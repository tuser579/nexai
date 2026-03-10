import { getServerSession } from '@/lib/auth'
import { NextResponse }     from 'next/server'
import { connectDB }        from '@/lib/db'
import ImageHistory         from '@/models/ImageHistory'

// ── GET image history ─────────────────────────────
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

    const { searchParams } = new URL(req.url)
    const limit     = parseInt(searchParams.get('limit')     || '20')
    const page      = parseInt(searchParams.get('page')      || '1')
    const favorites = searchParams.get('favorites') === 'true'

    const query = { userId: session.user.id }
    if (favorites) query.isFavorite = true

    const images = await ImageHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await ImageHistory.countDocuments(query)

    return NextResponse.json({
      images,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Image history error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch image history' },
      { status: 500 }
    )
  }
}

// ── DELETE all image history ──────────────────────
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
    await ImageHistory.deleteMany({ userId: session.user.id })

    return NextResponse.json({ message: 'Image history cleared' })
  } catch (err) {
    console.error('Image history DELETE error:', err)
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    )
  }
}

// ── PATCH — toggle favorite ───────────────────────
export async function PATCH(req) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await req.json()

    await connectDB()

    const image = await ImageHistory.findOne({
      _id:    id,
      userId: session.user.id,
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    image.isFavorite = !image.isFavorite
    await image.save()

    return NextResponse.json({
      isFavorite: image.isFavorite,
    })
  } catch (err) {
    console.error('Image favorite error:', err)
    return NextResponse.json(
      { error: 'Failed to update favorite' },
      { status: 500 }
    )
  }
}