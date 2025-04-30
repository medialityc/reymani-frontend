// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'Reymani Backoffice',
  description: 'Aplicación de administración de Reymani',

  // OpenGraph metadata
  openGraph: {
    title: 'Reymani Backoffice',
    description: 'Aplicación de administración de Reymani',
    type: 'website'
  },

  // Twitter card metadata
  twitter: {
    card: 'summary',
    title: 'Reymani Backoffice',
    description: 'Aplicación de administración de Reymani'
  }
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <AuthProvider>
          {children}
          <ToastContainer position='bottom-left' />
        </AuthProvider>
      </body>
    </html>
  )
}

export default RootLayout
