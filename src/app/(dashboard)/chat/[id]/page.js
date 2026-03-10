import { getServerSession } from '@/lib/auth'
import { redirect }         from 'next/navigation'
import { connectDB }        from '@/lib/db'
import Chat                 from '@/models/Chat'
import ChatWindow           from '@/components/chat/ChatWindow'

export const metadata = {
  title:       'Chat — NexAI',
  description: 'Continue your conversation',
}

export default async function ChatSessionPage({ params }) {
  const session = await getServerSession()
  if (!session?.user) redirect('/login')

  const { id } = params

  // ── Load chat from DB ─────────────────────────
  let initialMessages = []
  let chatTitle       = 'Chat'

  try {
    await connectDB()

    const chat = await Chat.findOne({
      _id:    id,
      userId: session.user.id,
    }).lean()

    if (!chat) redirect('/chat')

    initialMessages = chat.messages || []
    chatTitle       = chat.title    || 'Chat'
  } catch (err) {
    console.error('Load chat error:', err)
    redirect('/chat')
  }

  return (
    <div className="h-full flex flex-col">
      <ChatWindow
        initialMessages={initialMessages}
        chatId={id}
      />
    </div>
  )
}