'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIChatWidget() {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('chat.welcome'),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      // Fallback response if API fails
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'O serviço de chat está temporariamente indisponível. Por favor, contacte support@atlasglobal.digital ou @AtlasCore_Support no Telegram.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating button - Dark theme harmonious */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
              boxShadow: '0 4px 20px rgba(0, 212, 170, 0.4)',
            }}
            aria-label="Abrir chat"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: '#00D4AA',
                opacity: 0.3,
                animationDuration: '2s',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: '#0d1017',
              border: '1px solid rgba(0, 212, 170, 0.15)',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 170, 0.08)',
            }}
          >
            {/* Header - Dark harmonious */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.08), rgba(0, 180, 216, 0.04))',
                borderBottom: '1px solid rgba(0, 212, 170, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
                  }}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('chat.title')}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: '#00D4AA',
                        boxShadow: '0 0 6px #00D4AA',
                      }}
                    />
                    <span className="nex-mono text-[10px]" style={{ color: '#A0A0A0' }}>
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: '#A0A0A0' }}
                  aria-label={isMinimized ? 'Expandir' : 'Minimizar'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: '#A0A0A0' }}
                  aria-label="Fechar chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4 cyber-scrollbar"
                  style={{ maxHeight: '340px', background: '#0a0d12' }}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: message.role === 'assistant'
                            ? 'linear-gradient(135deg, #00D4AA, #00B4D8)'
                            : '#1E222C',
                        }}
                      >
                        {message.role === 'assistant' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4" style={{ color: '#A0A0A0' }} />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                          message.role === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'
                        }`}
                        style={{
                          background: message.role === 'assistant'
                            ? 'rgba(0, 212, 170, 0.1)'
                            : 'linear-gradient(135deg, #00D4AA, #00B4D8)',
                          color: message.role === 'assistant'
                            ? '#FFFFFF'
                            : 'white',
                          border: message.role === 'assistant' ? '1px solid rgba(0, 212, 170, 0.15)' : 'none',
                        }}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2.5">
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
                        }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div
                        className="px-3.5 py-2.5 rounded-2xl rounded-tl-md"
                        style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.15)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#00D4AA', animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#00D4AA', animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#00D4AA', animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSubmit}
                  className="p-3"
                  style={{ borderTop: '1px solid rgba(0, 212, 170, 0.1)', background: '#0d1017' }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('chat.placeholder')}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                      style={{
                        background: '#141820',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: '#FFFFFF',
                      }}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="flex items-center justify-center w-10 h-10 rounded-xl transition-all disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, #00D4AA, #00B4D8)',
                      }}
                      aria-label={t('chat.send')}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
