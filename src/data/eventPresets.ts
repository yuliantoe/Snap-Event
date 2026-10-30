import { EventCategory, EventDetails, FilterId, FrameTheme } from '../types/photobooth';

export interface EventPresetConfig {
  category: EventCategory;
  name: string;
  tagline: string;
  icon: string;
  details: EventDetails;
  recommendedFilter: FilterId;
  specificBadges: string[];
  specificEmojis: string[];
}

export const EVENT_PRESETS: Record<EventCategory, EventPresetConfig> = {
  bazar: {
    category: 'bazar',
    name: 'Bazar & Night Market',
    tagline: 'Festival Kuliner, Musik & Komunitas',
    icon: '🎪',
    recommendedFilter: 'golden',
    details: {
      category: 'bazar',
      title: 'Festival Bazar Nusantara & Weekend Market',
      subtitle: 'Kuliner Kreatif, Live Music & UMKM Fest',
      hashtag: '#BazarFest2026 #KulinerHits',
      date: 'Sabtu & Minggu, 2026',
      location: 'Plaza Parkir Timur Senayan',
      frameTheme: 'bazar-carnival',
    },
    specificBadges: [
      'BAZAR HUNTER',
      'KULINER HITS',
      'STREET FOOD',
      'PROMO DAY',
      'DISCOUNT VIBES',
      'JAJAN TERUS',
      'FESTIVAL SQUAD',
    ],
    specificEmojis: ['🍢', '🍜', '🧋', '🛍️', '🎪', '🏮', '🍧', '☕', '🔥', '🎉'],
  },

  birthday: {
    category: 'birthday',
    name: 'Pesta Ulang Tahun',
    tagline: 'Birthday Bash & Milestone Celebrations',
    icon: '🎂',
    recommendedFilter: 'pastel',
    details: {
      category: 'birthday',
      title: "Clara's Sweet 17th Birthday Fiesta",
      subtitle: 'Celebrating Another Year of Laughter & Dreams',
      hashtag: '#ClaraTurns17 #SweetSeventeen',
      date: 'Tonight · 2026',
      location: 'Skyline Glasshouse Garden',
      frameTheme: 'birthday-confetti',
    },
    specificBadges: [
      'HAPPY BIRTHDAY',
      'BIRTHDAY SQUAD',
      'SWEET 17',
      'MAKE A WISH',
      'PARTY MODE',
      'BIRTHDAY BABE',
      'LEVEL UP!',
      'BLESSED',
    ],
    specificEmojis: ['🎂', '🎈', '🎁', '🥳', '👑', '🧁', '💖', '✨', '🦄', '🎉'],
  },

  office: {
    category: 'office',
    name: 'Kantor Gathering',
    tagline: 'Annual Gala, Outing & Team Building',
    icon: '🏢',
    recommendedFilter: 'glam',
    details: {
      category: 'office',
      title: 'Annual Gathering & Synergy Gala 2026',
      subtitle: 'One Team, One Goal · PT Sinergi Cipta Mandiri',
      hashtag: '#OfficeGathering2026 #TeamSynergy',
      date: 'October 29, 2026',
      location: 'Grand Ballroom & Convention Center',
      frameTheme: 'corporate-navy',
    },
    specificBadges: [
      'BEST TEAM EVER',
      'WORK HARD PLAY HARD',
      'TEAM SYNERGY',
      'TOP PERFORMER',
      'GATHERING 2026',
      'SOLID TOGETHER',
      'INNOVATE & GROW',
      'TEAM LEADERS',
    ],
    specificEmojis: ['💼', '🏆', '🤝', '🎯', '🚀', '☕', '🥂', '👔', '⭐', '🔥'],
  },

  wedding: {
    category: 'wedding',
    name: 'Pernikahan & Resepsi',
    tagline: 'Romantic Wedding Gala & Reception',
    icon: '💍',
    recommendedFilter: 'glam',
    details: {
      category: 'wedding',
      title: "Sophia & Liam's Wedding Celebration",
      subtitle: 'Grand Ballroom Reception & Evening Party',
      hashtag: '#SophiaAndLiam2026',
      date: 'October 29, 2026',
      location: 'The Grand Heritage Estate',
      frameTheme: 'champagne-gold',
    },
    specificBadges: [
      'JUST MARRIED',
      'TRUE LOVE',
      'BEST NIGHT EVER',
      'CHEERS!',
      'HAPPILY EVER AFTER',
      'FOREVER & ALWAYS',
      'VIP GUESTS',
    ],
    specificEmojis: ['🥂', '🍾', '💖', '💍', '💐', '✨', '🎩', '💋', '🌸', '💃'],
  },

  custom: {
    category: 'custom',
    name: 'Custom Event',
    tagline: 'Bebas Kustomisasi Semua Detail',
    icon: '✨',
    recommendedFilter: 'retro',
    details: {
      category: 'custom',
      title: 'Special Event Photobooth',
      subtitle: 'Moments to Remember',
      hashtag: '#EventPhotobooth',
      date: '2026',
      location: 'Main Hall',
      frameTheme: 'modern-noir',
    },
    specificBadges: ['VIP', 'BEST MOMENTS', 'SMILE!', 'MEMORIES', 'PHOTOBOOTH'],
    specificEmojis: ['📸', '✨', '🎉', '🔥', '❤️', '🙌'],
  },
};

export const CORPORATE_THEMES_INFO = [
  {
    id: 'corporate-navy',
    name: 'Executive Navy & Platinum',
    tagline: 'Desain formal eksekutif dengan platinum hairline & aksen sudut geometris',
    badge: 'Executive',
    accentColor: '#38bdf8',
  },
  {
    id: 'corporate-gold-gala',
    name: 'Gold Awards Gala',
    tagline: 'Kemewahan metallic gold brushed dengan diamond award filigree untuk malam apresiasi',
    badge: 'Annual Awards',
    accentColor: '#facc15',
  },
  {
    id: 'corporate-tech-summit',
    name: 'Tech Summit Cyber',
    tagline: 'Gradasi electric cyan-violet dengan aksen garis telemetri & inovasi digital',
    badge: 'Tech & Hackathon',
    accentColor: '#22d3ee',
  },
  {
    id: 'corporate-modern-travertine',
    name: 'Swiss Travertine Minimalist',
    tagline: 'Kanvas putih travertine arsitektural dengan bingkai charcoal Swiss modern',
    badge: 'Swiss Modern',
    accentColor: '#18181b',
  },
  {
    id: 'corporate-emerald-esg',
    name: 'Emerald ESG Sustainability',
    tagline: 'Forest emerald megah dengan lis champagne gold untuk summit ESG & perbankan',
    badge: 'ESG & Green',
    accentColor: '#34d399',
  },
] as const;

