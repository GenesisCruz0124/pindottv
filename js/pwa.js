/*
 * PindotTV - PWA install prompt + service worker registration
 */

(() => {
  const installBanner = document.getElementById('installBanner');
  const installBtn = document.getElementById('installBtn');
  const installDismiss = document.getElementById('installDismiss');
  const installText = document.getElementById('installText');

  const DISMISS_KEY = 'pindottv.installDismissed';

  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
  }

  function isDismissed() {
    return localStorage.getItem(DISMISS_KEY) === '1';
  }

  function showBanner() {
    if (isStandalone() || isDismissed()) return;
    installBanner.classList.remove('hidden');
  }

  function hideBanner() {
    installBanner.classList.add('hidden');
  }

  installDismiss.addEventListener('click', () => {
    hideBanner();
    localStorage.setItem(DISMISS_KEY, '1');
  });

  // Chrome / Edge / Android - native install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installText.textContent = 'I-install ang PindotTV sa home screen para parang totoong app!';
    installBtn.textContent = 'I-install';
    showBanner();
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      hideBanner();
      try {
        await deferredPrompt.prompt();
      } catch { /* user dismissed */ }
      deferredPrompt = null;
      return;
    }
    if (isIOS()) {
      alert('Paano i-install sa iPhone/iPad:\n\n1. I-tap ang Share button (kahon na may pataas na arrow) sa Safari.\n2. I-scroll pababa at piliin ang "Add to Home Screen".\n3. I-tap ang "Add".');
    }
  });

  window.addEventListener('appinstalled', () => {
    hideBanner();
    deferredPrompt = null;
  });

  // iOS Safari never fires beforeinstallprompt - show manual instructions instead
  if (isIOS() && !isStandalone() && !isDismissed()) {
    installText.textContent = 'I-install sa iPhone/iPad: tap ang Share button sa Safari, piliin ang "Add to Home Screen".';
    installBtn.textContent = 'Paano?';
    showBanner();
  }

  // Service worker for offline caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
})();
