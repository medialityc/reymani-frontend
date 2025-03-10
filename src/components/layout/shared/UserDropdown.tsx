'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Image from 'next/image'

import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Auth Context
import { useAuth } from '@/contexts/AuthContext'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleDropdownOpen = () => {
    setOpen(!open)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleLogout = (event: MouseEvent<HTMLButtonElement>) => {
    logout()
    handleDropdownClose(event, '/login')
  }

  const defaultAvatar = '/images/avatars/1.png'

  return (
    <>
      <div ref={anchorRef} className='inline-block relative'>
        <Badge
          overlap='circular'
          badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          className='mis-2'
        >
          <Image
            src={user && user.profilePicture ? user.profilePicture : defaultAvatar}
            alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
            width={38}
            height={38}
            className='cursor-pointer rounded-full'
            onClick={handleDropdownOpen}
          />
        </Badge>
      </div>
      <Popper
        open={open}
        transition
        disablePortal={true}
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1500]'
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10]
              }
            }
          ]
        }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'top right' : 'top left'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Image
                      src={user && user.profilePicture ? user.profilePicture : defaultAvatar}
                      alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
                      width={38}
                      height={38}
                      className='rounded-full'
                    />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {user ? `${user.firstName} ${user.lastName}` : 'Cargando...'}
                      </Typography>
                      <Typography variant='caption'>
                        {user
                          ? user.role === 3
                            ? 'Administrador del Sistema'
                            : user.role === 2
                              ? 'Administrador del Negocio'
                              : ''
                          : ''}
                      </Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/users/me')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>Mi Perfil</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
