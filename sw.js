/* 관세사 앱 오프라인 저장 */
const VER = '20261026130726';
const CORE = 'core-' + VER, FONTS = 'fonts-v1';
const FILES = ['./', './index.html', './graph.html', './graph9.html', './vgraph.html', './vline.html', './hs.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CORE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CORE && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  /* 글꼴(구글 폰트): 한 번 받으면 저장해 두고 오프라인에서도 사용 */
  if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }).catch(() => hit))));
    return;
  }
  if (u.origin !== location.origin) return;
  /* 앱 파일: 인터넷 되면 최신본, 안 되면 저장본 */
  /* 브라우저 임시저장(최대 10분)을 건너뛰고 서버에 새 버전이 있는지 매번 확인 */
  e.respondWith(fetch(new Request(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })).then(r => { if (r.ok) caches.open(CORE).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html'))));
});
