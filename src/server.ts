import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const httpServer = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Moodz Socket Server Running')
})

const io = new Server(httpServer, {
    cors: {
        origin: '*', // In production, restrict this to your domain
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-session', async ({ sessionId, userId, userName }) => {
        socket.join(sessionId)
        console.log(`User ${userName} (${userId}) joined session ${sessionId}`)

        // Notify others
        socket.to(sessionId).emit('user-joined', { userId, userName })

        // Load previous messages
        try {
            const messages = await prisma.sessionChatMessage.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' },
                include: { user: { select: { name: true, image: true } } }
            })

            // Transform for client
            const formattedMessages = messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                userId: msg.userId,
                userName: msg.user.name || 'Unknown',
                userImage: msg.user.image,
                timestamp: msg.createdAt.toISOString(),
                isDeleted: msg.isDeleted
            }))

            socket.emit('previous-messages', formattedMessages)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    })

    socket.on('leave-session', ({ sessionId, userId }) => {
        socket.leave(sessionId)
        socket.to(sessionId).emit('user-left', { userId })
        console.log(`User ${userId} left session ${sessionId}`)
    })

    socket.on('send-message', async (data) => {
        const { sessionId, content, userId, userName } = data

        try {
            // Persist to DB
            const message = await prisma.sessionChatMessage.create({
                data: {
                    sessionId,
                    userId,
                    content,
                }
            })

            const payload = {
                id: message.id,
                content,
                userId,
                userName,
                timestamp: message.createdAt.toISOString(),
                isDeleted: false
            }

            // Broadcast to everyone in the room (including sender)
            io.to(sessionId).emit('chat-message', payload)

        } catch (error) {
            console.error('Error saving message:', error)
            socket.emit('error', { message: 'Failed to send message' })
        }
    })

    socket.on('delete-message', async ({ sessionId, messageId }) => {
        try {
            // Soft delete in DB
            await prisma.sessionChatMessage.update({
                where: { id: messageId },
                data: {
                    isDeleted: true,
                    deletedBy: 'socket-user' // Ideally we should verify who is deleting
                }
            })

            io.to(sessionId).emit('message-deleted', { messageId })
        } catch (error) {
            console.error('Error deleting message:', error)
        }
    })

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
    })
})

const PORT = 3001
httpServer.listen(PORT, () => {
    console.log(`Socket server running on port ${PORT}`)
})
