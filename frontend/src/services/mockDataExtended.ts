export const mockShopCategories = [
  {
    id: 1,
    name: 'VIP Packages',
    language: 'en',
    order: 1,
    enabled: true
  },
  {
    id: 2,
    name: 'VIP Пакеты',
    language: 'ru',
    order: 1,
    enabled: true
  },
  {
    id: 3,
    name: 'Resources',
    language: 'en',
    order: 2,
    enabled: true
  },
  {
    id: 4,
    name: 'Ресурсы',
    language: 'ru',
    order: 2,
    enabled: true
  },
  {
    id: 5,
    name: 'Weapons',
    language: 'en',
    order: 3,
    enabled: true
  },
  {
    id: 6,
    name: 'Оружие',
    language: 'ru',
    order: 3,
    enabled: true
  }
];

export const mockShopItems = [
  {
    id: 1,
    categoryId: 1,
    language: 'en',
    name: 'VIP Bronze',
    description: 'Basic VIP package with essential benefits',
    price: 9.99,
    currency: 'USD',
    imageUrl: 'https://via.placeholder.com/400x300/cd7f32/ffffff?text=VIP+Bronze',
    enabled: true,
    order: 1,
    features: [
      'Priority queue access',
      'Custom chat color',
      '2 home locations',
      'Kit cooldown -25%'
    ],
    discount: 0
  },
  {
    id: 2,
    categoryId: 1,
    language: 'en',
    name: 'VIP Silver',
    description: 'Enhanced VIP package with more benefits',
    price: 19.99,
    currency: 'USD',
    imageUrl: 'https://via.placeholder.com/400x300/c0c0c0/000000?text=VIP+Silver',
    enabled: true,
    order: 2,
    features: [
      'All Bronze benefits',
      '5 home locations',
      'Kit cooldown -50%',
      'Exclusive skins',
      'Private locker'
    ],
    discount: 15
  },
  {
    id: 3,
    categoryId: 1,
    language: 'en',
    name: 'VIP Gold',
    description: 'Premium VIP package with maximum benefits',
    price: 34.99,
    currency: 'USD',
    imageUrl: 'https://via.placeholder.com/400x300/ffd700/000000?text=VIP+Gold',
    enabled: true,
    order: 3,
    features: [
      'All Silver benefits',
      '10 home locations',
      'No kit cooldown',
      'All exclusive skins',
      'Large private locker',
      'Colored name tag'
    ],
    discount: 20
  },
  {
    id: 4,
    categoryId: 3,
    language: 'en',
    name: 'Starter Resource Pack',
    description: 'Essential resources to kickstart your adventure',
    price: 4.99,
    currency: 'USD',
    imageUrl: 'https://via.placeholder.com/400x300/0ea5e9/ffffff?text=Resources',
    enabled: true,
    order: 1,
    features: [
      '10,000 Wood',
      '5,000 Stone',
      '2,000 Metal Ore',
      '500 Cloth'
    ],
    discount: 0
  },
  {
    id: 5,
    categoryId: 5,
    language: 'en',
    name: 'Weapon Bundle',
    description: 'Complete set of weapons for combat',
    price: 14.99,
    currency: 'USD',
    imageUrl: 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Weapons',
    enabled: true,
    order: 1,
    features: [
      '1x M4 Rifle',
      '1x Shotgun',
      '1x Bolt Action Rifle',
      '500 Ammo',
      '2x Med Kits'
    ],
    discount: 10
  }
];

