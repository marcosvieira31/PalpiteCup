async function toBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return '' // retorna vazio se falhar
  }
}

export async function generateShareImage(
  elementId: string,
  filename: string = 'palpitecup-ranking'
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const element = document.getElementById(elementId)
  if (!element) return

  // Pré-converte todas as imagens para base64
  const imgs = element.querySelectorAll<HTMLImageElement>('img')
  await Promise.all(Array.from(imgs).map(async (img) => {
    // Para avatares do GitHub, Google ou locais
    const urlToFetch = img.src.startsWith('/') ? window.location.origin + img.src : img.src;
    const base64 = await toBase64(urlToFetch)
    if (base64) img.src = base64
  }))

  // Aguarda um frame para garantir que as imagens foram atualizadas
  await new Promise(r => requestAnimationFrame(r))

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#22c55e',
    logging: false,
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
