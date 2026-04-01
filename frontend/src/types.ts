export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  time: string
  files?: UploadedFile[]
  metadata?: {
    tool_name?: string
    arguments?: string
  }
}

export interface UploadedFile {
  name: string
  type: string
  content: string
}

export interface Session {
  id: string
  title: string
  createdAt: number
}

export interface HITLQuestion {
  id: string
  type: 'text' | 'choice' | 'multi_choice' | 'yes_no' | 'confirm'
  text: string
  options?: Array<{ value: string; label: string }>
  input_placeholder?: string
  required?: boolean
}

export interface HITLSession {
  session_id: string
  questions: HITLQuestion[]
  tool_call_id?: string
}

export const SUGGESTIONS = [
  { icon: '💡', title: '解释概念', desc: '解释量子纠缠是什么' },
  { icon: '✍️', title: '帮我写作', desc: '写一封商务邮件' },
  { icon: '🔧', title: '代码调试', desc: '帮我找出代码中的 bug' },
  { icon: '📊', title: '数据分析', desc: '如何用 Python 分析 CSV 数据' },
]
