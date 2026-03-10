import { getServerSession } from '@/lib/auth'
import { NextResponse }     from 'next/server'
import { connectDB }        from '@/lib/db'
import Chat                 from '@/models/Chat'

// ── GET all chat sessions for current user ────────
export async function GET(req) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get url params
    const { searchParams } = new URL(req.url)
    const limit  = parseInt(searchParams.get('limit')  || '50')
    const page   = parseInt(searchParams.get('page')   || '1')
    const search = searchParams.get('search') || ''

    // Build query
    const query = {
      userId:     session.user.id,
      isArchived: false,
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' }
    }

    // Fetch chats — only summary fields (no messages)
    const chats = await Chat.find(query)
      .select('_id title model isPinned updatedAt createdAt')
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Chat.countDocuments(query)

    return NextResponse.json({
      chats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Chat history GET error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

// ── DELETE all chat history for current user ──────
export async function DELETE(req) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    await Chat.deleteMany({ userId: session.user.id })

    return NextResponse.json({
      message: 'All chat history deleted',
    })
  } catch (err) {
    console.error('Chat history DELETE error:', err)
    return NextResponse.json(
      { error: 'Failed to delete chat history' },
      { status: 500 }
    )
  }
}