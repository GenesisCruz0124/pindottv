/*
 * PindotTV - main app logic (views, remote buttons, device management)
 */

(() => {
  const BRAND_LABELS = { roku: 'Roku', samsung: 'Samsung', lg: 'LG', sony: 'Sony', panasonic: 'Panasonic', devant: 'Devant', tcl: 'TCL' };
  const BRANDS_WITH_PSK = ['sony'];

  const byId = (id) => document.getElementById(id);

  const els = {
    headerStatusDot: byId('headerStatusDot'),
    headerDeviceName: byId('headerDeviceName'),
    switchBtn: byId('switchBtn'),
    langToggleBtn: byId('langToggleBtn'),
    langToggleLabel: byId('langToggleLabel'),

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
    tvPskField: byId('tvPskField'),
    tvPsk: byId('tvPsk'),
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
      els.headerDeviceName.textContent = PindotI18n.t('header.noTv');
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
      els.deviceList.innerHTML = `<p class="muted-empty">${PindotI18n.t('tvs.empty')}</p>`;
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
            <div class="device-card-name">${escapeHtml(device.name)} ${isActive ? `<span class="active-badge">${PindotI18n.t('tvs.active')}</span>` : ''}</div>
            <div class="device-card-meta">${brandLabel(device.brand)} · ${escapeHtml(device.ip)}</div>
          </div>
        </div>
        <div class="device-card-actions">
          <button class="icon-btn" data-action="test" aria-label="${PindotI18n.t('tvs.testAria')}"><svg class="icon"><use href="#icon-wifi"></use></svg></button>
          <button class="icon-btn" data-action="edit" aria-label="${PindotI18n.t('tvs.editAria')}"><svg class="icon"><use href="#icon-edit"></use></svg></button>
          <button class="icon-btn danger" data-action="delete" aria-label="${PindotI18n.t('tvs.deleteAria')}"><svg class="icon"><use href="#icon-trash"></use></svg></button>
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
      return PindotI18n.t('errors.pairTimeout', { brand });
    }
    if (code === 'unauthorized') {
      return PindotI18n.t('errors.unauthorized', { brand });
    }
    if (code === 'unsupported') {
      return PindotI18n.t('errors.unsupported');
    }
    if (code === 'timeout' || code === 'network' || code === 'ws-error') {
      if (device.brand === 'roku') {
        return PindotI18n.t('errors.rokuConnFail');
      }
      return PindotI18n.t('errors.genericConnFail', { brand });
    }
    return PindotI18n.t('errors.commandFailed');
  }

  async function handleKeyPress(key) {
    const device = PindotStorage.getActiveDevice();
    if (!device) {
      showToast(PindotI18n.t('toast.noTvAddFirst'), 'warn');
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
      showToast(PindotI18n.t('toast.connected', { name: device.name }), 'success');
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
        showToast(PindotI18n.t('toast.deviceActive', { name: PindotStorage.getDevice(id).name }), 'success');
        switchView('remote');
      } else if (action === 'test') {
        testDeviceConnection(id);
      } else if (action === 'edit') {
        openTvModal(id);
      } else if (action === 'delete') {
        const device = PindotStorage.getDevice(id);
        if (device && confirm(PindotI18n.t('toast.deleteConfirm', { name: device.name }))) {
          PindotStorage.deleteDevice(id);
          refreshState();
          render();
          showToast(PindotI18n.t('toast.deleted'), '');
        }
      }
    });
  }

  // ---------------- Add / Edit TV modal ----------------
  function updateBrandHint() {
    els.brandHint.innerHTML = PindotI18n.t('brandHints.' + els.tvBrand.value) || '';
    els.tvPskField.classList.toggle('hidden', !BRANDS_WITH_PSK.includes(els.tvBrand.value));
  }

  function openTvModal(deviceId) {
    const isEdit = !!deviceId;
    els.tvModalTitle.textContent = isEdit ? PindotI18n.t('modal.editTitle') : PindotI18n.t('modal.addTitle');
    if (isEdit) {
      const device = PindotStorage.getDevice(deviceId);
      els.tvId.value = device.id;
      els.tvName.value = device.name;
      els.tvBrand.value = device.brand;
      els.tvIp.value = device.ip;
      els.tvPsk.value = device.psk || '';
    } else {
      els.tvForm.reset();
      els.tvId.value = '';
      els.tvBrand.value = 'roku';
      els.tvPsk.value = '';
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
      const psk = els.tvPsk.value.trim() || null;

      if (!name || !ip) return;
      if (!isValidIp(ip)) {
        showToast(PindotI18n.t('toast.invalidIp'), 'warn');
        return;
      }

      const id = els.tvId.value;
      if (id) {
        PindotStorage.updateDevice(id, { name, ip, brand, psk, token: null, lastStatus: 'unknown' });
      } else {
        const device = PindotStorage.addDevice({ name, ip, brand, psk });
        PindotStorage.setActiveDeviceId(device.id);
      }
      refreshState();
      render();
      closeTvModal();
      showToast(PindotI18n.t('toast.saved'), 'success');
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
            <div class="device-card-name">${escapeHtml(d.name)} ${d.id === state.activeId ? `<span class="active-badge">${PindotI18n.t('tvs.active')}</span>` : ''}</div>
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

  // ---------------- Language toggle ----------------
  function updateLangToggleLabel() {
    els.langToggleLabel.textContent = PindotI18n.getLang() === 'en' ? 'TL' : 'EN';
  }

  function bindLangToggle() {
    updateLangToggleLabel();
    els.langToggleBtn.addEventListener('click', () => {
      const next = PindotI18n.getLang() === 'en' ? 'fil' : 'en';
      PindotI18n.setLang(next);
      updateLangToggleLabel();
      render();

      if (!els.tvModalOverlay.classList.contains('hidden')) {
        els.tvModalTitle.textContent = els.tvId.value ? PindotI18n.t('modal.editTitle') : PindotI18n.t('modal.addTitle');
        updateBrandHint();
      }
      if (!els.switchModalOverlay.classList.contains('hidden')) {
        openSwitchModal();
      }
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
    bindLangToggle();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
