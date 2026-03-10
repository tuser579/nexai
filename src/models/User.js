import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: {
      type:    String,
      default: '',
    },
    provider: {
      type:    String,
      default: 'email',
      enum:    ['email', 'google'],
    },
    plan: {
      type:    String,
      default: 'free',
      enum:    ['free', 'pro', 'enterprise'],
    },
    preferences: {
      theme:        { type: String, default: 'dark'            },
      defaultModel: { type: String, default: 'gemini-1.5-flash'},
      language:     { type: String, default: 'en'              },
    },
    stats: {
      totalChats:    { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      totalImages:   { type: Number, default: 0 },
      totalVideos:   { type: Number, default: 0 },
    },
    imageHistory: [
      {
        prompt:    String,
        imageUrl:  String,
        style:     String,
        size:      String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// ── Index — only define here, NOT with index:true above ──
// email already has unique:true which creates an index automatically
// so we do NOT add another ChatSchema.index({ email:1 }) here

// ── Hash password before save ──────────────────────
// No next() — works in all Mongoose versions
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt    = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// ── Compare password ───────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ── Prevent model recompile in dev hot reload ──────
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User