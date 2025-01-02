export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `token=${token}; path=/`
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
