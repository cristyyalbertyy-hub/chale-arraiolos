import { Link, useSearchParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function ThankYouPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-svh">
      <Header />
      <main className="bg-olive py-20 sm:py-28">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cream/20 text-4xl">
            ✓
          </div>
          <h1 className="font-display mt-8 text-3xl font-semibold text-cream sm:text-4xl">
            Obrigado!
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-sand">
            O seu pagamento foi recebido com sucesso. Em breve receberá um email de
            confirmação com os detalhes da reserva no Chalé Arraiolos.
          </p>
          {sessionId && (
            <p className="mt-4 text-xs text-sand/70">
              Referência: {sessionId.slice(0, 20)}…
            </p>
          )}
          <Link
            to="/"
            className="mt-10 inline-flex rounded-full bg-terracotta px-8 py-3.5 font-semibold text-cream transition-colors hover:bg-terracotta-dark"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
