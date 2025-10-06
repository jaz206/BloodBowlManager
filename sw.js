const CACHE_NAME = 'blood-bowl-guide-v27';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/firebaseConfig.ts',
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
  '/contexts/AuthContext.tsx',
  '/hooks/useAuth.ts',
  '/components/Login.tsx',
  '/components/MainApp.tsx',
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
  '/components/UserProfile.tsx',
  '/components/Leagues.tsx',
  '/components/SyncStatusIndicator.tsx',
  '/components/icons/ChevronDownIcon.tsx',
  '/components/icons/ChevronUpIcon.tsx',
  '/components/icons/DiceIcon.tsx',
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/UsersIcon.tsx',
  '/components/icons/UserIcon.tsx',
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
  '/components/icons/GoogleIcon.tsx',
  '/components/icons/TrophyIcon.tsx',
  '/components/icons/PencilIcon.tsx',
  '/components/icons/CheckCircleIcon.tsx',
  '/components/icons/ExclamationCircleIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/',
  'https://apis.google.com/js/api.js',
  'https://accounts.google.com/gsi/client'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const urlsWithHttps = URLS_TO_CACHE.filter(url => url.startsWith('https://'));
        const urlsWithoutHttps = URLS_TO_CACHE.filter(url => !url.startsWith('https://'));
        
        const cachePromises = [
            cache.addAll(urlsWithoutHttps)
        ];

        urlsWithHttps.forEach(url => {
            cachePromises.push(
                fetch(url, { mode: 'no-cors' })
                    .then(response => cache.put(url, response))
                    .catch(err => console.log(`Failed to cache ${url}`, err))
            );
        });

        return Promise.all(cachePromises);
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