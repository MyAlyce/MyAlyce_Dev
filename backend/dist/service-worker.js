let cacheName = 'pwa-assets';
const assets = [
  "/",
  "/index.css",
  "/index.js",
  "/recordings/JoshuaBrewster_BREATH_2023-05-16T03_00_47.662Z.csv",
  "/recordings/JoshuaBrewster_ECG_2023-05-16T03_09_02.553Z.csv",
  "/recordings/JoshuaBrewster_EMG_2023-05-16T03_09_02.553Z.csv",
  "/recordings/JoshuaBrewster_ENV_2023-05-16T03_00_47.662Z.csv",
  "/recordings/JoshuaBrewster_HRV_2023-05-16T03_00_47.662Z.csv",
  "/recordings/JoshuaBrewster_HRV_Session_Joshua_Brewster.csv",
  "/recordings/JoshuaBrewster_IMU_2023-05-16T03_00_47.662Z.csv",
  "/recordings/JoshuaBrewster_PPG_2023-05-16T03_00_47.662Z.csv",
  "/assets/google.png",
  "/assets/myalyce.png",
  "/assets/GDrive.svg",
  "/assets/person.jpg"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
    
  );
});




