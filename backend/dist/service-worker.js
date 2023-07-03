let cacheName = 'pwa-assets';

const assets = [
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

let cacheExpiration = 1000 * 60 * //seconds 
  60 * //minutes
  24 * //hours
  (2/24)    //days

let isValid = function (response) {
	if (!response) return false;
	var fetched = response.headers.get('sw-fetched-on');
	if (fetched && (parseFloat(fetched) + (cacheExpiration)) > new Date().getTime()) return true;
	return false;
};

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(function (response) {

			// If there's a cached API and it's still valid, use it
			if (isValid(response)) {
				return response;
			}

			if(response) return response;
			// Otherwise, make a fresh API call
			else return fetch(fetchEvent.request).then(function (response) {

				// Cache for offline access
        if(assets.includes(fetchEvent.request.url)){
          var copy = response.clone();
          fetchEvent.waitUntil(caches.open(cacheName).then(function (cache) {
            var headers = new Headers(copy.headers);
            headers.append('sw-fetched-on', new Date().getTime());
            return copy.blob().then(function (body) {
              return cache.put(fetchEvent.request, new Response(body, {
                status: copy.status ? copy.status : 200,
                statusText: copy.statusText,
                headers: headers
              }));
            });
          }));
        }

				// Return the requested file
				return response;

			})
      // .catch(function (error) {
			// 	return caches.match(request).then(function (response) { //fallback to offline cache
			// 		return response || caches.match('/offline.json'); //todo: figure out what is supposed to go in offline.json (https://gomakethings.com/how-to-set-an-expiration-date-for-items-in-a-service-worker-cache/)
			// 	});
			// });  
  }));
});




