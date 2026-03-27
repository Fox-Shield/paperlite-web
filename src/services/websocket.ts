import { Client, type StompSubscription } from '@stomp/stompjs'
import type { Comment } from '@/types/collaboration'

class WebSocketService {
    private client: Client | null = null

    private getClient(): Client {
        if (!this.client) {
            const token = localStorage.getItem('access_token') ?? ''
            this.client = new Client({
                brokerURL: `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`,
                reconnectDelay: 5000
            })
            this.client.activate()
        }
        return this.client
    }

    subscribeToDocumentComments(documentId: string, callback: (comment: Comment) => void): StompSubscription {
        return this.getClient().subscribe(`/topic/documents/${documentId}/comments`, (message) => {
            try {
                const comment: Comment = JSON.parse(message.body)
                callback(comment)
            } catch {
                // ignore malformed messages
            }
        })
    }

    disconnect(): void {
        if (this.client) {
            this.client.deactivate()
            this.client = null
        }
    }
}

export const wsService = new WebSocketService()
