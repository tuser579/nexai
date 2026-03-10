import VideoGenerator from '@/components/video/VideoGenerator'

export const metadata = {
  title:       'Video Generator — NexAI',
  description: 'Generate videos with AnimateDiff',
}

export default function VideoPage() {
  return (
    <div className="
      p-4 md:p-6 max-w-7xl mx-auto h-full
    ">
      {/* Header */}
      <div className="mb-6">
        <h2 className="
          text-lg font-display font-bold
          text-[var(--text)]
        ">
          Generate Video
        </h2>
        <p className="text-sm text-[var(--muted)] mt-0.5">
          Powered by AnimateDiff · Uses Replicate credits
        </p>
      </div>

      {/* Generator */}
      <VideoGenerator />
    </div>
  )
}