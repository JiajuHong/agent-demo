<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Menu, Moon, PenLine, Sun } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  isDark: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  'toggle-theme': []
  'toggle-sidebar': []
  'rename-title': [title: string]
}>()

const editingTitle = ref(false)
const draftTitle = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)

async function startRename() {
  editingTitle.value = true
  draftTitle.value = props.title
  await nextTick()
  titleInputRef.value?.focus()
  titleInputRef.value?.select()
}

function submitRename() {
  const nextTitle = draftTitle.value.trim()
  if (nextTitle && nextTitle !== props.title) {
    emit('rename-title', nextTitle)
  }
  editingTitle.value = false
}

function cancelRename() {
  editingTitle.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-10 h-16 w-full"
    :class="props.isDark ? 'bg-[#17181C]' : 'bg-[var(--bg)]'"
  >
    <div class="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-4">
      <div class="flex min-w-[40px] items-center">
    <button
      v-if="isMobile"
      class="inline-flex h-10 w-10 items-center justify-center rounded-full transition-all"
      :class="props.isDark ? 'text-gray-200 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'"
      title="打开侧边栏"
      @click="emit('toggle-sidebar')"
    >
      <Menu class="h-5 w-5" />
    </button>
        <div v-else class="h-10 w-10" />
      </div>

      <div class="mx-3 flex min-w-0 flex-1 justify-center">
        <div class="group max-w-[85%]">
          <button
            v-if="!editingTitle"
            type="button"
            class="inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-medium transition-all md:text-base"
            :class="props.isDark
              ? 'border-transparent bg-transparent text-gray-100 hover:border-white/10 hover:bg-[#212226] hover:shadow-sm'
              : 'border-transparent bg-transparent text-gray-700 hover:border-gray-200 hover:bg-white hover:shadow-sm'"
            title="点击重命名会话"
            @click="startRename"
          >
            <span class="block truncate">{{ title }}</span>
            <PenLine
              class="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60"
              :class="props.isDark ? 'text-gray-300' : 'text-gray-500'"
            />
          </button>

          <div
            v-else
            class="rounded-full border px-3 py-1"
            :class="props.isDark ? 'border-white/10 bg-[#212226]' : 'border-gray-200 bg-white'"
          >
            <input
              ref="titleInputRef"
              v-model="draftTitle"
              class="w-[220px] bg-transparent text-sm outline-none md:w-[320px] md:text-base"
              :class="props.isDark ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-800 placeholder:text-gray-400'"
              maxlength="40"
              placeholder="请输入会话标题"
              @keydown.enter.prevent="submitRename"
              @keydown.escape.prevent="cancelRename"
              @blur="submitRename"
            />
          </div>
        </div>
      </div>

      <div class="flex min-w-[40px] justify-end">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full transition-all"
          :class="props.isDark ? 'text-gray-100 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="emit('toggle-theme')"
        >
          <Sun v-if="isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
</template>