export const mockServerStatuses = [
  {
    serverId: 1,
    serverName: 'Rust Legacy Classic',
    serverType: 'classic',
    isOnline: true,
    currentPlayers: 47,
    maxPlayers: 100,
    map: 'Procedural 4000',
    uptime: 256800,
    ip: '185.202.223.101',
    port: 28015,
    activePlayers: [
      {
        id: 1,
        username: 'ShadowHunter',
        steamId: '76561198000000001',
        playTime: 15400,
        lastSeen: '2026-01-28T10:30:00Z',
        firstJoined: '2026-01-10T12:00:00Z',
        isOnline: true,
        kills: 347,
        deaths: 156,
        rank: 1
      },
      {
        id: 2,
        username: 'ProGamer2024',
        steamId: '76561198000000002',
        playTime: 8900,
        lastSeen: '2026-01-28T10:25:00Z',
        firstJoined: '2026-01-12T15:30:00Z',
        isOnline: true,
        kills: 289,
        deaths: 134,
        rank: 2
      },
      {
        id: 3,
        username: 'RustKing',
        steamId: '76561198000000003',
        playTime: 12300,
        lastSeen: '2026-01-28T10:20:00Z',
        firstJoined: '2026-01-08T09:00:00Z',
        isOnline: true,
        kills: 267,
        deaths: 145,
        rank: 3
      },
      {
        id: 4,
        username: 'SnipeElite',
        steamId: '76561198000000004',
        playTime: 7800,
        lastSeen: '2026-01-28T10:15:00Z',
        firstJoined: '2026-01-15T18:00:00Z',
        isOnline: true,
        kills: 234,
        deaths: 98,
        rank: 4
      },
      {
        id: 5,
        username: 'BuilderPro',
        steamId: '76561198000000005',
        playTime: 9600,
        lastSeen: '2026-01-28T10:10:00Z',
        firstJoined: '2026-01-11T14:30:00Z',
        isOnline: true,
        kills: 198,
        deaths: 112,
        rank: 5
      }
    ]
  },
  {
    serverId: 2,
    serverName: 'Rust Legacy Deathmatch',
    serverType: 'deathmatch',
    isOnline: true,
    currentPlayers: 32,
    maxPlayers: 50,
    map: 'Arena 2000',
    uptime: 189600,
    ip: '185.202.223.102',
    port: 28016,
    activePlayers: [
      {
        id: 6,
        username: 'DeathMaster',
        steamId: '76561198000000006',
        playTime: 5600,
        lastSeen: '2026-01-28T10:30:00Z',
        firstJoined: '2026-01-20T16:00:00Z',
        isOnline: true,
        kills: 456,
        deaths: 234,
        rank: 1
      },
      {
        id: 7,
        username: 'QuickShot',
        steamId: '76561198000000007',
        playTime: 4200,
        lastSeen: '2026-01-28T10:28:00Z',
        firstJoined: '2026-01-22T19:00:00Z',
        isOnline: true,
        kills: 412,
        deaths: 267,
        rank: 2
      },
      {
        id: 8,
        username: 'ArenaChamp',
        steamId: '76561198000000008',
        playTime: 6100,
        lastSeen: '2026-01-28T10:26:00Z',
        firstJoined: '2026-01-18T11:30:00Z',
        isOnline: true,
        kills: 389,
        deaths: 201,
        rank: 3
      },
      {
        id: 9,
        username: 'FragHunter',
        steamId: '76561198000000009',
        playTime: 3800,
        lastSeen: '2026-01-28T10:24:00Z',
        firstJoined: '2026-01-24T14:00:00Z',
        isOnline: true,
        kills: 367,
        deaths: 189,
        rank: 4
      }
    ]
  }
];

export const mockTheme = {
  id: 1,
  name: 'Blue Cyber',
  primaryColor: '#0ea5e9',
  accentColor: '#06b6d4',
  backgroundColor: '#030712',
  cardBackground: '#0f172a',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  borderColor: 'rgba(14, 165, 233, 0.2)',
  glowColor: 'rgba(14, 165, 233, 0.5)',
  isActive: true
};

export const mockFontSettings = {
  id: 1,
  headingFont: 'Orbitron',
  bodyFont: 'Exo 2',
  h1Size: 'clamp(3rem, 10vw, 7rem)',
  h2Size: 'clamp(2.5rem, 6vw, 4rem)',
  h3Size: '1.5rem',
  bodySize: '1rem'
};

export const mockTopPlayers = [
  {
    id: 1,
    username: 'ShadowHunter',
    steamId: '76561198000000001',
    playTime: 15400,
    lastSeen: '2026-01-28T10:30:00Z',
    firstJoined: '2026-01-10T12:00:00Z',
    isOnline: true,
    kills: 347,
    deaths: 156,
    rank: 1
  },
  {
    id: 2,
    username: 'ProGamer2024',
    steamId: '76561198000000002',
    playTime: 8900,
    lastSeen: '2026-01-28T10:25:00Z',
    firstJoined: '2026-01-12T15:30:00Z',
    isOnline: true,
    kills: 289,
    deaths: 134,
    rank: 2
  },
  {
    id: 3,
    username: 'RustKing',
    steamId: '76561198000000003',
    playTime: 12300,
    lastSeen: '2026-01-28T10:20:00Z',
    firstJoined: '2026-01-08T09:00:00Z',
    isOnline: true,
    kills: 267,
    deaths: 145,
    rank: 3
  },
  {
    id: 4,
    username: 'SnipeElite',
    steamId: '76561198000000004',
    playTime: 7800,
    lastSeen: '2026-01-28T10:15:00Z',
    firstJoined: '2026-01-15T18:00:00Z',
    isOnline: false,
    kills: 234,
    deaths: 98,
    rank: 4
  },
  {
    id: 5,
    username: 'BuilderPro',
    steamId: '76561198000000005',
    playTime: 9600,
    lastSeen: '2026-01-28T10:10:00Z',
    firstJoined: '2026-01-11T14:30:00Z',
    isOnline: true,
    kills: 198,
    deaths: 112,
    rank: 5
  },
  {
    id: 6,
    username: 'DeathMaster',
    steamId: '76561198000000006',
    playTime: 5600,
    lastSeen: '2026-01-28T10:30:00Z',
    firstJoined: '2026-01-20T16:00:00Z',
    isOnline: true,
    kills: 456,
    deaths: 234,
    rank: 6
  },
  {
    id: 7,
    username: 'QuickShot',
    steamId: '76561198000000007',
    playTime: 4200,
    lastSeen: '2026-01-28T10:28:00Z',
    firstJoined: '2026-01-22T19:00:00Z',
    isOnline: true,
    kills: 412,
    deaths: 267,
    rank: 7
  },
  {
    id: 8,
    username: 'ArenaChamp',
    steamId: '76561198000000008',
    playTime: 6100,
    lastSeen: '2026-01-28T10:26:00Z',
    firstJoined: '2026-01-18T11:30:00Z',
    isOnline: false,
    kills: 389,
    deaths: 201,
    rank: 8
  }
];
