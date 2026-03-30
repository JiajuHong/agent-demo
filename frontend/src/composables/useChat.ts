import { ref, computed } from 'vue'
import type { Message, Session, Step } from '../types'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000'

function genId(): string {
  return Math.random().toString(36).slice(2, 11)
}

function getTime(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// ─── 模拟回复（后端不可用时回退）────────────────────────────────
const MOCK_RESPONSES = [
  `# 欢迎使用 AI 助手\n\n我是一个功能强大的 AI 助手，可以帮助你：\n\n- **回答问题**：各类知识查询\n- **代码开发**：编写、调试代码\n- **写作辅助**：文章、邮件、报告\n- **数据分析**：理解和解读数据\n\n尽管提问吧！`,
  `这是一个很好的问题。我来详细解答：\n\n1. 首先，我们需要理解基本概念\n2. 然后逐步分析问题\n3. 最后给出最优解决方案\n\n**结论**：通过系统化思考，可以找到清晰的答案。`,
  `\`\`\`python\n# Python 示例代码\ndef fibonacci(n: int) -> list[int]:\n    """返回斐波那契数列的前 n 项"""\n    if n <= 0:\n        return []\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint(fibonacci(10))\n# 输出: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\`\`\`\n\n这段代码实现了经典的斐波那契数列算法，时间复杂度为 O(n)。`,
]

async function simulateStream(
  append: (text: string) => void,
  _prompt: string,
  stopSignal: { stopped: boolean },
): Promise<void> {
  const text = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
  const chunks = text.split('')
  let i = 0

  return new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      if (stopSignal.stopped || i >= chunks.length) {
        clearInterval(timer)
        resolve()
        return
      }
      // 逐字输出，偶尔多输出几个字符模拟真实流速
      const batch = Math.floor(Math.random() * 3) + 1
      append(chunks.slice(i, i + batch).join(''))
      i += batch
    }, 25)
  })
}

