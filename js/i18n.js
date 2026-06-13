/*
 * PindotTV - i18n (Filipino/Taglish + English)
 */

const PindotI18n = (() => {
  const LANG_KEY = 'pindottv.lang';
  const DEFAULT_LANG = 'en';

  const STRINGS = {
    fil: {
      meta: {
        title: 'PindotTV - WiFi Smart TV Remote',
        description: 'PindotTV - Gawing remote control ang phone mo para sa Smart TV gamit ang WiFi. Walang kailangang i-install sa TV, browser lang!',
      },
      header: {
        chooseTv: 'Pumili ng TV',
        noTv: 'Walang TV',
        langToggle: 'Palitan ang wika',
      },
      nav: {
        tvs: 'Mga TV',
        help: 'Tulong',
      },
      remote: {
        emptyTitle: 'Wala ka pang TV',
        emptyText: 'Mag-add muna ng TV para magamit ang remote. I-tap ang button sa baba.',
        addTv: 'Magdagdag ng TV',
        test: 'I-test',
        dpadUp: 'Pataas',
        dpadLeft: 'Pakaliwa',
        dpadRight: 'Pakanan',
        dpadDown: 'Pababa',
        numbers: 'Numero',
      },
      tvs: {
        heading: 'Mga TV',
        desc: 'I-save ang mga TV mo dito para mabilis mag-switch. Pindot lang para gamitin.',
        empty: 'Wala ka pang naka-save na TV. I-tap ang button sa baba para magdagdag.',
        addNew: 'Magdagdag ng Bagong TV',
        active: 'Active',
        testAria: 'I-test ang koneksyon',
        editAria: 'I-edit',
        deleteAria: 'Tanggalin',
      },
      help: {
        heading: 'Paano Gumagana',
        desc: 'Basahin muna ito bago gamitin ang PindotTV - para alam mo ang gagana at hindi.',
        card1Title: '1. Sigurado: parehong WiFi',
        card1Body: '<p>Dapat <strong>konektado sa parehong WiFi network</strong> ang phone mo at ang Smart TV. Hindi gagana ang PindotTV kung iba ang network (hal. mobile data sa phone, WiFi sa TV).</p>',
        card2Title: '2. Paano makita ang IP Address ng TV',
        card2Body: `<p>Kailangan mo ang IP address ng TV (hal. <code>192.168.1.50</code>) para ito i-type sa "Magdagdag ng TV":</p>
        <ul>
          <li><strong>Roku:</strong> Settings &rarr; Network &rarr; About. Makikita dito ang "IP address".</li>
          <li><strong>Samsung (Tizen):</strong> Settings &rarr; General &rarr; Network &rarr; Network Status, o Settings &rarr; Support &rarr; About This TV.</li>
          <li><strong>LG (webOS):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; piliin ang connected network &rarr; makikita ang IP address (minsan tinatawag na "Network Status").</li>
          <li><strong>Devant (webOS / STW series):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; piliin ang connected network &rarr; makikita ang IP address. Pareho ang setup ng mga ito sa LG webOS.</li>
          <li><strong>Sony (Bravia / Android TV):</strong> Settings &rarr; Network &rarr; Network Status. I-enable din ang "IP Control" (Pre-Shared Key) sa Home Network settings.</li>
          <li><strong>Panasonic (Viera):</strong> Settings &rarr; Network &rarr; Network Status. I-enable din ang "TV Remote App" / "Network Control" sa Network Link Settings.</li>
        </ul>`,
        card3Title: '3. Alin ang Pinaka-Gumagana (Compatibility)',
        card3Table: `<thead>
          <tr><th>Brand</th><th>Status</th><th>Paliwanag</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Roku TV / Stick</td>
            <td><span class="badge badge-good">Pinaka-Reliable</span></td>
            <td>Gamit ang Roku ECP (port 8060). Pero dahil HTTP lang (hindi HTTPS) ang Roku, posibleng harangin ng browser - tingnan ang #4 sa baba.</td>
          </tr>
          <tr>
            <td>Samsung Smart TV (Tizen, 2016+)</td>
            <td><span class="badge badge-warn">Limitado</span></td>
            <td>Gumagamit ng secure WebSocket (wss) na may "self-signed" certificate. Kailangan munang tanggapin ang certificate warning - tingnan ang #5.</td>
          </tr>
          <tr>
            <td>LG Smart TV (webOS)</td>
            <td><span class="badge badge-warn">Limitado</span></td>
            <td>Parehong WebSocket pairing tulad ng Samsung. May "Connect?" prompt na lalabas sa TV - tanggapin agad.</td>
          </tr>
          <tr>
            <td>Devant Smart TV (webOS / STW series)</td>
            <td><span class="badge badge-warn">Limitado</span></td>
            <td>Parehong webOS pairing tulad ng LG - may "Connect?" prompt na lalabas sa TV, tanggapin agad. Mga mas lumang Devant (VIDAA OS) o basic/non-smart na TV ay hindi suportado.</td>
          </tr>
          <tr>
            <td>Sony (Bravia / Android TV)</td>
            <td><span class="badge badge-warn">Limitado</span></td>
            <td>Gumagamit ng IRCC-IP (HTTP) na may "Pre-Shared Key" (PSK). Kailangang i-enable muna ang "IP Control" sa TV settings at ilagay ang parehong PSK sa app. Posibleng harangin ng browser ang custom headers.</td>
          </tr>
          <tr>
            <td>Panasonic (Viera)</td>
            <td><span class="badge badge-warn">Limitado</span></td>
            <td>Gumagamit ng "Network Control" / TV Remote App (HTTP). Kailangang i-enable muna ito sa TV settings. Posibleng harangin din ng browser ang ilang request.</td>
          </tr>
          <tr>
            <td>Non-Smart TV / walang WiFi</td>
            <td><span class="badge badge-bad">Hindi Suportado</span></td>
            <td>Kailangan ng Infrared (IR) signal para sa mga ito, at hindi kayang gumawa ng IR ang isang browser/PWA. Kailangan ng external IR blaster hardware.</td>
          </tr>
        </tbody>`,
        card4Title: '4. MAHALAGA: "Mixed Content" na hadlang',
        card4Body: `<p>Ang PindotTV ay naka-host sa <strong>secure na HTTPS</strong> (GitHub Pages). Pero ang Roku ECP ay <strong>HTTP lang</strong> sa loob ng inyong WiFi. Pinipigilan ng mga browser (lalo na Chrome) ang "secure" page na mag-request sa "insecure" address - ito ang tawag na <em>Mixed Content</em>.</p>
        <p><strong>Paano malalampasan (workaround):</strong></p>
        <ol>
          <li>Sa Chrome (Android o Desktop), i-tap ang <strong>lock/info icon</strong> sa tabi ng address bar.</li>
          <li>Pumunta sa <strong>"Site settings"</strong>.</li>
          <li>Hanapin ang <strong>"Insecure content"</strong> at palitan sa <strong>"Allow"</strong>.</li>
          <li>I-reload ang PindotTV at subukan ulit ang remote.</li>
        </ol>
        <p class="muted">Kung wala ang option na ito sa browser mo, posibleng hindi gumana ang direct connection - pero gagana pa rin ang pag-save ng mga TV at ang ibang parte ng app.</p>`,
        card5Title: '5. Samsung / LG: "Hindi Pinagkakatiwalaang Certificate"',
        card5Body: `<p>Ang Samsung at LG ay gumagamit ng <em>self-signed certificate</em> sa kanilang local WebSocket server, kaya bababala ang browser. Para tanggapin ito:</p>
        <ol>
          <li>Buksan ang isang bagong tab.</li>
          <li>Pumunta sa <code>https://[IP-ng-TV]:8002</code> (Samsung) o <code>https://[IP-ng-TV]:3001</code> (LG).</li>
          <li>Lalabas ang babala na "Hindi Secure" - piliin ang <strong>"Advanced" &rarr; "Proceed anyway / Tuloy pa rin"</strong>.</li>
          <li>Bumalik sa PindotTV at i-tap ulit ang "I-test" o ang remote button.</li>
          <li>Tingnan ang TV screen - lalabas ang <strong>pairing prompt</strong> ("Allow PindotTV to connect?"). Piliin ang <strong>"Allow / Oo"</strong> agad.</li>
        </ol>`,
        card6Title: '6. Paano gumagana ang "I-test" (Connection Test)',
        card6Body: '<p>Sinusubukan ng PindotTV na kumonekta sa IP address ng TV. Kung successful ang koneksyon, magiging <span class="status-dot inline" data-status="online"></span> <strong>berde (online)</strong> ang indicator. Kung walang response o naharang, magiging <span class="status-dot inline" data-status="offline"></span> <strong>pula (offline)</strong> ito. Hindi ito 100% guarantee - posibleng tama ang IP pero naka-block ng browser security.</p>',
        card7Title: '7. Privacy',
        card7Body: '<p>Lahat ng impormasyon ng TV mo (pangalan, IP address) ay naka-save lang <strong>sa device mo</strong> (localStorage ng browser). Walang ipinapadalang data sa server o sa ibang tao.</p>',
      },
      modal: {
        addTitle: 'Magdagdag ng TV',
        editTitle: 'I-edit ang TV',
        close: 'Isara',
        nameLabel: 'Pangalan ng TV',
        namePlaceholder: 'hal. TV sa Sala',
        brandLabel: 'Brand',
        ipLabel: 'IP Address ng TV',
        ipPlaceholder: 'hal. 192.168.1.50',
        pskLabel: 'Passcode (PSK) - opsyonal',
        pskPlaceholder: 'hal. 1234',
        save: 'I-save',
      },
      switchModal: {
        title: 'Piliin ang TV',
        manage: 'Pamahalaan ang mga TV',
      },
      install: {
        text: 'I-install ang PindotTV sa home screen para parang totoong app!',
        btn: 'I-install',
        iosText: 'I-install sa iPhone/iPad: tap ang Share button sa Safari, piliin ang "Add to Home Screen".',
        iosBtn: 'Paano?',
        iosAlert: 'Paano i-install sa iPhone/iPad:\n\n1. I-tap ang Share button (kahon na may pataas na arrow) sa Safari.\n2. I-scroll pababa at piliin ang "Add to Home Screen".\n3. I-tap ang "Add".',
      },
      toast: {
        noTvAddFirst: 'Wala pang TV - mag-add muna sa "Mga TV" tab.',
        connected: 'Connected sa "{name}"!',
        deviceActive: 'Active na ang "{name}"',
        deleteConfirm: 'Tanggalin ang "{name}"?',
        deleted: 'Tinanggal ang TV.',
        invalidIp: 'Mali ang format ng IP address (hal. 192.168.1.50).',
        saved: 'Na-save ang TV!',
      },
      errors: {
        pairTimeout: 'Walang sagot sa pairing prompt ng {brand} TV. Buksan ang TV at tanggapin ang "Allow/Connect" sa loob ng ilang segundo, tapos subukan ulit.',
        unauthorized: 'Tinanggihan ng {brand} TV ang koneksyon. Subukan ulit at tanggapin ang prompt sa TV screen.',
        unsupported: 'Hindi pa suportado ang button na ito para sa brand ng TV mo.',
        rokuConnFail: 'Hindi makonekta sa Roku. Tingnan: (1) tama ba ang IP, (2) bukas ba ang TV, (3) same WiFi ba kayo. Posible ring naharang ito ng browser ("Mixed Content") - buksan ang Tulong tab.',
        genericConnFail: 'Hindi makonekta sa {brand} TV. Tingnan kung same WiFi kayo at tama ang IP. Kung first time, posibleng kailangan munang tanggapin ang certificate - buksan ang Tulong tab para sa solusyon.',
        commandFailed: 'Hindi gumana ang command. Buksan ang Tulong tab para sa mga posibleng dahilan.',
      },
      brandHints: {
        roku: '<strong>Roku:</strong> Settings &rarr; Network &rarr; About. Hanapin ang "IP address" (hal. 192.168.1.50). Siguraduhing nakabukas ang "Control by mobile apps / Network access" sa Settings &rarr; System &rarr; Advanced system settings.',
        samsung: '<strong>Samsung (Tizen):</strong> Settings &rarr; General &rarr; Network &rarr; Network Status, o Settings &rarr; Support &rarr; About This TV. Sa unang gamit, lalabas ang "Allow connection?" sa TV - tanggapin agad (within ~25 seconds).',
        lg: '<strong>LG (webOS):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; piliin ang konektadong network para makita ang IP. Sa unang gamit, may lalabas na "Connect?" prompt sa TV - tanggapin agad.',
        devant: '<strong>Devant Smart TV (mga bagong webOS / "STW" series):</strong> Ginagamit nito ang parehong webOS platform ng LG, kaya pareho ang setup - i-enable ang "LG Connect Apps" / "Mobile TV On" sa TV settings, tapos tanggapin ang "Connect?" prompt na lalabas sa TV screen. Mga mas lumang Devant (VIDAA OS) o basic/non-smart na modelo ay hindi suportado.',
        sony: '<strong>Sony (Bravia / Android TV):</strong> I-enable ang "IP Control" sa Settings &rarr; Network &rarr; Home Network &rarr; IP Control &rarr; Authentication, itakda sa "Normal and Pre-Shared Key" at lagyan ng passcode (PSK) - ilagay din ang parehong PSK sa ibaba. Makikita ang IP sa Settings &rarr; Network &rarr; Network Status.',
        panasonic: '<strong>Panasonic (Viera):</strong> I-enable ang "TV Remote App" / "Network Control" sa Settings &rarr; Network &rarr; Network Link Settings (o "TV Remote" sa app settings). Makikita ang IP sa Settings &rarr; Network &rarr; Network Status.',
      },
    },

    en: {
      meta: {
        title: 'PindotTV - WiFi Smart TV Remote',
        description: 'PindotTV - Turn your phone into a remote control for your Smart TV using WiFi. No install needed on the TV, just your browser!',
      },
      header: {
        chooseTv: 'Choose TV',
        noTv: 'No TV',
        langToggle: 'Change language',
      },
      nav: {
        tvs: 'My TVs',
        help: 'Help',
      },
      remote: {
        emptyTitle: "You don't have a TV yet",
        emptyText: 'Add a TV first to use the remote. Tap the button below.',
        addTv: 'Add TV',
        test: 'Test',
        dpadUp: 'Up',
        dpadLeft: 'Left',
        dpadRight: 'Right',
        dpadDown: 'Down',
        numbers: 'Numbers',
      },
      tvs: {
        heading: 'My TVs',
        desc: 'Save your TVs here so you can switch quickly. Just tap to use.',
        empty: "You don't have any saved TVs yet. Tap the button below to add one.",
        addNew: 'Add New TV',
        active: 'Active',
        testAria: 'Test connection',
        editAria: 'Edit',
        deleteAria: 'Delete',
      },
      help: {
        heading: 'How It Works',
        desc: "Read this first before using PindotTV - so you know what will and won't work.",
        card1Title: '1. Make sure: same WiFi',
        card1Body: "<p>Your phone and your Smart TV must be <strong>connected to the same WiFi network</strong>. PindotTV won't work if they're on different networks (e.g. mobile data on the phone, WiFi on the TV).</p>",
        card2Title: "2. How to find your TV's IP Address",
        card2Body: `<p>You'll need the TV's IP address (e.g. <code>192.168.1.50</code>) to type into "Add TV":</p>
        <ul>
          <li><strong>Roku:</strong> Settings &rarr; Network &rarr; About. The "IP address" is shown here.</li>
          <li><strong>Samsung (Tizen):</strong> Settings &rarr; General &rarr; Network &rarr; Network Status, or Settings &rarr; Support &rarr; About This TV.</li>
          <li><strong>LG (webOS):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; select the connected network &rarr; the IP address is shown (sometimes called "Network Status").</li>
          <li><strong>Devant (webOS / STW series):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; select the connected network &rarr; the IP address is shown. Setup is the same as LG webOS.</li>
          <li><strong>Sony (Bravia / Android TV):</strong> Settings &rarr; Network &rarr; Network Status. Also enable "IP Control" (Pre-Shared Key) in the Home Network settings.</li>
          <li><strong>Panasonic (Viera):</strong> Settings &rarr; Network &rarr; Network Status. Also enable "TV Remote App" / "Network Control" in Network Link Settings.</li>
        </ul>`,
        card3Title: '3. Which Works Best (Compatibility)',
        card3Table: `<thead>
          <tr><th>Brand</th><th>Status</th><th>Explanation</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Roku TV / Stick</td>
            <td><span class="badge badge-good">Most Reliable</span></td>
            <td>Uses Roku ECP (port 8060). But since Roku is HTTP only (not HTTPS), the browser may block it - see #4 below.</td>
          </tr>
          <tr>
            <td>Samsung Smart TV (Tizen, 2016+)</td>
            <td><span class="badge badge-warn">Limited</span></td>
            <td>Uses a secure WebSocket (wss) with a "self-signed" certificate. You need to accept the certificate warning first - see #5.</td>
          </tr>
          <tr>
            <td>LG Smart TV (webOS)</td>
            <td><span class="badge badge-warn">Limited</span></td>
            <td>Same WebSocket pairing as Samsung. A "Connect?" prompt will appear on the TV - accept it right away.</td>
          </tr>
          <tr>
            <td>Devant Smart TV (webOS / STW series)</td>
            <td><span class="badge badge-warn">Limited</span></td>
            <td>Same webOS pairing as LG - a "Connect?" prompt appears on the TV, accept it right away. Older Devant models (VIDAA OS) or basic/non-smart sets are not supported.</td>
          </tr>
          <tr>
            <td>Sony (Bravia / Android TV)</td>
            <td><span class="badge badge-warn">Limited</span></td>
            <td>Uses IRCC-IP (HTTP) with a "Pre-Shared Key" (PSK). You must enable "IP Control" in TV settings first and enter the same PSK in the app. The browser may also block custom headers.</td>
          </tr>
          <tr>
            <td>Panasonic (Viera)</td>
            <td><span class="badge badge-warn">Limited</span></td>
            <td>Uses "Network Control" / TV Remote App (HTTP). Must be enabled first in TV settings. The browser may also block some requests.</td>
          </tr>
          <tr>
            <td>Non-Smart TV / no WiFi</td>
            <td><span class="badge badge-bad">Not Supported</span></td>
            <td>These need an Infrared (IR) signal, and a browser/PWA can't produce IR. An external IR blaster device is required.</td>
          </tr>
        </tbody>`,
        card4Title: '4. IMPORTANT: the "Mixed Content" blocker',
        card4Body: `<p>PindotTV is hosted on <strong>secure HTTPS</strong> (GitHub Pages). But Roku ECP is <strong>HTTP only</strong> on your home WiFi. Browsers (especially Chrome) block a "secure" page from making requests to an "insecure" address - this is called <em>Mixed Content</em>.</p>
        <p><strong>How to work around it:</strong></p>
        <ol>
          <li>In Chrome (Android or Desktop), tap the <strong>lock/info icon</strong> next to the address bar.</li>
          <li>Go to <strong>"Site settings"</strong>.</li>
          <li>Find <strong>"Insecure content"</strong> and switch it to <strong>"Allow"</strong>.</li>
          <li>Reload PindotTV and try the remote again.</li>
        </ol>
        <p class="muted">If this option isn't available in your browser, the direct connection may not work - but saving TVs and the rest of the app will still work fine.</p>`,
        card5Title: '5. Samsung / LG: "Untrusted Certificate"',
        card5Body: `<p>Samsung and LG use a <em>self-signed certificate</em> on their local WebSocket server, so the browser will show a warning. To accept it:</p>
        <ol>
          <li>Open a new tab.</li>
          <li>Go to <code>https://[TV-IP]:8002</code> (Samsung) or <code>https://[TV-IP]:3001</code> (LG).</li>
          <li>You'll see a "Not Secure" warning - choose <strong>"Advanced" &rarr; "Proceed anyway"</strong>.</li>
          <li>Go back to PindotTV and tap "Test" or a remote button again.</li>
          <li>Check the TV screen - a <strong>pairing prompt</strong> will appear ("Allow PindotTV to connect?"). Choose <strong>"Allow"</strong> right away.</li>
        </ol>`,
        card6Title: '6. How the "Test" (Connection Test) works',
        card6Body: '<p>PindotTV tries to connect to the TV\'s IP address. If the connection succeeds, the indicator turns <span class="status-dot inline" data-status="online"></span> <strong>green (online)</strong>. If there\'s no response or it\'s blocked, it turns <span class="status-dot inline" data-status="offline"></span> <strong>red (offline)</strong>. This isn\'t a 100% guarantee - the IP could be correct but blocked by browser security.</p>',
        card7Title: '7. Privacy',
        card7Body: '<p>All of your TV info (name, IP address) is saved only <strong>on your device</strong> (browser localStorage). No data is sent to any server or anyone else.</p>',
      },
      modal: {
        addTitle: 'Add TV',
        editTitle: 'Edit TV',
        close: 'Close',
        nameLabel: 'TV Name',
        namePlaceholder: 'e.g. Living Room TV',
        brandLabel: 'Brand',
        ipLabel: 'TV IP Address',
        ipPlaceholder: 'e.g. 192.168.1.50',
        pskLabel: 'Passcode (PSK) - optional',
        pskPlaceholder: 'e.g. 1234',
        save: 'Save',
      },
      switchModal: {
        title: 'Choose TV',
        manage: 'Manage TVs',
      },
      install: {
        text: 'Install PindotTV to your home screen so it feels like a real app!',
        btn: 'Install',
        iosText: 'Install on iPhone/iPad: tap the Share button in Safari, then choose "Add to Home Screen".',
        iosBtn: 'How?',
        iosAlert: 'How to install on iPhone/iPad:\n\n1. Tap the Share button (box with an arrow pointing up) in Safari.\n2. Scroll down and choose "Add to Home Screen".\n3. Tap "Add".',
      },
      toast: {
        noTvAddFirst: 'No TV yet - add one first in the "My TVs" tab.',
        connected: 'Connected to "{name}"!',
        deviceActive: '"{name}" is now active',
        deleteConfirm: 'Delete "{name}"?',
        deleted: 'TV deleted.',
        invalidIp: 'Invalid IP address format (e.g. 192.168.1.50).',
        saved: 'TV saved!',
      },
      errors: {
        pairTimeout: 'No response to the pairing prompt on the {brand} TV. Open the TV and accept "Allow/Connect" within a few seconds, then try again.',
        unauthorized: 'The {brand} TV rejected the connection. Try again and accept the prompt on the TV screen.',
        unsupported: "This button isn't supported yet for your TV's brand.",
        rokuConnFail: 'Could not connect to the Roku. Check: (1) is the IP correct, (2) is the TV on, (3) are you on the same WiFi. The browser may have also blocked it ("Mixed Content") - open the Help tab.',
        genericConnFail: 'Could not connect to the {brand} TV. Check that you are on the same WiFi and the IP is correct. If this is your first time, you may need to accept the certificate first - open the Help tab for the fix.',
        commandFailed: 'The command did not go through. Open the Help tab for possible reasons.',
      },
      brandHints: {
        roku: '<strong>Roku:</strong> Settings &rarr; Network &rarr; About. Find the "IP address" (e.g. 192.168.1.50). Make sure "Control by mobile apps / Network access" is enabled in Settings &rarr; System &rarr; Advanced system settings.',
        samsung: '<strong>Samsung (Tizen):</strong> Settings &rarr; General &rarr; Network &rarr; Network Status, or Settings &rarr; Support &rarr; About This TV. On first use, an "Allow connection?" prompt will appear on the TV - accept it right away (within ~25 seconds).',
        lg: '<strong>LG (webOS):</strong> Settings &rarr; All Settings &rarr; Connection &rarr; Wi-Fi &rarr; select the connected network to see the IP. On first use, a "Connect?" prompt will appear on the TV - accept it right away.',
        devant: '<strong>Devant Smart TV (newer webOS / "STW" series):</strong> These run on the same webOS platform LG licenses, so setup is the same - enable "LG Connect Apps" / "Mobile TV On" in TV settings, then accept the "Connect?" prompt that appears on the TV screen. Older Devant models (VIDAA OS) or basic/non-smart sets are not supported.',
        sony: '<strong>Sony (Bravia / Android TV):</strong> Enable "IP Control" in Settings &rarr; Network &rarr; Home Network &rarr; IP Control &rarr; Authentication, set it to "Normal and Pre-Shared Key" and set a passcode (PSK) - enter the same PSK below. Find the IP under Settings &rarr; Network &rarr; Network Status.',
        panasonic: '<strong>Panasonic (Viera):</strong> Enable "TV Remote App" / "Network Control" in Settings &rarr; Network &rarr; Network Link Settings (or "TV Remote" in app settings). Find the IP under Settings &rarr; Network &rarr; Network Status.',
      },
    },
  };

  function getLang() {
    const stored = localStorage.getItem(LANG_KEY);
    return stored === 'en' || stored === 'fil' ? stored : DEFAULT_LANG;
  }

  function lookup(path, lang) {
    const dict = STRINGS[lang] || STRINGS[DEFAULT_LANG];
    let node = dict;
    for (const part of path.split('.')) {
      if (node == null) return undefined;
      node = node[part];
    }
    return node;
  }

  function t(path, vars) {
    let str = lookup(path, getLang());
    if (str === undefined) str = lookup(path, DEFAULT_LANG);
    if (str === undefined) return path;
    if (vars) {
      Object.keys(vars).forEach((key) => {
        str = str.replace(new RegExp('\\{' + key + '\\}', 'g'), vars[key]);
      });
    }
    return str;
  }

  function applyHtmlLang() {
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'fil-PH';
  }

  function applyTranslations() {
    applyHtmlLang();

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });

    const titleEl = document.querySelector('title');
    if (titleEl) titleEl.textContent = t('meta.title');
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', t('meta.description'));
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang === 'en' ? 'en' : 'fil');
    applyTranslations();
    document.dispatchEvent(new CustomEvent('pindottv:langchange', { detail: { lang: getLang() } }));
  }

  // Apply immediately - scripts run after the DOM body has been parsed.
  applyTranslations();

  return { getLang, setLang, t, applyTranslations };
})();
