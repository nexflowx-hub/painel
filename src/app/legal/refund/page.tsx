import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Reembolso | Atlas Core',
  description: 'Política de reembolso e cancelamento da plataforma Atlas Core Banking',
}

export default function RefundPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Política de Reembolso</h1>
      <p className="nex-mono text-xs" style={{ color: '#606060' }}>Última atualização: Janeiro 2025</p>

      <section className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>1. Serviços Financeiros</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Os serviços de pagamento e liquidação fornecidos pela Atlas Core envolvem transações
          financeiras irreversíveis com terceiros. Como tal, reembolsos estão sujeitos à política
          de cada provedor de pagamento subjacente e à natureza da transação.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>2. Taxas da Plataforma</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          As taxas cobradas pela Atlas Core são não-reembolsáveis após a execução da transação.
          Em caso de erro técnico da Plataforma que resulte numa cobrança indevida, o utilizador
          deve contactar o suporte no prazo de 30 dias para solicitar o reembolso integral.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>3. Transações Falhadas</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Se uma transação falhar devido a erro do nosso sistema, o valor será automaticamente
          creditado na carteira de origem no prazo de 1-3 dias úteis. Caso o crédito não seja
          processado, o utilizador deve abrir um ticket de suporte com os detalhes da transação.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>4. Cancelamento de Payouts</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Solicitações de payout podem ser canceladas antes do processamento (status: &quot;Pendente&quot;).
          Após o início do processamento, o cancelamento não é possível e o utilizador deve aguardar
          a conclusão da transferência. Payouts processados incorretamente serão investigados
          mediante abertura de disputa.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>5. Conversões de Moeda (Swap)</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Operações de câmbio (swap) são executadas a taxa de mercado no momento da transação.
          Devido à volatilidade do mercado, reembolsos por variações cambiais não são aceites.
          Se o swap falhar por erro técnico, o valor original será restituído integralmente.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>6. Procedimento de Solicitação</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Para solicitar um reembolso, o utilizador deve: (1) Aceder à secção de Suporte no
          Dashboard, (2) Abrir um ticket com o assunto &quot;Solicitação de Reembolso&quot;, (3) Incluir
          o ID da transação e motivo da solicitação. O prazo de análise é de 5-10 dias úteis.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>7. Contacto</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Para questões relacionadas com reembolsos, contacte: support@atlascore.io
        </p>
      </section>
    </article>
  )
}
