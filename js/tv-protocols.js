/*
 * PindotTV - TV control protocols
 * Roku ECP (HTTP), Samsung Tizen (WebSocket), LG webOS (WebSocket/SSAP)
 *
 * Browsers enforce "Mixed Content" rules: an HTTPS page (like GitHub Pages)
 * cannot normally call http:// or self-signed wss:// endpoints on the local
 * network. These modules still attempt the real protocol calls - if a user's
 * browser allows it (e.g. via the "Insecure content -> Allow" site setting),
 * everything works. Otherwise we surface a clear, Taglish error so the UI can
 * explain the limitation (see help.js / "Paano Gumagana").
 */

const TVProtocols = (() => {

  function withTimeout(promise, ms, onTimeoutMessage) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error(onTimeoutMessage || 'timeout'), { code: 'timeout' })), ms);
    });
    return Promise.race([promise.finally(() => clearTimeout(timer)), timeout]);
  }

  function classifyFetchError(err) {
    if (err && err.code) return err;
    if (err && err.name === 'AbortError') {
      return Object.assign(new Error('timeout'), { code: 'timeout' });
    }
    // A plain "Failed to fetch" / TypeError almost always means the request
    // was blocked (mixed content / CORS) or the host is unreachable.
    return Object.assign(new Error('network'), { code: 'network', original: err });
  }

  // ----------------------------------------------------------------------
  // ROKU - External Control Protocol (ECP), HTTP POST on port 8060
  // https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md
  // ----------------------------------------------------------------------
  const roku = {
    KEY_MAP: {
      power: 'PowerOff',
      home: 'Home',
      back: 'Back',
      select: 'Select',
      ok: 'Select',
      up: 'Up',
      down: 'Down',
      left: 'Left',
      right: 'Right',
      volumeUp: 'VolumeUp',
      volumeDown: 'VolumeDown',
      mute: 'VolumeMute',
      channelUp: 'ChannelUp',
      channelDown: 'ChannelDown',
      input: 'InputTuner',
      play: 'Play',
      info: 'Info',
      replay: 'InstantReplay',
      backspace: 'Backspace',
    },

    keyUrl(device, ecpKey) {
      return `http://${device.ip}:8060/keypress/${encodeURIComponent(ecpKey)}`;
    },

    async sendKey(device, key) {
      let ecpKey;
      if (key === 'digit') throw Object.assign(new Error('use sendDigit'), { code: 'bad-call' });
      ecpKey = roku.KEY_MAP[key];
      if (!ecpKey) throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
      try {
        await fetch(roku.keyUrl(device, ecpKey), {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-store',
        });
      } catch (err) {
        throw classifyFetchError(err);
      }
    },

    async sendDigit(device, digit) {
      try {
        await fetch(roku.keyUrl(device, 'Lit_' + digit), {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-store',
        });
      } catch (err) {
        throw classifyFetchError(err);
      }
    },

    async testConnection(device) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        // no-cors gives an "opaque" response, but fetch only resolves if a
        // TCP connection to the host:port actually succeeded.
        await fetch(`http://${device.ip}:8060/query/device-info`, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        });
        return true;
      } catch (err) {
        throw classifyFetchError(err);
      } finally {
        clearTimeout(timer);
      }
    },
  };

  // ----------------------------------------------------------------------
  // TCL - "TCL Roku TV" models run genuine Roku OS, so they speak the
  // exact same External Control Protocol (ECP) on port 8060 as Roku
  // devices. TCL Google TV / Android TV models are not supported - see
  // the Help / compatibility table.
  // ----------------------------------------------------------------------
  const tcl = roku;

  // ----------------------------------------------------------------------
  // SAMSUNG - Tizen WebSocket remote API (port 8001 plain / 8002 TLS)
  // wss://<ip>:8002/api/v2/channels/samsung.remote.control?name=<base64>
  // ----------------------------------------------------------------------
  const samsung = {
    KEY_MAP: {
      power: 'KEY_POWER',
      home: 'KEY_HOME',
      back: 'KEY_RETURN',
      select: 'KEY_ENTER',
      ok: 'KEY_ENTER',
      up: 'KEY_UP',
      down: 'KEY_DOWN',
      left: 'KEY_LEFT',
      right: 'KEY_RIGHT',
      volumeUp: 'KEY_VOLUP',
      volumeDown: 'KEY_VOLDOWN',
      mute: 'KEY_MUTE',
      channelUp: 'KEY_CHUP',
      channelDown: 'KEY_CHDOWN',
      input: 'KEY_SOURCE',
      play: 'KEY_PLAY',
      info: 'KEY_INFO',
      replay: 'KEY_REWIND',
      backspace: 'KEY_RETURN',
    },

    digitKey(digit) {
      return 'KEY_' + digit;
    },

    appNameB64() {
      return btoa(unescape(encodeURIComponent('PindotTV')));
    },

    buildUrl(device) {
      const name = samsung.appNameB64();
      const token = device.token ? `&token=${encodeURIComponent(device.token)}` : '';
      return `wss://${device.ip}:8002/api/v2/channels/samsung.remote.control?name=${name}${token}`;
    },

    /**
     * Opens a WebSocket and waits for the "ms.channel.connect" ack.
     * The first time a TV is paired it will show an "Allow connection?"
     * prompt - give it extra time (pairTimeout) for the user to accept.
     */
    connect(device, { timeout = 6000, pairTimeout = 25000 } = {}) {
      return new Promise((resolve, reject) => {
        let ws;
        try {
          ws = new WebSocket(samsung.buildUrl(device));
        } catch (err) {
          reject(Object.assign(new Error('ws-create-failed'), { code: 'network', original: err }));
          return;
        }

        let settled = false;
        let timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          try { ws.close(); } catch {}
          reject(Object.assign(new Error('timeout'), { code: 'timeout' }));
        }, timeout);

        const extendForPairing = () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            try { ws.close(); } catch {}
            reject(Object.assign(new Error('pair-timeout'), { code: 'pair-timeout' }));
          }, pairTimeout);
        };

        ws.onopen = () => {
          // First connect (no token yet) usually triggers a pairing prompt
          // on the TV - extend the timeout so the user has time to accept.
          if (!device.token) extendForPairing();
        };

        ws.onmessage = (ev) => {
          let data;
          try { data = JSON.parse(ev.data); } catch { return; }

          if (data.event === 'ms.channel.connect') {
            const token = data.data && data.data.token;
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve({ ws, token: token || device.token || null });
            }
          } else if (data.event === 'ms.channel.unauthorized' || data.event === 'ms.channel.timeOut') {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              try { ws.close(); } catch {}
              reject(Object.assign(new Error(data.event), { code: 'unauthorized' }));
            }
          }
        };

        ws.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(Object.assign(new Error('ws-error'), { code: 'ws-error' }));
          }
        };

        ws.onclose = (ev) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(Object.assign(new Error('ws-closed:' + ev.code), { code: 'ws-error', closeCode: ev.code }));
          }
        };
      });
    },

    async sendKey(device, key, onTokenUpdate) {
      const cmd = key === 'digit' ? null : samsung.KEY_MAP[key];
      if (!cmd) throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
      const { ws, token } = await samsung.connect(device);
      if (token && token !== device.token && typeof onTokenUpdate === 'function') {
        onTokenUpdate(token);
      }
      ws.send(JSON.stringify({
        method: 'ms.remote.control',
        params: { Cmd: 'Click', DataOfCmd: cmd, Option: 'false', TypeOfRemote: 'SendRemoteKey' },
      }));
      setTimeout(() => { try { ws.close(); } catch {} }, 400);
    },

    async sendDigit(device, digit, onTokenUpdate) {
      const { ws, token } = await samsung.connect(device);
      if (token && token !== device.token && typeof onTokenUpdate === 'function') {
        onTokenUpdate(token);
      }
      ws.send(JSON.stringify({
        method: 'ms.remote.control',
        params: { Cmd: 'Click', DataOfCmd: samsung.digitKey(digit), Option: 'false', TypeOfRemote: 'SendRemoteKey' },
      }));
      setTimeout(() => { try { ws.close(); } catch {} }, 400);
    },

    async testConnection(device, onTokenUpdate) {
      const { ws, token } = await samsung.connect(device, { timeout: 5000, pairTimeout: 25000 });
      if (token && token !== device.token && typeof onTokenUpdate === 'function') {
        onTokenUpdate(token);
      }
      try { ws.close(); } catch {}
      return true;
    },
  };

  // ----------------------------------------------------------------------
  // LG - webOS SSAP over WebSocket (port 3000 plain / 3001 TLS)
  // ----------------------------------------------------------------------
  const lg = {
    DIRECT_URI: {
      volumeUp: 'ssap://audio/volumeUp',
      volumeDown: 'ssap://audio/volumeDown',
      power: 'ssap://system/turnOff',
      channelUp: 'ssap://tv/channelUp',
      channelDown: 'ssap://tv/channelDown',
    },
    POINTER_BUTTON: {
      home: 'HOME',
      back: 'BACK',
      select: 'ENTER',
      ok: 'ENTER',
      up: 'UP',
      down: 'DOWN',
      left: 'LEFT',
      right: 'RIGHT',
      info: 'INFO',
      play: 'PLAY',
      replay: 'REWIND',
      backspace: 'BACK',
    },

    manifest() {
      return {
        manifestVersion: 1,
        appVersion: '1.1',
        signed: undefined,
        permissions: [
          'LAUNCH', 'LAUNCH_WEBAPP', 'APP_TO_APP', 'CLOSE',
          'CONTROL_AUDIO', 'CONTROL_DISPLAY', 'CONTROL_INPUT_JOYSTICK',
          'CONTROL_INPUT_MEDIA_PLAYBACK', 'CONTROL_INPUT_TV',
          'CONTROL_POWER', 'READ_INPUT_DEVICE_LIST', 'READ_NETWORK_STATE',
          'READ_RUNNING_APPS', 'READ_TV_CHANNEL_LIST', 'READ_CURRENT_CHANNEL',
          'READ_POWER_STATE',
        ],
      };
    },

    buildUrl(device) {
      return `wss://${device.ip}:3001`;
    },

    /**
     * Connects + registers with the TV. On first run this triggers a pairing
     * prompt ("LG Connect Apps") on the TV screen.
     * Resolves with { ws, clientKey }.
     */
    connect(device, { timeout = 6000, pairTimeout = 30000 } = {}) {
      return new Promise((resolve, reject) => {
        let ws;
        try {
          ws = new WebSocket(lg.buildUrl(device));
        } catch (err) {
          reject(Object.assign(new Error('ws-create-failed'), { code: 'network', original: err }));
          return;
        }

        let settled = false;
        let timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          try { ws.close(); } catch {}
          reject(Object.assign(new Error('timeout'), { code: 'timeout' }));
        }, timeout);

        ws.onopen = () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            try { ws.close(); } catch {}
            reject(Object.assign(new Error('pair-timeout'), { code: 'pair-timeout' }));
          }, pairTimeout);

          ws.send(JSON.stringify({
            type: 'register',
            id: 'register_0',
            payload: { forcePairing: false, pairingType: 'PROMPT', manifest: lg.manifest(), 'client-key': device.token || undefined },
          }));
        };

        ws.onmessage = (ev) => {
          let data;
          try { data = JSON.parse(ev.data); } catch { return; }

          if (data.type === 'registered') {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              const clientKey = data.payload && data.payload['client-key'];
              resolve({ ws, clientKey: clientKey || device.token || null });
            }
          } else if (data.type === 'error') {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              try { ws.close(); } catch {}
              reject(Object.assign(new Error(data.error || 'lg-error'), { code: 'unauthorized' }));
            }
          }
        };

        ws.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(Object.assign(new Error('ws-error'), { code: 'ws-error' }));
          }
        };

        ws.onclose = (ev) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(Object.assign(new Error('ws-closed:' + ev.code), { code: 'ws-error', closeCode: ev.code }));
          }
        };
      });
    },

    sendRequest(ws, uri, payload) {
      const id = 'req_' + Math.random().toString(36).slice(2, 9);
      ws.send(JSON.stringify({ type: 'request', id, uri, payload: payload || {} }));
    },

    async openPointerSocket(ws) {
      return new Promise((resolve, reject) => {
        const id = 'ptr_' + Math.random().toString(36).slice(2, 9);
        const timer = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'timeout' })), 5000);
        const handler = (ev) => {
          let data;
          try { data = JSON.parse(ev.data); } catch { return; }
          if (data.id === id && data.payload && data.payload.socketPath) {
            clearTimeout(timer);
            ws.removeEventListener('message', handler);
            const pointerWs = new WebSocket(data.payload.socketPath);
            pointerWs.onopen = () => resolve(pointerWs);
            pointerWs.onerror = () => reject(Object.assign(new Error('pointer-ws-error'), { code: 'ws-error' }));
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ type: 'request', id, uri: 'ssap://com.webos.service.networkinput/getPointerInputSocket' }));
      });
    },

    async sendKey(device, key, onTokenUpdate) {
      const { ws, clientKey } = await lg.connect(device);
      if (clientKey && clientKey !== device.token && typeof onTokenUpdate === 'function') {
        onTokenUpdate(clientKey);
      }

      try {
        if (key === 'power') {
          lg.sendRequest(ws, lg.DIRECT_URI.power);
        } else if (key === 'volumeUp' || key === 'volumeDown' || key === 'channelUp' || key === 'channelDown') {
          lg.sendRequest(ws, lg.DIRECT_URI[key]);
        } else if (key === 'mute') {
          lg.sendRequest(ws, 'ssap://audio/setMute', { mute: true });
        } else if (key === 'input') {
          lg.sendRequest(ws, 'ssap://com.webos.applicationManager/launch', { id: 'com.webos.app.inputpicker' });
        } else {
          const button = lg.POINTER_BUTTON[key];
          if (!button) throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
          const pointerWs = await lg.openPointerSocket(ws);
          pointerWs.send(`type:button\nname:${button}\n\n`);
          setTimeout(() => { try { pointerWs.close(); } catch {} }, 400);
        }
      } finally {
        setTimeout(() => { try { ws.close(); } catch {} }, 600);
      }
    },

    async sendDigit(device, digit, onTokenUpdate) {
      const { ws, clientKey } = await lg.connect(device);
      if (clientKey && clientKey !== device.token && typeof onTokenUpdate === 'function') {
        onTokenUpdate(clientKey);
      }
      try {
        const pointerWs = await lg.openPointerSocket(ws);
        pointerWs.send(`type:button\nname:${digit}\n\n`);
        setTimeout(() => { try { pointerWs.close(); } catch {} }, 400);
      } finally {
        setTimeout(() => { try { ws.close(); } catch {} }, 600);
      }
    },

    async testConnection(device, onTokenUpdate) {
      const { ws, clientKey } = await lg.connect(device, { timeout: 5000, pairTimeout: 30000 });
      if (clientKey && clientKey !== device.token && typeof onTokenUpdate === 'function') {
        onTokenUpdate(clientKey);
      }
      try { ws.close(); } catch {}
      return true;
    },
  };

  // ----------------------------------------------------------------------
  // DEVANT - newer "Smart TV webOS" (STW series) sets run webOS Hub, the
  // same platform LG licenses to other brands, so they speak the exact
  // same SSAP/WebSocket pairing protocol as LG webOS TVs.
  // Older Devant models (VIDAA OS) or basic non-smart sets are not
  // supported - see the Help / compatibility table.
  // ----------------------------------------------------------------------
  const devant = lg;

  // ----------------------------------------------------------------------
  // SONY - Bravia / Android TV, IRCC-IP over HTTP (port 80)
  // https://pro-bravia.sony.net/develop/integrate/ircc-ip/
  // Requires "IP Control" with a Pre-Shared Key (PSK) enabled on the TV.
  // The SOAPACTION / X-Auth-PSK headers may be stripped by the browser in
  // no-cors mode, so this is best-effort (see "Paano Gumagana" / Help).
  // ----------------------------------------------------------------------
  const sony = {
    IRCC_CODE: {
      power: 'AAAAAQAAAAEAAAAVAw==',
      home: 'AAAAAQAAAAEAAAAkAw==',
      back: 'AAAAAgAAAJcAAAAjAw==',
      select: 'AAAAAQAAAAEAAABlAw==',
      ok: 'AAAAAQAAAAEAAABlAw==',
      up: 'AAAAAQAAAAEAAAB0Aw==',
      down: 'AAAAAQAAAAEAAAB1Aw==',
      left: 'AAAAAQAAAAEAAAA0Aw==',
      right: 'AAAAAQAAAAEAAAAzAw==',
      volumeUp: 'AAAAAQAAAAEAAAASAw==',
      volumeDown: 'AAAAAQAAAAEAAAATAw==',
      mute: 'AAAAAQAAAAEAAAAUAw==',
      channelUp: 'AAAAAQAAAAEAAAAQAw==',
      channelDown: 'AAAAAQAAAAEAAAARAw==',
      input: 'AAAAAQAAAAEAAAAlAw==',
      replay: 'AAAAAgAAAJcAAAAbAw==',
      backspace: 'AAAAAgAAAJcAAAAjAw==',
      '0': 'AAAAAQAAAAEAAAAJAw==',
      '1': 'AAAAAQAAAAEAAAAAAw==',
      '2': 'AAAAAQAAAAEAAAABAw==',
      '3': 'AAAAAQAAAAEAAAACAw==',
      '4': 'AAAAAQAAAAEAAAADAw==',
      '5': 'AAAAAQAAAAEAAAAEAw==',
      '6': 'AAAAAQAAAAEAAAAFAw==',
      '7': 'AAAAAQAAAAEAAAAGAw==',
      '8': 'AAAAAQAAAAEAAAAHAw==',
      '9': 'AAAAAQAAAAEAAAAIAw==',
    },

    soapBody(code) {
      return `<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendIRCC xmlns:u="urn:schemas-sony-com:service:IRCC:1"><IRCCCode>${code}</IRCCCode></u:X_SendIRCC></s:Body></s:Envelope>`;
    },

    async sendIrcc(device, code) {
      try {
        await fetch(`http://${device.ip}/sony/IRCC`, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-store',
          headers: {
            'Content-Type': 'text/xml; charset=UTF-8',
            SOAPACTION: '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCC"',
            'X-Auth-PSK': device.psk || '',
          },
          body: sony.soapBody(code),
        });
      } catch (err) {
        throw classifyFetchError(err);
      }
    },

    async sendKey(device, key) {
      if (key === 'digit') throw Object.assign(new Error('use sendDigit'), { code: 'bad-call' });
      const code = sony.IRCC_CODE[key];
      if (!code) throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
      await sony.sendIrcc(device, code);
    },

    async sendDigit(device, digit) {
      const code = sony.IRCC_CODE[digit];
      if (!code) throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
      await sony.sendIrcc(device, code);
    },

    async testConnection(device) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        await fetch(`http://${device.ip}/sony/system`, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-PSK': device.psk || '',
          },
          body: JSON.stringify({ method: 'getPowerStatus', id: 1, params: [], version: '1.0' }),
        });
        return true;
      } catch (err) {
        throw classifyFetchError(err);
      } finally {
        clearTimeout(timer);
      }
    },
  };

  // ----------------------------------------------------------------------
  // PANASONIC - Viera "Network Control" SOAP over HTTP (port 55000)
  // The SOAPACTION header may be stripped by the browser in no-cors mode,
  // so this is best-effort (see "Paano Gumagana" / Help).
  // ----------------------------------------------------------------------
  const panasonic = {
    KEY_MAP: {
      power: 'NRC_POWER-ONOFF',
      home: 'NRC_HOME-ONOFF',
      back: 'NRC_RETURN-ONOFF',
      select: 'NRC_ENTER-ONOFF',
      ok: 'NRC_ENTER-ONOFF',
      up: 'NRC_UP-ONOFF',
      down: 'NRC_DOWN-ONOFF',
      left: 'NRC_LEFT-ONOFF',
      right: 'NRC_RIGHT-ONOFF',
      volumeUp: 'NRC_VOLUP-ONOFF',
      volumeDown: 'NRC_VOLDOWN-ONOFF',
      mute: 'NRC_MUTE-ONOFF',
      channelUp: 'NRC_CH_UP-ONOFF',
      channelDown: 'NRC_CH_DOWN-ONOFF',
      input: 'NRC_CHG_INPUT-ONOFF',
      replay: 'NRC_REW-ONOFF',
      backspace: 'NRC_RETURN-ONOFF',
    },

    soapBody(key) {
      return `<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:X_SendKey xmlns:u="urn:panasonic-com:service:p00NetworkControl:1"><X_KeyEvent>${key}</X_KeyEvent></u:X_SendKey></s:Body></s:Envelope>`;
    },

    async sendCommand(device, key) {
      try {
        await fetch(`http://${device.ip}:55000/nrc/control_0`, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-store',
          headers: {
            'Content-Type': 'text/xml; charset="utf-8"',
            SOAPACTION: '"urn:panasonic-com:service:p00NetworkControl:1#X_SendKey"',
          },
          body: panasonic.soapBody(key),
        });
      } catch (err) {
        throw classifyFetchError(err);
      }
    },

    async sendKey(device, key) {
      if (key === 'digit') throw Object.assign(new Error('use sendDigit'), { code: 'bad-call' });
      const nrcKey = panasonic.KEY_MAP[key];
      if (!nrcKey) throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
      await panasonic.sendCommand(device, nrcKey);
    },

    async sendDigit(device, digit) {
      await panasonic.sendCommand(device, 'NRC_D' + digit + '-ONOFF');
    },

    async testConnection(device) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        await fetch(`http://${device.ip}:55000/nrc/sdd_0.xml`, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal,
        });
        return true;
      } catch (err) {
        throw classifyFetchError(err);
      } finally {
        clearTimeout(timer);
      }
    },
  };

  // ----------------------------------------------------------------------
  // Unified dispatch
  // ----------------------------------------------------------------------
  const BRANDS = { roku, samsung, lg, sony, panasonic, devant, tcl };

  function isDigitKey(key) {
    return /^[0-9]$/.test(key);
  }

  async function sendKey(device, key, onTokenUpdate) {
    const proto = BRANDS[device.brand];
    if (!proto) throw Object.assign(new Error('unsupported-brand'), { code: 'unsupported' });

    if (isDigitKey(key)) {
      if (typeof proto.sendDigit !== 'function') throw Object.assign(new Error('unsupported-key'), { code: 'unsupported' });
      return proto.sendDigit(device, key, onTokenUpdate);
    }
    return proto.sendKey(device, key, onTokenUpdate);
  }

  async function testConnection(device, onTokenUpdate) {
    const proto = BRANDS[device.brand];
    if (!proto) throw Object.assign(new Error('unsupported-brand'), { code: 'unsupported' });
    return proto.testConnection(device, onTokenUpdate);
  }

  return { roku, samsung, lg, sony, panasonic, devant, tcl, sendKey, testConnection, withTimeout };
})();
