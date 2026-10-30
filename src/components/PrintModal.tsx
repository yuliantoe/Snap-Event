import React, { useEffect, useState } from 'react';
import { Printer, X, Check, Copy, Scissors, Sparkles, Sliders } from 'lucide-react';
import { PrintPaperSize, PrintSettings } from '../types/photobooth';
import { createPrintCanvas, triggerDirectPrint } from '../utils/printEngine';

interface PrintModalProps {
  compositeUrl: string;
  eventTitle: string;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  compositeUrl,
  eventTitle,
  onClose,
}) => {
  const [settings, setSettings] = useState<PrintSettings>({
    paperSize: 'strip_2x6_dual',
    copies: 1,
    showCutLine: true,
    highDpi: true,
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);

  // Update preview canvas whenever settings change
  useEffect(() => {
    let active = true;
    setIsGeneratingPreview(true);

    createPrintCanvas(compositeUrl, settings)
      .then((canvas) => {
        if (active) {
          setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
          setIsGeneratingPreview(false);
        }
      })
      .catch((err) => {
        console.error('Print preview generation failed', err);
        if (active) setIsGeneratingPreview(false);
      });

    return () => {
      active = false;
    };
  }, [compositeUrl, settings]);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      setPrintSuccess(false);

      await triggerDirectPrint(compositeUrl, settings);

      setIsPrinting(false);
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 3000);
    } catch (err) {
      console.error('Print error:', err);
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[#0e0e13] text-zinc-100 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-rose-500" />
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Studio Print Langsung ke Printer
              </h3>
              <p className="text-xs text-zinc-400">
                Format siap cetak photobooth untuk printer foto & dye-sublimation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Preview Box */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-xl bg-zinc-950 p-4 border border-zinc-800/80 min-h-[380px]">
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                <span className="text-xs">Menyiapkan layout kertas foto...</span>
              </div>
            ) : previewUrl ? (
              <div className="relative max-h-[460px] max-w-full overflow-hidden rounded-lg bg-white p-2 shadow-2xl">
                <img
                  src={previewUrl}
                  alt="Print Layout Preview"
                  className="max-h-[420px] w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <span className="text-xs text-zinc-500">Preview tidak tersedia</span>
            )}

            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
              <span>Ukuran: {settings.paperSize === 'strip_2x6_dual' ? '4x6 Inch (Dual 2x6 Cut)' : settings.paperSize === 'postcard_4x6' ? '4x6 Inch Postcard' : 'Single 2x6 Strip'}</span>
              <span aria-hidden="true">·</span>
              <span>Kualitas 300 DPI</span>
            </div>
          </div>

          {/* Right Print Settings Form */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-4">
              {/* Paper Format Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Format Kertas Foto
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, paperSize: 'strip_2x6_dual' }))}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                      settings.paperSize === 'strip_2x6_dual'
                        ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="mt-0.5 rounded bg-zinc-800 p-1.5 text-rose-400">
                      <Scissors className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Dual 2x6 Strip on 4x6 (Standar Booth)
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        2 rangkap strip pada kertas 4x6 dengan garis potong tengah. Otomatis dipotong jadi 2.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, paperSize: 'postcard_4x6' }))}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                      settings.paperSize === 'postcard_4x6'
                        ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="mt-0.5 rounded bg-zinc-800 p-1.5 text-zinc-300">
                      <Printer className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Full Postcard 4x6 Inch
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Ukuran foto 10x15 cm penuh, ideal untuk frame meja & foto grup perusahaan.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, paperSize: 'single_strip_2x6' }))}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                      settings.paperSize === 'single_strip_2x6'
                        ? 'border-rose-500 bg-rose-500/10 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="mt-0.5 rounded bg-zinc-800 p-1.5 text-zinc-300">
                      <Copy className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Single 2x6 Strip
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Format strip tunggal untuk roll printer atau cetak individu.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Number of Copies */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Jumlah Cetak (Copies)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, copies: num }))}
                      className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
                        settings.copies === num
                          ? 'border-rose-500 bg-rose-600 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {num} {num === 1 ? 'Lembar' : 'Lembar'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800">
                {settings.paperSize === 'strip_2x6_dual' && (
                  <label className="flex items-center justify-between cursor-pointer text-xs text-zinc-300">
                    <span className="flex items-center gap-2">
                      <Scissors className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Tampilkan Garis Potong Tengah</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showCutLine}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, showCutLine: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                )}

                <label className="flex items-center justify-between cursor-pointer text-xs text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Resolusi Tinggi Cetak Foto (300 DPI)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.highDpi}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, highDpi: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-rose-600 focus:ring-rose-500"
                  />
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
              {printSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Perintah cetak berhasil dikirim ke printer!</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting || isGeneratingPreview}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-rose-500 disabled:opacity-50 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>
                    {isPrinting
                      ? 'Mengirim ke Printer...'
                      : `Print Sekarang (${settings.copies} ${settings.copies > 1 ? 'Lembar' : 'Lembar'})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
