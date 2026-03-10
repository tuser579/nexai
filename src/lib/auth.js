import { auth } from '@/auth'

export async function getServerSession() {
  try {
    return await auth()
  } catch (err) {
    console.error('getServerSession error:', err)
    return null
  }
}