<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
import type { Message } from '../types'

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

// 自定义 linkify 规则：排除文件扩展名（如 .md, .js, .css 等）
// md.linkify.add('http:', null)
// md.linkify.add('https:', null)
// md.linkify.tlds('.onion', true)  // 重新启用 .onion 如果需要

// 使用正则排除所有点号开头的文件扩展名模式
const originalLinkify = md.linkify.match
md.linkify.match = function(text: string) {
  const matches = originalLinkify.call(this, text)
  if (!matches) return []
  return matches.filter((match: { text: string }) => {
    // 排除形如 "文件名.扩展名" 的模式（包含点且扩展名是常见代码文件类型）
    const fileExtPattern = /\.[a-zA-Z0-9]+$/
    if (fileExtPattern.test(match.text)) {
      // 检查是否是文件路径模式（包含 / 或 \ 或者是纯文件名）
      const isFilePath = match.text.includes('/') || match.text.includes('\\') || 
                        !match.text.includes(':') // 不包含协议说明符
      if (isFilePath) return false
    }
    return true
  })
}

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

      <template v-if="message.role === 'assistant'">
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

      <template v-else-if="message.role === 'user'">
        <div class="bubble user">
          <div v-html="renderUserContent(message.content)" />
        </div>
      </template>

      <template v-else-if="message.role === 'tool'">
        <div class="tool-inline">
          <span class="tool-label">{{ message.metadata?.tool_name || 'tool' }}</span>
          <div v-if="message.metadata?.arguments" class="tool-args">
            <pre><code>{{ message.metadata.arguments }}</code></pre>
          </div>
          <div
            class="tool-content"
          >
            {{ message.content }}
          </div>
        </div>
      </template>

      <div class="msg-time">{{ message.time }}</div>
    </div>

    <div v-if="message.role === 'user'" class="avatar user">你</div>

  </div>
</template>

<style scoped>
.tool-inline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: var(--tool-inline-bg, #f3f4f6);
  border-radius: 8px;
  border-left: 3px solid var(--tool-inline-border, #6b7280);
}

.tool-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--tool-inline-label-color, #6b7280);
  text-transform: uppercase;
}

.tool-args {
  margin-top: 4px;
  padding: 6px 8px;
  background: var(--tool-args-bg, #fff);
  border-radius: 4px;
  border: 1px solid var(--tool-args-border, #e5e7eb);
}

.tool-args pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.tool-args code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: var(--tool-args-color, #374151);
}

.tool-content {
  font-size: 13px;
  color: var(--tool-inline-content-color, #374151);
  white-space: pre-wrap;
  word-break: break-all;
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

.streaming-indicator {
  padding: 8px 12px;
  color: var(--streaming-color, #9ca3af);
  font-style: italic;
  font-size: 13px;
}
</style>
