import { useState, FormEvent } from 'react'
import './SendMessageForm.css'

interface SendMessageFormProps {
  onSend: (text: string) => void  // parent passes a function we call with the message text
  disabled: boolean
}

export function SendMessageForm({ onSend, disabled }: SendMessageFormProps) {
  // Local state just for the input value. Parent doesn't need it; we only send on submit.
  const [text, setText] = useState('')

  // FormEvent: TypeScript type for form submit events. preventDefault() stops page reload on submit.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')  // clear input after sending
  }

  return (
    <form className="send-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  )
}
