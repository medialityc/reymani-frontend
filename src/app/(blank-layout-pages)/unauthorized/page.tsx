// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import Unauthorized from '@/views/Unauthorized'

// Util Imports
import { getServerMode } from '@core/utils/serverHelpers'

const NotFoundPage = () => {
  // Vars
  const direction = 'ltr'
  const mode = getServerMode()

  return (
    <Providers direction={direction}>
      <BlankLayout>
        <Unauthorized mode={mode} />
      </BlankLayout>
    </Providers>
  )
}

export default NotFoundPage
