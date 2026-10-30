import React, { useState } from 'react';
import { X, Check, Sparkles, Calendar, MapPin, Hash, Palette } from 'lucide-react';
import { EventCategory, EventDetails, FrameTheme } from '../types/photobooth';
import { EVENT_PRESETS } from '../data/eventPresets';

interface EventSettingsModalProps {
  eventDetails: EventDetails;
  onSave: (updated: EventDetails) => void;
  onClose: () => void;
}

export const EventSettingsModal: React.FC<EventSettingsModalProps> = ({
  eventDetails,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<EventDetails>({ ...eventDetails });

  const handleApplyPreset = (category: EventCategory) => {
    const preset = EVENT_PRESETS[category];
    if (preset) {
      setForm({ ...preset.details });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0e0e13] text-zinc-100 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-lg font-bold text-white">
              Event Branding & Frame Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {/* Quick Preset Buttons */}
          <div className="flex flex-col gap-2 pb-2 border-b border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Pilih Momen Acara Cepat (Event Moments)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'bazar', label: 'Bazar / Market', icon: '🎪' },
                  { id: 'birthday', label: 'Ulang Tahun', icon: '🎂' },
                  { id: 'office', label: 'Kantor Gathering', icon: '🏢' },
                  { id: 'wedding', label: 'Pernikahan', icon: '💍' },
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium text-left transition-all ${
                    form.category === p.id
                      ? 'border-rose-500 bg-rose-500/10 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Judul Acara / Event Title
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Festival Bazar Nusantara 2026"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Subtitle / Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span>Lokasi / Venue</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Senayan Park / Grand Ballroom"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-rose-400" />
                <span>Tanggal / Waktu</span>
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="e.g. October 29, 2026"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subtitle description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Tagline / Subtitle Acara
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Kuliner Kreatif & Weekend Vibes"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Hashtag */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Hash className="h-3.5 w-3.5 text-rose-400" />
              <span>Official Event Hashtag</span>
            </label>
            <input
              type="text"
              value={form.hashtag}
              onChange={(e) => setForm({ ...form, hashtag: e.target.value })}
              placeholder="e.g. #BazarFest2026"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Default Frame Theme */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <Palette className="h-3.5 w-3.5 text-rose-400" />
                <span>Tema Desain Frame Photostrip</span>
              </label>
              <span className="text-[11px] text-rose-400">Termasuk 5 Tema Korporat ✨</span>
            </div>

            {/* Corporate Specific Frame Themes */}
            <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wide">
                🏢 5 Tema Desain Acara Korporat:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'corporate-navy', label: '1. Executive Navy' },
                    { id: 'corporate-gold-gala', label: '2. Gold Awards Gala' },
                    { id: 'corporate-tech-summit', label: '3. Tech Summit Cyber' },
                    { id: 'corporate-modern-travertine', label: '4. Swiss Travertine' },
                    { id: 'corporate-emerald-esg', label: '5. Emerald ESG Gala' },
                  ] as const
                ).map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setForm({ ...form, frameTheme: t.id })}
                    className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all truncate text-center ${
                      form.frameTheme === t.id
                        ? 'border-rose-500 bg-rose-500/20 text-white font-semibold ring-1 ring-rose-500'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Other Event Themes */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
              {(
                [
                  { id: 'bazar-carnival', label: '🎪 Bazar' },
                  { id: 'birthday-confetti', label: '🎂 Ultah' },
                  { id: 'champagne-gold', label: '💍 Luxury' },
                  { id: 'modern-noir', label: 'Matte Noir' },
                  { id: 'classic-white', label: 'Studio Paper' },
                  { id: 'neon-glow', label: 'Neon Glow' },
                  { id: 'polaroid', label: 'Polaroid' },
                ] as const
              ).map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm({ ...form, frameTheme: t.id })}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all truncate text-center ${
                    form.frameTheme === t.id
                      ? 'border-rose-500 bg-rose-500/10 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
