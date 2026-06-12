export async function generateShareImage(
  elementId: string,
  filename: string = 'palpitecup-ranking'
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#22c55e',
    logging: false,
    imageTimeout: 5000, // timeout de 5s por imagem
    onclone: (doc) => {
      // Remove imagens que podem travar o CORS
      const imgs = doc.querySelectorAll('img')
      imgs.forEach(img => {
        img.crossOrigin = 'anonymous'
        // Se não carregar em 3s, usa placeholder
        if (!img.complete) img.src = ''
      })
    }
  })

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png', 0.9)
  })

  const file = new File([blob], `${filename}.png`, { type: 'image/png' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: 'PalpiteCup',
      text: '🏆 Confira o ranking do nosso bolão!',
      files: [file],
    })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.png`
    a.click()
    URL.revokeObjectURL(url)
  }
}
