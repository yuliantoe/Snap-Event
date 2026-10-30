import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Download,
  X,
  Sparkles,
  Smile,
  Send,
  Camera,
  Printer,
} from 'lucide-react';
import { EventGalleryItem } from '../types/photobooth';
import confetti from 'canvas-confetti';
import { PrintModal } from './PrintModal';

interface LiveGalleryProps {
  items: EventGalleryItem[];
  onLikeItem: (id: string) => void;
  onReactItem: (id: string, emoji: string) => void;
  onAddComment: (id: string, author: string, text: string) => void;
  onOpenBooth: () => void;
}

export const LiveGallery: React.FC<LiveGalleryProps> = ({
  items,
  onLikeItem,
  onReactItem,
  onAddComment,
  onOpenBooth,
}) => {
  const [selectedItem, setSelectedItem] = useState<EventGalleryItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [printModalItem, setPrintModalItem] = useState<EventGalleryItem | null>(null);

  const activeModalItem = selectedItem
    ? items.find((i) => i.id === selectedItem.id) || selectedItem
    : null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeModalItem) return;

    onAddComment(
      activeModalItem.id,
      authorName.trim() || 'Guest',
      commentText.trim()
    );
    setCommentText('');
  };

  const handleDownloadSingle = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_photo.png`;
    a.click();
  };

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bazar' | 'birthday' | 'office' | 'wedding'>('all');

  const filteredItems = items.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#121217] px-6 py-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
            Real-Time Event Wall
          </span>
          <h2 className="font-display text-xl font-bold text-white">
            Guest Photos & Guestbook
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Photos captured live in the booth appear here instantly. Leave wishes and reactions!
          </p>
        </div>

        <button
          onClick={onOpenBooth}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Camera className="h-4 w-4" />
          <span>Hop into Booth</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: 'Semua Momen' },
            { id: 'bazar', label: '🎪 Bazar & Kuliner' },
            { id: 'birthday', label: '🎂 Ulang Tahun' },
            { id: 'office', label: '🏢 Kantor Gathering' },
            { id: 'wedding', label: '💍 Pernikahan' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === tab.id
                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Masonry / Bento Grid of Photos */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-[#121217] p-12 text-center">
          <Camera className="h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="font-display text-lg font-bold text-white">
            No Event Photos Yet
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            Be the first guest to strike a pose in the booth! Photos will stream directly here.
          </p>
          <button
            onClick={onOpenBooth}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
          >
            Take First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#121217] shadow-lg transition-all hover:border-zinc-700 hover:shadow-rose-500/5"
            >
              {/* Photo Image container */}
              <div
                onClick={() => setSelectedItem(item)}
                className="relative cursor-pointer overflow-hidden bg-zinc-950 flex items-center justify-center p-3"
              >
                <img
                  src={item.compositeUrl}
                  alt={item.caption || item.eventTitle}
                  className="max-h-[420px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] rounded-md"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="rounded-lg bg-black/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                    View Fullscreen & React
                  </span>
                </div>
              </div>

              {/* Card Meta & Social Controls */}
              <div className="flex flex-col gap-2 p-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[160px]">
                    {item.author}
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>

                {/* Reactions & Like counts */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    {['❤️', '🥂', '🎉', '🔥'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReactItem(item.id, emoji);
                          confetti({ particleCount: 20, spread: 35, origin: { y: 0.8 } });
                        }}
                        className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] tabular-nums font-mono">
                          {item.reactions[emoji] || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onLikeItem(item.id)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart className="h-4 w-4 fill-rose-500/20 text-rose-500" />
                    <span className="tabular-nums font-mono text-xs">{item.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Detail & Guestbook Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[#0e0e13] text-zinc-100 shadow-2xl my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  {activeModalItem.author}&apos;s Photobooth Memory
                </h3>
                <span className="text-xs text-zinc-400">
                  {activeModalItem.eventTitle} · {new Date(activeModalItem.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
              {/* Photo Display */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-xl bg-zinc-950 p-4">
                <img
                  src={activeModalItem.compositeUrl}
                  alt={activeModalItem.caption}
                  className="max-h-[500px] w-auto object-contain mx-auto rounded-lg shadow-lg"
                />

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() =>
                      handleDownloadSingle(activeModalItem.compositeUrl, activeModalItem.author)
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: activeModalItem.eventTitle,
                          text: activeModalItem.caption,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => setPrintModalItem(activeModalItem)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    title="Cetak foto langsung ke printer"
                  >
                    <Printer className="h-3.5 w-3.5 text-rose-400" />
                    <span>Print Langsung</span>
                  </button>
                </div>
              </div>

              {/* Guestbook Wishes & Discussion */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-4">
                  {/* Caption */}
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3.5">
                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                      &ldquo;{activeModalItem.caption}&rdquo;
                    </p>
                  </div>

                  {/* Reaction bar */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      {['❤️', '🥂', '🎉', '🔥', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => onReactItem(activeModalItem.id, emoji)}
                          className="flex items-center gap-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:scale-105 transition-all"
                        >
                          <span>{emoji}</span>
                          <span className="font-mono text-[11px] tabular-nums">
                            {activeModalItem.reactions[emoji] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Wishes & Comments ({activeModalItem.comments.length})
                    </span>
                    {activeModalItem.comments.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2">
                        No comments yet. Write the first wish!
                      </p>
                    ) : (
                      activeModalItem.comments.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-col gap-0.5 rounded-lg bg-zinc-900/40 p-2.5 border border-zinc-800/40 text-xs"
                        >
                          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                            <span className="font-semibold text-zinc-200">{c.author}</span>
                            <span>{c.time}</span>
                          </div>
                          <p className="text-zinc-300">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add comment input */}
                <form
                  onSubmit={handleSendComment}
                  className="flex flex-col gap-2 pt-2 border-t border-zinc-800"
                >
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a wish or comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Print Studio Modal from Live Wall */}
      {printModalItem && (
        <PrintModal
          compositeUrl={printModalItem.compositeUrl}
          eventTitle={printModalItem.eventTitle}
          onClose={() => setPrintModalItem(null)}
        />
      )}
    </div>
  );
};
