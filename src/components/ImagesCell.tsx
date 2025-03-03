'use client'

import React, { useState } from 'react'

import Image from 'next/image'

import { Box, IconButton, Dialog, DialogContent, Grid, Tooltip, ClickAwayListener } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CloseIcon from '@mui/icons-material/Close'
import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import ImageIcon from '@mui/icons-material/Image'

interface ImagesCellProps {
  images: string[]
  alt: string
}

const ImagesCell: React.FC<ImagesCellProps> = ({ images, alt }) => {
  const [open, setOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [tooltipOpen, setTooltipOpen] = useState(false)

  // Si no hay imágenes, muestra un placeholder
  if (!images || images.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Box
          sx={{
            bgcolor: 'grey.200',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
        >
          <ImageIcon sx={{ color: 'grey.500', fontSize: 20 }} />
        </Box>
      </Box>
    )
  }

  const handleOpen = () => {
    setTooltipOpen(false) // Cerrar el tooltip al abrir el diálogo
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleTooltipClose = () => {
    setTooltipOpen(false)
  }

  const handleTooltipOpen = () => {
    setTooltipOpen(true)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  // Si hay más de una imagen, muestra un indicador de la cantidad
  const multipleImagesIndicator =
    images.length > 1 ? (
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          fontSize: '10px',
          padding: '2px 4px',
          borderTopLeftRadius: '4px'
        }}
      >
        {images.length}
      </Box>
    ) : null

  // Componente para renderizar una imagen con manejo de errores
  const ImageWithFallback = ({
    src,
    altText,
    index,
    width,
    height,
    fill = false,
    style = {},
    priority = false
  }: {
    src: string
    altText: string
    index: number
    width?: number
    height?: number
    fill?: boolean
    style?: React.CSSProperties
    priority?: boolean
  }) => {
    if (imageErrors[index]) {
      return (
        <Box
          sx={{
            bgcolor: 'grey.200',
            width: width || '100%',
            height: height || '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: fill ? 'absolute' : 'relative',
            inset: fill ? 0 : 'auto'
          }}
        >
          <BrokenImageIcon sx={{ color: 'grey.500' }} />
        </Box>
      )
    }

    try {
      return fill ? (
        <Image
          src={src}
          alt={altText}
          fill={true}
          style={{
            ...style,
            objectFit: 'contain' // Asegura que la imagen mantenga su relación de aspecto
          }}
          onError={() => handleImageError(index)}
          unoptimized // Agregamos esto para evitar la optimización de Next.js que puede causar problemas con ciertos dominios
          priority={priority}
        />
      ) : (
        <Image
          src={src}
          alt={altText}
          width={width || 40}
          height={height || 40}
          style={{
            ...style,
            width: 'auto', // Añadiendo width:auto cuando se especifica height
            height: 'auto', // Añadiendo height:auto cuando se especifica width
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onError={() => handleImageError(index)}
          unoptimized // Agregamos esto para evitar la optimización de Next.js
          priority={priority}
        />
      )
    } catch (error) {
      handleImageError(index)

      return (
        <Box
          sx={{
            bgcolor: 'grey.200',
            width: width || '100%',
            height: height || '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <BrokenImageIcon sx={{ color: 'grey.500' }} />
        </Box>
      )
    }
  }

  return (
    <>
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <Box sx={{ position: 'relative' }}>
          <Tooltip
            title='Ver imágenes'
            open={tooltipOpen}
            onClose={handleTooltipClose}
            onOpen={handleTooltipOpen}
            disableHoverListener
          >
            <Box
              onClick={handleOpen}
              onMouseEnter={handleTooltipOpen}
              onMouseLeave={handleTooltipClose}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                <ImageWithFallback
                  src={images[0]}
                  altText={alt}
                  index={0}
                  width={40}
                  height={40}
                  style={{
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                  priority={true}
                />
                {multipleImagesIndicator}
              </Box>
            </Box>
          </Tooltip>
        </Box>
      </ClickAwayListener>

      {/* Diálogo para ver las imágenes ampliadas */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='md'
        fullWidth
        onClick={e => e.stopPropagation()} // Prevenir que el clic se propague
      >
        <Box sx={{ position: 'relative' }}>
          <DialogContent>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500',
                zIndex: 1
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Imagen principal */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                mb: 2,
                height: 400
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <ImageWithFallback
                  src={images[currentImageIndex]}
                  altText={`${alt} - imagen ${currentImageIndex + 1}`}
                  index={currentImageIndex}
                  fill={true}
                  style={{ objectFit: 'contain' }}
                />
              </Box>

              {/* Controles de navegación */}
              {images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrev}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'grey.700',
                      bgcolor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'grey.700',
                      bgcolor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Miniaturas */}
            {images.length > 1 && (
              <Grid container spacing={1} justifyContent='center'>
                {images.map((src, index) => (
                  <Grid item key={index}>
                    <Box
                      onClick={() => setCurrentImageIndex(index)}
                      sx={{
                        width: 60,
                        height: 60,
                        position: 'relative',
                        opacity: index === currentImageIndex ? 1 : 0.6,
                        border: index === currentImageIndex ? '2px solid #1976d2' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          opacity: 1
                        }
                      }}
                    >
                      <ImageWithFallback
                        src={src}
                        altText={`${alt} - miniatura ${index + 1}`}
                        index={index + images.length} // Usamos un índice diferente para las miniaturas
                        fill={true}
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
        </Box>
      </Dialog>
    </>
  )
}

export default ImagesCell