export function useChat() {
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<string | null>(null)
  const messagesBySession = ref<Record<string, Message[]>>({})
  const streamingBySession = ref<Record<string, boolean>>({})
  const loadedHistorySessionIds = ref<Record<string, boolean>>({})
  const webSearch = ref(false)
  const thinking = ref(false)
  const backendOnline = ref(false)
  // HITL 会话状态
  const hitlSession = ref<{
    session_id: string
    questions: Array<{
      id: string
      type: 'text' | 'choice' | 'multi_choice' | 'yes_no'
      text: string
      options?: Array<{ value: string; label: string }>
      required?: boolean
    }>
  } | null>(null)
  // 尚未发送任何消息的「草稿」会话，不显示在侧边栏
  const draftSession = ref<Session | null>(null)

  const abortCtrlBySession = new Map<string, AbortController>()
  const stopSignalBySession = new Map<string, { stopped: boolean }>()

  const currentMessages = computed(() => {
    const sid = currentSessionId.value
    if (!sid) return []
    return messagesBySession.value[sid] ?? []
  })

  const isStreaming = computed(() => {
    const sid = currentSessionId.value
    if (!sid) return false
    return !!streamingBySession.value[sid]
  })

  const currentSession = computed(() => {
    const sid = currentSessionId.value
    if (!sid) return null
    if (draftSession.value?.id === sid) return draftSession.value
    return sessions.value.find(s => s.id === sid) ?? null
  })

  function setSessionMessages(sessionId: string, list: Message[]) {
    messagesBySession.value = {
      ...messagesBySession.value,
      [sessionId]: list,
    }
  }

  function renameSessionStorageKey(oldId: string, newId: string): void {
    if (oldId === newId) return

    const oldMessages = messagesBySession.value[oldId]
    if (oldMessages !== undefined) {
      const { [oldId]: _drop, ...rest } = messagesBySession.value
      messagesBySession.value = {
        ...rest,
        [newId]: oldMessages,
      }
    }

    const oldLoaded = loadedHistorySessionIds.value[oldId]
    if (oldLoaded !== undefined) {
      const { [oldId]: _drop, ...rest } = loadedHistorySessionIds.value
      loadedHistorySessionIds.value = {
        ...rest,
        [newId]: oldLoaded,
      }
    }

    const oldStreaming = streamingBySession.value[oldId]
    if (oldStreaming !== undefined) {
      const { [oldId]: _drop, ...rest } = streamingBySession.value
      streamingBySession.value = {
        ...rest,
        [newId]: oldStreaming,
      }
    }

    const stopSignal = stopSignalBySession.get(oldId)
    if (stopSignal) {
      stopSignalBySession.delete(oldId)
      stopSignalBySession.set(newId, stopSignal)
    }

    const abortCtrl = abortCtrlBySession.get(oldId)
    if (abortCtrl) {
      abortCtrlBySession.delete(oldId)
      abortCtrlBySession.set(newId, abortCtrl)
    }
  }

  function getSessionMessages(sessionId: string): Message[] {
    return messagesBySession.value[sessionId] ?? []
  }

  function pushSessionMessage(sessionId: string, message: Message) {
    const next = [...getSessionMessages(sessionId), message]
    setSessionMessages(sessionId, next)
  }

  function updateSessionMessage(sessionId: string, messageId: string, updater: (msg: Message) => Message) {
    const list = getSessionMessages(sessionId)
    const idx = list.findIndex(m => m.id === messageId)
    if (idx < 0) return
    const next = list.slice()
    next[idx] = updater(next[idx])
    setSessionMessages(sessionId, next)
  }

  function setSessionStreaming(sessionId: string, value: boolean) {
    streamingBySession.value = {
      ...streamingBySession.value,
      [sessionId]: value,
    }
  }

  function isSessionStreaming(sessionId: string): boolean {
    return !!streamingBySession.value[sessionId]
  }

  // ─── 后端请求 ───────────────────────────────────────────────
  async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json() as Promise<T>
  }

  async function loadSessions(): Promise<void> {
    try {
      const data = await fetchJSON<{ sessions?: Array<{ session_id: string; title?: string; created_at?: number | string }>; items?: Array<{ session_id: string; title?: string; created_at?: number | string }> }>(
        `${API_BASE}/api/v1/sessions`,
      )
      const rawSessions = data.sessions ?? data.items ?? []
      sessions.value = rawSessions.map(s => ({
        id: s.session_id,
        title: s.title ?? '新对话',
        createdAt:
          typeof s.created_at === 'number'
            ? s.created_at * 1000
            : (typeof s.created_at === 'string' ? Date.parse(s.created_at) : NaN) || Date.now(),
      }))
      backendOnline.value = true
    } catch {
      backendOnline.value = false
    }
  }

  async function createDraftSession(): Promise<void> {
    const local: Session = { id: genId(), title: '新对话', createdAt: Date.now() }
    // 不加入 sessions（不在侧边栏显示），仅作为草稿
    draftSession.value = local
    currentSessionId.value = local.id
    if (!messagesBySession.value[local.id]) {
      setSessionMessages(local.id, [])
    }
    loadedHistorySessionIds.value = {
      ...loadedHistorySessionIds.value,
      [local.id]: true,
    }
  }

  async function renameSession(id: string, title: string): Promise<void> {
    const cleanTitle = title.trim()
    if (!cleanTitle) return

    const session = sessions.value.find(s => s.id === id)
    if (!session) return

    session.title = cleanTitle

    if (!backendOnline.value) return

    try {
      await fetchJSON<{ session_id: string; title?: string }>(
        `${API_BASE}/api/v1/sessions/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: cleanTitle }),
        },
      )
    } catch {
      // keep local title even if backend rename fails
    }
  }

  async function deleteSession(id: string): Promise<void> {
    if (backendOnline.value) {
      try {
        const res = await fetch(`${API_BASE}/api/v1/sessions/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`)
      } catch {
        return
      }
    }

    stopStreamingBySession(id)

    const index = sessions.value.findIndex(s => s.id === id)
    if (index < 0) return

    const wasCurrent = currentSessionId.value === id
    sessions.value.splice(index, 1)

    const { [id]: _drop1, ...restMessages } = messagesBySession.value
    messagesBySession.value = restMessages
    const { [id]: _drop2, ...restLoaded } = loadedHistorySessionIds.value
    loadedHistorySessionIds.value = restLoaded
    const { [id]: _drop3, ...restStreaming } = streamingBySession.value
    streamingBySession.value = restStreaming

    if (!wasCurrent) return

    if (sessions.value.length > 0) {
      await selectSession(sessions.value[0].id)
      return
    }

    await newChat()
  }

  async function selectSession(id: string): Promise<void> {
    currentSessionId.value = id

    if (!messagesBySession.value[id]) {
      setSessionMessages(id, [])
    }

    if (loadedHistorySessionIds.value[id]) return

    if (backendOnline.value) {
      try {
        const data = await fetchJSON<{ messages?: Array<{ role: string; content: string; metadata?: { steps?: Step[] } }>; history?: Array<{ role: string; content: string; metadata?: { steps?: Step[] } }> }>(
          `${API_BASE}/api/v1/sessions/${id}/history`,
        )
        const rawMessages = data.messages ?? data.history ?? []
        setSessionMessages(id, rawMessages.map(m => {
          const steps = m.metadata?.steps
          return {
            id: genId(),
            role: m.role as Message['role'],
            content: m.content,
            time: getTime(),
            steps: steps,
            final_answer: steps && m.content ? m.content : undefined,
          }
        }))
      } catch { /* ignore */ }
    }

    loadedHistorySessionIds.value = {
      ...loadedHistorySessionIds.value,
      [id]: true,
    }
  }

  async function sendMessage(content: string, files?: File[]): Promise<void> {
    if (!content.trim()) return

    let sessionId = currentSessionId.value
    if (!sessionId) {
      await newChat()
      sessionId = currentSessionId.value
    }
    if (!sessionId) return
    if (isSessionStreaming(sessionId)) return

    // 首次发消息时才真正创建后端会话，并将草稿提升到侧边栏
    if (draftSession.value?.id === sessionId) {
      if (backendOnline.value) {
        try {
          const data = await fetchJSON<{ session_id?: string }>(
            `${API_BASE}/api/v1/sessions`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: '{}',
            },
          )
          const sid = data.session_id
          if (sid && sid !== sessionId) {
            renameSessionStorageKey(sessionId, sid)
            draftSession.value.id = sid
            currentSessionId.value = sid
            sessionId = sid
          }
        } catch {
          // 创建后端会话失败时继续走本地/模拟流程，不阻断用户发消息
        }
      }

      sessions.value.unshift(draftSession.value)
      draftSession.value = null
    }

    if (!messagesBySession.value[sessionId]) {
      setSessionMessages(sessionId, [])
    }

    // 上传文件内容拼入消息
    let combinedContent = content.trim()
    if (files && files.length > 0) {
      const names = files.map(f => f.name).join('、')
      combinedContent = `[已附加文件：${names}]\n\n${combinedContent}`
    }

    // 用户消息
    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: combinedContent,
      time: getTime(),
    }
    pushSessionMessage(sessionId, userMsg)

    // 占位助手消息
    const assistantMsg: Message = { id: genId(), role: 'assistant', content: '', time: getTime(), steps: [] }
    pushSessionMessage(sessionId, assistantMsg)
    const assistantMsgId = assistantMsg.id

    let currentStepIndex = ref(-1)

    const appendAssistantContent = (text: string) => {
      if (!text) return
      updateSessionMessage(sessionId, assistantMsgId, (msg) => {
        if (!msg.steps || msg.steps.length === 0) {
          return msg
        }
        const steps = [...msg.steps]
        const currentStep = { ...steps[steps.length - 1] }
        currentStep.model_output = (currentStep.model_output || '') + text
        steps[steps.length - 1] = currentStep
        return { ...msg, steps }
      })
    }

    const setAssistantContent = (text: string) => {
      updateSessionMessage(sessionId, assistantMsgId, (msg) => {
        if (!msg.steps || msg.steps.length === 0) {
          return { ...msg, content: text }
        }
        const steps = [...msg.steps]
        const currentStep = { ...steps[steps.length - 1] }
        currentStep.model_output = text
        steps[steps.length - 1] = currentStep
        return { ...msg, steps }
      })
    }

    const getAssistantContent = () => {
      const target = getSessionMessages(sessionId).find(m => m.id === assistantMsgId)
      if (!target) return ''
      if (target.steps && target.steps.length > 0) {
        return target.steps[target.steps.length - 1].model_output || ''
      }
      return target.content || ''
    }

    const startNewStep = (stepNum: number) => {
      updateSessionMessage(sessionId, assistantMsgId, (msg) => {
        const steps = [...(msg.steps || []), { step: stepNum, model_output: '', tool_calls: [] }]
        return { ...msg, steps }
      })
      currentStepIndex.value = stepNum
    }

    const appendToolCallToCurrentStep = (toolCall: { type: 'thinking' | 'tool_call'; content?: string; tool_name?: string; arguments?: Record<string, unknown>; result?: string }) => {
      updateSessionMessage(sessionId, assistantMsgId, (msg) => {
        if (!msg.steps || msg.steps.length === 0) {
          return msg
        }
        const steps = [...msg.steps]
        const currentStep = { ...steps[steps.length - 1] }
        const toolCalls = [...(currentStep.tool_calls || [])]

        if (toolCall.type === 'thinking') {
          let merged = false
          for (let i = toolCalls.length - 1; i >= 0; i--) {
            if (toolCalls[i].type === 'thinking') {
              const lastThinking = { ...toolCalls[i] }
              lastThinking.content = (lastThinking.content || '') + (toolCall.content || '')
              toolCalls[i] = lastThinking
              merged = true
              break
            }
          }
          if (!merged) {
            toolCalls.push(toolCall)
          }
        } else {
          toolCalls.push(toolCall)
        }

        currentStep.tool_calls = toolCalls
        steps[steps.length - 1] = currentStep
        return { ...msg, steps }
      })
    }

    setSessionStreaming(sessionId, true)
    const stopSignal = { stopped: false }
    stopSignalBySession.set(sessionId, stopSignal)
    const abortCtrl = new AbortController()
    abortCtrlBySession.set(sessionId, abortCtrl)

    const onAgentFinish = (result: string) => {
      updateSessionMessage(sessionId, assistantMsgId, (msg) => ({
        ...msg,
        final_answer: result
      }))
    }

    try {
      if (backendOnline.value) {
        await streamFromBackend(
          sessionId,
          combinedContent,
          appendAssistantContent,
          getAssistantContent,
          startNewStep,
          appendToolCallToCurrentStep,
          onAgentFinish,
          abortCtrl.signal,
        )
      } else {
        await simulateStream(appendAssistantContent, combinedContent, stopSignal)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // 后端失败 → 回退到模拟
        if (!getAssistantContent().trim()) {
          await simulateStream(appendAssistantContent, combinedContent, stopSignal)
        }
      }
    } finally {
      setSessionStreaming(sessionId, false)
      stopSignalBySession.delete(sessionId)
      abortCtrlBySession.delete(sessionId)
    }

    if (!getAssistantContent().trim()) {
      if (backendOnline.value) {
        try {
          const historyData = await fetchJSON<{ messages?: Array<{ role: string; content: string }>; history?: Array<{ role: string; content: string }> }>(
            `${API_BASE}/api/v1/sessions/${sessionId}/history`,
          )
          const history = historyData.messages ?? historyData.history ?? []
          for (let i = history.length - 1; i >= 0; i -= 1) {
            const item = history[i]
            if (item.role === 'assistant' && item.content?.trim()) {
              setAssistantContent(item.content)
              break
            }
          }
        } catch {
          // ignore recovery errors
        }
      }

      if (!getAssistantContent().trim()) {
        setAssistantContent('抱歉，暂时无法获取回复。请检查服务后端是否正常运行。')
      }
    }

    // 流式完成后，在第 1 轮和第 3 轮自动调用 LLM 生成标题
    if (backendOnline.value) {
      const sess = sessions.value.find(s => s.id === sessionId)
      const userCount = getSessionMessages(sessionId).filter(m => m.role === 'user').length
      if (userCount === 1 || userCount === 3) {
        generateTitle(sessionId) // fire and forget
      } else if (!sess || !sess.title || sess.title === '新对话') {
        generateTitle(sessionId) // fire and forget
      }
    }
  }

  async function streamFromBackend(
    sessionId: string,
    content: string,
    appendAssistantContent: (text: string) => void,
    getAssistantContent: () => string,
    startNewStep: (stepNum: number) => void,
    appendToolCallToCurrentStep: (toolCall: { type: 'thinking' | 'tool_call'; content?: string; tool_name?: string; arguments?: Record<string, unknown>; result?: string }) => void,
    onAgentFinish: (result: string) => void,
    signal: AbortSignal,
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/api/v1/chat/completions/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message: content,
      }),
      signal,
    })

    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    let currentStepNum = 0

    const handleSseBlock = (block: string) => {
      if (!block.trim()) return

      const lines = block.split(/\r?\n/)
      let evtType: string | null = null
      const dataLines: string[] = []

      for (const line of lines) {
        if (line.startsWith(':')) continue
        if (line.startsWith('event:')) {
          evtType = line.slice(6).trim() || null
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart())
        }
      }

      if (dataLines.length === 0) return

      const dataRaw = dataLines.join('\n')
      let payload: unknown
      try {
        payload = JSON.parse(dataRaw)
      } catch {
        return
      }

      const p = payload as Record<string, unknown>
      const eventType =
        (evtType && evtType !== 'message' ? evtType : null) ??
        ((p?.type as string) || null) ??
        'message'

      if (eventType === 'step_start') {
        const d = p?.data as Record<string, unknown> | undefined
        currentStepNum = (d?.step as number) || 0
        if (currentStepNum > 0) {
          startNewStep(currentStepNum)
        }
      } else if (eventType === 'llm_chunk') {
        const d = p?.data as Record<string, unknown> | undefined
        const chunk = (d?.chunk ?? d?.delta ?? d?.content ?? p?.chunk ?? p?.delta ?? p?.content ?? '') as string
        if (chunk) appendAssistantContent(chunk)
      } else if (eventType === 'tool_call_finish') {
        const d = p?.data as Record<string, unknown> | undefined
        const toolName = (d?.tool_name ?? d?.name ?? '') as string
        const result = (d?.result ?? '') as string
        if (toolName === 'Finish') {
          appendToolCallToCurrentStep({
            type: 'tool_call',
            tool_name: toolName,
          })
        } else if (toolName !== 'Thought') {
          let args = {}
          const argsRaw = d?.arguments ?? d?.args ?? '{}'
          if (typeof argsRaw === 'string') {
            try { args = JSON.parse(argsRaw) } catch { /* ignore */ }
          } else if (typeof argsRaw === 'object') {
            args = argsRaw as Record<string, unknown>
          }
          appendToolCallToCurrentStep({
            type: 'tool_call',
            tool_name: toolName,
            arguments: args,
            result: result,
          })
        }
      } else if (eventType === 'thinking') {
        const d = p?.data as Record<string, unknown> | undefined
        const chunk = (d?.chunk ?? '') as string
        if (chunk) {
          appendToolCallToCurrentStep({
            type: 'thinking',
            content: chunk,
          })
        }
      } else if (eventType === 'hitl_question') {
        const d = p?.data as Record<string, unknown> | undefined
        const hitlData = d as {
          session_id?: string
          questions?: Array<{
            id: string
            type: string
            text: string
            options?: Array<{ value: string; label: string }>
            required?: boolean
          }>
        } | undefined
        if (hitlData?.session_id && hitlData?.questions) {
          const questions = hitlData.questions.map(q => ({
            ...q,
            type: q.type as 'text' | 'choice' | 'multi_choice' | 'yes_no'
          }))
          hitlSession.value = {
            session_id: hitlData.session_id,
            questions
          }
        }
      } else if (eventType === 'agent_finish') {
        const d = p?.data as Record<string, unknown> | undefined
        const result = (d?.result ?? '') as string
        if (result) {
          onAgentFinish(result)
        }
      } else if (eventType === 'error') {
        const d = p?.data as Record<string, unknown> | undefined
        appendAssistantContent((d?.message as string) ?? (p?.error as string) ?? '发生错误')
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        if (buffer.trim()) handleSseBlock(buffer)
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const blocks = buffer.split(/\r?\n\r?\n/)
      buffer = blocks.pop() ?? ''

      for (const block of blocks) {
        handleSseBlock(block)
      }
    }
  }

  async function generateTitle(sessionId: string): Promise<void> {
    if (!backendOnline.value) return
    try {
      const data = await fetchJSON<{ session_id: string; title: string }>(
        `${API_BASE}/api/v1/sessions/${sessionId}/generate-title`,
        { method: 'POST' },
      )
      if (data.title) {
        const sess = sessions.value.find(s => s.id === sessionId)
        if (sess) sess.title = data.title
      }
    } catch {
      // 标题生成失败不影响主流程
    }
  }

  function stopStreamingBySession(sessionId: string): void {
    const stopSignal = stopSignalBySession.get(sessionId)
    if (stopSignal) stopSignal.stopped = true
    abortCtrlBySession.get(sessionId)?.abort()
    setSessionStreaming(sessionId, false)
  }

  function stopStreaming(): void {
    const sid = currentSessionId.value
    if (!sid) return
    stopStreamingBySession(sid)
  }

  function clearDraftSession(): void {
    const draft = draftSession.value
    if (!draft) return

    const draftId = draft.id
    stopStreamingBySession(draftId)
    stopSignalBySession.delete(draftId)
    abortCtrlBySession.delete(draftId)

    const { [draftId]: _dropMessages, ...restMessages } = messagesBySession.value
    messagesBySession.value = restMessages
    const { [draftId]: _dropLoaded, ...restLoaded } = loadedHistorySessionIds.value
    loadedHistorySessionIds.value = restLoaded
    const { [draftId]: _dropStreaming, ...restStreaming } = streamingBySession.value
    streamingBySession.value = restStreaming

    if (currentSessionId.value === draftId) {
      currentSessionId.value = sessions.value[0]?.id ?? null
    }

    draftSession.value = null
  }

  async function newChat(): Promise<void> {
    // 已有草稿会话且尚未发消息 → 直接切换过去，不重复创建
    if (draftSession.value) {
      currentSessionId.value = draftSession.value.id
      return
    }
    await createDraftSession()
  }

  // ─── 初始化 ─────────────────────────────────────────────────
  loadSessions().then(async () => {
    if (sessions.value.length > 0) {
      await selectSession(sessions.value[0].id)
      return
    }
  })

  return {
    sessions,
    currentSessionId,
    currentSession,
    messages: currentMessages,
    isStreaming,
    webSearch,
    thinking,
    backendOnline,
    hitlSession,
    sendMessage,
    renameSession,
    generateTitle,
    deleteSession,
    stopStreaming,
    clearDraftSession,
    selectSession,
    newChat,
  }
}
