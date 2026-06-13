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
  let installMode = null; // 'prompt' | 'ios'

  function applyInstallTexts() {
    if (installMode === 'prompt') {
      installText.textContent = PindotI18n.t('install.text');
      installBtn.textContent = PindotI18n.t('install.btn');
    } else if (installMode === 'ios') {
      installText.textContent = PindotI18n.t('install.iosText');
      installBtn.textContent = PindotI18n.t('install.iosBtn');
    }
  }

  document.addEventListener('pindottv:langchange', applyInstallTexts);

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
    installMode = 'prompt';
    applyInstallTexts();
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
      alert(PindotI18n.t('install.iosAlert'));
    }
  });

  window.addEventListener('appinstalled', () => {
    hideBanner();
    deferredPrompt = null;
  });

  // iOS Safari never fires beforeinstallprompt - show manual instructions instead
  if (isIOS() && !isStandalone() && !isDismissed()) {
    installMode = 'ios';
    applyInstallTexts();
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
