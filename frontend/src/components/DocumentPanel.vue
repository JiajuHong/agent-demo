<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FileText, Code, Eye, EyeOff, ChevronDown, Save, Download } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
})

const props = defineProps<{
  sessionId: string | null
  isDark: boolean
}>()

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000'

type DocType = 'srs' | 'design' | 'code'
const activeTab = ref<DocType>('srs')
const isLoading = ref(false)
const srsContent = ref('')
const designContent = ref('')
const codeTree = ref<Array<{ path: string; type: string }>>([])
const selectedFile = ref<string | null>(null)
const fileContent = ref('')
const showPreview = ref(false)
const previewOnly = ref(false)
const editedContent = ref('')
const previewRef = ref<HTMLDivElement | null>(null)
const selectedFileIndex = ref(-1)
const editorLoaded = ref(false)
const editorInstance = ref<any>(null)
const isScrolling = ref(false)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
      } catch {
        // ignore
      }
    }
    return '<pre class="hljs"><code>' + MarkdownIt().utils.escapeHtml(str) + '</code></pre>'
  }
})

const editorOptions = computed(() => ({
  theme: props.isDark ? 'vs-dark' : 'vs',
  language: currentLanguage.value,
  readOnly: false,
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on',
  padding: { top: 12 },
}))

const markdownEditorOptions = computed(() => ({
  theme: props.isDark ? 'vs-dark' : 'vs',
  language: 'markdown',
  readOnly: false,
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on',
  padding: { top: 12 },
  folding: true,
  renderLineHighlight: 'line',
  quickSuggestions: false,
}))

const tabs = [
  { key: 'srs', label: '需求规格说明书', icon: FileText },
  { key: 'design', label: '设计文档', icon: Code },
  { key: 'code', label: '代码', icon: Eye },
] as const

const codeExtensions = ['.py', '.js', '.ts', '.jsx', '.tsx', '.vue', '.html', '.css', '.scss', '.json', '.yaml', '.yml', '.toml', '.xml', '.md', '.txt', '.sql', '.sh', '.bash', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php', '.rs', '.swift', '.kt', '.scala']

const languageMap: Record<string, string> = {
  '.py': 'python',
  '.js': 'javascript',
  '.ts': 'typescript',
  '.jsx': 'javascript',
  '.tsx': 'typescript',
  '.vue': 'html',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.go': 'go',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.rs': 'rust',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
}

const currentLanguage = computed(() => {
  if (!selectedFile.value) return 'plaintext'
  const ext = selectedFile.value.substring(selectedFile.value.lastIndexOf('.'))
  return languageMap[ext.toLowerCase()] || 'plaintext'
})

const filteredCodeTree = computed(() => {
  return codeTree.value.filter(item => {
    if (item.type === 'directory') return false
    const ext = item.path.substring(item.path.lastIndexOf('.')).toLowerCase()
    return codeExtensions.includes(ext) || !item.path.includes('.')
  })
})

const currentContent = computed({
  get: () => {
    if (activeTab.value === 'srs') return srsContent.value
    if (activeTab.value === 'design') return designContent.value
    return fileContent.value
  },
  set: (value: string) => {
    if (activeTab.value === 'srs') srsContent.value = value
    else if (activeTab.value === 'design') designContent.value = value
    else fileContent.value = value
  },
})

const previewContent = ref('')

const displayContent = computed(() => {
  return editedContent.value || currentContent.value
})

async function renderWithMermaid(content: string): Promise<string> {
  const mermaidPlaceholders = new Map<string, string>()
  let mermaidIndex = 0

  const createMermaidPlaceholder = (code: string) => {
    const key = `@@MERMAIDPH_${mermaidIndex++}@@`
    mermaidPlaceholders.set(key, code)
    return key
  }

  const mermaidBlockRegex = /```mermaid\n([\s\S]*?)```/g
  let contentWithMermaid = content.replace(mermaidBlockRegex, (_match, code) => {
    return createMermaidPlaceholder(code.trim())
  })

  let html = md.render(contentWithMermaid)

  for (const [key, code] of mermaidPlaceholders) {
    const id = `mermaid-preview-${Date.now()}-${key.replace(/\D/g, '')}`
    let svg = ''
    try {
      const result = await mermaid.render(id, code)
      svg = result.svg
    } catch {
      svg = `<pre class="mermaid-error">Mermaid 渲染错误</pre>`
    }
    html = html.replaceAll(key, `<div class="mermaid">${svg}</div>`)
  }

  return html
}

watch(displayContent, async (content) => {
  previewContent.value = await renderWithMermaid(content)
}, { immediate: true })

watch(fileContent, (content) => {
  if (content && editedContent.value !== content) {
    editedContent.value = content
  }
})

async function fetchSRS() {
  if (!props.sessionId) return
  isLoading.value = true
  try {
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/SRS.md`)
    if (res.ok) {
      const text = await res.text()
      srsContent.value = text
      editedContent.value = text
    }
  } catch (e) {
    console.error('Failed to fetch SRS:', e)
  } finally {
    isLoading.value = false
  }
}

async function fetchDesign() {
  if (!props.sessionId) return
  isLoading.value = true
  try {
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/DESIGN.md`)
    if (res.ok) {
      const text = await res.text()
      designContent.value = text
      editedContent.value = text
    }
  } catch (e) {
    console.error('Failed to fetch Design:', e)
  } finally {
    isLoading.value = false
  }
}

