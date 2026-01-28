/**
 * MOCK DATA FOR RUST LEGACY SERVER
 * 
 * This file contains example data for all API endpoints.
 * In production, this data will come from your backend API.
 * 
 * All text content is placeholder - replace with your actual content.
 */

// ============================================================================
// SERVER INFO
// ============================================================================
export const mockServerInfo = {
  id: 1,
  name: "RUST LEGACY X1",
  maxPlayers: 100,
  gameVersion: "Legacy",
  downloadUrl: "https://example.com/download/rust-legacy-client.zip",
  virusTotalUrl: "https://www.virustotal.com/gui/file/YOUR_FILE_HASH",
  descriptions: [
    {
      id: 1,
      serverInfoId: 1,
      language: "en",
      content: "Experience the classic Rust Legacy gameplay with balanced x1 rates. Build, survive, and dominate!"
    },
    {
      id: 2,
      serverInfoId: 1,
      language: "ru",
      content: "Испытайте классический геймплей Rust Legacy со сбалансированными рейтами x1. Стройте, выживайте и доминируйте!"
    }
  ]
};

// ============================================================================
// FEATURES (shown on home page)
// ============================================================================
export const mockFeatures = [
  {
    id: 1,
    serverInfoId: 1,
    language: "en",
    title: "Classic x1 Rates",
    description: "Pure vanilla experience with balanced gathering",
    icon: "zap",
    order: 1
  },
  {
    id: 2,
    serverInfoId: 1,
    language: "en",
    title: "Active Community",
    description: "Join hundreds of players in our community",
    icon: "users",
    order: 2
  },
  {
    id: 3,
    serverInfoId: 1,
    language: "en",
    title: "24/7 Uptime",
    description: "Reliable server with 99.9% uptime",
    icon: "server",
    order: 3
  },
  {
    id: 4,
    serverInfoId: 1,
    language: "en",
    title: "Fair Play",
    description: "Active admins ensuring fair gameplay",
    icon: "shield",
    order: 4
  }
];

// ============================================================================
// NEWS (shown on home page)
// ============================================================================
export const mockNews = [
  {
    id: 1,
    language: "en",
    title: "Server Launch!",
    content: "Welcome to our Rust Legacy server! Join us for classic survival gameplay.",
    imageUrl: "https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Server+Launch",
    published: true,
    publishedAt: "2025-01-15T12:00:00Z",
    createdAt: "2025-01-15T12:00:00Z",
    updatedAt: "2025-01-15T12:00:00Z"
  },
  {
    id: 2,
    language: "en",
    title: "New Events Coming",
    content: "Get ready for exciting server events with special rewards!",
    imageUrl: "https://via.placeholder.com/800x400/06b6d4/ffffff?text=Events",
    published: true,
    publishedAt: "2025-01-20T18:00:00Z",
    createdAt: "2025-01-20T18:00:00Z",
    updatedAt: "2025-01-20T18:00:00Z"
  }
];

// ============================================================================
// PAYMENT METHODS (shown in footer)
// ============================================================================
export const mockPaymentMethods = [
  {
    id: 1,
    name: "Visa",
    imageUrl: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=VISA",
    order: 1,
    enabled: true
  },
  {
    id: 2,
    name: "MasterCard",
    imageUrl: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=MC",
    order: 2,
    enabled: true
  },
  {
    id: 3,
    name: "PayPal",
    imageUrl: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=PayPal",
    order: 3,
    enabled: true
  },
  {
    id: 4,
    name: "Crypto",
    imageUrl: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=BTC",
    order: 4,
    enabled: true
  },
  {
    id: 5,
    name: "Яндекс.Деньги",
    imageUrl: "https://via.placeholder.com/80x50/ffffff/0ea5e9?text=YM",
    order: 5,
    enabled: true
  }
];

