/*
 * PindotTV - localStorage helpers for saved TVs
 */

const PindotStorage = (() => {
  const DEVICES_KEY = 'pindottv.devices';
  const ACTIVE_KEY = 'pindottv.activeDeviceId';

  function getDevices() {
    try {
      const raw = localStorage.getItem(DEVICES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveDevices(devices) {
    localStorage.setItem(DEVICES_KEY, JSON.stringify(devices));
  }

  function generateId() {
    return 'tv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addDevice({ name, ip, brand }) {
    const device = {
      id: generateId(),
      name: name.trim(),
      ip: ip.trim(),
      brand,
      token: null,
      lastStatus: 'unknown', // 'online' | 'offline' | 'unknown'
      lastCheckedAt: null,
      createdAt: Date.now(),
    };
    const devices = getDevices();
    devices.push(device);
    saveDevices(devices);
    if (!getActiveDeviceId()) setActiveDeviceId(device.id);
    return device;
  }

  function updateDevice(id, patch) {
    const devices = getDevices();
    const idx = devices.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    devices[idx] = { ...devices[idx], ...patch };
    saveDevices(devices);
    return devices[idx];
  }

  function deleteDevice(id) {
    const devices = getDevices().filter((d) => d.id !== id);
    saveDevices(devices);
    if (getActiveDeviceId() === id) {
      setActiveDeviceId(devices.length ? devices[0].id : null);
    }
  }

  function getActiveDeviceId() {
    return localStorage.getItem(ACTIVE_KEY);
  }

  function setActiveDeviceId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  function getActiveDevice() {
    const id = getActiveDeviceId();
    if (!id) return null;
    return getDevices().find((d) => d.id === id) || null;
  }

  function getDevice(id) {
    return getDevices().find((d) => d.id === id) || null;
  }

  return {
    getDevices,
    saveDevices,
    addDevice,
    updateDevice,
    deleteDevice,
    getActiveDeviceId,
    setActiveDeviceId,
    getActiveDevice,
    getDevice,
  };
})();