async function fetchCodeTree() {
  if (!props.sessionId) return
  isLoading.value = true
  try {
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/tree`)
    if (res.ok) {
      codeTree.value = await res.json()
      if (filteredCodeTree.value.length > 0) {
        selectFile(0)
      }
    }
  } catch (e) {
    console.error('Failed to fetch code tree:', e)
  } finally {
    isLoading.value = false
  }
}

async function selectFile(index: number) {
  const file = filteredCodeTree.value[index]
  if (!file || !props.sessionId) return
  selectedFileIndex.value = index
  editorLoaded.value = false
  try {
    const encodedPath = encodeURIComponent(file.path)
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/${encodedPath}`)
    if (res.ok) {
      const text = await res.text()
      fileContent.value = text
      editedContent.value = text
      selectedFile.value = file.path
    } else {
      console.error('Failed to fetch file:', res.status, res.statusText)
    }
  } catch (e) {
    console.error('Failed to fetch file:', e)
  }
}

async function saveFile() {
  if (!selectedFile.value || !props.sessionId) return
  isLoading.value = true
  try {
    const encodedPath = encodeURIComponent(selectedFile.value)
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/${encodedPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: editedContent.value })
    })
    if (res.ok) {
      fileContent.value = editedContent.value
      console.log('File saved successfully')
    } else {
      console.error('Failed to save file:', res.status, res.statusText)
    }
  } catch (e) {
    console.error('Failed to save file:', e)
  } finally {
    isLoading.value = false
  }
}

async function saveDoc() {
  if (!props.sessionId) return
  isLoading.value = true
  const filename = activeTab.value === 'srs' ? 'SRS.md' : 'DESIGN.md'
  try {
    const encodedPath = encodeURIComponent(filename)
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/${encodedPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: editedContent.value })
    })
    if (res.ok) {
      if (activeTab.value === 'srs') {
        srsContent.value = editedContent.value
      } else {
        designContent.value = editedContent.value
      }
      console.log('Document saved successfully')
    } else {
      console.error('Failed to save document:', res.status, res.statusText)
    }
  } catch (e) {
    console.error('Failed to save document:', e)
  } finally {
    isLoading.value = false
  }
}

