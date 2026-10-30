import { PrintSettings } from '../types/photobooth';

export async function createPrintCanvas(
  compositeDataUrl: string,
  settings: PrintSettings
): Promise<HTMLCanvasElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = compositeDataUrl;
  });

  const canvas = document.createElement('canvas');

  // Standard 4x6 inch print at 300 DPI is 1200 x 1800 px (or 1800 x 1200 landscape)
  if (settings.paperSize === 'strip_2x6_dual') {
    // 4x6 inch paper containing TWO identical 2x6 strips side by side
    canvas.width = 1800; // 6 inches at 300 DPI
    canvas.height = 1200; // 4 inches at 300 DPI
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get print context');

    // Clean white photographic paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stripW = 860;
    const stripH = 1160;
    const paddingY = 20;
    const leftX = 25;
    const rightX = 915;

    // Left Strip
    ctx.drawImage(img, leftX, paddingY, stripW, stripH);

    // Right Strip (identical duplicate for photobooth cutting)
    ctx.drawImage(img, rightX, paddingY, stripW, stripH);

    // Optional Cut Line in the exact center
    if (settings.showCutLine) {
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(900, 10);
      ctx.lineTo(900, 1190);
      ctx.stroke();

      // Scissor icon & label
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('✂ CUT LINE / GARIS POTONG ✂', 900, 1195);
      ctx.restore();
    }
  } else if (settings.paperSize === 'postcard_4x6') {
    // 4x6 inch Postcard Print (1200 x 1800 or 1800 x 1200 depending on aspect)
    const isLandscape = img.width > img.height;
    canvas.width = isLandscape ? 1800 : 1200;
    canvas.height = isLandscape ? 1200 : 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get print context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale to fit nicely with elegant 25px photo border
    const margin = 30;
    const fitW = canvas.width - margin * 2;
    const fitH = canvas.height - margin * 2;

    const imgRatio = img.width / img.height;
    const targetRatio = fitW / fitH;

    let dw = fitW;
    let dh = fitH;
    let dx = margin;
    let dy = margin;

    if (imgRatio > targetRatio) {
      dh = fitW / imgRatio;
      dy = margin + (fitH - dh) / 2;
    } else {
      dw = fitH * imgRatio;
      dx = margin + (fitW - dw) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    // Single 2x6 strip (600 x 1800 at 300 DPI)
    canvas.width = 600;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get print context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 15, 15, 570, 1770);
  }

  return canvas;
}

export async function triggerDirectPrint(
  compositeDataUrl: string,
  settings: PrintSettings
): Promise<void> {
  const canvas = await createPrintCanvas(compositeDataUrl, settings);
  const printImageUrl = canvas.toDataURL('image/jpeg', 0.98);

  // Create an isolated invisible print iframe to trigger standard OS printer dialog
  // without page clutter, URL headers, or breaking the current screen
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    throw new Error('Unable to access print frame context');
  }

  // Generate pages according to copies
  let imagesHtml = '';
  for (let i = 0; i < settings.copies; i++) {
    imagesHtml += `
      <div class="print-page">
        <img src="${printImageUrl}" alt="Print Job" />
      </div>
    `;
  }

  const pageCss =
    settings.paperSize === 'strip_2x6_dual'
      ? '@page { size: 6in 4in landscape; margin: 0; }'
      : settings.paperSize === 'postcard_4x6'
      ? '@page { size: 4in 6in portrait; margin: 0; }'
      : '@page { size: 2in 6in portrait; margin: 0; }';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SnapLuxe Photo Print</title>
        <style>
          ${pageCss}
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            background: #ffffff;
          }
          .print-page {
            width: 100vw;
            height: 100vh;
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            display: block;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${imagesHtml}
      </body>
    </html>
  `);
  doc.close();

  // Wait for images to load inside iframe, then trigger print
  await new Promise<void>((resolve) => {
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 1500);
      }, 350);
    };
  });
}
