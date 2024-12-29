export const saveToken = (token: string) => {
  localStorage.setItem('token', token) // Para pruebas locales
}

export const getToken = () => localStorage.getItem('token')

export const removeToken = () => {
  localStorage.removeItem('token')
}