// ============================================================================
// LEGAL DOCUMENTS
// ============================================================================
export const mockLegalDocuments = {
  // Terms of Service
  terms: {
    id: 1,
    language: "en",
    type: "terms" as const,
    title: "Terms of Service",
    content: `
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing this server, you agree to these terms.</p>
      
      <h3>2. User Conduct</h3>
      <p>Respectful behavior is required. Cheating is prohibited.</p>
      
      <h3>3. Account Responsibility</h3>
      <p>You are responsible for your account security.</p>
      
      <h3>4. Termination</h3>
      <p>We may terminate access for violations.</p>
    `,
    updatedAt: "2025-01-15T00:00:00Z"
  },
  
  // Privacy Policy
  privacy: {
    id: 2,
    language: "en",
    type: "privacy" as const,
    title: "Privacy Policy",
    content: `
      <h3>1. Information Collection</h3>
      <p>We collect Steam ID, username, and gameplay data.</p>
      
      <h3>2. Data Usage</h3>
      <p>Data is used to provide and improve our services.</p>
      
      <h3>3. Data Security</h3>
      <p>We implement security measures to protect your data.</p>
      
      <h3>4. Your Rights</h3>
      <p>You can access, correct, or delete your data.</p>
    `,
    updatedAt: "2025-01-15T00:00:00Z"
  },
  
  // Company Info (Belarus legal requirements)
  company: {
    id: 3,
    language: "en",
    type: "company_info" as const,
    title: "Company Information",
    content: `
      <h3>Legal Entity (Юридическое лицо)</h3>
      <p><strong>Company Name:</strong> ООО "Example Gaming"</p>
      <p><strong>УНП (Registration Number):</strong> 123456789</p>
      <p><strong>Legal Address:</strong> г. Минск, ул. Примерная, д. 1, офис 100</p>
      <p><strong>Registration Date:</strong> 01.01.2024</p>
      
      <h3>Contact Information</h3>
      <p><strong>Email:</strong> legal@example.com</p>
      <p><strong>Phone:</strong> +375 (29) 123-45-67</p>
      <p><strong>Support:</strong> support@example.com</p>
      
      <h3>Banking Details</h3>
      <p><strong>Bank:</strong> ЗАО "Пример Банк"</p>
      <p><strong>BIC:</strong> EXAMPLEBY</p>
      <p><strong>Account:</strong> BY00BANK00000000000000000000</p>
      
      <h3>Operating License</h3>
      <p><strong>License Number:</strong> №12345 от 01.01.2024</p>
      <p><strong>Issued by:</strong> Министерство по налогам и сборам РБ</p>
    `,
    updatedAt: "2025-01-15T00:00:00Z"
  },
  
  // Server Rules
  rules: {
    id: 4,
    language: "en",
    type: "rules" as const,
    title: "Server Rules",
    content: `
      <h3>🚫 1. Cheating and Exploits</h3>
      <p>✗ Any cheats, hacks, or third-party software</p>
      <p>✗ Exploiting game bugs or glitches</p>
      <p>✗ Macro use or automation</p>
      <p><strong>Penalty:</strong> Permanent ban</p>
      
      <h3>💬 2. Behavior and Communication</h3>
      <p>✗ Harassment, racism, or hate speech</p>
      <p>✗ Excessive toxicity or griefing</p>
      <p>✗ Impersonating staff</p>
      <p><strong>Penalty:</strong> Mute, kick, or ban</p>
      
      <h3>🏠 3. Building Rules</h3>
      <p>✓ Build anywhere on the map</p>
      <p>✗ Building in monuments or resource areas</p>
      <p>✗ Creating lag machines</p>
      <p>✗ Excessive land claiming</p>
      <p><strong>Penalty:</strong> Base removal and warning</p>
      
      <h3>⚔️ 4. Raiding and PvP</h3>
      <p>✓ Raiding is allowed 24/7</p>
      <p>✗ Griefing after successful raid</p>
      <p>✗ Foundation wiping</p>
      <p>✗ Killing freshspawns repeatedly</p>
      <p><strong>Penalty:</strong> Warning or temporary ban</p>
      
      <h3>📢 5. Spam and Advertising</h3>
      <p>✗ Chat or voice spam</p>
      <p>✗ Advertising other servers</p>
      <p>✗ Real money trading</p>
      <p><strong>Penalty:</strong> Mute or ban</p>
      
      <h3>👥 6. Groups and Alliances</h3>
      <p>✓ No official group size limit</p>
      <p>✗ Teaming to dominate server</p>
      <p>✗ Excessive zerging (monitored)</p>
      <p><strong>Note:</strong> Large groups may be split or limited</p>
    `,
    updatedAt: "2025-01-15T00:00:00Z"
  }
};

