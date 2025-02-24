// Component Imports
import ForgotPassword from '@/views/auth/ForgotPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ForgotPasswordPage = () => {
  // Vars
  const mode = getServerMode()

  return <ForgotPassword mode={mode} />
}

export default ForgotPasswordPage
