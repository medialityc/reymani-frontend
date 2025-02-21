import React, { useEffect, useState } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// New Import
import { getRoleFromToken } from '@/utils/tokenStorage'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Extraer el role solo cuando el componente está montado
  const role = mounted ? getRoleFromToken() : null

  let menuItems: { label: string; href: string; icon: JSX.Element }[] = []

  if (role === 'BusinessAdmin') {
    menuItems = [
      { label: 'Principal', href: '/', icon: <i className='ri-dashboard-horizontal-fill' /> },
      { label: 'Mi Negocio', href: '/mi-negocio', icon: <i className='ri-home-4-line' /> },
      { label: 'Pedidos', href: '/pedidos', icon: <i className='ri-shopping-bag-fill' /> }
    ]
  } else if (role === 'SystemAdmin') {
    menuItems = [
      { label: 'Principal', href: '/', icon: <i className='ri-dashboard-horizontal-fill' /> },
      { label: 'Negocios', href: '/negocios', icon: <i className='ri-store-3-line' /> },
      { label: 'Pedidos', href: '/pedidos', icon: <i className='ri-shopping-bag-fill' /> },
      { label: 'Usuarios', href: '/usuarios', icon: <i className='ri-user-3-line' /> },
      { label: 'Mensajeros', href: '/mensajeros', icon: <i className='ri-motorbike-line' /> }
    ]
  }

  // No renderizar hasta que esté montado para evitar diferencias entre server y client.
  if (!mounted) return null

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        {menuItems.map(item => (
          <MenuItem key={item.href} href={item.href} icon={item.icon}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
