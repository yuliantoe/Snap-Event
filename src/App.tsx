import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { DeviceModeBar } from './components/DeviceModeBar';
import { CameraBooth } from './components/CameraBooth';
import { FilterControls } from './components/FilterControls';
import { ReviewModal } from './components/ReviewModal';
import { ShareModal } from './components/ShareModal';
import { LiveGallery } from './components/LiveGallery';
import { SlideshowKiosk } from './components/SlideshowKiosk';
import { EventSettingsModal } from './components/EventSettingsModal';
import {
  DeviceDisplayMode,
  EventCategory,
  EventDetails,
  EventGalleryItem,
  FilterId,
  FrameTheme,
  LayoutMode,
} from './types/photobooth';
import { SAMPLE_GALLERY_PHOTOS } from './data/samplePhotos';
import { EVENT_PRESETS } from './data/eventPresets';
import { getFilterById } from './utils/filters';
import { sfx } from './utils/audio';

const STORAGE_KEY_GALLERY = 'snapluxe_gallery_items_v2';
const STORAGE_KEY_EVENT = 'snapluxe_event_details_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booth' | 'gallery' | 'slideshow'>('booth');
  const [deviceMode, setDeviceMode] = useState<DeviceDisplayMode>('desktop');
  const [isFullCamera, setIsFullCamera] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleRotateTablet = () => {
    setDeviceMode((prev) => (prev === 'tablet_landscape' ? 'tablet_portrait' : 'tablet_landscape'));
    sfx.playBeep(880, 0.05);
  };

  const handleToggleFullCamera = () => {
    setIsFullCamera((prev) => !prev);
    sfx.playBeep(920, 0.05);
  };

  // Event Details State with Default Bazar Event
  const [eventDetails, setEventDetails] = useState<EventDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENT);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      category: 'bazar',
      title: 'Festival Bazar Nusantara & Weekend Market',
      subtitle: 'Kuliner Kreatif, Live Music & UMKM Fest',
      hashtag: '#BazarFest2026 #KulinerHits',
      date: 'Sabtu & Minggu, 2026',
      location: 'Plaza Parkir Timur Senayan',
      frameTheme: 'bazar-carnival',
    };
  });

  // Filter & Tone Tuning State
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('golden');
  const [customAdjust, setCustomAdjust] = useState({
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    warmth: 0,
    grain: 0,
    vignette: 0,
  });

  const handleResetAdjust = () => {
    setCustomAdjust({
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      warmth: 0,
      grain: 0,
      vignette: 0,
    });
  };

  // Switch Event Presets (Bazar, Ulang Tahun, Kantor Gathering, Wedding)
  const handleSelectEventPreset = (category: EventCategory) => {
    const preset = EVENT_PRESETS[category];
    if (preset) {
      setEventDetails({ ...preset.details });
      setSelectedFilter(preset.recommendedFilter);
      sfx.playBeep(880, 0.06);
    }
  };

  // Captured Photos Flow State
  const [pendingPhotos, setPendingPhotos] = useState<string[] | null>(null);
  const [pendingLayout, setPendingLayout] = useState<LayoutMode>('strip_3');

  // Share Modal State
  const [shareData, setShareData] = useState<{
    compositeUrl: string;
    storyUrl: string | null;
    layout: LayoutMode;
  } | null>(null);

  // Live Gallery Items
  const [galleryItems, setGalleryItems] = useState<EventGalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GALLERY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return SAMPLE_GALLERY_PHOTOS;
  });

  // Save gallery & event details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(galleryItems));
    } catch {
      // Storage quota or restriction
    }
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENT, JSON.stringify(eventDetails));
    } catch {
      // Storage quota or restriction
    }
  }, [eventDetails]);

  // Handle Photo Capture Completion
  const handlePhotosCaptured = (photos: string[], layout: LayoutMode) => {
    setPendingPhotos(photos);
    setPendingLayout(layout);
  };

  // Proceed from Review to Share Modal
  const handleProceedToShare = (compositeUrl: string, storyUrl: string | null) => {
    setShareData({
      compositeUrl,
      storyUrl,
      layout: pendingLayout,
    });
    setPendingPhotos(null);
  };

  // Publish to Live Gallery
  const handlePublishToGallery = (
    item: Omit<EventGalleryItem, 'id' | 'timestamp' | 'likes' | 'reactions' | 'comments'>
  ) => {
    const newItem: EventGalleryItem = {
      ...item,
      category: item.category || eventDetails.category,
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      likes: 1,
      reactions: { '❤️': 1 },
      comments: [],
    };

    setGalleryItems((prev) => [newItem, ...prev]);
  };

  // Reactions & Likes in Live Wall
  const handleLikeItem = (id: string) => {
    setGalleryItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, likes: i.likes + 1 } : i))
    );
  };

  const handleReactItem = (id: string, emoji: string) => {
    setGalleryItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const count = i.reactions[emoji] || 0;
          return {
            ...i,
            reactions: {
              ...i.reactions,
              [emoji]: count + 1,
            },
          };
        }
        return i;
      })
    );
  };

  const handleAddComment = (id: string, author: string, text: string) => {
    setGalleryItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          return {
            ...i,
            comments: [
              ...i.comments,
              {
                id: `cmt-${Date.now()}`,
                author,
                text,
                time: 'Just now',
              },
            ],
          };
        }
        return i;
      })
    );
  };

  const handleSelectFrameTheme = (theme: FrameTheme) => {
    setEventDetails((prev) => ({ ...prev, frameTheme: theme }));
    sfx.playBeep(920, 0.05);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        eventTitle={eventDetails.title}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onQuickSnap={() => {
          setActiveTab('booth');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Device Mode Switcher (Komputer Desktop vs Tablet Landscape vs Tablet Portrait) */}
      <DeviceModeBar
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        onRotateTablet={handleRotateTablet}
        isFullCamera={isFullCamera}
        onToggleFullCamera={handleToggleFullCamera}
      />

      {/* Main Container with dynamic sizing adapted to device mode */}
      <main
        className={`flex-1 transition-all duration-300 ${
          deviceMode === 'tablet_portrait'
            ? 'w-full max-w-[768px] mx-auto px-4 py-5'
            : deviceMode === 'tablet_landscape'
            ? 'w-full max-w-5xl mx-auto px-5 sm:px-6 py-6'
            : 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
        }`}
      >
        {activeTab === 'booth' && (
          <div className="flex flex-col gap-6">
            <CameraBooth
              onPhotosCaptured={handlePhotosCaptured}
              selectedFilter={selectedFilter}
              customAdjust={customAdjust}
              eventDetails={eventDetails}
              onSelectEventPreset={handleSelectEventPreset}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSelectFrameTheme={handleSelectFrameTheme}
              deviceMode={deviceMode}
              isFullCamera={isFullCamera}
              onToggleFullCamera={handleToggleFullCamera}
              onSelectFilter={setSelectedFilter}
            />

            {/* Filter and Tone Adjustment Controls */}
            <FilterControls
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              customAdjust={customAdjust}
              setCustomAdjust={setCustomAdjust}
              onResetAdjust={handleResetAdjust}
            />
          </div>
        )}

        {activeTab === 'gallery' && (
          <LiveGallery
            items={galleryItems}
            onLikeItem={handleLikeItem}
            onReactItem={handleReactItem}
            onAddComment={handleAddComment}
            onOpenBooth={() => setActiveTab('booth')}
          />
        )}

        {activeTab === 'slideshow' && (
          <SlideshowKiosk
            items={galleryItems}
            eventDetails={eventDetails}
            onExit={() => setActiveTab('booth')}
          />
        )}
      </main>

      {/* Review Modal after capturing photos */}
      {pendingPhotos && (
        <ReviewModal
          capturedPhotos={pendingPhotos}
          initialLayout={pendingLayout}
          preset={getFilterById(selectedFilter)}
          customAdjust={customAdjust}
          eventDetails={eventDetails}
          onRetake={() => setPendingPhotos(null)}
          onProceedToShare={handleProceedToShare}
          onClose={() => setPendingPhotos(null)}
        />
      )}

      {/* Share & Mobile QR Modal */}
      {shareData && (
        <ShareModal
          compositeUrl={shareData.compositeUrl}
          storyUrl={shareData.storyUrl}
          layout={shareData.layout}
          eventDetails={eventDetails}
          onClose={() => setShareData(null)}
          onPublishToGallery={handlePublishToGallery}
        />
      )}

      {/* Event Settings Modal */}
      {isSettingsOpen && (
        <EventSettingsModal
          eventDetails={eventDetails}
          onSave={setEventDetails}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-[#08080a] py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-zinc-400">SnapLuxe</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Event Photobooth & Multi-Camera Studio</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Official Event: {eventDetails.hashtag}</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Camera & Real-time Filters</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
