/*
 * PindotTV - main app logic (views, remote buttons, device management)
 */

(() => {
  const BRAND_LABELS = { roku: 'Roku', samsung: 'Samsung', lg: 'LG' };

  const BRAND_HINTS = {
    roku: '<strong>Roku:</strong> Settings &rarr; Network &rarr; About. Hanapin ang "IP address" (hal. 192.168.1.50). Siguraduhing nakabukas ang "Control by mobile apps / Network access" sa Settings &rarr; System &rarr; Advanced system settings.',
    samsung: '<strong>Samsung (Tizen):</strong> Settings &rarr; General &rarr; Network &rarr; Network Status, o Settings &rarr; Support &rarr; About This TV. Sa unang gamit, lalabas ang "Allow connection?" sa TV - tanggapin agad (within ~25 seconds).',
    lg: '<strong>LG (webOS):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; piliin ang konektadong network para makita ang IP. Sa unang gamit, may lalabas na "Connect?" prompt sa TV - tanggapin agad.',
  };

  const byId = (id) => document.getElementById(id);

  const els = {
    headerStatusDot: byId('headerStatusDot'),
    headerDeviceName: byId('headerDeviceName'),
    switchBtn: byId('switchBtn'),

    remoteEmpty: byId('remoteEmpty'),
    remoteControls: byId('remoteControls'),
    remoteDeviceName: byId('remoteDeviceName'),
    remoteDeviceMeta: byId('remoteDeviceMeta'),
    remoteStatusDot: byId('remoteStatusDot'),
    testConnectionBtn: byId('testConnectionBtn'),
    goAddTvBtn: byId('goAddTvBtn'),

    numpadToggle: byId('numpadToggle'),
    numpadSection: byId('numpadSection'),

    deviceList: byId('deviceList'),
    addTvBtn: byId('addTvBtn'),

    tvModalOverlay: byId('tvModalOverlay'),
    tvModalTitle: byId('tvModalTitle'),
    tvModalClose: byId('tvModalClose'),
    tvForm: byId('tvForm'),
    tvId: byId('tvId'),
    tvName: byId('tvName'),
    tvBrand: byId('tvBrand'),
    tvIp: byId('tvIp'),
    brandHint: byId('brandHint'),
    tvCancelBtn: byId('tvCancelBtn'),

    switchModalOverlay: byId('switchModalOverlay'),
    switchModalClose: byId('switchModalClose'),
    switchList: byId('switchList'),
    switchManageBtn: byId('switchManageBtn'),

    toast: byId('toast'),
  };

  const state = { devices: [], activeId: null };

  function refreshState() {
    state.devices = PindotStorage.getDevices();
    state.activeId = PindotStorage.getActiveDeviceId();
  }

  function brandLabel(brand) {
    return BRAND_LABELS[brand] || brand;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function vibrate(pattern = 15) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch { /* ignore */ }
    }
  }

  // ---------------- Toast ----------------
  let toastTimer = null;
  function showToast(message, type = '') {
    els.toast.textContent = message;
    els.toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 4000);
  }

  // ---------------- View switching ----------------
  function switchView(view) {
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.dataset.view === view));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  }

  function bindNav() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
  }

  // ---------------- Rendering ----------------
  function render() {
    renderHeader();
    renderRemote();
    renderDeviceList();
  }

  function renderHeader() {
    const device = PindotStorage.getActiveDevice();
    if (device) {
      els.headerDeviceName.textContent = device.name;
      els.headerStatusDot.dataset.status = device.lastStatus || 'unknown';
    } else {
      els.headerDeviceName.textContent = 'Walang TV';
      els.headerStatusDot.dataset.status = 'unknown';
    }
  }

  function renderRemote() {
    const device = PindotStorage.getActiveDevice();
    if (!device) {
      els.remoteEmpty.classList.remove('hidden');
      els.remoteControls.classList.add('hidden');
      return;
    }
    els.remoteEmpty.classList.add('hidden');
    els.remoteControls.classList.remove('hidden');
    els.remoteDeviceName.textContent = device.name;
    els.remoteDeviceMeta.textContent = `${brandLabel(device.brand)} · ${device.ip}`;
    els.remoteStatusDot.dataset.status = device.lastStatus || 'unknown';
  }

  function renderDeviceList() {
    if (!state.devices.length) {
      els.deviceList.innerHTML = '<p class="muted-empty">Wala ka pang naka-save na TV. I-tap ang button sa baba para magdagdag.</p>';
      return;
    }
    els.deviceList.innerHTML = state.devices.map((d) => deviceCardHtml(d, d.id === state.activeId)).join('');
  }

  function deviceCardHtml(device, isActive) {
    return `
      <div class="device-card ${isActive ? 'active' : ''}" data-id="${device.id}">
        <div class="device-card-main" data-action="select">
          <span class="status-dot" data-status="${device.lastStatus || 'unknown'}"></span>
          <div class="device-card-info">
            <div class="device-card-name">${escapeHtml(device.name)} ${isActive ? '<span class="active-badge">Active</span>' : ''}</div>
            <div class="device-card-meta">${brandLabel(device.brand)} · ${escapeHtml(device.ip)}</div>
          </div>
        </div>
        <div class="device-card-actions">
          <button class="icon-btn" data-action="test" aria-label="I-test ang koneksyon"><svg class="icon"><use href="#icon-wifi"></use></svg></button>
          <button class="icon-btn" data-action="edit" aria-label="I-edit"><svg class="icon"><use href="#icon-edit"></use></svg></button>
          <button class="icon-btn danger" data-action="delete" aria-label="Tanggalin"><svg class="icon"><use href="#icon-trash"></use></svg></button>
        </div>
      </div>`;
  }

  // ---------------- Remote button handling ----------------
  function makeTokenUpdater(deviceId) {
    return (token) => {
      PindotStorage.updateDevice(deviceId, { token });
      refreshState();
    };
  }

  function setDeviceStatus(deviceId, status) {
    PindotStorage.updateDevice(deviceId, { lastStatus: status, lastCheckedAt: Date.now() });
    refreshState();
    render();
  }

  function setDeviceStatusUI(deviceId, status) {
    if (deviceId === state.activeId) {
      els.headerStatusDot.dataset.status = status;
      els.remoteStatusDot.dataset.status = status;
    }
    const dot = document.querySelector(`.device-card[data-id="${deviceId}"] .status-dot`);
    if (dot) dot.dataset.status = status;
  }

  function friendlyError(device, err) {
    const code = err && err.code;
    const brand = brandLabel(device.brand);

    if (code === 'pair-timeout') {
      return `Walang sagot sa pairing prompt ng ${brand} TV. Buksan ang TV at tanggapin ang "Allow/Connect" sa loob ng ilang segundo, tapos subukan ulit.`;
    }
    if (code === 'unauthorized') {
      return `Tinanggihan ng ${brand} TV ang koneksyon. Subukan ulit at tanggapin ang prompt sa TV screen.`;
    }
    if (code === 'unsupported') {
      return 'Hindi pa suportado ang button na ito para sa brand ng TV mo.';
    }
    if (code === 'timeout' || code === 'network' || code === 'ws-error') {
      if (device.brand === 'roku') {
        return 'Hindi makonekta sa Roku. Tingnan: (1) tama ba ang IP, (2) bukas ba ang TV, (3) same WiFi ba kayo. Posible ring naharang ito ng browser ("Mixed Content") - buksan ang Tulong tab.';
      }
      return `Hindi makonekta sa ${brand} TV. Tingnan kung same WiFi kayo at tama ang IP. Kung first time, posibleng kailangan munang tanggapin ang certificate - buksan ang Tulong tab para sa solusyon.`;
    }
    return 'Hindi gumana ang command. Buksan ang Tulong tab para sa mga posibleng dahilan.';
  }

  async function handleKeyPress(key) {
    const device = PindotStorage.getActiveDevice();
    if (!device) {
      showToast('Wala pang TV - mag-add muna sa "Mga TV" tab.', 'warn');
      switchView('tvs');
      return;
    }
    vibrate();
    try {
      await TVProtocols.sendKey(device, key, makeTokenUpdater(device.id));
      setDeviceStatus(device.id, 'online');
    } catch (err) {
      setDeviceStatus(device.id, 'offline');
      showToast(friendlyError(device, err), 'error');
    }
  }

  function bindRemoteButtons() {
    document.querySelectorAll('#remoteControls [data-key]').forEach((btn) => {
      btn.addEventListener('click', () => handleKeyPress(btn.dataset.key));
    });

    document.querySelectorAll('.num-btn[data-digit]').forEach((btn) => {
      btn.addEventListener('click', () => handleKeyPress(btn.dataset.digit));
    });

    els.numpadToggle.addEventListener('click', () => {
      const willShow = els.numpadSection.classList.contains('hidden');
      els.numpadSection.classList.toggle('hidden', !willShow);
      els.numpadToggle.setAttribute('aria-expanded', String(willShow));
      vibrate(10);
    });

    els.testConnectionBtn.addEventListener('click', () => {
      const device = PindotStorage.getActiveDevice();
      if (device) testDeviceConnection(device.id);
    });

    els.goAddTvBtn.addEventListener('click', () => openTvModal(null));
  }

  // ---------------- Connection test ----------------
  async function testDeviceConnection(deviceId) {
    const device = PindotStorage.getDevice(deviceId);
    if (!device) return;
    setDeviceStatusUI(deviceId, 'checking');
    vibrate(10);
    try {
      await TVProtocols.testConnection(device, makeTokenUpdater(deviceId));
      setDeviceStatus(deviceId, 'online');
      showToast(`Connected sa "${device.name}"!`, 'success');
    } catch (err) {
      setDeviceStatus(deviceId, 'offline');
      showToast(friendlyError(device, err), 'error');
    }
  }

  // ---------------- Device list interactions ----------------
  function bindDeviceListEvents() {
    els.deviceList.addEventListener('click', (e) => {
      const card = e.target.closest('.device-card');
      if (!card) return;
      const id = card.dataset.id;
      const actionBtn = e.target.closest('[data-action]');
      const action = actionBtn ? actionBtn.dataset.action : 'select';

      if (action === 'select') {
        PindotStorage.setActiveDeviceId(id);
        refreshState();
        render();
        showToast(`Active na ang "${PindotStorage.getDevice(id).name}"`, 'success');
        switchView('remote');
      } else if (action === 'test') {
        testDeviceConnection(id);
      } else if (action === 'edit') {
        openTvModal(id);
      } else if (action === 'delete') {
        const device = PindotStorage.getDevice(id);
        if (device && confirm(`Tanggalin ang "${device.name}"?`)) {
          PindotStorage.deleteDevice(id);
          refreshState();
          render();
          showToast('Tinanggal ang TV.', '');
        }
      }
    });
  }

  // ---------------- Add / Edit TV modal ----------------
  function updateBrandHint() {
    els.brandHint.innerHTML = BRAND_HINTS[els.tvBrand.value] || '';
  }

  function openTvModal(deviceId) {
    const isEdit = !!deviceId;
    els.tvModalTitle.textContent = isEdit ? 'I-edit ang TV' : 'Magdagdag ng TV';
    if (isEdit) {
      const device = PindotStorage.getDevice(deviceId);
      els.tvId.value = device.id;
      els.tvName.value = device.name;
      els.tvBrand.value = device.brand;
      els.tvIp.value = device.ip;
    } else {
      els.tvForm.reset();
      els.tvId.value = '';
      els.tvBrand.value = 'roku';
    }
    updateBrandHint();
    els.tvModalOverlay.classList.remove('hidden');
    setTimeout(() => els.tvName.focus(), 50);
  }

  function closeTvModal() {
    els.tvModalOverlay.classList.add('hidden');
  }

  function isValidIp(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
  }

  function bindTvModal() {
    els.addTvBtn.addEventListener('click', () => openTvModal(null));
    els.tvCancelBtn.addEventListener('click', closeTvModal);
    els.tvModalClose.addEventListener('click', closeTvModal);
    els.tvModalOverlay.addEventListener('click', (e) => {
      if (e.target === els.tvModalOverlay) closeTvModal();
    });
    els.tvBrand.addEventListener('change', updateBrandHint);

    els.tvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = els.tvName.value.trim();
      const ip = els.tvIp.value.trim();
      const brand = els.tvBrand.value;

      if (!name || !ip) return;
      if (!isValidIp(ip)) {
        showToast('Mali ang format ng IP address (hal. 192.168.1.50).', 'warn');
        return;
      }

      const id = els.tvId.value;
      if (id) {
        PindotStorage.updateDevice(id, { name, ip, brand, token: null, lastStatus: 'unknown' });
      } else {
        const device = PindotStorage.addDevice({ name, ip, brand });
        PindotStorage.setActiveDeviceId(device.id);
      }
      refreshState();
      render();
      closeTvModal();
      showToast('Na-save ang TV!', 'success');
      switchView('remote');
    });
  }

  // ---------------- Quick switch modal ----------------
  function openSwitchModal() {
    if (!state.devices.length) {
      openTvModal(null);
      return;
    }
    els.switchList.innerHTML = state.devices.map((d) => `
      <div class="device-card ${d.id === state.activeId ? 'active' : ''}" data-id="${d.id}">
        <div class="device-card-main">
          <span class="status-dot" data-status="${d.lastStatus || 'unknown'}"></span>
          <div class="device-card-info">
            <div class="device-card-name">${escapeHtml(d.name)} ${d.id === state.activeId ? '<span class="active-badge">Active</span>' : ''}</div>
            <div class="device-card-meta">${brandLabel(d.brand)} · ${escapeHtml(d.ip)}</div>
          </div>
        </div>
      </div>`).join('');
    els.switchModalOverlay.classList.remove('hidden');
  }

  function closeSwitchModal() {
    els.switchModalOverlay.classList.add('hidden');
  }

  function bindSwitchModal() {
    els.switchBtn.addEventListener('click', openSwitchModal);
    els.switchModalClose.addEventListener('click', closeSwitchModal);
    els.switchModalOverlay.addEventListener('click', (e) => {
      if (e.target === els.switchModalOverlay) closeSwitchModal();
    });
    els.switchManageBtn.addEventListener('click', () => {
      closeSwitchModal();
      switchView('tvs');
    });
    els.switchList.addEventListener('click', (e) => {
      const card = e.target.closest('.device-card');
      if (!card) return;
      PindotStorage.setActiveDeviceId(card.dataset.id);
      refreshState();
      render();
      closeSwitchModal();
      vibrate(10);
    });
  }

  // ---------------- Init ----------------
  function init() {
    refreshState();
    bindNav();
    bindRemoteButtons();
    bindTvModal();
    bindSwitchModal();
    bindDeviceListEvents();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
