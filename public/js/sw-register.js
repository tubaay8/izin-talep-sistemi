if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // PWA ozelligi olmadan da uygulama normal sekilde calismaya devam eder.
    });
  });
}
