import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso | Atlas Core',
  description: 'Termos e condições de uso da plataforma Atlas Core Banking',
}

export default function TermsPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Termos de Uso</h1>
      <p className="nex-mono text-xs" style={{ color: '#606060' }}>Última atualização: Janeiro 2025</p>

      <section className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>1. Aceitação dos Termos</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Ao aceder e utilizar a plataforma Atlas Core Banking (&quot;Plataforma&quot;), operada por IAHUB360 LTD
          (&quot;Empresa&quot;), o utilizador concorda integralmente com os presentes Termos de Uso. Caso não concorde
          com algum dos termos aqui descritos, deverá cessar imediatamente a utilização da Plataforma.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>2. Descrição do Serviço</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          A Atlas Core é uma plataforma de orquestração financeira B2B2C que oferece serviços de pagamento,
          gestão de tesouraria, câmbio FX, e liquidação global. A Plataforma atua como intermediária
          tecnológica, roteando pagamentos através de provedores de pagamento licenciados.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>3. Elegibilidade</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Para utilizar a Plataforma, o utilizador deve ser maior de 18 anos, possuir capacidade legal
          para celebrar contratos vinculativos, e estar em conformidade com as leis da sua jurisdição.
          Contas empresariais requerem documentação de constituição societária válida.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>4. Contas e Segurança</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          O utilizador é responsável por manter a confidencialidade das suas credenciais de acesso.
          Todas as atividades realizadas sob a conta do utilizador são da sua inteira responsabilidade.
          A Empresa reserva-se o direito de suspender contas que apresentem atividade suspeita.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>5. Limitação de Responsabilidade</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          A Plataforma é fornecida &quot;tal como está&quot;, sem garantias de qualquer tipo. A Empresa não se
          responsabiliza por perdas indiretas, incidentais ou consequentes decorrentes da utilização
          dos serviços. O limite máximo de responsabilidade da Empresa é limitado ao valor das taxas
          cobradas pelo serviço nos 12 meses anteriores ao evento.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>6. Compliance e KYC/AML</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          A Empresa está sujeita a regulamentações de Prevenção ao Branqueamento de Capitais (AML) e
          Conheça o seu Cliente (KYC). O utilizador poderá ser solicitado a fornecer documentação
          adicional para verificação de identidade. A recusa em cumprir com estes requisitos poderá
          resultar na limitação ou encerramento da conta.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>7. Lei Aplicável</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Estes termos são regidos pelas leis do Reino Unido. Qualquer litígio será submetido à
          jurisdição exclusiva dos tribunais ingleses.
        </p>
      </section>
    </article>
  )
}
