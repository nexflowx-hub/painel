import { NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history = [] } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Forward to backend API (OpenRouter will be handled there)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.atlasglobal.digital/api/v1'
    
    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ response: data.response || data.message })
      }
    } catch {
      // Backend not available, use fallback
    }

    // Fallback response when backend is not available
    const fallbackResponses: Record<string, string> = {
      ola: 'Olá! Bem-vindo ao Atlas Global Payments. Como posso ajudá-lo hoje?',
      hello: 'Hello! Welcome to Atlas Global Payments. How can I help you today?',
      ajuda: 'Claro! Posso ajudá-lo com: pagamentos, levantamentos, gestão de wallets, configuração de gateways, e muito mais. O que precisa?',
      help: 'Sure! I can help you with: payments, withdrawals, wallet management, gateway setup, and more. What do you need?',
      pagamento: 'Para efetuar um pagamento, navegue até a secção "Links de Pagamento" ou "Gateways & API". Precisa de mais detalhes?',
      payment: 'To make a payment, navigate to "Payment Links" or "Gateways & API" section. Need more details?',
      suporte: 'Para suporte técnico, contacte-nos:\n- Email: support@atlasglobal.digital\n- Telegram: @AtlasCore_Support\n- Telefone: +44 74 5122 1030',
      support: 'For technical support, contact us:\n- Email: support@atlasglobal.digital\n- Telegram: @AtlasCore_Support\n- Phone: +44 74 5122 1030',
    }

    const lowerMessage = message.toLowerCase()
    let responseText = 'Obrigado pela sua mensagem. Para assistência personalizada, contacte a nossa equipa em support@atlasglobal.digital ou via Telegram @AtlasCore_Support.'

    for (const [key, value] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        responseText = value
        break
      }
    }

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
