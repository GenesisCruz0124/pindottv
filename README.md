# 📺 PindotTV

**Gawing remote control ang phone mo para sa Smart TV — gamit lang ang WiFi!**

PindotTV ay isang Progressive Web App (PWA) na nagpapahintulot sa iyong phone na kontrolin ang iyong Smart TV sa parehong WiFi network — walang kailangang i-download sa app store, browser lang!

🔗 **Live demo:** https://genesiscruz0124.github.io/pindottv/

> I-install sa home screen para mas mabilis gamitin (tingnan sa baba kung paano).

---

## ✨ Mga Feature

- **Manual IP setup** — i-type ang IP address ng TV mo (Settings → Network sa TV)
- **Roku ECP support** — pinaka-reliable, gamit ang Roku External Control Protocol (port 8060)
- **Samsung Tizen & LG webOS support** — gamit ang WebSocket remote APIs (may limitations - basahin ang "Paano Gumagana" sa app)
- **Full remote layout** — Power, Volume +/−, Mute, Channel +/−, D-pad with OK, Back, Home, Input, at Number Pad (0-9)
- **Dark theme**, malalaking buttons, **haptic feedback** (vibration) sa bawat pindot
- **Maramihang TV** — i-save ang mga TV mo (hal. "TV sa Sala", "TV sa Kwarto") at mag-quick-switch
- **Connection test** — berde/pula na indicator para malaman kung "online" ang TV
- **Installable PWA** — gumagana offline ang app shell, may custom "Add to Home Screen" prompt

---

## 📲 Paano I-install sa Phone

### Android (Chrome)
1. Buksan ang [live demo link](https://genesiscruz0124.github.io/pindottv/) sa Chrome.
2. Lalabas ang banner na "I-install ang PindotTV" — i-tap ang **"I-install"**.
3. Kung walang banner, i-tap ang **⋮ menu → "Add to Home screen" / "Install app"**.

### iPhone / iPad (Safari)
1. Buksan ang [live demo link](https://genesiscruz0124.github.io/pindottv/) sa Safari.
2. I-tap ang **Share button** (kahon na may pataas na arrow).
3. I-scroll pababa at piliin ang **"Add to Home Screen"**.
4. I-tap ang **"Add"**.

Lalabas na ang PindotTV icon sa home screen mo, parang totoong app!

---

## 📡 Suportadong TV Brands

| Brand | Status | Paliwanag |
|---|---|---|
| **Roku** (TV / Streaming Stick) | ✅ Pinaka-Reliable | Gamit ang Roku ECP (HTTP, port 8060) |
| **Samsung** Smart TV (Tizen, 2016+) | ⚠️ Limitado | WebSocket na may self-signed certificate — may extra steps |
| **LG** Smart TV (webOS) | ⚠️ Limitado | WebSocket pairing — kailangang tanggapin ang prompt sa TV |
| Non-Smart TV / walang WiFi | ❌ Hindi Suportado | Kailangan ng IR blaster, hindi kaya ng browser |

**Mahalaga:** Dahil naka-host sa HTTPS ang GitHub Pages pero karamihan sa mga TV ay HTTP/self-signed sa local network, posibleng harangin ng browser ang koneksyon ("Mixed Content" / certificate warning). Buksan ang **"Tulong" tab** sa app para sa kumpletong step-by-step na solusyon sa bawat brand.

---

## 🧰 Paggamit

1. Siguraduhing **same WiFi** ang phone mo at ang Smart TV.
2. Pumunta sa **"Mga TV"** tab → **"Magdagdag ng Bagong TV"**.
3. Pangalanan ang TV (hal. "TV sa Sala"), piliin ang brand, at i-type ang IP address.
4. I-save, tapos pumunta sa **"Remote"** tab at simulan na ang pagpindot!
5. Gamitin ang **"I-test"** button para tingnan kung naka-connect (berde = online, pula = offline).

---

## 📷 Screenshots

> _Palitan ang mga ito ng aktwal na screenshots ng app._

| Remote | Mga TV | Tulong |
|---|---|---|
| ![Remote view placeholder](docs/screenshot-remote.png) | ![Mga TV view placeholder](docs/screenshot-tvs.png) | ![Tulong view placeholder](docs/screenshot-help.png) |

---

## 🛠️ Tech Stack

- Vanilla **HTML, CSS, JavaScript** — walang framework, walang build step
- **Service Worker** para sa offline caching
- **Web App Manifest** para sa installability
- Deployed sa **GitHub Pages** gamit ang GitHub Actions (`.github/workflows/deploy.yml`)

### Local Development

Kailangan lang ng simpleng static server (para gumana nang tama ang service worker / fetch):

```bash
npx serve .
# o
python3 -m http.server 8080
```

Buksan ang `http://localhost:8080`.

---

## ⚠️ Honest Limitations (Mahalaga!)

- Phone at TV mo ay dapat **same WiFi network**.
- **Hindi gagana sa "dumb" TV** (walang Smart features / WiFi) — kailangan ng IR remote/blaster.
- Dahil HTTPS ang GitHub Pages, posibleng harangin ng browser ang HTTP (Roku) o self-signed WebSocket (Samsung/LG) connections — may workaround na nakadetalye sa **"Paano Gumagana"** tab ng app.
- Lahat ng data (pangalan at IP ng TV) ay naka-save lang **lokal sa device mo** (localStorage) — walang ipinapadalang impormasyon sa server.

---

## 📄 License

MIT
