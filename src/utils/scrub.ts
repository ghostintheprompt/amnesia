export async function scrubAndDownloadImage(src: string, hash: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = "anonymous";
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    // We use the proxy to ensure we don't hit canvas tainting issues
    img.src = `/api/proxy-resource?url=${encodeURIComponent(src)}`;
  });

  canvas.width = img.width;
  canvas.height = img.height;
  
  // Apply a heavy blur and grayscale for the 'Amnesia' effect
  ctx.filter = 'blur(8px) grayscale(100%)';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Add "WIPED BY AMNESIA" watermark
  ctx.filter = 'none';
  ctx.font = 'bold 48px monospace';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.fillText('WIPED_BY_AMNESIA', 40, 80);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `amnesia_wiped_${hash}.jpg`;
  link.click();
}
