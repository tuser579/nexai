import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_MODEL } from '@/constants/models'

// ── Must match ALL model IDs in constants/models.js ──
const VALID_MODELS = [
  // Gemini
  'gemini-2.0-flash',

  // Groq
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
   
  // github
  'gpt-4o',
  'gpt-4o-mini',
  'Meta-Llama-3.1-405B-Instruct',
  'Meta-Llama-3.3-70B-Instruct',
  'DeepSeek-R1',
  'Phi-4',
  'Mistral-Large-2411',
  'Cohere-command-r-plus-08-2024',
  
  // OpenRouter free
  'meta-llama/llama-3.1-8b-instruct',
  'meta-llama/llama-3.3-70b-instruct',
  'google/gemma-2-9b-it',
  'mistralai/mistral-7b-instruct',
  'deepseek/deepseek-r1',
  'deepseek/deepseek-chat',
  'qwen/qwen-2.5-72b-instruct',

  // OpenAI
  'gpt-3.5-turbo',
  'gpt-4o',

  // Together
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
]

function safeModel(model) {
  return VALID_MODELS.includes(model) ? model : DEFAULT_MODEL
}

export const useAppStore = create(
  persist(
    (set, get) => ({

      // ── Theme ─────────────────────────────────
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),

      // ── Active Chat ───────────────────────────
      activeChatId: null,
      setActiveChatId: (id) => set({ activeChatId: id }),

      // ── Messages ──────────────────────────────
      messages: [],
      setMessages: (messages) => set({ messages }),

      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      updateLastMessage: (content) =>
        set((s) => {
          const msgs = [...s.messages]
          if (msgs.length === 0) return s
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
          return { messages: msgs }
        }),

      clearMessages: () => set({ messages: [], activeChatId: null }),

      // ── AI Model ──────────────────────────────
      model: DEFAULT_MODEL,
      setModel: (model) => {
        // Always allow setting — don't block with safeModel here
        set({ model })
      },

      // ── Streaming State ───────────────────────
      isStreaming: false,
      setStreaming: (v) => set({ isStreaming: v }),

      // ── Chat Sessions ─────────────────────────
      chatSessions: [],
      setChatSessions: (sessions) => set({ chatSessions: sessions }),

      addChatSession: (session) =>
        set((s) => ({ chatSessions: [session, ...s.chatSessions] })),

      updateChatSession: (id, updates) =>
        set((s) => ({
          chatSessions: s.chatSessions.map((c) =>
            c._id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteChatSession: (id) =>
        set((s) => ({
          chatSessions: s.chatSessions.filter((c) => c._id !== id),
        })),

      // ── Image History ─────────────────────────
      imageHistory: [],
      setImageHistory: (history) => set({ imageHistory: history }),

      addImageToHistory: (image) =>
        set((s) => ({ imageHistory: [image, ...s.imageHistory] })),

      deleteImageFromHistory: (id) =>
        set((s) => ({
          imageHistory: s.imageHistory.filter((img) => img._id !== id),
        })),

      toggleImageFavorite: (id) =>
        set((s) => ({
          imageHistory: s.imageHistory.map((img) =>
            img._id === id ? { ...img, isFavorite: !img.isFavorite } : img
          ),
        })),

      // ── UI State ──────────────────────────────
      sidebarOpen: true,
      mobileSidebarOpen: false,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Active Page ───────────────────────────
      activePage: 'chat',
      setActivePage: (page) => set({ activePage: page }),

      // ── Image Generator ───────────────────────
      imagePrompt: '',
      imageStyle: 'photorealistic',
      imageSize: '512x512',
      setImagePrompt: (v) => set({ imagePrompt: v }),
      setImageStyle: (v) => set({ imageStyle: v }),
      setImageSize: (v) => set({ imageSize: v }),

      // ── Video Generator ───────────────────────
      videoPrompt: '',
      videoStyle: 'cinematic',
      videoDuration: '5s',
      videoQuality: 'standard',
      setVideoPrompt: (v) => set({ videoPrompt: v }),
      setVideoStyle: (v) => set({ videoStyle: v }),
      setVideoDuration: (v) => set({ videoDuration: v }),
      setVideoQuality: (v) => set({ videoQuality: v }),

      // ── Notifications ─────────────────────────
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [...s.notifications, { id: Date.now(), ...n }],
        })),
      removeNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      // ── Reset ─────────────────────────────────
      resetStore: () =>
        set({
          activeChatId: null,
          messages: [],
          chatSessions: [],
          imageHistory: [],
          isStreaming: false,
          mobileSidebarOpen: false,
        }),
    }),

    {
      name: 'nexai-store',
      partialize: (state) => ({
        theme: state.theme,
        model: state.model, // persist as-is, no filtering
        sidebarOpen: state.sidebarOpen,
        imageStyle: state.imageStyle,
        imageSize: state.imageSize,
        videoStyle: state.videoStyle,
        videoDuration: state.videoDuration,
        videoQuality: state.videoQuality,
      }),
    }
  )
)