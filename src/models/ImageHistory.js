import mongoose from 'mongoose'

const ImageHistorySchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // ── Generation Info ────────────────────────
    prompt: {
      type:     String,
      required: true,
      maxlength: 1000,
    },

    negativePrompt: {
      type:    String,
      default: '',
    },

    // ── Style Settings ─────────────────────────
    style: {
      type:    String,
      default: 'Photorealistic',
    },

    size: {
      type:    String,
      default: '512x512',
    },

    width: {
      type:    Number,
      default: 512,
    },

    height: {
      type:    Number,
      default: 512,
    },

    // ── Result ─────────────────────────────────
    // Stores base64 string or hosted URL
    imageUrl: {
      type:     String,
      required: true,
    },

    // ── Provider ───────────────────────────────
    // Which service generated it
    provider: {
      type:    String,
      enum:    ['huggingface', 'replicate', 'openai'],
      default: 'huggingface',
    },

    model: {
      type:    String,
      default: 'stable-diffusion-2-1',
    },

    // ── Generation Time ────────────────────────
    generationTime: {
      type:    Number, // in milliseconds
      default: 0,
    },

    // ── Favorite ───────────────────────────────
    isFavorite: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// ── Indexes ───────────────────────────────────────
ImageHistorySchema.index({ userId: 1, createdAt: -1 })
ImageHistorySchema.index({ userId: 1, isFavorite: 1 })

export default mongoose.models.ImageHistory ||
  mongoose.model('ImageHistory', ImageHistorySchema);