import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useTheme } from '@mui/material'

interface ConfirmationDialogProps {
  title: string
  text: string
  open: boolean
  handleClose: () => void
  handleAgree: () => void
}

function ConfirmationDialog({ title, text, open, handleClose, handleAgree }: ConfirmationDialogProps) {
  const theme = useTheme()

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} id='alert-dialog-title'>
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
            id='alert-dialog-description'
          >
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} onClick={handleClose}>
            Volver
          </Button>
          <Button sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }} onClick={handleAgree} autoFocus>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ConfirmationDialog
