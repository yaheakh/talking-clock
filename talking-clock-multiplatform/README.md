# Talking Clock — Web, Android & Android TV

This repo has everything needed to run the Talking Clock on Chrome
(Windows/Mac/Linux/Android) and as a real installable Android/Android TV
app, built automatically by GitHub — **no Android Studio required.**

```
.
├── talking-clock-pwa/          ← the web app (PWA) — open this directly, or host it
├── android/                    ← Android Studio project (WebView wrapper around the PWA)
└── .github/workflows/
    └── android-build.yml       ← builds the .apk automatically on GitHub's servers
```

The Android app is just the same PWA (`talking-clock-pwa/`, copied into
`android/app/src/main/assets/www/`) opened full-screen inside a WebView —
so any change you make to the web version, you re-copy into that assets
folder and rebuild, no separate app logic to maintain.

---

## 1. Running the web version (Chrome, any device)

Just open `talking-clock-pwa/index.html` in a browser — it works
immediately, no build step, no install.

**To get the "Install as app" prompt / offline caching to actually work**,
it needs to be served over `https://` (or `http://localhost`) — opening
the raw file with `file://` works fine for using the clock, but browsers
block service-worker registration (used for offline support) on `file://`.
Two easy ways to serve it properly:

- **GitHub Pages** (free, permanent link): in your GitHub repo settings →
  Pages → set the source folder to `talking-clock-pwa/`. You'll get a URL
  like `https://yourname.github.io/your-repo/` that works on any device,
  installable straight from Chrome's address bar (⊕ icon) or Android
  Chrome's "Add to Home screen".
- **Locally, for testing**: `npx serve talking-clock-pwa` then open the
  `http://localhost:...` link it prints.

## 2. Getting the Android/Android TV app WITHOUT installing Android Studio

1. Push this whole folder to a new GitHub repository (create a repo on
   GitHub, then `git init`, `git add .`, `git commit -m "init"`,
   `git remote add origin <your-repo-url>`, `git push -u origin main`).
2. Go to the **Actions** tab of your repo on GitHub. A workflow called
   **"Build Android APK"** runs automatically on every push (or click
   "Run workflow" to trigger it manually).
3. Once it finishes (green check, a few minutes), open that run and
   scroll down to **Artifacts** → download **talking-clock-debug-apk**.
   That's a `.zip` containing `app-debug.apk`.
4. Copy `app-debug.apk` to your Android phone, tablet, or Android TV
   (USB cable, Google Drive, `adb push`, a USB stick on the TV, etc.)
   and open it to install. Android will ask you to allow "install from
   unknown sources" the first time — that's expected for a
   non-Play-Store app.

That's it — the whole Android SDK/Gradle toolchain runs on GitHub's
servers; nothing to install on your own machine.

**Note:** this produces a *debug* APK, which is perfectly fine to install
and use yourself — it's just not signed for the Play Store. If you ever
want a proper signed release build (e.g. to publish it), that needs a
signing keystore, which is a separate, one-time step I can help set up
later.

## 3. If you ever do get Android Studio

Just open the `android/` folder as an existing project — Android Studio
will notice the Gradle wrapper isn't checked in and offer to generate it
automatically on first sync (this is normal and expected; I deliberately
left it out since it's a binary file GitHub Actions doesn't need — it
uses a plain `gradle` install instead).

## Known limitations, honestly

- **Multi-monitor picker, secondary-screen alerts, launch-at-startup,
  window drag/resize** — all removed. Those were Electron/desktop-window
  concepts that don't mean anything in a browser tab or a phone/TV app.
- **Global keyboard shortcuts** (Ctrl/Alt+T, Ctrl/Alt+S) now only work
  while the page/app is focused — a web page can't register a true
  OS-wide hotkey the way the desktop Electron app could.
- **Google Fonts** need an internet connection on first load in the
  Android app; after that the WebView caches them normally. The clock
  and all reminder/notification logic work fully offline regardless —
  fonts just fall back to the system default until they load.
- The Islamic-calendar Jordan holidays (Eid al-Fitr, Eid al-Adha, etc.)
  are hardcoded for 2026–2027 and will need updating in `app.js` /
  `talking-clock-desktop`'s equivalent file once official dates for
  later years are announced.