async function downloadZip() {
  if (!props.sessionId) return
  try {
    const res = await fetch(`${apiBase}/api/v1/files/${props.sessionId}/download`)
    if (!res.ok) {
      console.error('Failed to download:', res.status, res.statusText)
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.sessionId}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Failed to download zip:', e)
  }
}

function handleEditorMount(editor: any) {
  editorInstance.value = editor
  editor.onDidScrollChange(() => {
    if (isScrolling.value || !previewRef.value) return
    isScrolling.value = true

    const scrollTop = editor.getScrollTop()
    const scrollHeight = editor.getScrollHeight()
    const editorHeight = editor.getLayoutInfo().height
    const visibleTopLine = editor.getTopForLineNumber(1)

    // 计算当前滚动位置在编辑器中的比例
    const scrollRatio = (scrollTop - visibleTopLine) / (scrollHeight - editorHeight)

    // 同步预览区域
    const previewHeight = previewRef.value.scrollHeight
    const previewScrollTop = scrollRatio * (previewHeight - previewRef.value.clientHeight)
    previewRef.value.scrollTop = Math.max(0, previewScrollTop)

    setTimeout(() => { isScrolling.value = false }, 30)
  })
}

function onPreviewScroll(event: Event) {
  if (isScrolling.value || !editorInstance.value) return
  const target = event.target as HTMLDivElement
  isScrolling.value = true

  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 计算预览滚动比例
  const scrollRatio = scrollTop / (scrollHeight - clientHeight)

  // 获取编辑器总高度
  const editorScrollHeight = editorInstance.value.getScrollHeight()
  const editorClientHeight = editorInstance.value.getLayoutInfo().height

  // 同步编辑器滚动位置
  const editorScrollTop = scrollRatio * (editorScrollHeight - editorClientHeight)
  editorInstance.value.setScrollTop(Math.max(0, editorScrollTop))

  setTimeout(() => { isScrolling.value = false }, 30)
}

watch(activeTab, async (tab) => {
  editorInstance.value = null
  if (tab === 'srs') {
    if (!srsContent.value) await fetchSRS()
    editedContent.value = srsContent.value
  } else if (tab === 'design') {
    if (!designContent.value) await fetchDesign()
    editedContent.value = designContent.value
  } else if (tab === 'code') {
    if (!codeTree.value.length) await fetchCodeTree()
    else if (!selectedFile.value && filteredCodeTree.value.length > 0) {
      await selectFile(0)
    }
    editedContent.value = fileContent.value
  }
})

watch(() => props.sessionId, (id) => {
  if (id) {
    srsContent.value = ''
    designContent.value = ''
    codeTree.value = []
    selectedFile.value = null
    fileContent.value = ''
    activeTab.value = 'srs'
    fetchSRS()
  }
}, { immediate: true })
</script>

