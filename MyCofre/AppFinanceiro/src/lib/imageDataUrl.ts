const MAX_FILE_BYTES = 8 * 1024 * 1024 // 8 MB antes do redimensionamento

/**
 * Redimensiona e converte imagem para JPEG em data URL.
 * Hoje o perfil não persiste foto no app; útil para upload futuro (API) ou outros fluxos.
 */
export async function fileToProfileAvatarDataUrl(
  file: File,
  maxEdgePx = 400,
  jpegQuality = 0.88
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione um arquivo de imagem.')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Imagem muito grande. Use uma foto de até 8 MB.')
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      try {
        let { naturalWidth: w, naturalHeight: h } = img
        if (w < 1 || h < 1) {
          reject(new Error('Não foi possível ler a imagem.'))
          return
        }
        const scale = Math.min(1, maxEdgePx / Math.max(w, h))
        w = Math.max(1, Math.round(w * scale))
        h = Math.max(1, Math.round(h * scale))

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', jpegQuality))
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Erro ao processar a imagem.'))
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível carregar a imagem.'))
    }

    img.src = objectUrl
  })
}
