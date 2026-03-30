<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import type { Message, Step, ToolCall } from '../types'

const props = defineProps<{
  message: Message
  isStreaming: boolean
}>()

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  highlight(str: string, lang: string): string {
    const escaped = md.utils.escapeHtml(str)
    let highlighted = escaped
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch { /* fallback */ }
    }
    return (
      `<div class="code-block-wrap">` +
        `<div class="code-block-header">` +
          `<span>${lang || 'text'}</span>` +
          `<button class="copy-btn" data-code="${encodeURIComponent(str)}">复制</button>` +
        `</div>` +
        `<pre><code class="hljs">${highlighted}</code></pre>` +
      `</div>`
    )
  },
})

const KATEX_OPTIONS = {
  throwOnError: false,
  strict: 'ignore' as const,
}

function renderKatex(expr: string, displayMode: boolean): string {
  return katex.renderToString(expr, {
    ...KATEX_OPTIONS,
    displayMode,
  })
}

function renderMarkdown(content: string): string {
  const mathPlaceholders = new Map<string, string>()
  const codePlaceholders = new Map<string, string>()
  let mathIndex = 0
  let codeIndex = 0

  const createMathPlaceholder = (html: string) => {
    const key = `@@MATHPH_${mathIndex++}@@`
    mathPlaceholders.set(key, html)
    return key
  }

  const createCodePlaceholder = (source: string) => {
    const key = `@@CODEPH_${codeIndex++}@@`
    codePlaceholders.set(key, source)
    return key
  }

  const codeProtected = content
    .replace(/```[\s\S]*?(?:```|$)/g, (block) => createCodePlaceholder(block))
    .replace(/`[^`\n]*`/g, (inlineCode) => createCodePlaceholder(inlineCode))

  const withMathPlaceholders = codeProtected
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expr) => `\n${createMathPlaceholder(renderKatex(expr.trim(), true))}\n`)
    .replace(/\$\$([\s\S]*?)\$\$/g, (_match, expr) => createMathPlaceholder(renderKatex(expr.trim(), true)))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expr) => createMathPlaceholder(renderKatex(expr.trim(), false)))
    .replace(/\$(.+?)\$/g, (_match, expr) => createMathPlaceholder(renderKatex(expr.trim(), false)))

  let markdownSource = withMathPlaceholders
  for (const [key, source] of codePlaceholders.entries()) {
    markdownSource = markdownSource.replaceAll(key, source)
  }

  let html = md.render(markdownSource)
  for (const [key, value] of mathPlaceholders.entries()) {
    html = html.replaceAll(`<p>${key}</p>`, value)
    html = html.replaceAll(key, value)
  }
  return html
}

function renderUserContent(content: string): string {
  return md.utils.escapeHtml(content).replace(/\n/g, '<br>')
}

function formatArgs(args: Record<string, unknown>): string {
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    return String(args)
  }
}

function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    'Read': '读取文件',
    'Write': '写入文件',
    'Edit': '编辑文件',
    'Grep': '搜索代码',
    'Bash': '执行命令',
    'Glob': '查找文件',
    'TodoList': '待办列表',
    'AskUser': '询问用户',
    'Thought': '思考',
    'Finish': '完成',
  }
  return displayNames[toolName] || toolName
}

const renderedSteps = computed(() => {
  if (!props.message.steps || props.message.steps.length === 0) {
    return null
  }
  return props.message.steps
})

function handleMdClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  const btn = target.closest('.copy-btn') as HTMLButtonElement | null
  if (!btn) return

  const encoded = btn.dataset.code ?? ''
  const text = decodeURIComponent(encoded)

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '已复制 ✓'
      btn.classList.add('copied')
      setTimeout(() => {
        btn.textContent = '复制'
        btn.classList.remove('copied')
      }, 2000)
    })
  }
}
</script>

<template>
  <div class="message-row" :class="message.role">

    <div v-if="message.role === 'assistant'" class="avatar assistant">🤖</div>

    <div class="message-stack" :class="message.role">

      <template v-if="message.role === 'assistant' && renderedSteps">
        <div
          v-for="(step, stepIndex) in renderedSteps"
          :key="stepIndex"
          class="step-block"
        >
          <div class="step-header">
            <span class="step-badge">Step {{ step.step }}</span>
          </div>
          <div v-if="!(stepIndex === renderedSteps.length - 1 && message.final_answer)" class="step-model-output">
            <div
              class="md-body"
              v-html="renderMarkdown(step.model_output)"
              @click="handleMdClick"
            />
          </div>

          <div v-if="step.tool_calls && step.tool_calls.length > 0" class="step-tool-calls">
            <div
              v-for="(toolCall, tcIndex) in step.tool_calls"
              :key="tcIndex"
              class="tool-call-item"
              :class="toolCall.type"
            >
              <template v-if="toolCall.type === 'thinking'">
                <div class="tool-thinking">
                  <span class="tool-icon">💭</span>
                  <span class="tool-content" v-html="toolCall.content || ''" />
                </div>
              </template>
              <template v-else-if="toolCall.type === 'tool_call' && toolCall.tool_name === 'Finish'">
                <div class="tool-finish">
                  <span class="tool-icon">✅</span>
                  <span class="tool-name">完成</span>
                </div>
              </template>
              <template v-else-if="toolCall.type === 'tool_call'">
                <div class="tool-call-card">
                  <div class="tool-call-header">
                    <span class="tool-icon">🔧</span>
                    <span class="tool-name">{{ getToolDisplayName(toolCall.tool_name || '') }}</span>
                  </div>
                  <div class="tool-call-args">
                    <pre><code>{{ formatArgs(toolCall.arguments || {}) }}</code></pre>
                  </div>
                  <div v-if="toolCall.result" class="tool-call-result">
                    <span class="result-label">结果:</span>
                    <span class="result-content" v-html="renderMarkdown(toolCall.result)" />
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div
            v-if="isStreaming && stepIndex === renderedSteps.length - 1 && !step.model_output"
            class="streaming-indicator"
          >
            等待响应...
          </div>
        </div>

        <div v-if="message.final_answer" class="final-answer">
          <div class="final-answer-label">最终答案</div>
          <div
            class="md-body"
            v-html="renderMarkdown(message.final_answer)"
            @click="handleMdClick"
          />
        </div>
      </template>

      <template v-else-if="message.role === 'assistant'">
        <div
          class="bubble assistant"
          :class="{ 'streaming-cursor': isStreaming }"
        >
          <div
            class="md-body"
            v-html="renderMarkdown(message.content)"
            @click="handleMdClick"
          />
        </div>
      </template>

      <template v-else>
        <div class="bubble user">
          <div v-html="renderUserContent(message.content)" />
        </div>
      </template>

      <div class="msg-time">{{ message.time }}</div>
    </div>

    <div v-if="message.role === 'user'" class="avatar user">你</div>

  </div>
</template>

<style scoped>
.step-block {
  margin-bottom: 16px;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
}

.step-header {
  background: var(--step-header-bg, #f3f4f6);
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.step-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--step-badge-color, #6b7280);
}

.step-model-output {
  padding: 12px;
}

.step-tool-calls {
  padding: 0 12px 12px;
}

.tool-call-item {
  margin-bottom: 8px;
}

.tool-call-item.thinking {
  padding: 4px 0;
}

.tool-thinking {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: var(--thinking-color, #6b7280);
  padding: 4px 8px;
  background: var(--thinking-bg, #f9fafb);
  border-radius: 4px;
}

.tool-icon {
  flex-shrink: 0;
}

.tool-content {
  word-break: break-word;
  flex: 1;
}

.tool-content :deep(p) {
  margin: 0 0 4px 0;
}

.tool-content :deep(p:last-child) {
  margin-bottom: 0;
}

.tool-content :deep(code) {
  background: var(--inline-code-bg, #f3f4f6);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.tool-finish {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--finish-color, #16a34a);
  padding: 4px 8px;
  background: var(--finish-bg, #f0fdf4);
  border-radius: 4px;
  font-weight: 500;
}

.tool-call-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--tool-header-bg, #f9fafb);
  border-bottom: 1px solid var(--tool-border-color, #e5e7eb);
  font-weight: 500;
}

.tool-call-args {
  padding: 8px 10px;
  background: var(--tool-args-bg, #fff);
}

.tool-call-args pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.tool-call-args code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.tool-call-result {
  padding: 6px 10px;
  background: var(--tool-result-bg, #f0fdf4);
  border-top: 1px solid var(--tool-border-color, #e5e7eb);
}

.result-label {
  font-weight: 500;
  color: var(--result-label-color, #166534);
  margin-right: 6px;
}

.result-content {
  color: var(--result-content-color, #15803d);
  word-break: break-word;
  flex: 1;
}

.result-content :deep(p) {
  margin: 0 0 4px 0;
}

.result-content :deep(p:last-child) {
  margin-bottom: 0;
}

.result-content :deep(code) {
  background: var(--inline-code-bg, #f3f4f6);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.streaming-indicator {
  padding: 8px 12px;
  color: var(--streaming-color, #9ca3af);
  font-style: italic;
  font-size: 13px;
}

.final-answer {
  margin-top: 12px;
  padding: 12px;
  background: var(--final-answer-bg, #f0fdf4);
  border: 1px solid var(--final-answer-border, #86efac);
  border-radius: 8px;
}

.final-answer-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--final-answer-label-color, #166534);
  margin-bottom: 8px;
}
</style>