<template>
  <div class="document-panel" :class="{ dark: isDark }">
    <!-- Tab 切换 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 代码预览模式 -->
      <template v-else-if="activeTab === 'code'">
        <div v-if="!filteredCodeTree.length" class="empty">
          <Code class="empty-icon" />
          <p>暂无代码</p>
          <p class="empty-hint">完成设计阶段后将生成代码</p>
        </div>
        <div v-else class="code-container">
          <!-- 文件选择器 -->
          <div class="file-selector">
            <div class="selector-left">
              <button class="file-selector-btn">
                <span class="file-name">{{ selectedFile || '选择文件...' }}</span>
                <ChevronDown class="chevron" />
              </button>
              <div class="file-dropdown">
                <div
                  v-for="(item, index) in filteredCodeTree"
                  :key="item.path"
                  :class="['file-option', { selected: selectedFileIndex === index }]"
                  @click="selectFile(index)"
                >
                  {{ item.path.split('/').pop() }}
                  <span class="file-path-hint">{{ item.path }}</span>
                </div>
              </div>
            </div>
            <button class="tool-btn" @click="downloadZip">
              <Download class="btn-icon" />
              下载
            </button>
          </div>

          <!-- 文件内容编辑器 -->
          <div v-if="selectedFile" class="file-editor">
            <div class="editor-toolbar">
              <span class="file-name">{{ selectedFile }}</span>
              <div class="toolbar-actions">
                <button class="tool-btn" @click="saveFile">
                  <Save class="btn-icon" />
                  保存
                </button>
              </div>
            </div>
            <div class="code-editor-area">
              <VueMonacoEditor
                v-if="selectedFile"
                :key="selectedFile"
                v-model:value="editedContent"
                :language="currentLanguage"
                :options="editorOptions"
                class="monaco-editor"
                @mount="editorLoaded = true"
              />
              <div v-if="!editorLoaded" class="editor-loading">
                <div class="loading-spinner"></div>
                <span>加载编辑器...</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>选择一个文件查看内容</p>
          </div>
        </div>
      </template>

      <!-- 文档编辑模式 (SRS / Design) -->
      <template v-else>
        <div v-if="!currentContent && !isLoading" class="empty">
          <FileText class="empty-icon" />
          <p>暂无{{ activeTab === 'srs' ? '需求规格说明书' : '设计文档' }}</p>
          <p class="empty-hint">继续对话，系统将自动生成文档</p>
        </div>
        <div v-else class="document-editor">
          <!-- 编辑器工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <span class="toolbar-title">
                {{ activeTab === 'srs' ? '需求规格说明书' : '软件设计文档' }}
              </span>
            </div>
            <div class="toolbar-actions">
              <button class="tool-btn" @click="saveDoc">
                <Save class="btn-icon" />
                保存
              </button>
              <button class="tool-btn" @click="previewOnly = !previewOnly; if(previewOnly) showPreview = true">
                <EyeOff v-if="previewOnly" class="btn-icon" />
                <Eye v-else class="btn-icon" />
                {{ previewOnly ? '取消仅预览' : '仅预览' }}
              </button>
              <button class="tool-btn" @click="showPreview = !showPreview">
                <Eye class="btn-icon" />
                {{ showPreview ? '隐藏分栏' : '显示分栏' }}
              </button>
            </div>
          </div>

          <!-- 编辑器 + 预览 -->
          <div class="editor-content" :class="{ 'with-preview': showPreview && !previewOnly, 'preview-only': previewOnly }">
            <div v-if="!previewOnly" class="editor-pane">
              <VueMonacoEditor
                :key="activeTab"
                v-model:value="editedContent"
                language="markdown"
                :options="markdownEditorOptions"
                class="monaco-editor"
                @mount="handleEditorMount"
              />
            </div>
            <div v-if="showPreview || previewOnly" ref="previewRef" class="preview-pane" :class="{ 'full-width': previewOnly }" @scroll="onPreviewScroll">
              <div class="markdown-body" v-html="previewContent"></div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.document-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
}

.document-panel.dark {
  background: #1f2937;
  border-left-color: #374151;
}

