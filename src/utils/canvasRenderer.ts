import { EventDetails, FilterPreset, LayoutMode, StickerItem } from '../types/photobooth';

export interface RenderOptions {
  photos: string[]; // Base64 or Image URLs
  layout: LayoutMode;
  preset: FilterPreset;
  customAdjust: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    grain: number;
    vignette: number;
  };
  eventDetails: EventDetails;
  stickers: StickerItem[];
  outputType?: 'standard' | 'story_9_16';
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function renderPhotoboothComposite(options: RenderOptions): Promise<string> {
  const { photos, layout, preset, customAdjust, eventDetails, stickers, outputType } = options;

  if (photos.length === 0) {
    throw new Error('No photos to render');
  }

  const loadedImages = await Promise.all(photos.map(loadImage));

  // Determine Canvas Dimensions
  let width = 1200;
  let height = 1600;

  if (outputType === 'story_9_16') {
    width = 1080;
    height = 1920;
  } else if (layout === 'strip_3') {
    width = 900;
    height = 2400;
  } else if (layout === 'strip_4') {
    width = 900;
    height = 2900;
  } else if (layout === 'grid_4') {
    width = 1600;
    height = 1750;
  } else if (layout === 'single') {
    width = 1200;
    height = 1550;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Draw Frame Background based on theme
  const theme = eventDetails.frameTheme;
  if (theme === 'classic-white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (theme === 'champagne-gold') {
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, width, height);

    // Elegant gold hairline outer border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, height - 48);
  } else if (theme === 'bazar-carnival') {
    // Warm rich night-market festival theme
    ctx.fillStyle = '#18100b';
    ctx.fillRect(0, 0, width, height);

    // Warm amber & coral festival border
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#f97316');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);
  } else if (theme === 'birthday-confetti') {
    // Joyful birthday pastel theme
    ctx.fillStyle = '#fff8fa';
    ctx.fillRect(0, 0, width, height);

    // Sweet rose border
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // Decorative sprinkle dots along borders
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399'];
    for (let d = 0; d < 36; d++) {
      ctx.fillStyle = colors[d % colors.length];
      const dotX = 35 + ((d * 87) % (width - 70));
      const dotY = d % 2 === 0 ? 35 + (d * 5) % 60 : height - 35 - (d * 5) % 60;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (theme === 'corporate-navy') {
    // 1. Corporate Executive Navy & Platinum
    ctx.fillStyle = '#081226';
    ctx.fillRect(0, 0, width, height);

    // Platinum & cyan precision border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    // Platinum corner geometric brackets
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    const bLen = 28;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(18, 18 + bLen); ctx.lineTo(18, 18); ctx.lineTo(18 + bLen, 18);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 18 - bLen, 18); ctx.lineTo(width - 18, 18); ctx.lineTo(width - 18, 18 + bLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(18, height - 18 - bLen); ctx.lineTo(18, height - 18); ctx.lineTo(18 + bLen, height - 18);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 18 - bLen, height - 18); ctx.lineTo(width - 18, height - 18); ctx.lineTo(width - 18, height - 18 - bLen);
    ctx.stroke();
  } else if (theme === 'corporate-gold-gala') {
    // 2. Corporate Gold Tier Annual Gala & Awards
    ctx.fillStyle = '#09090c';
    ctx.fillRect(0, 0, width, height);

    // Metallic brushed gold gradient borders
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, '#ca8a04');
    goldGrad.addColorStop(0.3, '#fef08a');
    goldGrad.addColorStop(0.6, '#eab308');
    goldGrad.addColorStop(1, '#a16207');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 5;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 32, width - 64, height - 64);

    // Decorative award diamond accents
    ctx.fillStyle = '#fef08a';
    const drawDiamond = (dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(dx, dy - 6); ctx.lineTo(dx + 6, dy); ctx.lineTo(dx, dy + 6); ctx.lineTo(dx - 6, dy);
      ctx.closePath();
      ctx.fill();
    };
    drawDiamond(40, 40);
    drawDiamond(width - 40, 40);
    drawDiamond(40, height - 40);
    drawDiamond(width - 40, height - 40);
  } else if (theme === 'corporate-tech-summit') {
    // 3. Corporate Tech Summit & Cyber Innovation
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, width, height);

    // Electric cyan to violet gradient
    const techGrad = ctx.createLinearGradient(0, 0, width, height);
    techGrad.addColorStop(0, '#06b6d4');
    techGrad.addColorStop(0.5, '#6366f1');
    techGrad.addColorStop(1, '#a855f7');

    ctx.strokeStyle = techGrad;
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, width - 44, height - 44);

    // Tech ticks on edges
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(width / 2 - 20, 16, 40, 3);
    ctx.fillRect(width / 2 - 20, height - 19, 40, 3);
  } else if (theme === 'corporate-modern-travertine') {
    // 4. Corporate Modern Travertine & Minimalist Swiss Studio
    ctx.fillStyle = '#f8f8f9';
    ctx.fillRect(0, 0, width, height);

    // Clean architect hairline borders
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (theme === 'corporate-emerald-esg') {
    // 5. Corporate Emerald ESG & Sustainability Gala
    ctx.fillStyle = '#041c14';
    ctx.fillRect(0, 0, width, height);

    // Emerald & champagne border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(22, 22, width - 44, height - 44);
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 30, width - 60, height - 60);
  } else if (theme === 'neon-glow') {
    ctx.fillStyle = '#09090f';
    ctx.fillRect(0, 0, width, height);

    // Neon gradient accent borders
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.5, '#a855f7');
    grad.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, width - 40, height - 40);
  } else if (theme === 'polaroid') {
    ctx.fillStyle = '#fdfdfb';
    ctx.fillRect(0, 0, width, height);
  } else {
    // modern-noir
    ctx.fillStyle = '#111116';
    ctx.fillRect(0, 0, width, height);

    // Subtle edge
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);
  }

  // 2. Compute Header & Footer Areas
  const isLight =
    theme === 'classic-white' ||
    theme === 'champagne-gold' ||
    theme === 'polaroid' ||
    theme === 'birthday-confetti' ||
    theme === 'corporate-modern-travertine';
  const textColor = isLight ? '#18181b' : '#f4f4f5';
  const mutedColor = isLight ? '#71717a' : '#a1a1aa';
  const accentColor =
    theme === 'champagne-gold'
      ? '#b45309'
      : theme === 'bazar-carnival'
      ? '#f97316'
      : theme === 'birthday-confetti'
      ? '#db2777'
      : theme === 'corporate-navy'
      ? '#38bdf8'
      : theme === 'corporate-gold-gala'
      ? '#eab308'
      : theme === 'corporate-tech-summit'
      ? '#22d3ee'
      : theme === 'corporate-modern-travertine'
      ? '#18181b'
      : theme === 'corporate-emerald-esg'
      ? '#fbbf24'
      : theme === 'neon-glow'
      ? '#f43f5e'
      : isLight
      ? '#09090b'
      : '#ffffff';

  const headerHeight = outputType === 'story_9_16' ? 180 : 160;
  const footerHeight = theme === 'polaroid' ? 220 : 150;
  const paddingX = outputType === 'story_9_16' ? 60 : 50;

  // Render Header
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.font = '700 36px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText(eventDetails.title.toUpperCase(), width / 2, headerHeight * 0.42);

  // Subtitle / Date
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = mutedColor;
  const subText = `${eventDetails.subtitle ? eventDetails.subtitle + '  ·  ' : ''}${eventDetails.date}`;
  ctx.fillText(subText, width / 2, headerHeight * 0.75);

  ctx.restore();

  // 3. Position Photos
  interface PhotoBox {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  const boxes: PhotoBox[] = [];
  const usableY = headerHeight;
  const usableHeight = height - headerHeight - footerHeight;
  const usableWidth = width - paddingX * 2;

  if (layout === 'strip_3' || (layout === 'strip_4' && loadedImages.length === 3)) {
    const count = 3;
    const gap = 30;
    const itemHeight = (usableHeight - (count - 1) * gap) / count;
    for (let i = 0; i < count; i++) {
      boxes.push({
        x: paddingX,
        y: usableY + i * (itemHeight + gap),
        w: usableWidth,
        h: itemHeight,
      });
    }
  } else if (layout === 'strip_4') {
    const count = 4;
    const gap = 24;
    const itemHeight = (usableHeight - (count - 1) * gap) / count;
    for (let i = 0; i < count; i++) {
      boxes.push({
        x: paddingX,
        y: usableY + i * (itemHeight + gap),
        w: usableWidth,
        h: itemHeight,
      });
    }
  } else if (layout === 'grid_4') {
    const gap = 30;
    const colW = (usableWidth - gap) / 2;
    const rowH = (usableHeight - gap) / 2;
    boxes.push({ x: paddingX, y: usableY, w: colW, h: rowH });
    boxes.push({ x: paddingX + colW + gap, y: usableY, w: colW, h: rowH });
    boxes.push({ x: paddingX, y: usableY + rowH + gap, w: colW, h: rowH });
    boxes.push({ x: paddingX + colW + gap, y: usableY + rowH + gap, w: colW, h: rowH });
  } else {
    // Single
    boxes.push({
      x: paddingX,
      y: usableY,
      w: usableWidth,
      h: usableHeight,
    });
  }

  // Draw each photo into its designated box with filters applied
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const img = loadedImages[i % loadedImages.length];

    // Crop / cover calculation
    const imgRatio = img.width / img.height;
    const boxRatio = box.w / box.h;

    let sx = 0;
    let sy = 0;
    let sw = img.width;
    let sh = img.height;

    if (imgRatio > boxRatio) {
      sw = img.height * boxRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / boxRatio;
      sy = (img.height - sh) / 2;
    }

    // Temporary canvas for single photo filter processing
    const pCanvas = document.createElement('canvas');
    pCanvas.width = box.w;
    pCanvas.height = box.h;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) continue;

    // Apply CSS filter on offscreen context
    const computedBrightness = preset.brightness * customAdjust.brightness;
    const computedContrast = preset.contrast * customAdjust.contrast;
    const computedSaturation = preset.saturation * customAdjust.saturation;
    let filterString = `brightness(${computedBrightness.toFixed(2)}) contrast(${computedContrast.toFixed(2)}) saturate(${computedSaturation.toFixed(2)})`;

    if (preset.id === 'noir') {
      filterString = `grayscale(1) ${filterString}`;
    } else if (preset.id === 'vintage') {
      filterString = `sepia(0.65) ${filterString}`;
    } else if (preset.id === 'golden') {
      filterString = `sepia(0.25) ${filterString}`;
    } else if (preset.id === 'retro') {
      filterString = `sepia(0.3) ${filterString}`;
    } else if (preset.id === 'cyber') {
      filterString = `hue-rotate(185deg) ${filterString}`;
    } else if (preset.id === 'duotone') {
      filterString = `hue-rotate(240deg) ${filterString}`;
    }

    if (customAdjust.warmth !== 0) {
      filterString += ` hue-rotate(${customAdjust.warmth}deg)`;
    }

    pCtx.filter = filterString;
    pCtx.drawImage(img, sx, sy, sw, sh, 0, 0, box.w, box.h);
    pCtx.filter = 'none';

    // Apply Vignette if preset/custom demands it
    const totalVignette = Math.max(preset.vignette, customAdjust.vignette);
    if (totalVignette > 0) {
      const radius = Math.max(box.w, box.h) * 0.75;
      const vGrad = pCtx.createRadialGradient(box.w / 2, box.h / 2, radius * 0.4, box.w / 2, box.h / 2, radius);
      vGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vGrad.addColorStop(1, `rgba(0,0,0,${(totalVignette / 100) * 0.7})`);
      pCtx.fillStyle = vGrad;
      pCtx.fillRect(0, 0, box.w, box.h);
    }

    // Apply Film Grain if preset/custom demands it
    const totalGrain = Math.max(preset.grain, customAdjust.grain);
    if (totalGrain > 5) {
      const imgData = pCtx.getImageData(0, 0, box.w, box.h);
      const data = imgData.data;
      const grainFactor = (totalGrain / 100) * 45;
      for (let p = 0; p < data.length; p += 4) {
        const noise = (Math.random() - 0.5) * grainFactor;
        data[p] = Math.min(255, Math.max(0, data[p] + noise));
        data[p + 1] = Math.min(255, Math.max(0, data[p + 1] + noise));
        data[p + 2] = Math.min(255, Math.max(0, data[p + 2] + noise));
      }
      pCtx.putImageData(imgData, 0, 0);
    }

    // Draw photo into composite canvas
    ctx.save();
    // Inner frame border or shadow
    if (theme === 'classic-white') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
    }
    ctx.drawImage(pCanvas, box.x, box.y, box.w, box.h);
    ctx.restore();

    // Subtle photo border line
    ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x, box.y, box.w, box.h);
  }

  // 4. Render Footer Branding & Hashtag
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const footerCenterY = height - footerHeight / 2;

  // Hashtag
  ctx.font = '600 24px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = accentColor;
  ctx.fillText(eventDetails.hashtag || '#SnapLuxeBooth', width / 2, footerCenterY - 14);

  // Booth signature & serial
  ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = mutedColor;
  ctx.fillText('SNAPLUXE DIGITAL BOOTH  ·  INSTANT SHARE', width / 2, footerCenterY + 22);

  ctx.restore();

  // 5. Render Stickers & Digital Props
  for (const sticker of stickers) {
    ctx.save();
    const posX = (sticker.x / 100) * width;
    const posY = (sticker.y / 100) * height;

    ctx.translate(posX, posY);
    if (sticker.rotation) {
      ctx.rotate((sticker.rotation * Math.PI) / 180);
    }

    if (sticker.type === 'emoji') {
      ctx.font = `${sticker.size * 1.5}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    } else if (sticker.type === 'badge') {
      // Rounded badge banner
      ctx.font = `bold ${sticker.size * 0.45}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(sticker.content.toUpperCase());
      const bW = metrics.width + 40;
      const bH = sticker.size * 0.75;

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(-bW / 2, -bH / 2, bW, bH, bH / 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(sticker.content.toUpperCase(), 0, 2);
    }

    ctx.restore();
  }

  return canvas.toDataURL('image/png', 0.95);
}
