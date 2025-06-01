// Obtener la URL del servidor de imágenes de las variables de entorno
const imageServer = process.env.NEXT_PUBLIC_MINIO_SERVER || 'http://181.225.255.61'

// Extraer hostname de la URL (sin protocolo)
const imageServerHostname = imageServer.replace(/^https?:\/\//, '')

module.exports = {
  images: {
    domains: ['minio-api.mayabeque.mdialityc.com'],
    remotePatterns: [
      {
        protocol: imageServer.startsWith('https') ? 'https' : 'http',
        hostname: imageServerHostname
      }
    ]
  },
  output: 'standalone'
}
