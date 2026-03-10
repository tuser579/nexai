import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type:     String,
    required: true,
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
})

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    title: {
      type:    String,
      default: 'New Chat',
      trim:    true,
    },
    model: {
      type:    String,
      default: 'gemini-1.5-flash',
    },
    messages: [MessageSchema],
    isPinned: {
      type:    Boolean,
      default: false,
    },
    isArchived: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ────────────────────────────────────────
ChatSchema.index({ userId: 1, createdAt: -1 })
ChatSchema.index({ userId: 1, isPinned: 1 })

// ── Virtual: message count ─────────────────────────
ChatSchema.virtual('messageCount').get(function () {
  return this.messages?.length || 0
})

// ── Prevent model recompile in dev hot reload ──────
const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema)

export default Chat