/* Tab Bar */
.tab-bar {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.dark .tab-bar {
  background: #111827;
  border-bottom-color: #374151;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: #f3f4f6;
}

.dark .tab:hover {
  background: #1f2937;
}

.tab.active {
  color: #4f46e5;
  border-bottom: 2px solid #4f46e5;
}

.tab-icon {
  width: 14px;
  height: 14px;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  text-align: center;
  padding: 20px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.7;
}

/* Editor Toolbar */
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .editor-toolbar {
  background: #111827;
  border-bottom-color: #374151;
}

.toolbar-title {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.dark .toolbar-title {
  color: #e5e7eb;
}

.file-name {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #6b7280;
}

.dark .file-name {
  color: #9ca3af;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .tool-btn {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

.tool-btn:hover {
  background: #f3f4f6;
}

.dark .tool-btn:hover {
  background: #4b5563;
}

.tool-btn.primary {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.tool-btn.primary:hover {
  background: #4338ca;
}

.tool-btn.save {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.tool-btn.save:hover {
  background: #059669;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* Code Container */
.code-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

.file-selector {
  position: relative;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-left {
  flex: 1;
  min-width: 0;
  position: relative;
}

.dark .file-selector {
  background: #1a1a2e;
  border-bottom-color: #374151;
}

.file-selector-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
}

.dark .file-selector-btn {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

.file-selector-btn .file-name {
  flex: 1;
  text-align: left;
}

.chevron {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.file-dropdown {
  position: absolute;
  top: 100%;
  left: 12px;
  right: 12px;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  display: none;
}

.file-selector:hover .file-dropdown,
.file-selector:focus-within .file-dropdown {
  display: block;
}

.dark .file-dropdown {
  background: #1f2937;
  border-color: #374151;
}

.file-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid #f3f4f6;
}

.dark .file-option {
  border-bottom-color: #374151;
}

.file-option:hover {
  background: #f3f4f6;
}

.dark .file-option:hover {
  background: #374151;
}

.file-option.selected {
  background: #eef2ff;
  color: #4f46e5;
}

.dark .file-option.selected {
  background: #312e81;
  color: #a5b4fc;
}

.file-path-hint {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.file-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.code-editor-area {
  flex: 1;
  overflow: hidden;
}

.monaco-editor {
  width: 100%;
  height: 100%;
}

.editor-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  gap: 12px;
}

/* Document Editor */
.document-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

/* Editor Content */
.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.editor-content.with-preview .editor-pane {
  width: 50%;
  border-right: 1px solid #e5e7eb;
}

.dark .editor-content.with-preview .editor-pane {
  border-right-color: #374151;
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 0;
}

.preview-pane {
  width: 50%;
  overflow-y: auto;
  background: #fafafa;
  flex: 1;
}

.preview-pane.full-width {
  width: 100%;
}

.dark .preview-pane {
  background: #1a1a2e;
}

/* Markdown Preview */
.markdown-body {
  padding: 16px;
  font-size: 14px;
  line-height: 1.8;
  color: #374151;
}

.dark .markdown-body {
  color: #e5e7eb;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  font-weight: 600;
  margin: 1.2em 0 0.6em;
  color: #111827;
}

.dark .markdown-body :deep(h1),
.dark .markdown-body :deep(h2),
.dark .markdown-body :deep(h3),
.dark .markdown-body :deep(h4) {
  color: #f3f4f6;
}

.markdown-body :deep(h1) { font-size: 1.6em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
.markdown-body :deep(h2) { font-size: 1.4em; }
.markdown-body :deep(h3) { font-size: 1.2em; }

.markdown-body :deep(p) {
  margin: 0.8em 0;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  background: #f3f4f6;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
  color: #d63384;
}

.dark .markdown-body :deep(code) {
  background: #374151;
  color: #f9a8d4;
}

.markdown-body :deep(pre) {
  background: #1e1e2f;
  color: #e5e7eb;
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.dark .markdown-body :deep(pre) {
  background: #12121f;
}

.markdown-body :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.8em 0;
}

.markdown-body :deep(li) {
  margin: 0.3em 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.dark .markdown-body :deep(th),
.dark .markdown-body :deep(td) {
  border-color: #374151;
}

.markdown-body :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}

.dark .markdown-body :deep(th) {
  background: #1f2937;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid #4f46e5;
  margin: 1em 0;
  padding-left: 1em;
  color: #6b7280;
}

.dark .markdown-body :deep(blockquote) {
  color: #9ca3af;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.markdown-body :deep(.mermaid) {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
}

.dark .markdown-body :deep(.mermaid) {
  background: #1f2937;
}

.markdown-body :deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
}

.markdown-body :deep(.mermaid-error) {
  color: #ef4444;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.dark .markdown-body :deep(.mermaid-error) {
  background: #7f1d1d;
  color: #fca5a5;
}
</style>
