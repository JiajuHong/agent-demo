<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Bot, Code } from 'lucide-vue-next'
import { useTheme }    from './composables/useTheme'
import { useChat }     from './composables/useChat'
import Sidebar         from './components/Sidebar.vue'
import ChatHeader      from './components/ChatHeader.vue'
import MessageBubble   from './components/MessageBubble.vue'
import ChatInput       from './components/InputArea.vue'
import HITLQuestion    from './components/HITLQuestion.vue'


// ─── Theme ────────────────────────────────────────────────────
const { isDark, toggleTheme } = useTheme()

// ─── Chat state ───────────────────────────────────────────────
const {
  sessions,
  currentSessionId,
  currentSession,
  messages,
  isStreaming,
  webSearch,
  thinking,
  sendMessage,
  renameSession,
  deleteSession,
  stopStreaming,
  clearDraftSession,
  selectSession,
  newChat,
  hitlSession,
} = useChat()

// ─── Sidebar (mobile) ─────────────────────────────────────────
const sidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)
const isMobile    = computed(() => windowWidth.value < 768)

function handleResize() { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  clearDraftSession()
})
watch(isMobile, (mobile) => { if (!mobile) sidebarOpen.value = false })

function toggleSidebar()  { sidebarOpen.value = !sidebarOpen.value }
function closeSidebar()   { sidebarOpen.value = false }

function onSelectSession(id: string) {
  selectSession(id)
  if (isMobile.value) sidebarOpen.value = false
}

async function onRenameSession(payload: { id: string; title: string }) {
  await renameSession(payload.id, payload.title)
}

async function onDeleteSession(id: string) {
  await deleteSession(id)
}

async function onRenameTitle(title: string) {
  if (!currentSessionId.value) return
  await renameSession(currentSessionId.value, title)
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000'

async function submitHitlAnswer(
  hitlData: typeof hitlSession.value,
  answers: Array<{ id: string; answer: string | string[] }>
) {
  if (!hitlData) return
  console.log('🎯 HITL 用户回答:', JSON.stringify(answers, null, 2))
  try {
    await fetch(`${API_BASE}/api/v1/chat/hitl/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: hitlData.session_id,
        answers
      })
    })
  } catch (err) {
    console.error('HITL submit failed:', err)
  }
  // 清空 HITL session
  hitlSession.value = null
}

// ─── Auto-scroll ──────────────────────────────────────────────
const messageArea = ref<HTMLDivElement | null>(null)
const autoScrollEnabled = ref(true)

function distanceToBottom(el: HTMLDivElement): number {
  return el.scrollHeight - el.scrollTop - el.clientHeight
}

function handleMessageScroll() {
  const el = messageArea.value
  if (!el) return

  // 用户上滑离开底部时暂停自动滚动；回到底部附近时恢复。
  autoScrollEnabled.value = distanceToBottom(el) < 48
}

async function scrollBottom() {
  if (!autoScrollEnabled.value) return
  await nextTick()
  if (messageArea.value) {
    messageArea.value.scrollTop = messageArea.value.scrollHeight
  }
}

watch(messages, scrollBottom, { deep: true })
watch(isStreaming, (v) => { if (v) scrollBottom() })
watch(currentSessionId, () => {
  autoScrollEnabled.value = true
  scrollBottom()
})

// ─── Actions ─────────────────────────────────────────────────
async function onSend(content: string, files: File[]) {
  await sendMessage(content, files)
}
function toggleWebSearch() {
  webSearch.value = !webSearch.value
  console.log('[webSearch]', webSearch.value)
}
function toggleThinking() {
  thinking.value = !thinking.value
  console.log('[thinking]', thinking.value)
}

const softwareFactory = ref(false)

function toggleSoftwareFactory() {
  softwareFactory.value = !softwareFactory.value
  console.log('[softwareFactory]', softwareFactory.value)
}

// ─── Derived ─────────────────────────────────────────────────
const chatTitle   = computed(() => currentSession.value?.title ?? '新对话')
const hasMessages = computed(() => messages.value.length > 0)
const lastMsgId   = computed(() => messages.value[messages.value.length - 1]?.id)
</script>

<template>
  <div class="app-shell" :class="{ dark: isDark }">

    <!-- Sidebar -->
    <Sidebar
      :sessions="sessions"
      :current-session-id="currentSessionId"
      :is-open="sidebarOpen || !isMobile"
      :is-dark="isDark"
      @new-chat="newChat"
      @select-session="onSelectSession"
      @rename-session="onRenameSession"
      @delete-session="onDeleteSession"
      @close="closeSidebar"
    />

    <!-- Main content -->
    <div class="chat-main">

      <!-- Top header bar -->
      <ChatHeader
        :title="chatTitle"
        :is-dark="isDark"
        :is-mobile="isMobile"
        @toggle-theme="toggleTheme"
        @toggle-sidebar="toggleSidebar"
        @rename-title="onRenameTitle"
      />

      <!-- Message feed -->
        <div v-if="hasMessages" ref="messageArea" class="message-area" @scroll="handleMessageScroll">
          <MessageBubble
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            :is-streaming="isStreaming && msg.id === lastMsgId && msg.role === 'assistant'"
          />
          <!-- HITL Question Component -->
          <HITLQuestion
            v-if="hitlSession"
            :hitl-session="hitlSession"
            @submit="(answers) => submitHitlAnswer(hitlSession!, answers)"
          />
          <div style="height:8px" />
        </div>

        <!-- Welcome / centered state -->
        <div v-else class="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div class="hero-fade-in flex w-full max-w-4xl flex-col items-center">
            <div class="mb-8 flex items-center gap-3 text-center">
              <Bot class="h-8 w-8 text-[#4D6BFE]" />
              <h2 class="text-2xl font-bold md:text-3xl" :class="isDark ? 'text-white' : 'text-gray-800'">
                今天有什么可以帮到你？
              </h2>
            </div>

            <div class="w-full max-w-4xl px-4">
              <ChatInput
                :is-streaming="isStreaming"
                :web-search="webSearch"
                :thinking="thinking"
                :software-factory="softwareFactory"
                :is-dark="isDark"
                @send="onSend"
                @stop="stopStreaming"
                @toggle-web-search="toggleWebSearch"
                @toggle-thinking="toggleThinking"
                @toggle-software-factory="toggleSoftwareFactory"
              />
            </div>
          </div>
        </div>

        <!-- Input area (always at bottom) -->
        <ChatInput
          v-if="hasMessages"
          :is-streaming="isStreaming"
          :web-search="webSearch"
          :thinking="thinking"
          :software-factory="softwareFactory"
          :is-dark="isDark"
          @send="onSend"
          @stop="stopStreaming"
          @toggle-web-search="toggleWebSearch"
          @toggle-thinking="toggleThinking"
          @toggle-software-factory="toggleSoftwareFactory"
        />

    </div>

  </div>
</template>

<style scoped>
@keyframes hero-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-fade-in {
  animation: hero-fade-in .7s ease both;
}
</style>
