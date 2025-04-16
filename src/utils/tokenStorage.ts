export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // Configuración más robusta para la cookie
    document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=86400` // 24 horas de duración
  }
}

export const getToken = () => {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'))

    if (match) return match[2]
  }

  return null
}

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'token=; Max-Age=0; path=/'
  }
}

export const getRoleFromToken = (tokenParam?: string): string | null => {
  const token = tokenParam || getToken()

  if (!token) return null

  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const payload = JSON.parse(jsonPayload)

    return payload.role || null
  } catch (error) {
    return null
  }
}
