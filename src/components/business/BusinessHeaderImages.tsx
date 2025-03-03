import React from 'react'

import Image from 'next/image'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

interface BusinessHeaderImagesProps {
  logoUrl: string | null
  bannerUrl: string | null
  isEditing: boolean
  onLogoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLogoDelete?: () => void
  onBannerDelete?: () => void
}

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(15), // Increased from 8 to 12 to add more spacing
  width: '100%'
}))

const BannerContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '250px',
  position: 'relative',
  backgroundColor: theme.palette.grey[200],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}))

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '-40px',
  left: '24px',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: theme.palette.common.white,
  padding: '4px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: theme.shadows[2]
}))

const BannerEditContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  display: 'flex',
  gap: theme.spacing(1)
}))

const LogoEditContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '-60px',
  left: '150px',
  display: 'flex',
  gap: theme.spacing(1)
}))

const BusinessHeaderImages: React.FC<BusinessHeaderImagesProps> = ({
  logoUrl,
  bannerUrl,
  isEditing,
  onLogoChange,
  onBannerChange,
  onLogoDelete,
  onBannerDelete
}) => {
  return (
    <HeaderContainer>
      <BannerContainer>
        {bannerUrl ? (
          <Image src={bannerUrl} alt='Banner del negocio' fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            {isEditing ? 'Añade un banner para tu negocio' : 'Sin banner'}
          </Box>
        )}

        {isEditing && (
          <BannerEditContainer>
            <Button variant='contained' component='label' size='small'>
              {bannerUrl ? 'Cambiar Banner' : 'Subir Banner'}
              <input
                type='file'
                hidden
                accept='image/jpeg,image/png,image/gif,image/bmp,image/webp'
                onChange={onBannerChange}
              />
            </Button>
            {bannerUrl && onBannerDelete && (
              <Button variant='contained' color='error' size='small' onClick={onBannerDelete}>
                Eliminar
              </Button>
            )}
          </BannerEditContainer>
        )}
      </BannerContainer>

      <LogoContainer>
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt='Logo del negocio'
            width={112}
            height={112}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
            priority
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: 'text.secondary'
            }}
          >
            Logo
          </Box>
        )}
      </LogoContainer>

      {isEditing && (
        <LogoEditContainer>
          <Button variant='contained' component='label' size='small'>
            {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
            <input
              type='file'
              hidden
              accept='image/jpeg,image/png,image/gif,image/bmp,image/webp'
              onChange={onLogoChange}
            />
          </Button>
          {logoUrl && onLogoDelete && (
            <Button variant='contained' color='error' size='small' onClick={onLogoDelete}>
              Eliminar
            </Button>
          )}
        </LogoEditContainer>
      )}
    </HeaderContainer>
  )
}

export default BusinessHeaderImages
