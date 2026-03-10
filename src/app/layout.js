import './globals.css'
import { Toaster }         from 'react-hot-toast'
import AuthSessionProvider from './SessionProvider'
import ThemeWrapper        from './ThemeWrapper'
import { ThemeProvider }   from '@/context/ThemeContext'

export const metadata = {
  title:       'NexAI — AI Platform',
  description: 'Chat, generate images & videos, and analyze media with AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthSessionProvider>
          <ThemeWrapper>
            <ThemeProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background:   '#13131f',
                    color:        '#e8e8f0',
                    border:       '1px solid #1e1e30',
                    borderRadius: '12px',
                    fontSize:     '13px',
                    padding:      '12px 16px',
                  },
                  success: { iconTheme: { primary: '#4ade80', secondary: '#13131f' } },
                  error:   { iconTheme: { primary: '#f87171', secondary: '#13131f' } },
                  loading: { iconTheme: { primary: '#6c63ff', secondary: '#13131f' } },
                }}
              />
            </ThemeProvider>
          </ThemeWrapper>
        </AuthSessionProvider>
      </body>
    </html>
  )
}