<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HITLSession } from '../types'

const props = defineProps<{
  hitlSession: HITLSession
}>()

const emit = defineEmits<{
  (e: 'submit', answers: Array<{
    id: string;
    answer: string | string[] | { choice: string | string[]; input: string | string[] }
  }>): void
}>()

const answers = ref<Record<string, string | string[]>>({})

const getOptionValue = (option: string | { value: string; label: string }): string => {
  return typeof option === 'string' ? option : option.value
}

const getOptionLabel = (option: string | { value: string; label: string }): string => {
  return typeof option === 'string' ? option : option.label
}

const handleSubmit = () => {
  const answerList = props.hitlSession.questions.map(q => {
    const answer = answers.value[q.id]
    if (q.type === 'confirm' && answers.value[q.id + '_input']) {
      return {
        id: q.id,
        answer: {
          choice: answer || 'modify',
          input: answers.value[q.id + '_input']
        }
      }
    }
    return {
      id: q.id,
      answer: answer ?? ''
    }
  })
  console.log('🎯 HITL 组件收集的答案:', JSON.stringify(answerList, null, 2))
  emit('submit', answerList)
}

const handleChoiceChange = (questionId: string, value: string) => {
  answers.value[questionId] = value
}

const handleMultiChoiceChange = (questionId: string, value: string) => {
  const current = (answers.value[questionId] as string[]) || []
  console.log('multi_choice before:', questionId, current)
  if (current.includes(value)) {
    const filtered = current.filter(v => v !== value)
    answers.value[questionId] = filtered.length > 0 ? filtered : ''
  } else {
    answers.value[questionId] = [...current, value]
  }
  console.log('multi_choice after:', questionId, answers.value[questionId])
}

const isAllRequiredAnswered = computed(() => {
  return props.hitlSession.questions
    .filter(q => q.required)
    .every(q => {
      const answer = answers.value[q.id]
      if (Array.isArray(answer)) return answer.length > 0
      return !!answer
    })
})
</script>

<template>
  <div class="max-w-xl mx-auto">
    <div class="bg-white dark:bg-[#212226] shadow-xl shadow-gray-200/50 dark:shadow-none rounded-[24px] p-6">
      <div class="mb-5">
        <span class="inline-block bg-[#4D6BFE] text-white px-4 py-1.5 rounded-full text-xs font-medium">
          🤖 请回答问题
        </span>
      </div>

      <div class="flex flex-col gap-6">
        <div
          v-for="question in hitlSession.questions"
          :key="question.id"
          class="flex flex-col gap-3"
        >
          <label class="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
            {{ question.text }}
            <span v-if="question.required" class="text-red-400 text-sm">*</span>
          </label>

          <input
            v-if="question.type === 'text'"
            type="text"
            class="bg-gray-100 dark:bg-[#2E2F34] text-gray-700 dark:text-gray-100 px-4 py-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4D6BFE] placeholder:text-gray-400"
            :placeholder="`请输入${question.text}`"
            :value="answers[question.id] || ''"
            @input="handleChoiceChange(question.id, ($event.target as HTMLInputElement).value)"
          />

          <div v-else-if="question.type === 'choice'" class="flex flex-wrap gap-2">
            <button
              v-for="option in question.options"
              :key="getOptionValue(option)"
              type="button"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              :class="{
                'bg-[#4D6BFE] text-white': answers[question.id] === getOptionValue(option),
                'bg-gray-100 text-gray-600 hover:bg-gray-200': answers[question.id] !== getOptionValue(option),
                'dark:bg-[#2E2F34] dark:text-gray-400 dark:hover:bg-[#3A3B40]': answers[question.id] !== getOptionValue(option)
              }"
              @click="handleChoiceChange(question.id, getOptionValue(option))"
            >
              {{ getOptionLabel(option) }}
            </button>
          </div>

          <div v-else-if="question.type === 'multi_choice'" class="flex flex-wrap gap-2">
            <button
              v-for="option in question.options"
              :key="getOptionValue(option)"
              type="button"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              :class="{
                'bg-[#4D6BFE] text-white': (answers[question.id] as string[] || []).includes(getOptionValue(option)),
                'bg-gray-100 text-gray-600 hover:bg-gray-200': !(answers[question.id] as string[] || []).includes(getOptionValue(option)),
                'dark:bg-[#2E2F34] dark:text-gray-400 dark:hover:bg-[#3A3B40]': !(answers[question.id] as string[] || []).includes(getOptionValue(option))
              }"
              @click="handleMultiChoiceChange(question.id, getOptionValue(option))"
            >
              {{ getOptionLabel(option) }}
            </button>
          </div>

          <div v-else-if="question.type === 'yes_no'" class="flex flex-wrap gap-2">
            <button
              type="button"
              class="px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              :class="{
                'bg-[#4D6BFE] text-white': answers[question.id] === 'yes',
                'bg-gray-100 text-gray-600 hover:bg-gray-200': answers[question.id] !== 'yes',
                'dark:bg-[#2E2F34] dark:text-gray-400 dark:hover:bg-[#3A3B40]': answers[question.id] !== 'yes'
              }"
              @click="handleChoiceChange(question.id, 'yes')"
            >
              是
            </button>
            <button
              type="button"
              class="px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
              :class="{
                'bg-[#4D6BFE] text-white': answers[question.id] === 'no',
                'bg-gray-100 text-gray-600 hover:bg-gray-200': answers[question.id] !== 'no',
                'dark:bg-[#2E2F34] dark:text-gray-400 dark:hover:bg-[#3A3B40]': answers[question.id] !== 'no'
              }"
              @click="handleChoiceChange(question.id, 'no')"
            >
              否
            </button>
          </div>

          <div v-else-if="question.type === 'confirm'" class="flex flex-col gap-3">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-[#4D6BFE] text-white': answers[question.id] === 'confirm',
                  'bg-gray-100 text-gray-600 hover:bg-gray-200': answers[question.id] !== 'confirm',
                  'dark:bg-[#2E2F34] dark:text-gray-400 dark:hover:bg-[#3A3B40]': answers[question.id] !== 'confirm'
                }"
                @click="handleChoiceChange(question.id, 'confirm')"
              >
                确认
              </button>
              <button
                type="button"
                class="px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-[#4D6BFE] text-white': answers[question.id] === 'modify',
                  'bg-gray-100 text-gray-600 hover:bg-gray-200': answers[question.id] !== 'modify',
                  'dark:bg-[#2E2F34] dark:text-gray-400 dark:hover:bg-[#3A3B40]': answers[question.id] !== 'modify'
                }"
                @click="handleChoiceChange(question.id, 'modify')"
              >
                修改
              </button>
            </div>
            <input
              type="text"
              class="bg-gray-100 dark:bg-[#2E2F34] text-gray-700 dark:text-gray-100 px-4 py-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4D6BFE] placeholder:text-gray-400"
              :placeholder="question.input_placeholder || '如有修改意见请输入...'"
              :value="answers[question.id + '_input'] || ''"
              @input="handleChoiceChange(question.id + '_input', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button
          class="bg-[#4D6BFE] text-white px-6 py-2 rounded-full text-sm font-medium transition-opacity duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!isAllRequiredAnswered"
          @click="handleSubmit"
        >
          提交回答
        </button>
      </div>
    </div>
  </div>
</template>
