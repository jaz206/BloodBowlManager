const CACHE_NAME = 'blood-bowl-guide-v24';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/data/gameSequence.ts',
  '/data/weather.ts',
  '/data/kickoffEvents.ts',
  '/data/injuries.ts',
  '/data/stuntyInjuries.ts',
  '/data/casualties.ts',
  '/data/lastingInjuries.ts',
  '/data/passChart.ts',
  '/data/teams.ts',
  '/data/skills.ts',
  '/data/prayers.ts',
  '/data/starPlayers.ts',
  '/data/randomNames.ts',
  '/components/GameSequence.tsx',
  '/components/Weather.tsx',
  '/components/KickoffEvents.tsx',
  '/components/Injuries.tsx',
  '/components/Casualties.tsx',
  '/components/Plays.tsx',
  '/components/PassChart.tsx',
  '/components/Teams.tsx',
  '/components/Skills.tsx',
  '/components/Prayers.tsx',
  '/components/PrayersModal.tsx',
  '/components/Section.tsx',
  '/components/RuleItem.tsx',
  '/components/SkillModal.tsx',
  '/components/StarPlayerModal.tsx',
  '/components/StarPlayers.tsx',
  '/components/QuickGuide.tsx',
  '/components/Generators.tsx',
  '/components/TeamsAndSkills.tsx',
  '/components/TeamManager.tsx',
  '/components/TeamCreator.tsx',
  '/components/TeamDashboard.tsx',
  '/components/PlayerModal.tsx',
  '/components/SkillSelectorModal.tsx',
  '/components/LiveGame.tsx',
  '/components/PlayerStatusCard.tsx',
  '/components/PlayerCardModal.tsx',
  '/components/PostGameWizard.tsx',
  '/components/TurnoverModal.tsx',
  '/components/ApothecaryModal.tsx',
  '/components/ImageModal.tsx',
  '/components/icons/ChevronDownIcon.tsx',
  '/components/icons/ChevronUpIcon.tsx',
  '/components/icons/DiceIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/UsersIcon.tsx',
  '/components/icons/ClipboardListIcon.tsx',
  '/components/icons/CubeIcon.tsx',
  '/components/icons/ShieldCheckIcon.tsx',
  '/components/icons/StopwatchIcon.tsx',
  '/components/icons/QrCodeIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/SunIcon.tsx',
  '/components/icons/CloudRainIcon.tsx',
  '/components/icons/SnowflakeIcon.tsx',
  '/components/icons/FireIcon.tsx',
  '/components/icons/CloudIcon.tsx',
  '/components/icons/UploadIcon.tsx',
  '/components/icons/DownloadIcon.tsx',
  '/components/icons/TdIcon.tsx',
  '/components/icons/PassIcon.tsx',
  '/components/icons/CasualtyIcon.tsx',
  '/components/icons/InterferenceIcon.tsx',
  '/components/icons/QuestionMarkCircleIcon.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});