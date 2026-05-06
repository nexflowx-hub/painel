import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Atlas Core',
  description: 'Política de privacidade e proteção de dados da plataforma Atlas Core Banking',
}

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Política de Privacidade</h1>
      <p className="nex-mono text-xs" style={{ color: '#606060' }}>Última atualização: Janeiro 2025</p>

      <section className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>1. Responsável pelo Tratamento</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          IAHUB360 LTD, registada no Reino Unido sob o número 16626733, é a responsável pelo
          tratamento dos dados pessoais recolhidos através da plataforma Atlas Core Banking.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>2. Dados Recolhidos</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Recolhemos os seguintes dados: nome completo, email, documentos de identificação (KYC),
          dados financeiros relevantes para a prestação dos serviços, endereço IP e dados de
          navegação para fins de segurança. Não vendemos nem partilhamos dados pessoais com
          terceiros para fins comerciais.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>3. Finalidade do Tratamento</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Os dados pessoais são tratados para as seguintes finalidades: prestação dos serviços
          financeiros, verificação de identidade (KYC/AML), prevenção de fraude, comunicações
          operacionais, e cumprimento de obrigações legais e regulatórias.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>4. Base Legal</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          O tratamento de dados é realizado com base no consentimento do titular, na execução
          de contrato, no cumprimento de obrigação legal, e no interesse legítimo da Empresa
          para fins de segurança e prevenção de fraude.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>5. Direitos do Titular</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          O titular dos dados tem direito a: acesso, retificação, apagamento, portabilidade,
          limitação do tratamento, e oposição. Para exercer estes direitos, contacte
          privacy@atlascore.io. Responderemos no prazo máximo de 30 dias.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>6. Retenção de Dados</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Os dados pessoais são retidos pelo período necessário à prestação dos serviços e ao
          cumprimento de obrigações legais. Dados financeiros são retidos por um mínimo de 5 anos
          conforme requisitos regulatórios. Após o período de retenção, os dados são eliminados
          de forma segura.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: '#FFFFFF' }}>7. Cookies e Tracking</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
          Utilizamos cookies essenciais para o funcionamento da Plataforma e cookies analíticos
          para melhorar a experiência do utilizador. O utilizador pode gerir as suas preferências
          de cookies através das definições do navegador.
        </p>
      </section>
    </article>
  )
}
