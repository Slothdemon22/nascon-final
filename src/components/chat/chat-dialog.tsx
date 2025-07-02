"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/db"
import { toast } from "sonner"
import { MessageCircle, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  message: string
  clerkID: string
  courseID: string
  created_at: string
  Name: string
  imageUrl: string
  tutor: boolean
}

interface ChatDialogProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseName: string
}

export const ChatDialog = ({ isOpen, onClose, courseId, courseName }: ChatDialogProps) => {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTutor, setIsTutor] = useState(false)

  useEffect(() => {
    if (user?.publicMetadata?.role === "admin") {
      setIsTutor(true)
    }
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('chatTable')
          .select('*')
          .eq('courseID', courseId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load chat messages')
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && courseId) {
      fetchMessages()
    }
  }, [isOpen, courseId])

  // Set up real-time subscription
  useEffect(() => {
    if (!courseId) return

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatTable',
          filter: `courseID=eq.${courseId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [courseId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    try {
      const { error } = await supabase
        .from('chatTable')
        .insert([
          {
            message: newMessage.trim(),
            clerkID: user.id,
            courseID: courseId,
            Name: user.firstName || user.username || 'Anonymous',
            imageUrl: user.imageUrl || '',
            tutor: user?.publicMetadata?.role === "admin" ? 1 : 0
          }
        ])

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col bg-[var(--background)] border border-border text-foreground">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold">{courseName}</div>
              <div className="text-xs text-muted-foreground">Course Chat {isTutor && "(Tutor Mode)"}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-accent/10 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${
                    message.clerkID === user?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg overflow-hidden ${
                        message.clerkID === user?.id
                          ? 'ring-2 ring-offset-2 ring-offset-[var(--background)] ' + (message.tutor ? 'ring-accent2/50' : 'ring-primary/50')
                          : ''
                      }`}
                    >
                      {message.imageUrl ? (
                        <img 
                          src={message.imageUrl} 
                          alt={message.Name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.Name)}&background=random`;
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          message.tutor 
                            ? 'bg-accent2'
                            : 'bg-primary'
                        }`}>
                          {message.Name?.[0] || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                  <div
                    className={`group relative max-w-[70%] rounded-2xl p-3 shadow-md border transition-all duration-200 ${
                      message.clerkID === user?.id
                        ? message.tutor
                          ? 'bg-accent2/10 border-accent2 text-accent2'
                          : 'bg-primary/10 border-primary text-primary'
                        : message.tutor
                          ? 'bg-accent2/10 border-accent2 text-accent2'
                          : 'bg-accent/10 border-accent text-accent'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {message.Name || 'Anonymous'}
                        {message.clerkID === user?.id && (
                          <span className="text-[10px] text-primary/70">(You)</span>
                        )}
                      </span>
                      {message.tutor && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent2/20 text-accent2 border border-accent2/20">
                          Tutor
                        </span>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed">{message.message}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">Start a Conversation</p>
              <p className="text-sm text-center max-w-sm">
                {isTutor 
                  ? "As a tutor, you can help students with their questions and provide guidance."
                  : "Ask questions, share insights, or discuss course topics with tutors and peers!"}
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-white/80 rounded-b-2xl">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isTutor ? "Reply as tutor..." : "Type your message..."}
              className="flex-1 bg-white border border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-accent focus-visible:border-accent"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className={`rounded-xl px-4 font-semibold shadow-sm ${
                isTutor 
                  ? "bg-accent2 text-white hover:bg-accent2/90"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}