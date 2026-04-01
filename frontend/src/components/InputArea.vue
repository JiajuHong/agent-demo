<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { ArrowUp, Brain, Globe, Paperclip, Settings, Square } from 'lucide-vue-next'

const props = defineProps<{
  isStreaming: boolean
  webSearch:   boolean
  thinking:    boolean
  isDark:      boolean
}>()

const emit = defineEmits<{
  'send':              [content: string, files: File[]]
  'stop':              []
  'toggle-web-search': []
  'toggle-thinking':   []
}>()

const input      = ref('')
const textarea   = ref<HTMLTextAreaElement | null>(null)
const fileInput  = ref<HTMLInputElement | null>(null)
const files      = ref<File[]>([])
const isInputFocused = ref(false)

watch(
  () => props.webSearch,
  () => {
    // placeholder for future use
  },
)

const featureBtnBaseClass =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-normal transition-all sm:px-3.5 sm:text-sm'

const selectedFeatureClass =
  'bg-[#F0F5FF] border-[#D6E0FF] text-[#4D6BFE] shadow-[0_0_10px_rgba(77,107,254,0.12)]'

const selectedFeatureClassDark =
  'bg-[#1E2B5E] border-[#2A3B80] text-[#4D6BFE] shadow-[0_0_10px_rgba(77,107,254,0.18)]'

const unselectedFeatureClass = computed(() =>
  props.isDark
    ? 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100',
)

const searchBtnClass = computed(() =>
  `${featureBtnBaseClass} ${
    props.webSearch
      ? (props.isDark ? selectedFeatureClassDark : selectedFeatureClass)
      : (props.isDark ? 'border-white/10 bg-[#2E2F34] text-gray-300 hover:bg-[#35363C]' : unselectedFeatureClass.value)
  }`,
)

const thinkingBtnClass = computed(() =>
  `${featureBtnBaseClass} ${
    props.thinking
      ? (props.isDark ? selectedFeatureClassDark : selectedFeatureClass)
      : (props.isDark ? 'border-white/10 bg-[#2E2F34] text-gray-300 hover:bg-[#35363C]' : unselectedFeatureClass.value)
  }`,
)



const sendBtnClass = computed(() => {
  if (props.isStreaming) {
    return 'bg-red-500 text-white hover:bg-red-600'
  }
  if (input.value.trim() || files.value.length > 0) {
    return 'bg-[#4D6BFE] text-white hover:brightness-110'
  }
  return 'bg-[#D6E0FF] text-white'
})

const inputCardClass = computed(() => {
  if (isInputFocused.value || input.value.trim()) {
    return 'ring-1 ring-[#4D6BFE]/20 border-[#4D6BFE] shadow-[0_0_15px_rgba(77,107,254,0.1)]'
  }
  return ''
})

const paperclipBtnClass = computed(() =>
  props.isDark
    ? 'border-white/10 bg-[#212226] text-gray-400 hover:text-gray-100 hover:bg-[#2A2B30]'
    : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100',
)

async function autoResize() {
  await nextTick()
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

function submit() {
  if (props.isStreaming) {
    emit('stop')
    return
  }

  const text = input.value.trim()
  if (!text && files.value.length === 0) return
  emit('send', text, files.value)
  input.value = ''
  files.value = []
  nextTick(autoResize)
}

async function openFilePicker() {
  fileInput.value?.click()
}

async function handleFileChange(e: Event) {
  const el = e.target as HTMLInputElement
  if (!el.files) return
  const picked = Array.from(el.files)
  for (const file of picked) {
    files.value.push(file)
  }
  el.value = ''
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

function toggleSearch() {
  emit('toggle-web-search')
}

function toggleThinking() {
  emit('toggle-thinking')
}


</script>

<template>
  <div class="input-wrap">
    <div class="input-card" :class="inputCardClass">

      <!-- Attached file chips -->
      <div v-if="files.length > 0" class="file-list">
        <div v-for="(f, i) in files" :key="i" class="file-chip">
          <span>📎 {{ f.name }}</span>
          <button class="file-chip-remove" title="移除" @click="removeFile(i)">×</button>
        </div>
      </div>

      <!-- Textarea -->
      <textarea
        ref="textarea"
        v-model="input"
        class="input-textarea"
        placeholder="给 小助手 发消息"
        rows="1"
        @input="autoResize"
        @keydown="handleKeydown"
        @focus="isInputFocused = true"
        @blur="isInputFocused = false"
      />

      <!-- Action bar -->
      <div class="flex items-center justify-between gap-3 px-3 pb-3 pt-2">
        <div class="flex items-center gap-2">
          <!-- <button
            type="button"
            :class="thinkingBtnClass"
            title="深度思考"
            @click="toggleThinking"
          >
            <Brain class="h-3.5 w-3.5" />
            <span>深度思考</span>
          </button> -->

          <!-- <button
            type="button"
            :class="searchBtnClass"
            title="智能搜索"
            @click="toggleSearch"
          >
            <Globe class="h-3.5 w-3.5" />
            <span>智能搜索</span>
          </button> -->
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all"
            :class="paperclipBtnClass"
            title="上传文件"
            @click="openFilePicker"
          >
            <Paperclip class="h-4 w-4" />
          </button>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.gif,.webp"
            class="hidden"
            @change="handleFileChange"
          />

          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all"
            :class="sendBtnClass"
            :title="isStreaming ? '停止生成' : '发送'"
            :disabled="!isStreaming && !input.trim() && files.length === 0"
            @click="submit"
          >
            <Square v-if="isStreaming" class="h-3.5 w-3.5 fill-current" />
            <ArrowUp v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <p class="input-hint">AI 生成内容仅供参考，请自行核实重要信息</p>
  </div>
</template>

<style scoped>
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px 0;
}

.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
}

.file-chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  color: #9ca3af;
}

.file-chip-remove:hover {
  color: #ef4444;
}
</style>
