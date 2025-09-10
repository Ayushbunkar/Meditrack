self.addEventListener("install", (e) => {
  console.log("Meditrek Service Worker Installed");
});

self.addEventListener("activate", (e) => {
  console.log("Meditrek Service Worker Activated");
});

self.addEventListener("fetch", (e) => {
  // Later: add caching here
});
