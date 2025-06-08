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
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col bg-gradient-to-br from-slate-900 via-slate-900/95 to-purple-900/20 border-white/10 text-white">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold">{courseName}</div>
              <div className="text-xs text-gray-400">Course Chat {isTutor && "(Tutor Mode)"}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                          ? 'ring-2 ring-offset-2 ring-offset-slate-900 ' + (message.tutor ? 'ring-yellow-500/50' : 'ring-purple-500/50')
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
                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {message.Name?.[0] || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {formatTime(message.created_at)}
                    </div>
                  </div>
                  <div
                    className={`group relative max-w-[70%] rounded-2xl p-3 shadow-lg transition-all duration-200 ${
                      message.clerkID === user?.id
                        ? message.tutor
                          ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 text-white hover:from-yellow-600/30 hover:to-orange-600/30'
                          : 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-white hover:from-purple-600/30 hover:to-pink-600/30'
                        : message.tutor
                          ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 text-gray-200 hover:from-yellow-600/30 hover:to-orange-600/30'
                          : 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 text-gray-200 hover:from-blue-600/30 hover:to-cyan-600/30'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {message.Name || 'Anonymous'}
                        {message.clerkID === user?.id && (
                          <span className="text-[10px] text-purple-400/70">(You)</span>
                        )}
                      </span>
                      {message.tutor && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20">
                          Tutor
                        </span>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed">{message.message}</div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-lg font-medium text-white mb-1">Start a Conversation</p>
              <p className="text-sm text-center max-w-sm">
                {isTutor 
                  ? "As a tutor, you can help students with their questions and provide guidance."
                  : "Ask questions, share insights, or discuss course topics with tutors and peers!"}
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isTutor ? "Reply as tutor..." : "Type your message..."}
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400 rounded-xl focus-visible:ring-purple-500/50"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className={`rounded-xl px-4 ${
                isTutor 
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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