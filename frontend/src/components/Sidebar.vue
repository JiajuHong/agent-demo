<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Sparkles, PenLine, Trash2 } from 'lucide-vue-next'
import type { Session } from '../types'

defineProps<{
  sessions: Session[]
  currentSessionId: string | null
  isOpen: boolean
  isDark: boolean
}>()

const emit = defineEmits<{
  'new-chat': []
  'select-session': [id: string]
  'rename-session': [payload: { id: string; title: string }]
  'delete-session': [id: string]
  'close': []
}>()

const isCollapsed = ref(false)
const editingId = ref<string | null>(null)
const editTitle = ref('')
const editInputRef = ref<HTMLInputElement[]>([])

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}

function expandSidebar() {
  isCollapsed.value = false
}

async function startEdit(session: Session) {
  if (isCollapsed.value) return
  editingId.value = session.id
  editTitle.value = session.title
  await nextTick()
  editInputRef.value[0]?.focus()
  editInputRef.value[0]?.select()
}

function confirmRename(session: Session) {
  const title = editTitle.value.trim()
  if (title && title !== session.title) {
    emit('rename-session', { id: session.id, title })
  }
  editingId.value = null
}

function cancelRename() {
  editingId.value = null
}

function handleDelete(session: Session) {
  const ok = window.confirm(`确定删除会话“${session.title}”？此操作不可恢复。`)
  if (!ok) return
  emit('delete-session', session.id)
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-30 bg-black/30 lg:hidden"
      @click="emit('close')"
    />
  </Transition>

  <aside
    class="z-40 flex h-screen min-w-0 flex-col transition-all duration-300 ease-in-out lg:relative lg:translate-x-0"
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      isCollapsed ? 'w-0 overflow-visible' : 'w-[260px]',
      isCollapsed
        ? (isDark ? 'border-transparent bg-[#101214]' : 'border-transparent bg-gray-100')
        : (isDark ? 'border-r border-white/5 bg-[#101214]' : 'border-r border-gray-200 bg-gray-100'),
    ]"
  >
    <header v-if="!isCollapsed" class="flex items-center justify-between p-4">
      <h2 v-if="!isCollapsed" class="text-xl font-bold transition-colors" :class="isDark ? 'text-gray-100' : 'text-gray-800'">小助手</h2>
      <div v-else class="w-5" />
      <div class="group relative">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full transition-all"
          :class="isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200'"
          aria-label="收起边栏"
          @click="toggleCollapsed"
        >
          <PanelLeftClose class="h-5 w-5" />
        </button>
        <span
          class="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
          :class="isDark ? 'border-white/10 bg-[#0b0b0c] text-gray-100' : 'border-black/5 bg-black text-white'"
        >
          收起边栏
        </span>
      </div>
    </header>

    <div v-else class="hidden" />

    <div v-if="!isCollapsed" class="px-3 pb-3">
      <button
        type="button"
        class="flex h-12 w-full items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium transition-all hover:shadow-sm"
        :class="[
          isDark
            ? 'border-white/10 bg-[#212226] text-gray-100 hover:bg-[#2a2b30]'
            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
          isCollapsed ? 'px-0' : '',
        ]"
        @click="emit('new-chat')"
      >
        <MessageSquarePlus class="h-4 w-4 shrink-0" />
        <span v-if="!isCollapsed">开启新对话</span>
      </button>
    </div>

    <div v-if="!isCollapsed" class="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
      <div v-if="sessions.length === 0" class="px-2 py-6 text-center text-sm" :class="isDark ? 'text-gray-500' : 'text-gray-500'">
        {{ isCollapsed ? '-' : '暂无历史记录' }}
      </div>

      <ul v-else class="space-y-1">
        <li v-for="s in sessions" :key="s.id">
          <div
            class="group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors"
            :class="[
              s.id === currentSessionId
                ? (isDark ? 'bg-[#212226] ring-1 ring-white/5' : 'bg-gray-200')
                : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200/70'),
            ]"
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 items-center gap-2 text-left"
              @click="emit('select-session', s.id)"
            >
              <template v-if="!isCollapsed">
                <input
                  v-if="editingId === s.id"
                  ref="editInputRef"
                  v-model="editTitle"
                  class="w-full rounded-md border px-2 py-1 text-sm outline-none ring-0"
                  :class="isDark
                    ? 'border-white/10 bg-[#212226] text-gray-100 focus:border-[#4D6BFE]'
                    : 'border-gray-300 bg-white text-gray-800 focus:border-gray-500'"
                  maxlength="40"
                  @keydown.enter.prevent="confirmRename(s)"
                  @keydown.escape.prevent="cancelRename"
                  @blur="confirmRename(s)"
                />
                <span v-else class="truncate text-sm" :class="isDark ? 'text-gray-100' : 'text-gray-700'">{{ s.title }}</span>
              </template>
            </button>

            <div v-if="!isCollapsed && editingId !== s.id" class="hidden items-center gap-1 group-hover:flex">
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md"
                :class="isDark
                  ? 'text-gray-400 hover:bg-white/10 hover:text-gray-100'
                  : 'text-gray-500 hover:bg-white hover:text-gray-700'"
                title="重命名"
                @click.stop="startEdit(s)"
              >
                <PenLine class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md"
                :class="isDark
                  ? 'text-gray-400 hover:bg-white/10 hover:text-red-400'
                  : 'text-gray-500 hover:bg-white hover:text-red-600'"
                title="删除"
                @click.stop="handleDelete(s)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </aside>

  <div v-if="isCollapsed" class="fixed left-4 top-4 z-50 flex items-center gap-3">
    <div
      class="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors"
      :class="isDark ? 'bg-[#212226] text-[#6E86FF]' : 'bg-[#EAF0FF] text-[#4D6BFE]'"
    >
      <Sparkles class="h-4 w-4" />
    </div>

    <div
      class="rounded-full border p-1 shadow-sm transition-colors"
      :class="isDark ? 'border-white/10 bg-[#212226] shadow-[0_4px_16px_rgba(0,0,0,0.35)]' : 'border-gray-100 bg-white'"
    >
      <div class="flex items-center gap-1">
        <div class="group relative">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all"
            :class="isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'"
            aria-label="打开边栏"
            @click="expandSidebar"
          >
            <PanelLeftOpen class="h-4 w-4" />
          </button>
          <span
            class="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            :class="isDark ? 'border-white/10 bg-[#0b0b0c] text-gray-100' : 'border-black/5 bg-black text-white'"
          >
            打开边栏
          </span>
        </div>

        <div class="group relative">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all"
            :class="isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'"
            aria-label="开启新对话"
            @click="emit('new-chat')"
          >
            <MessageSquarePlus class="h-4 w-4" />
          </button>
          <span
            class="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
            :class="isDark ? 'border-white/10 bg-[#0b0b0c] text-gray-100' : 'border-black/5 bg-black text-white'"
          >
            开启新对话
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
