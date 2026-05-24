import { DocumentLang } from './components/DocumentLang'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'

function App() {
  const isAdmin =
    typeof window !== 'undefined' &&
    window.location.pathname.replace(/\/$/, '') === '/gestao'

  return (
    <>
      <DocumentLang />
      {isAdmin ? <AdminPage /> : <HomePage />}
    </>
  )
}

export default App
