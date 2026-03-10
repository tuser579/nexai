import { getServerSession } from '@/lib/auth'
import { NextResponse }     from 'next/server'
import { connectDB }        from '@/lib/db'
import Chat                 from '@/models/Chat'

// ── GET single chat with all messages ────────────
export async function GET(req, { params }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    await connectDB()

    const chat = await Chat.findOne({
      _id:    id,
      userId: session.user.id,
    }).lean()

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ chat })
  } catch (err) {
    console.error('Chat GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}

// ── PATCH — update chat (title, isPinned) ─────────
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id }           = params
    const { title, isPinned } = await req.json()

    await connectDB()

    const updates = {}
    if (title    !== undefined) updates.title    = title
    if (isPinned !== undefined) updates.isPinned = isPinned

    const chat = await Chat.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updates,
      { new: true }
    ).select('_id title model isPinned updatedAt')

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ chat })
  } catch (err) {
    console.error('Chat PATCH error:', err)
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    )
  }
}

// ── DELETE single chat ────────────────────────────
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    await connectDB()

    const chat = await Chat.findOneAndDelete({
      _id:    id,
      userId: session.user.id,
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Chat deleted successfully',
    })
  } catch (err) {
    console.error('Chat DELETE error:', err)
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    )
  }
}
