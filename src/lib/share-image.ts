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
    backgroundColor: null,
    logging: false,
  })

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/png', 1.0)
  })

  const file = new File([blob], `${filename}.png`, { type: 'image/png' })

  // Tenta compartilhamento nativo (mobile)
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: 'PalpiteCup',
      text: '🏆 Confira o ranking do nosso bolão!',
      files: [file],
    })
  } else {
    // Fallback: download direto
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.png`
    a.click()
    URL.revokeObjectURL(url)
  }
}
