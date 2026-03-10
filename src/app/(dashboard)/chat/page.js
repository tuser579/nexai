import ChatWindow from '@/components/chat/ChatWindow'

export const metadata = {
  title:       'Chat — NexAI',
  description: 'Chat with Gemini, GPT and more',
}

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <ChatWindow />
    </div>
  )
}