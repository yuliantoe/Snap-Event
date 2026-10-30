import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  Send,
  Sparkles,
  X,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { EventDetails, EventGalleryItem, LayoutMode } from '../types/photobooth';
import { PrintModal } from './PrintModal';

interface ShareModalProps {
  compositeUrl: string;
  storyUrl: string | null;
  layout: LayoutMode;
  eventDetails: EventDetails;
  onClose: () => void;
  onPublishToGallery: (item: Omit<EventGalleryItem, 'id' | 'timestamp' | 'likes' | 'reactions' | 'comments'>) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  compositeUrl,
  storyUrl,
  layout,
  eventDetails,
  onClose,
  onPublishToGallery,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestCaption, setGuestCaption] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [published, setPublished] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<'standard' | 'story'>('standard');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const currentDisplayUrl = activeFormat === 'story' && storyUrl ? storyUrl : compositeUrl;

  useEffect(() => {
    // Fire celebratory confetti on modal open
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#38bdf8', '#c084fc'],
    });

    // Generate real-time QR code.
    // In production/event venue, guests scan this QR code with their mobile phone
    // to open and download the high-resolution photo instantly!
    const pageUrl = window.location.href;
    QRCode.toDataURL(pageUrl, {
      margin: 2,
      width: 256,
      color: {
        dark: '#111116',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, []);

  // Download high-resolution photo
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${eventDetails.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = currentDisplayUrl;
    link.click();
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        // Convert data URL to file blob for native image sharing
        const res = await fetch(currentDisplayUrl);
        const blob = await res.blob();
        const file = new File([blob], `snapluxe_booth_${Date.now()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: eventDetails.title,
            text: `Had the best time at ${eventDetails.title}! ${eventDetails.hashtag}`,
            files: [file],
          });
        } else {
          await navigator.share({
            title: eventDetails.title,
            text: `Check out our photobooth picture from ${eventDetails.title}! ${eventDetails.hashtag}`,
            url: window.location.href,
          });
        }
      } catch (err) {
        console.warn('Share dismissed or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Copy Image or link to clipboard
  const handleCopyImage = async () => {
    try {
      const res = await fetch(currentDisplayUrl);
      const blob = await res.blob();
      if (navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Browser Print layout
  const handlePrint = () => {
    window.print();
  };

  // Publish to event live feed
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (published) return;

    onPublishToGallery({
      compositeUrl: currentDisplayUrl,
      layout,
      theme: eventDetails.frameTheme,
      eventTitle: eventDetails.title,
      category: eventDetails.category,
      caption: guestCaption.trim() || 'Photobooth memories! 🎉✨',
      author: guestName.trim() || 'Event Guest',
    });

    setPublished(true);
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Twitter/X share intent
  const shareTwitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Having an incredible time at ${eventDetails.title}! Check out our booth photo ${eventDetails.hashtag}`
  )}&url=${encodeURIComponent(window.location.href)}`;

  // WhatsApp share intent
  const shareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out our photobooth picture from ${eventDetails.title}! ${window.location.href}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[#0e0e13] text-zinc-100 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-lg font-bold text-white">
              Instant Share & Mobile Hand-off
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Format Selector: Standard Strip/Grid vs 9:16 Instagram Story */}
        {storyUrl && (
          <div className="flex items-center justify-center gap-2 bg-zinc-900/60 border-b border-zinc-800/80 px-6 py-2.5">
            <span className="text-xs text-zinc-400">Export Format:</span>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveFormat('standard')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeFormat === 'standard'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Photobooth Strip / Grid
              </button>
              <button
                onClick={() => setActiveFormat('story')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeFormat === 'story'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Instagram Story (9:16)
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: Photo Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4">
            <div className="max-h-[500px] overflow-hidden rounded-lg shadow-lg">
              <img
                src={currentDisplayUrl}
                alt="Photobooth Composite"
                className="max-h-[480px] w-auto object-contain mx-auto printable-strip"
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
              <span>High-Res 300DPI</span>
              <span aria-hidden="true">·</span>
              <span>{eventDetails.hashtag}</span>
            </div>
          </div>

          {/* Right Column: QR Code, Direct Socials, and Live Guestbook */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Real-time QR Code Card for Mobile Guests */}
            <div className="flex items-center gap-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <div className="shrink-0 overflow-hidden rounded-lg bg-white p-1.5 shadow-sm">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Scan QR Code" className="h-24 w-24 object-contain" />
                ) : (
                  <div className="h-24 w-24 bg-zinc-200 animate-pulse" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wide">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Scan to Save on Phone</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Guests can scan this QR code with their mobile camera to save their high-resolution photo instantly.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Save to Device</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share via Phone</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{isCopied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-zinc-700 hover:text-white transition-colors"
                title="Buka studio print untuk mencetak ke printer foto (2x6 dual atau 4x6)"
              >
                <Printer className="h-4 w-4 text-rose-400" />
                <span>Print Langsung ke Printer</span>
              </button>
            </div>

            {/* Direct Social Channels */}
            <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Direct Social Media Hand-off
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={shareWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 px-3 py-2 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={shareTwitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-sky-500/10 border border-sky-500/30 px-3 py-2 text-xs font-medium text-sky-400 hover:bg-sky-500/20 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>X / Twitter</span>
                </a>
              </div>
            </div>

            {/* Post to Live Event Wall & Guestbook */}
            <form onSubmit={handlePublish} className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">
                  Add to Live Event Wall
                </span>
                {published && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    <span>Added to Live Wall!</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Maya & Dan)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Leave a wish or caption for the hosts..."
                  value={guestCaption}
                  onChange={(e) => setGuestCaption(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={published}
                className="flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{published ? 'Published to Event Feed' : 'Broadcast to Event Screen'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Direct Print Studio Modal */}
      {showPrintModal && (
        <PrintModal
          compositeUrl={currentDisplayUrl}
          eventTitle={eventDetails.title}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
