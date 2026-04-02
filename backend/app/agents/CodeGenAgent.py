"""StreamingReActAgent - 优化流式输出的 ReActAgent

重写 arun_stream 方法，解决原版需要两次调用 LLM 的问题。

原理：
- 使用 astream_with_tools 一次调用，同时返回文本和工具调用增量
- 流式输出文本给用户看，同时收集工具调用增量
- 流式结束后组装完整 tool_calls，直接执行工具
"""

import asyncio
import json
import re
from datetime import datetime
from typing import List, Dict, Any, AsyncGenerator

from hello_agents.agents.react_agent import ReActAgent
from hello_agents.core.lifecycle import EventType, LifecycleHook
from hello_agents.core.message import Message
from hello_agents.core.streaming import StreamEvent, StreamEventType
from hello_agents.tools.response import ToolStatus


class CodeGenAgent(ReActAgent):
    """优化流式输出的 ReActAgent

    与父类 ReActAgent 的区别：
    - arun_stream 不再需要两次调用 LLM
    - 使用 astream_with_tools 一次调用，同时获取文本和工具调用
    """

    async def arun_stream(
            self,
            input_text: str,
            on_start: LifecycleHook = None,
            on_step: LifecycleHook = None,
            on_tool_call: LifecycleHook = None,
            on_finish: LifecycleHook = None,
            on_error: LifecycleHook = None,
            **kwargs
    ) -> AsyncGenerator[StreamEvent, None]:
        """流式执行 Agent（一次 LLM 调用解决问题）

        使用 astream_with_tools 同时返回文本和工具调用增量，
        避免重复调用 LLM。

        Args:
            input_text: 用户问题
            on_start: 开始钩子
            on_step: 步骤钩子
            on_tool_call: 工具调用钩子
            on_finish: 完成钩子
            on_error: 错误钩子
            **kwargs: 其他参数

        Yields:
            StreamEvent: 流式事件
        """
        from hello_agents.observability import TraceLogger

        session_start_time = datetime.now()

        trace_logger: Optional[TraceLogger] = None
        if self.config.trace_enabled:
            trace_logger = TraceLogger(
                output_dir=self.config.trace_dir,
                sanitize=self.config.trace_sanitize,
                html_include_raw_response=self.config.trace_html_include_raw_response
            )
            trace_logger.log_event(
                "session_start",
                {
                    "agent_name": self.name,
                    "agent_type": self.__class__.__name__,
                    "input_text": input_text
                }
            )

        yield StreamEvent.create(
            StreamEventType.AGENT_START,
            self.name,
            input_text=input_text
        )

        await self._emit_event(EventType.AGENT_START, on_start, input_text=input_text)

        try:
            messages = self._build_messages(input_text)
            self.add_message(Message(input_text, "user"))
            tool_schemas = self._build_tool_schemas()

            current_step = 0
            final_answer = None

            print(f"\n🤖 {self.name} 开始处理问题: {input_text}")

            while current_step < self.max_steps:
                current_step += 1

                messages = self._build_messages("")

                yield StreamEvent.create(
                    StreamEventType.STEP_START,
                    self.name,
                    step=current_step,
                    max_steps=self.max_steps
                )

                await self._emit_event(EventType.STEP_START, on_step, step=current_step)

                print(f"\n--- 第 {current_step} 步 ---")

                if trace_logger:
                    trace_logger.log_event(
                        "step_start",
                        {
                            "step": current_step,
                            "max_steps": self.max_steps,
                            "messages_count": len(messages)
                        },
                        step=current_step
                    )

                full_response = ""
                tool_calls_data: List[Dict[str, Any]] = []
                tool_calls_last_lengths: Dict[int, int] = {}

                try:
                    tool_calls_started = set()

                    async for item in self.llm.astream_with_tools(
                            messages=messages,
                            tools=tool_schemas,
                            tool_choice="auto",
                            **kwargs
                    ):
                        if item["type"] == "text":
                            full_response += item["content"]
                            yield StreamEvent.create(
                                StreamEventType.LLM_CHUNK,
                                self.name,
                                chunk=item["content"],
                                step=current_step
                            )
                            print(item["content"], end="", flush=True)

                        elif item["type"] == "tool_call":
                            chunk = item["chunk"]
                            while len(tool_calls_data) <= chunk.index:
                                tool_calls_data.append({
                                    "id": None,
                                    "name": None,
                                    "arguments": ""
                                })

                            if chunk.id:
                                tool_calls_data[chunk.index]["id"] = chunk.id

                            if chunk.name:
                                tool_calls_data[chunk.index]["name"] = chunk.name
                                if chunk.index not in tool_calls_started:
                                    tool_calls_started.add(chunk.index)
                                    yield StreamEvent.create(
                                        StreamEventType.TOOL_CALL_START,
                                        self.name,
                                        tool_name=chunk.name,
                                        tool_call_id=tool_calls_data[chunk.index]["id"],
                                        step=current_step
                                    )
                                    print(f"\n🔧 调用工具1: {chunk.name}(", end="", flush=True)

                            if chunk.arguments:
                                tool_calls_data[chunk.index]["arguments"] += chunk.arguments

                                tool_name = tool_calls_data[chunk.index]["name"]
                                is_builtin_tools = tool_name in ("Thought", "Finish")

                                if is_builtin_tools:
                                    partial_json = tool_calls_data[chunk.index]["arguments"]
                                    last_length = tool_calls_last_lengths.get(chunk.index, 0)

                                    for field in ("reasoning", "answer"):
                                        complete_match = re.search(rf'"{field}":\s*"((?:[^"\\]|\\.)*)"', partial_json)
                                        if complete_match:
                                            content = complete_match.group(1)
                                        else:
                                            partial_match = re.search(rf'"{field}":\s*"((?:[^"\\]|\\.)*?)$', partial_json)
                                            if partial_match:
                                                content = partial_match.group(1)
                                            else:
                                                continue
                                        if len(content) > last_length:
                                            new_content = content[last_length:]
                                            tool_calls_last_lengths[chunk.index] = len(content)
                                            yield StreamEvent.create(
                                                StreamEventType.TOOL_CALL_CHUNK,
                                                self.name,
                                                tool_name=tool_name,
                                                tool_call_id=tool_calls_data[chunk.index]["id"],
                                                chunk=new_content,
                                                step=current_step
                                            )
                                            print(new_content, end="", flush=True)
                                        break

                                else:
                                    yield StreamEvent.create(
                                        StreamEventType.TOOL_CALL_CHUNK,
                                        self.name,
                                        tool_name=tool_name,
                                        tool_call_id=tool_calls_data[chunk.index]["id"],
                                        chunk=chunk.arguments,
                                        step=current_step
                                    )
                                    print(chunk.arguments, end="", flush=True)
                    print(")")

                    if trace_logger:
                        trace_logger.log_event(
                            "model_output",
                            {
                                "content": full_response or "",
                                "tool_calls_count": len(tool_calls_data),
                                "tool_calls": [
                                    {"name": tc["name"], "arguments": tc["arguments"]}
                                    for tc in tool_calls_data if tc["name"]
                                ]
                            },
                            step=current_step
                        )

                except Exception as e:
                    error_msg = f"LLM 调用失败: {str(e)}"
                    print(f"❌ {error_msg}")

                    yield StreamEvent.create(
                        StreamEventType.ERROR,
                        self.name,
                        error=error_msg,
                        step=current_step
                    )

                    await self._emit_event(EventType.AGENT_ERROR, on_error, error=error_msg)

                    if trace_logger:
                        trace_logger.log_event(
                            "error",
                            {
                                "error_type": "LLM_ERROR",
                                "message": error_msg
                            },
                            step=current_step
                        )

                    break

                tool_calls = []
                for tc_data in tool_calls_data:
                    if tc_data["name"]:
                        tool_calls.append(type("ToolCall", (), {
                            "id": tc_data["id"] or f"call_{len(tool_calls)}",
                            "name": tc_data["name"],
                            "arguments": tc_data["arguments"]
                        })())

                if not tool_calls:
                    final_answer = full_response or "抱歉，我无法回答这个问题。"

                    yield StreamEvent.create(
                        StreamEventType.AGENT_FINISH,
                        self.name,
                        result=final_answer,
                        total_steps=current_step
                    )

                    await self._emit_event(EventType.AGENT_FINISH, on_finish, result=final_answer)

                    # self.add_message(Message(input_text, "user"))
                    self.add_message(Message(final_answer, "assistant"))

                    if trace_logger:
                        duration = (datetime.now() - session_start_time).total_seconds()
                        trace_logger.log_event(
                            "session_end",
                            {
                                "duration": duration,
                                "total_steps": current_step,
                                "final_answer": final_answer,
                                "status": "success"
                            }
                        )
                        trace_logger.finalize()

                    return

                messages.append({
                    "role": "assistant",
                    "content": full_response,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.name,
                                "arguments": tc.arguments
                            }
                        }
                        for tc in tool_calls
                    ]
                })
                self.add_message(Message(
                    full_response,
                    "assistant",
                    tool_calls=[
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.name,
                                "arguments": tc.arguments
                            }
                        }
                        for tc in tool_calls
                    ] if tool_calls else None
                ))

                if trace_logger:
                    for tc in tool_calls:
                        trace_logger.log_event(
                            "tool_call",
                            {
                                "tool_name": tc.name,
                                "tool_call_id": tc.id,
                                "arguments": tc.arguments
                            },
                            step=current_step
                        )

                tool_results = await self._execute_tools_async_stream(
                    tool_calls,
                    current_step,
                    on_tool_call
                )

                for tool_name, tool_call_id, result_dict in tool_results:
                    is_builtin = tool_name in self._builtin_tools
                    yield StreamEvent.create(
                        StreamEventType.TOOL_CALL_FINISH,
                        self.name,
                        tool_name=tool_name,
                        tool_call_id=tool_call_id,
                        result=result_dict["content"],
                        is_builtin=is_builtin,
                        step=current_step
                    )

                    if tool_name == "Finish":
                        pass
                    else:
                        metadata = {"tool_name": tool_name}
                        if tool_name != "Thought":
                            args = json.loads(tool_calls[[tc.name for tc in tool_calls].index(tool_name)].arguments)
                            metadata["arguments"] = args
                        self.add_message(Message(
                            content=result_dict["content"],
                            role="tool",
                            tool_name=tool_name,
                            tool_call_id=tool_call_id,
                            metadata=metadata
                        ))

                    messages.append({
                        "role": "tool",
                        "tool_name": tool_name,
                        "tool_call_id": tool_call_id,
                        "content": result_dict["content"]
                    })

                    if trace_logger:
                        trace_logger.log_event(
                            "tool_result",
                            {
                                "tool_name": tool_name,
                                "tool_call_id": tool_call_id,
                                "result": result_dict["content"],
                                "is_builtin": is_builtin
                            },
                            step=current_step
                        )

                    if tool_name == "Finish":
                        try:
                            args = json.loads(tool_calls[0].arguments)
                            final_answer = args.get("answer", result_dict["content"])
                        except:
                            final_answer = result_dict["content"]

                        yield StreamEvent.create(
                            StreamEventType.AGENT_FINISH,
                            self.name,
                            result=final_answer,
                            total_steps=current_step
                        )

                        await self._emit_event(EventType.AGENT_FINISH, on_finish, result=final_answer)

                        # self.add_message(Message(input_text, "user"))
                        self.add_message(Message(final_answer, "assistant"))

                        if trace_logger:
                            duration = (datetime.now() - session_start_time).total_seconds()
                            trace_logger.log_event(
                                "session_end",
                                {
                                    "duration": duration,
                                    "total_steps": current_step,
                                    "final_answer": final_answer,
                                    "status": "success"
                                }
                            )
                            trace_logger.finalize()

                        return

                yield StreamEvent.create(
                    StreamEventType.STEP_FINISH,
                    self.name,
                    step=current_step
                )

                if trace_logger:
                    trace_logger.log_event(
                        "step_finish",
                        {
                            "step": current_step,
                            "tool_results_count": len(tool_results)
                        },
                        step=current_step
                    )

            if not final_answer:
                final_answer = "抱歉，已达到最大步数限制，无法完成任务。"

                yield StreamEvent.create(
                    StreamEventType.AGENT_FINISH,
                    self.name,
                    result=final_answer,
                    total_steps=current_step,
                    max_steps_reached=True
                )

                await self._emit_event(EventType.AGENT_FINISH, on_finish, result=final_answer)

                # self.add_message(Message(input_text, "user"))
                self.add_message(Message(final_answer, "assistant"))

                if trace_logger:
                    duration = (datetime.now() - session_start_time).total_seconds()
                    trace_logger.log_event(
                        "session_end",
                        {
                            "duration": duration,
                            "total_steps": current_step,
                            "final_answer": final_answer,
                            "status": "max_steps_reached"
                        }
                    )
                    trace_logger.finalize()

        except Exception as e:
            error_msg = f"Agent 执行失败: {str(e)}"

            yield StreamEvent.create(
                StreamEventType.ERROR,
                self.name,
                error=error_msg,
                error_type=type(e).__name__
            )

            await self._emit_event(EventType.AGENT_ERROR, on_error, error=error_msg)

            if trace_logger:
                trace_logger.log_event(
                    "error",
                    {
                        "error_type": type(e).__name__,
                        "message": error_msg
                    },
                    step=current_step if 'current_step' in dir() else None
                )
                trace_logger.finalize()

            raise

    async def _execute_tools_async_stream(
            self,
            tool_calls: List[Any],
            current_step: int,
            on_tool_call: LifecycleHook = None
    ) -> List[tuple]:
        """异步执行工具调用（流式版本，发送工具调用开始事件）

        Args:
            tool_calls: 工具调用列表
            current_step: 当前步骤
            on_tool_call: 工具调用钩子

        Returns:
            List[tuple]: (tool_name, tool_call_id, result_dict) 列表
        """
        results = []

        builtin_calls = [tc for tc in tool_calls if tc.name in self._builtin_tools]
        user_calls = [tc for tc in tool_calls if tc.name not in self._builtin_tools]

        for tc in builtin_calls:
            tool_name = tc.name
            tool_call_id = tc.id

            try:
                arguments = json.loads(tc.arguments)
            except json.JSONDecodeError as e:
                results.append((tool_name, tool_call_id, {"content": f"错误：参数格式不正确 - {str(e)}"}))
                continue

            await self._emit_event(
                EventType.TOOL_CALL,
                on_tool_call,
                tool_name=tool_name,
                tool_call_id=tool_call_id,
                args=arguments,
                step=current_step
            )

            if tool_name == "Thought":
                reasoning = arguments.get("reasoning", "")
                print(f"💭 思考: {reasoning}")
                result_content = reasoning
            elif tool_name == "Finish":
                answer = arguments.get("answer", "")
                print(f"✅ 最终答案: {answer}")
                result_content = answer
            else:
                result_content = f"未知的内置工具: {tool_name}"

            results.append((tool_name, tool_call_id, {"content": result_content}))

        if user_calls:
            max_concurrent = getattr(self.config, 'max_concurrent_tools', 3)
            semaphore = asyncio.Semaphore(max_concurrent)

            async def execute_one(tc):
                async with semaphore:
                    tool_name = tc.name
                    tool_call_id = tc.id

                    try:
                        arguments = json.loads(tc.arguments)
                    except json.JSONDecodeError as e:
                        return (tool_name, tool_call_id, {"content": f"错误：参数格式不正确 - {str(e)}"})

                    await self._emit_event(
                        EventType.TOOL_CALL,
                        on_tool_call,
                        tool_name=tool_name,
                        tool_call_id=tool_call_id,
                        args=arguments,
                        step=current_step
                    )

                    print(f"🔧 调用工具2: {tool_name}({arguments})")

                    tool = self.tool_registry.get_tool(tool_name)
                    if not tool:
                        result_content = f"❌ 工具 {tool_name} 不存在"
                    else:
                        try:
                            tool_response = await tool.arun_with_timing(arguments)
                            result_content = tool_response.text

                            truncate_result = self.truncator.truncate(
                                tool_name=tool_name,
                                output=result_content
                            )
                            result_content = truncate_result.get('preview', result_content)
                        except Exception as e:
                            result_content = f"❌ 工具执行失败: {str(e)}"

                    if result_content.startswith("❌"):
                        print(result_content)
                    else:
                        print(f"👀 观察: {result_content}")

                    return (tool_name, tool_call_id, {"content": result_content})

            user_results = await asyncio.gather(*[execute_one(tc) for tc in user_calls])
            results.extend(user_results)

        return results
