import Pusher from "pusher"

// Server-side Pusher instance (for triggering events)
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

export const pusher = pusherServer;

// Client-side Pusher instance is created in the hook to avoid SSR issues
// See: src/hooks/use-pusher.ts