// ============================================================================
// SERVER DETAILS (Info page - about section)
// ============================================================================
export const mockServerDetails = [
  {
    id: 1,
    language: "en",
    section: "about",
    title: "Server Type",
    content: "<p>Classic Rust Legacy x1 vanilla server. No gameplay-affecting mods or plugins.</p>",
    order: 1
  },
  {
    id: 2,
    language: "en",
    section: "about",
    title: "Wipe Schedule",
    content: "<p><strong>Map Wipes:</strong> Every 2 weeks (Thursdays 18:00 UTC)<br><strong>BP Wipes:</strong> Monthly</p>",
    order: 2
  },
  {
    id: 3,
    language: "en",
    section: "about",
    title: "Max Group Size",
    content: "<p>No strict limit, but large groups are monitored to prevent server domination.</p>",
    order: 3
  },
  {
    id: 4,
    language: "en",
    section: "about",
    title: "Server Location",
    content: "<p>Hosted in Europe (Germany) for optimal ping to CIS and EU players.</p>",
    order: 4
  }
];

// ============================================================================
// PLUGINS (Info page - plugins section)
// ============================================================================
export const mockPlugins = [
  {
    id: 1,
    language: "en",
    name: "Teleport System",
    description: "Set home locations and teleport with cooldowns",
    commands: [
      {
        id: 1,
        pluginId: 1,
        command: "/sethome",
        description: "Set your home location at current position",
        usage: "/sethome [name]"
      },
      {
        id: 2,
        pluginId: 1,
        command: "/home",
        description: "Teleport to your home (5min cooldown)",
        usage: "/home [name]"
      },
      {
        id: 3,
        pluginId: 1,
        command: "/removehome",
        description: "Remove a home location",
        usage: "/removehome [name]"
      },
      {
        id: 4,
        pluginId: 1,
        command: "/listhomes",
        description: "List all your home locations",
        usage: "/listhomes"
      }
    ],
    order: 1
  },
  {
    id: 2,
    language: "en",
    name: "Economy System",
    description: "Earn currency through gameplay and trading",
    commands: [
      {
        id: 5,
        pluginId: 2,
        command: "/balance",
        description: "Check your current balance",
        usage: "/balance"
      },
      {
        id: 6,
        pluginId: 2,
        command: "/shop",
        description: "Open the server shop menu",
        usage: "/shop"
      },
      {
        id: 7,
        pluginId: 2,
        command: "/pay",
        description: "Transfer money to another player",
        usage: "/pay [player] [amount]"
      },
      {
        id: 8,
        pluginId: 2,
        command: "/baltop",
        description: "View top 10 richest players",
        usage: "/baltop"
      }
    ],
    order: 2
  },
  {
    id: 3,
    language: "en",
    name: "Starter Kits",
    description: "Claim starter kits to help you begin",
    commands: [
      {
        id: 9,
        pluginId: 3,
        command: "/kit",
        description: "View all available kits",
        usage: "/kit"
      },
      {
        id: 10,
        pluginId: 3,
        command: "/kit starter",
        description: "Claim starter kit (once per wipe)",
        usage: "/kit starter"
      },
      {
        id: 11,
        pluginId: 3,
        command: "/kit vip",
        description: "Claim VIP kit (VIP only, daily)",
        usage: "/kit vip"
      }
    ],
    order: 3
  },
  {
    id: 4,
    language: "en",
    name: "Player Stats",
    description: "Track your gameplay statistics",
    commands: [
      {
        id: 12,
        pluginId: 4,
        command: "/stats",
        description: "View your statistics",
        usage: "/stats [player]"
      },
      {
        id: 13,
        pluginId: 4,
        command: "/playtime",
        description: "Check your playtime on server",
        usage: "/playtime"
      },
      {
        id: 14,
        pluginId: 4,
        command: "/top",
        description: "View server leaderboards",
        usage: "/top [kills|deaths|playtime]"
      }
    ],
    order: 4
  },
  {
    id: 5,
    language: "en",
    name: "Clans",
    description: "Create and manage clans with your friends",
    commands: [
      {
        id: 15,
        pluginId: 5,
        command: "/clan create",
        description: "Create a new clan",
        usage: "/clan create [name]"
      },
      {
        id: 16,
        pluginId: 5,
        command: "/clan invite",
        description: "Invite player to your clan",
        usage: "/clan invite [player]"
      },
      {
        id: 17,
        pluginId: 5,
        command: "/clan leave",
        description: "Leave your current clan",
        usage: "/clan leave"
      },
      {
        id: 18,
        pluginId: 5,
        command: "/clan info",
        description: "View clan information",
        usage: "/clan info [clanname]"
      }
    ],
    order: 5
  }
];

