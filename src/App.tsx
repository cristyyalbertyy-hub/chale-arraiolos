import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StripeProvider } from './providers/StripeProvider'
import { HomePage } from './pages/HomePage'
import { ThankYouPage } from './pages/ThankYouPage'

function App() {
  return (
    <StripeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/obrigado" element={<ThankYouPage />} />
        </Routes>
      </BrowserRouter>
    </StripeProvider>
  )
}

export default App