// ============================================================================
// GETTING STARTED STEPS (How to Start page)
// ============================================================================
export const mockGettingStartedSteps = [
  {
    id: 1,
    language: "en",
    stepNumber: 1,
    title: "Download the Client",
    content: `
      <p>Download our custom Rust Legacy client. The client is pre-configured and ready to connect to our server.</p>
      <p><strong>System Requirements:</strong></p>
      <ul>
        <li>OS: Windows 7/8/10/11 (64-bit)</li>
        <li>CPU: Dual-core 2.5 GHz or better</li>
        <li>RAM: 4GB minimum, 8GB recommended</li>
        <li>GPU: DirectX 10 compatible</li>
        <li>Storage: 5GB available space</li>
        <li>Internet: Broadband connection</li>
      </ul>
    `,
    imageUrl: "https://via.placeholder.com/600x400/0ea5e9/ffffff?text=Step+1+Download"
  },
  {
    id: 2,
    language: "en",
    stepNumber: 2,
    title: "Verify the Download",
    content: `
      <p>For your security, verify the downloaded file on VirusTotal. We provide transparency by offering the VirusTotal link for all our downloads.</p>
      <p>Our client is completely safe and clean - no malware, no viruses, just pure Rust Legacy gameplay.</p>
      <p><strong>Why verify?</strong></p>
      <ul>
        <li>Ensures file integrity</li>
        <li>Confirms no tampering</li>
        <li>Peace of mind</li>
      </ul>
    `,
    imageUrl: "https://via.placeholder.com/600x400/06b6d4/ffffff?text=Step+2+Verify"
  },
  {
    id: 3,
    language: "en",
    stepNumber: 3,
    title: "Install and Launch",
    content: `
      <p>Extract the downloaded archive to your preferred location (e.g., C:\\Games\\RustLegacy). Run <code>RustLegacy.exe</code> to launch the game.</p>
      <p><strong>First Launch Setup:</strong></p>
      <ul>
        <li>The client will automatically connect to our server</li>
        <li>Create your character and choose your spawn point</li>
        <li>Press <strong>F1</strong> to open console</li>
        <li>Type <code>/help</code> for available commands</li>
        <li>Press <strong>TAB</strong> to see online players</li>
        <li>Press <strong>M</strong> to open the map</li>
      </ul>
    `,
    imageUrl: "https://via.placeholder.com/600x400/14b8a6/ffffff?text=Step+3+Install"
  },
  {
    id: 4,
    language: "en",
    stepNumber: 4,
    title: "Start Playing!",
    content: `
      <p>You're all set! Here are some essential tips for your first game:</p>
      <ul>
        <li>Use <code>/kit starter</code> to claim your free starter kit</li>
        <li>Use <code>/sethome base</code> near your base to save location</li>
        <li>Type <code>/help</code> to see all available commands</li>
        <li>Join our Discord community for support and updates</li>
        <li>Read the rules with <code>/rules</code> command</li>
        <li>Check server info with <code>/info</code> command</li>
      </ul>
      <p><strong>Need help?</strong> Ask in global chat or join our Discord!</p>
    `,
    imageUrl: "https://via.placeholder.com/600x400/0284c7/ffffff?text=Step+4+Play"
  }
];

// ============================================================================
// PLAYERS (for Statistics page - currently not used)
// ============================================================================
export const mockPlayers = [
  {
    id: 1,
    username: "TopPlayer",
    steamId: "76561198000000001",
    playTime: 15400,
    lastSeen: "2025-01-28T10:30:00Z",
    firstJoined: "2025-01-10T12:00:00Z",
    isOnline: true
  },
  {
    id: 2,
    username: "ProGamer",
    steamId: "76561198000000002",
    playTime: 8900,
    lastSeen: "2025-01-27T22:15:00Z",
    firstJoined: "2025-01-12T15:30:00Z",
    isOnline: false
  }
];
