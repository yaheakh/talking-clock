let settings = null;
let editingReminderId = null;
let bannerTimeout = null;
const activeFiringIds = new Set(); // reminder ids currently mid-pulse, so re-renders don't cut it short
const activeSoonIds = new Set();   // reminder ids currently showing the gentle "coming up" highlight

/* =========================================================
   LANGUAGE / i18n
   ========================================================= */
function isArabic() { return !!(settings && settings.language === 'ar'); }

const STRINGS = {
  tt_settings: { en: 'Settings', ar: 'الإعدادات' },
  tt_minimize: { en: 'Minimize', ar: 'تصغير' },
  tt_maximize: { en: 'Toggle fullscreen / windowed', ar: 'تبديل ملء الشاشة / نافذة' },
  tt_close: { en: 'Close', ar: 'إغلاق' },
  tt_fullscreen: { en: 'Toggle fullscreen', ar: 'تبديل ملء الشاشة' },
  keep_awake: { en: 'Keep the screen awake while this is open', ar: 'إبقاء الشاشة مضاءة طالما التطبيق مفتوح' },
  reminders_title: { en: "Today's Reminders", ar: 'تذكيرات اليوم' },
  tt_add_reminder: { en: 'Add a reminder', ar: 'إضافة تذكير' },
  tt_toggle_reminders: { en: 'Hide/show the reminders list', ar: 'إخفاء/إظهار قائمة التذكيرات' },
  banner_hint: { en: 'Click anywhere or press Esc to dismiss', ar: 'اضغط في أي مكان أو اضغط Esc للإغلاق' },
  settings_title: { en: 'Settings', ar: 'الإعدادات' },
  tt_back_to_clock: { en: 'Back to clock', ar: 'العودة للساعة' },
  tab_reminders: { en: 'Reminders', ar: 'التذكيرات' },
  tab_time_reminder: { en: 'Time Reminder', ar: 'تذكير الوقت' },
  tab_voice: { en: 'Voice', ar: 'الصوت' },
  tab_clock: { en: 'Clock & Display', ar: 'الساعة والعرض' },
  tab_others: { en: 'Others', ar: 'أخرى' },
  btn_add_reminder: { en: '+ Add Reminder', ar: '+ إضافة تذكير' },
  enable: { en: 'Enable', ar: 'تفعيل' },
  announce_interval: { en: 'Announce Interval', ar: 'فاصل الإعلان الصوتي' },
  minutes: { en: 'minutes', ar: 'دقيقة' },
  interval_hint: { en: 'Type any number of minutes (e.g. 10, 45, 90).', ar: 'اكتب أي عدد من الدقائق (مثلاً 10 أو 45 أو 90).' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  voice_announcement: { en: 'Voice Announcement', ar: 'إعلان صوتي' },
  system_notification: { en: 'System Notification', ar: 'إشعار النظام' },
  dnd: { en: 'Do Not Disturb', ar: 'عدم الإزعاج' },
  dnd_locked: { en: 'When the system is locked', ar: 'عند قفل النظام' },
  dnd_fullscreen: { en: 'When another app is in fullscreen', ar: 'عند تشغيل برنامج آخر بملء الشاشة' },
  dnd_media: { en: 'When playing audio/video', ar: 'عند تشغيل صوت أو فيديو' },
  reserved_future: { en: 'Reserved for a future update', ar: 'محجوز لتحديث لاحق' },
  voice_engine: { en: 'Voice Engine', ar: 'محرك الصوت' },
  voice_system: { en: 'System voice (offline, free)', ar: 'صوت النظام (بدون إنترنت، مجاني)' },
  voice_elevenlabs: { en: 'ElevenLabs (clearer, needs internet)', ar: 'ElevenLabs (أوضح، يحتاج إنترنت)' },
  system_voice: { en: 'System Voice', ar: 'صوت النظام' },
  rate: { en: 'Rate', ar: 'السرعة' },
  volume: { en: 'Volume', ar: 'مستوى الصوت' },
  el_api_key: { en: 'ElevenLabs API Key', ar: 'مفتاح API الخاص بـ ElevenLabs' },
  el_voice_id: { en: 'Voice ID', ar: 'معرّف الصوت' },
  el_model: { en: 'Model', ar: 'النموذج' },
  el_model_multi: { en: 'eleven_multilingual_v2 (supports Arabic)', ar: 'eleven_multilingual_v2 (يدعم العربية)' },
  el_model_turbo: { en: 'eleven_turbo_v2_5 (fast, multilingual)', ar: 'eleven_turbo_v2_5 (سريع، متعدد اللغات)' },
  el_model_mono: { en: 'eleven_monolingual_v1 (English only)', ar: 'eleven_monolingual_v1 (إنجليزي فقط)' },
  el_hint: { en: 'Get an API key and voice ID from elevenlabs.io — billed by ElevenLabs, not by this app.', ar: 'احصل على مفتاح API ومعرّف الصوت من elevenlabs.io — الفوترة من ElevenLabs مباشرة، وليس من هذا التطبيق.' },
  test_voice_placeholder: { en: 'Type text to test the voice...', ar: 'اكتب نصاً لتجربة الصوت...' },
  btn_test_voice: { en: 'Test Voice', ar: 'تجربة الصوت' },
  language: { en: 'Language', ar: 'اللغة' },
  lang_en: { en: 'English', ar: 'الإنجليزية (English)' },
  lang_ar: { en: 'العربية (Arabic)', ar: 'العربية' },
  fullscreen_display: { en: 'Fullscreen Display', ar: 'شاشة العرض الكامل' },
  fullscreen_display_hint: { en: 'Pick which monitor the clock takes over completely. Changing this moves the window immediately.', ar: 'اختر الشاشة التي تسيطر عليها الساعة بالكامل. تغيير هذا الخيار ينقل النافذة فوراً.' },
  color_theme: { en: 'Color Theme', ar: 'لون الثيم' },
  theme_aurora: { en: 'Aurora', ar: 'أورورا' },
  theme_cyan: { en: 'Neon Cyan', ar: 'سماوي نيون' },
  theme_amber: { en: 'Amber Night', ar: 'كهرماني ليلي' },
  theme_minimal: { en: 'Minimal Contrast', ar: 'تباين بسيط' },
  clock_type: { en: 'Clock Type', ar: 'نوع الساعة' },
  clock_digital: { en: 'Digital Clock', ar: 'ساعة رقمية' },
  clock_analog: { en: 'Analog Clock (coming soon)', ar: 'ساعة تناظرية (قريباً)' },
  display: { en: 'Display', ar: 'العرض' },
  display_seconds: { en: 'Display Seconds', ar: 'إظهار الثواني' },
  display_date: { en: 'Display Date & Calendar', ar: 'إظهار التاريخ والتقويم' },
  display_reminders: { en: "Display Today's Next Reminders", ar: 'إظهار تذكيرات اليوم القادمة' },
  display_holidays: { en: 'Display Holiday Calendar (Jordan)', ar: 'إظهار تقويم العطل الرسمية (الأردن)' },
  text_size: { en: 'Text Size', ar: 'حجم الخط' },
  hour_format: { en: 'Hour Format', ar: 'صيغة الوقت' },
  hour_12: { en: '12-hour', ar: '12 ساعة' },
  hour_24: { en: '24-hour', ar: '24 ساعة' },
  mute_all: { en: 'Mute all notifications and voices', ar: 'كتم كل الإشعارات والأصوات' },
  show_banner: { en: 'Show big attention banner when a reminder fires', ar: 'إظهار بانر كبير عند انطلاق تذكير' },
  secondary_screen: { en: 'Also show a small alert on other monitors (experimental)', ar: 'إظهار تنبيه صغير على الشاشات الأخرى (تجريبي)' },
  launch_startup: { en: 'Launch automatically when the computer starts', ar: 'التشغيل تلقائياً عند بدء تشغيل الجهاز' },
  pulse_intensity: { en: 'Attention Pulse Intensity', ar: 'شدة نبضة التنبيه' },
  pulse_intensity_hint: { en: "How strongly the screen pulses/flashes when a reminder or time announcement fires — useful if you're focused on a different monitor.", ar: 'مدى قوة نبض/وميض الشاشة عند انطلاق تذكير أو إعلان الوقت — مفيد لو كنت مركّز على شاشة ثانية.' },
  btn_test_pulse: { en: 'Test Pulse', ar: 'تجربة النبضة' },
  keyboard_shortcuts: { en: 'Keyboard Shortcuts', ar: 'اختصارات لوحة المفاتيح' },
  shortcut_time: { en: 'Ctrl/Cmd + Alt + T — Announce the current time', ar: 'Ctrl/Cmd + Alt + T — نطق الوقت الحالي' },
  shortcut_settings: { en: 'Ctrl/Cmd + Alt + S — Open/close Settings', ar: 'Ctrl/Cmd + Alt + S — فتح/إغلاق الإعدادات' },
  modal_add_title: { en: 'Add Reminder', ar: 'إضافة تذكير' },
  modal_edit_title: { en: 'Edit Reminder', ar: 'تعديل تذكير' },
  title_label: { en: 'Title', ar: 'العنوان' },
  title_placeholder: { en: 'e.g. Team meeting', ar: 'مثال: اجتماع الفريق' },
  title_error: { en: 'Please enter a title.', ar: 'الرجاء إدخال عنوان.' },
  time_label: { en: 'Time', ar: 'الوقت' },
  time_error: { en: 'Please pick a time.', ar: 'الرجاء اختيار وقت.' },
  repeat_on: { en: 'Repeat on', ar: 'يتكرر في' },
  day_sun: { en: 'Sun', ar: 'أحد' },
  day_mon: { en: 'Mon', ar: 'إثنين' },
  day_tue: { en: 'Tue', ar: 'ثلاثاء' },
  day_wed: { en: 'Wed', ar: 'أربعاء' },
  day_thu: { en: 'Thu', ar: 'خميس' },
  day_fri: { en: 'Fri', ar: 'جمعة' },
  day_sat: { en: 'Sat', ar: 'سبت' },
  notify_before: { en: 'Notify me a few minutes before', ar: 'نبّهني قبل بضع دقائق' },
  minutes_before: { en: 'minutes before', ar: 'دقيقة قبل الموعد' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  save: { en: 'Save', ar: 'حفظ' },
  no_reminders_today: { en: 'No reminders today', ar: 'لا توجد تذكيرات اليوم' },
  size_normal: { en: 'Normal', ar: 'عادي' },
  size_large: { en: 'Large (default)', ar: 'كبير (افتراضي)' },
  size_xlarge: { en: 'Extra Large', ar: 'كبير جداً' },
  pulse_light: { en: 'Light — subtle', ar: 'خفيف — هادئ' },
  pulse_medium: { en: 'Medium — clear', ar: 'متوسط — واضح' },
  pulse_strong: { en: 'Strong — grabs attention immediately', ar: 'قوي — يلفت الانتباه فوراً' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  test: { en: '🔔 Test', ar: '🔔 تجربة' },
  test_advance: { en: '⏱ Test advance', ar: '⏱ تجربة التنبيه المسبق' },
};

function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return isArabic() ? entry.ar : entry.en;
}

function applyLanguage() {
  const ar = isArabic();
  document.documentElement.lang = ar ? 'ar' : 'en';
  // Deliberately NOT setting a global dir="rtl" on <html> — that cascades
  // into every flex container's item order (corner controls, clock
  // layout, tabs, etc.) and also lets the Unicode bidi algorithm
  // re-shuffle the HH:MM:SS spans, which is exactly the "hours in the
  // middle" bug. Mirroring is instead done surgically: .lang-ar toggles
  // specific, hand-picked CSS rules (see widget.css) for the corner
  // window controls, while the clock itself is pinned to strict
  // left-to-right everywhere, in every language.
  document.body.classList.toggle('lang-ar', ar);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
}

/* =========================================================
   SETTINGS PERSISTENCE — localStorage instead of a main-process file
   (this build has no Electron/Node backend; everything runs in one page)
   ========================================================= */
const LOCAL_STORAGE_KEY = 'talkingClockSettings';

const DEFAULT_SETTINGS = {
  language: 'en',
  reminders: [
    { id: 'r1', title: 'Morning stand-up', time: '10:00', days: [0,1,2,3,4,5,6], enabled: true },
    { id: 'r2', title: 'Check the news', time: '15:00', days: [1,2,3,4,5], enabled: true },
    { id: 'r3', title: 'Team meeting', time: '16:20', days: [1,2,3,4,5], enabled: true },
    { id: 'r4', title: 'Evening walk', time: '21:30', days: [0,1,2,3,4,5,6], enabled: true }
  ],
  timeReminder: {
    enabled: true,
    intervalMinutes: 30,
    voiceAnnouncement: true,
    systemNotification: false,
    dnd: { whenLocked: false, whenFullscreen: false, whenMediaPlaying: false }
  },
  tts: {
    engine: 'system',
    rate: 1,
    volume: 1,
    voiceName: '',
    elevenlabs: { apiKey: '', voiceId: '', modelId: 'eleven_multilingual_v2' }
  },
  clock: {
    type: 'digital',
    showSeconds: true,
    showDate: true,
    showReminders: true,
    showHolidays: true,
    hourFormat: 24,
    textSize: 'large',
    theme: 'aurora'
  },
  others: {
    mute: false,
    fullscreenFlashOnReminders: true,
    pulseIntensity: 'strong',
    wakeLock: true
  }
};

function deepMergeSettings(base, override) {
  if (Array.isArray(override)) return override;
  if (typeof override !== 'object' || override === null) return override ?? base;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      out[key] = deepMergeSettings(base[key], override[key]);
    } else {
      out[key] = override[key];
    }
  }
  return out;
}

function loadSettingsLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    return deepMergeSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), JSON.parse(raw));
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
}
function saveSettingsLocal(s) {
  try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(s)); } catch (e) { /* storage full/blocked — ignore */ }
}

/* =========================================================
   SCHEDULER — ported from the desktop app's main.js. There's no
   separate main process here, so this just runs as a second
   1-second interval alongside the clock's own render tick.
   ========================================================= */
let firedThisMinuteKeys = new Set();
let lastMinuteMark = '';

function dayAbbrev(list) {
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  if (!list || list.length === 7) return 'Every day';
  return 'Every week on ' + list.map(d => names[d]).join(', ');
}

function notify(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try { new Notification(title, { body }); } catch (e) { /* ignore */ }
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') { try { new Notification(title, { body }); } catch (e) { /* ignore */ } }
    });
  }
}

async function fireCustomReminder(reminder) {
  if (settings.others.mute) return;
  notify(reminder.title, `${dayAbbrev(reminder.days)} at ${reminder.time}`);
  handleSpeak(reminder.title);
  handleReminderPulse({
    id: reminder.id,
    title: reminder.title,
    showBanner: !!settings.others.fullscreenFlashOnReminders
  });
}

function fireAdvanceNotice(reminder, minutesBefore) {
  if (settings.others.mute) return;
  const text = `${reminder.title} in ${minutesBefore} minute${minutesBefore === 1 ? '' : 's'}`;
  notify('Coming up', text);
  handleSpeak(text);
  handleReminderAdvance({ id: reminder.id });
}

const WEEK_MINUTES = 7 * 1440;
function isAdvanceNoticeDue(reminder, now) {
  const adv = reminder.advanceNotice;
  if (!adv || !adv.enabled) return false;
  const minutesBefore = Math.max(1, Math.min(180, adv.minutesBefore || 5));

  const [rh, rm] = reminder.time.split(':').map(Number);
  const reminderMinutesOfDay = rh * 60 + rm;
  const days = (reminder.days && reminder.days.length) ? reminder.days : [0,1,2,3,4,5,6];
  const currentWeekMinute = now.getDay() * 1440 + now.getHours() * 60 + now.getMinutes();

  for (const d of days) {
    const weekMinute = d * 1440 + reminderMinutesOfDay;
    const advanceWeekMinute = (weekMinute - minutesBefore + WEEK_MINUTES) % WEEK_MINUTES;
    if (advanceWeekMinute === currentWeekMinute) return true;
  }
  return false;
}

function firePeriodicTimeAnnouncement(now) {
  if (settings.others.mute) return;
  if (!settings.timeReminder.enabled) return;

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  if (settings.timeReminder.voiceAnnouncement) {
    handleSpeak(`The time is ${window.formatSpokenTime(now)}`);
    handleTimeAnnouncing();
  }
  if (settings.timeReminder.systemNotification) {
    notify('Talking Clock', `${hh}:${mm}`);
  }
}

function schedulerTick() {
  if (!settings) return;
  const now = new Date();
  const minuteKey = `${now.getHours()}:${now.getMinutes()}`;
  if (minuteKey !== lastMinuteMark) {
    lastMinuteMark = minuteKey;
    firedThisMinuteKeys.clear();
  }

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const hhmm = `${hh}:${mm}`;
  const dow = now.getDay();

  for (const r of settings.reminders) {
    if (!r.enabled) continue;

    if (r.time === hhmm && (!r.days || !r.days.length || r.days.includes(dow))) {
      const key = 'custom:' + r.id;
      if (!firedThisMinuteKeys.has(key)) { firedThisMinuteKeys.add(key); fireCustomReminder(r); }
    }
    if (isAdvanceNoticeDue(r, now)) {
      const advKey = 'advance:' + r.id;
      if (!firedThisMinuteKeys.has(advKey)) {
        firedThisMinuteKeys.add(advKey);
        fireAdvanceNotice(r, Math.max(1, Math.min(180, r.advanceNotice.minutesBefore || 5)));
      }
    }
  }

  if (now.getSeconds() === 0) {
    const interval = Math.max(1, Math.min(1440, settings.timeReminder.intervalMinutes || 30));
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    if (totalMinutes % interval === 0) {
      const key = 'periodic:' + hhmm;
      if (!firedThisMinuteKeys.has(key)) { firedThisMinuteKeys.add(key); firePeriodicTimeAnnouncement(now); }
    }
  }
}

/* =========================================================
   SETTINGS OVERLAY (floats centered above the fullscreen clock)
   ========================================================= */
const settingsView = document.getElementById('settingsView');
const gearBtn = document.getElementById('gear');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');

function showSettings() { settingsView.classList.remove('hidden'); }
function hideSettings() { settingsView.classList.add('hidden'); }
function toggleSettings() {
  if (settingsView.classList.contains('hidden')) showSettings();
  else hideSettings();
}

gearBtn.addEventListener('click', toggleSettings);
settingsCloseBtn.addEventListener('click', hideSettings);

// Fullscreen here is the browser's own Fullscreen API (F11-equivalent) —
// there's no separate "windowed vs fullscreen app window" concept like in
// the desktop version, since this just runs inside a normal browser tab.
function updateFullscreenIcon() {
  const isFs = !!document.fullscreenElement;
  fullscreenBtn.textContent = isFs ? '🗗' : '⛶';
}
fullscreenBtn.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (e) { /* fullscreen not available/allowed here — ignore */ }
});
document.addEventListener('fullscreenchange', updateFullscreenIcon);

// Page-level keyboard shortcuts (work while this tab/page has focus —
// a real browser tab can't register a true OS-wide global shortcut the
// way the desktop app's Ctrl/Cmd+Alt+T did).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!settingsView.classList.contains('hidden')) hideSettings();
    dismissBanner();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 't') {
    const now = new Date();
    handleSpeak(`The time is ${window.formatSpokenTime(now)}`);
    handleTimeAnnouncing();
  }
  if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 's') {
    toggleSettings();
  }
});

// clicking the dark backdrop (outside the panel) also closes settings
settingsView.addEventListener('click', (e) => {
  if (e.target === settingsView) hideSettings();
});

/* =========================================================
   SCREEN WAKE LOCK — keeps the display from sleeping while the clock
   is open (this app IS the screensaver, so dimming/locking defeats the
   whole point, especially on a TV or tablet mounted on a wall).
   ========================================================= */
let wakeLockSentinel = null;
async function requestWakeLock() {
  if (!settings || !settings.others.wakeLock) return;
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => { wakeLockSentinel = null; });
  } catch (e) { /* denied or unsupported on this device — ignore */ }
}
function releaseWakeLock() {
  if (wakeLockSentinel) { wakeLockSentinel.release().catch(() => {}); wakeLockSentinel = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && settings && settings.others.wakeLock) requestWakeLock();
});

/* =========================================================
   CLOCK VIEW
   ========================================================= */
const clockStage = document.getElementById('clockView');
const timeEl = document.getElementById('time');
const mcHeaderEl = document.getElementById('mcHeader');
const remindersList = document.getElementById('reminders-list');
const pulseFlash = document.getElementById('pulseFlash');

const dayNamesFull = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatTime(now) {
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  let suffix = '';
  if (settings && settings.clock.hourFormat === 12) {
    suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
  }
  const hh = String(h).padStart(2, '0');
  const showSeconds = !settings || settings.clock.showSeconds !== false;
  return { hh, m, s, suffix, showSeconds };
}

function renderTime(now) {
  const { hh, m, s, suffix, showSeconds } = formatTime(now);
  let html = `<span class="t-hh">${hh}</span><span class="t-colon t-colon-1">:</span><span class="t-mm">${m}</span>`;
  if (showSeconds) {
    html += `<span class="t-colon t-colon-2">:</span><span class="t-ss" id="tSeconds">${s}</span>`;
  }
  if (suffix) {
    // Kept in English on purpose, even in Arabic mode (per explicit
    // preference) — only the surrounding UI text is translated.
    html += `<span class="t-suffix ${suffix.toLowerCase()}">${suffix}</span>`;
  }
  timeEl.innerHTML = html;

  // a tiny per-second "tick" so the seconds digit feels alive, not just colored
  if (showSeconds) {
    const secEl = document.getElementById('tSeconds');
    if (secEl) {
      secEl.classList.remove('tick');
      void secEl.offsetWidth;
      secEl.classList.add('tick');
    }
  }
}

const monthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function monthNames() { return isArabic() ? monthNamesAr : monthNamesEn; }

function renderCalendarHeader(now) {
  if (!mcHeaderEl) return;
  // Weekday + day number already live inside the highlighted circle in
  // the week strip right below — showing them again here would just be
  // the same information twice, so the header now only carries what
  // the week strip doesn't: month and year.
  mcHeaderEl.textContent = `${monthNames()[now.getMonth()]} ${now.getFullYear()}`;
}

/* =========================================================
   HOLIDAY CALENDAR — mini week strip + next official Jordan public
   holiday, shown alongside the clock. Islamic-calendar holidays (Eid
   al-Fitr, Eid al-Adha, Islamic New Year, the Prophet's Birthday) shift
   every year based on moon sightings, so they're looked up from a
   per-year table below rather than computed — extend JORDAN_HOLIDAYS
   with a new year's dates once they're officially announced/published.
   ========================================================= */
const dayNamesShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dayNamesShortAr = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

function isSameYMD(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Official Jordan public holidays. Fixed-date and multi-day Eid/holiday
// blocks are expanded into one entry per calendar day so "is today a
// holiday" and the week-strip dot both just do a plain date lookup.
// { date: 'YYYY-MM-DD', name: { en, ar } }
const JORDAN_HOLIDAYS = [
  // ---- 2026 ----
  { date: '2026-01-01', name: { en: "New Year's Day", ar: 'رأس السنة الميلادية' } },
  { date: '2026-03-20', name: { en: 'Eid al-Fitr', ar: 'عيد الفطر' } },
  { date: '2026-03-21', name: { en: 'Eid al-Fitr Holiday', ar: 'عطلة عيد الفطر' } },
  { date: '2026-03-22', name: { en: 'Eid al-Fitr Holiday', ar: 'عطلة عيد الفطر' } },
  { date: '2026-03-23', name: { en: 'Eid al-Fitr Holiday', ar: 'عطلة عيد الفطر' } },
  { date: '2026-05-01', name: { en: 'Labour Day', ar: 'عيد العمال' } },
  { date: '2026-05-25', name: { en: 'Independence Day', ar: 'عيد الاستقلال' } },
  { date: '2026-05-26', name: { en: 'Arafat Day', ar: 'يوم عرفة' } },
  { date: '2026-05-27', name: { en: 'Eid al-Adha', ar: 'عيد الأضحى' } },
  { date: '2026-05-28', name: { en: 'Eid al-Adha Holiday', ar: 'عطلة عيد الأضحى' } },
  { date: '2026-05-29', name: { en: 'Eid al-Adha Holiday', ar: 'عطلة عيد الأضحى' } },
  { date: '2026-05-30', name: { en: 'Eid al-Adha Holiday', ar: 'عطلة عيد الأضحى' } },
  { date: '2026-06-16', name: { en: 'Islamic New Year', ar: 'رأس السنة الهجرية' } },
  { date: '2026-08-25', name: { en: "Prophet Muhammad's Birthday", ar: 'المولد النبوي الشريف' } },
  { date: '2026-12-25', name: { en: 'Christmas Day', ar: 'عيد الميلاد المجيد' } },
  // ---- 2027 (Islamic dates tentative, pending moon-sighting confirmation) ----
  { date: '2027-01-01', name: { en: "New Year's Day", ar: 'رأس السنة الميلادية' } },
  { date: '2027-03-09', name: { en: 'Eid al-Fitr', ar: 'عيد الفطر' } },
  { date: '2027-03-10', name: { en: 'Eid al-Fitr Holiday', ar: 'عطلة عيد الفطر' } },
  { date: '2027-03-11', name: { en: 'Eid al-Fitr Holiday', ar: 'عطلة عيد الفطر' } },
  { date: '2027-03-12', name: { en: 'Eid al-Fitr Holiday', ar: 'عطلة عيد الفطر' } },
  { date: '2027-05-01', name: { en: 'Labour Day', ar: 'عيد العمال' } },
  { date: '2027-05-15', name: { en: 'Arafat Day', ar: 'يوم عرفة' } },
  { date: '2027-05-16', name: { en: 'Eid al-Adha', ar: 'عيد الأضحى' } },
  { date: '2027-05-17', name: { en: 'Eid al-Adha Holiday', ar: 'عطلة عيد الأضحى' } },
  { date: '2027-05-18', name: { en: 'Eid al-Adha Holiday', ar: 'عطلة عيد الأضحى' } },
  { date: '2027-05-19', name: { en: 'Eid al-Adha Holiday', ar: 'عطلة عيد الأضحى' } },
  { date: '2027-05-25', name: { en: 'Independence Day', ar: 'عيد الاستقلال' } },
  { date: '2027-06-06', name: { en: 'Islamic New Year', ar: 'رأس السنة الهجرية' } },
  { date: '2027-08-14', name: { en: "Prophet Muhammad's Birthday", ar: 'المولد النبوي الشريف' } },
  { date: '2027-12-25', name: { en: 'Christmas Day', ar: 'عيد الميلاد المجيد' } },
];

function dateKeyOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function holidayOn(d) {
  const key = dateKeyOf(d);
  return JORDAN_HOLIDAYS.find(h => h.date === key) || null;
}

function nextJordanHoliday(now) {
  const todayKey = dateKeyOf(now);
  const todayHoliday = holidayOn(now);
  const upcoming = JORDAN_HOLIDAYS.find(h => h.date > todayKey);
  return { todayHoliday, upcoming: upcoming ? { name: upcoming.name, date: new Date(upcoming.date + 'T00:00:00') } : null };
}

function renderWeekStrip(now) {
  const el = document.getElementById('weekStrip');
  if (!el) return;
  const names = isArabic() ? dayNamesShortAr : dayNamesShort;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const isToday = isSameYMD(d, now);
    const hasHoliday = !!holidayOn(d);
    html += `<div class="week-cell${isToday ? ' today' : ''}${hasHoliday ? ' has-holiday' : ''}">
      <span class="wc-dow">${names[d.getDay()]}</span>
      <span class="wc-day">${d.getDate()}</span>
    </div>`;
  }
  el.innerHTML = html;
}

function renderHolidayLine(now) {
  const el = document.getElementById('holidayLine');
  if (!el) return;
  const { todayHoliday, upcoming } = nextJordanHoliday(now);
  const lang = isArabic() ? 'ar' : 'en';
  const fmt = d => d.toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  if (todayHoliday) {
    el.className = 'holiday-line is-holiday-today';
    el.innerHTML = isArabic()
      ? `عطلة رسمية اليوم — <span class="hl-name">${todayHoliday.name.ar}</span>`
      : `Official holiday today — <span class="hl-name">${todayHoliday.name.en}</span>`;
    return;
  }

  el.className = 'holiday-line';
  if (!upcoming) {
    el.innerHTML = isArabic() ? 'لا توجد عطلة رسمية قادمة ضمن البيانات المتوفرة' : 'No upcoming holiday found in the current data';
    return;
  }
  const msPerDay = 86400000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAway = Math.round((upcoming.date - startOfToday) / msPerDay);
  const name = isArabic() ? upcoming.name.ar : upcoming.name.en;

  if (isArabic()) {
    const inDays = daysAway === 0 ? 'اليوم' : daysAway === 1 ? 'غداً' : `خلال ${daysAway} يوم`;
    el.innerHTML = `العطلة الرسمية القادمة: <span class="hl-name">${name}</span> — ${fmt(upcoming.date)} (${inDays})`;
  } else {
    const inDays = daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`;
    el.innerHTML = `Next official holiday: <span class="hl-name">${name}</span> — ${fmt(upcoming.date)} (${inDays})`;
  }
}

let lastHolidayRenderMinute = null;
function renderHolidayCalendar(now) {
  const panel = document.getElementById('holidayCalendar');
  if (!panel) return;
  const showDate = !settings || settings.clock.showDate !== false;

  panel.style.display = showDate ? '' : 'none';
  if (mcHeaderEl) mcHeaderEl.style.display = showDate ? '' : 'none';
  const weekStripEl = document.getElementById('weekStrip');
  if (weekStripEl) weekStripEl.style.display = showDate ? '' : 'none';
  const holidayLineEl = document.getElementById('holidayLine');
  if (holidayLineEl) holidayLineEl.style.display = showDate ? '' : 'none';
  const timeDateDivider = document.getElementById('timeDateDivider');
  if (timeDateDivider) timeDateDivider.style.display = showDate ? '' : 'none';

  if (!showDate) return;
  // The header/week strip/holiday line only change once a day (or on a
  // language switch) — no need to redo any of this work every second.
  if (lastHolidayRenderMinute === now.getMinutes() && panel.dataset.day === String(now.getDate()) && panel.dataset.lang === (settings.language || 'en')) return;
  lastHolidayRenderMinute = now.getMinutes();
  panel.dataset.day = String(now.getDate());
  panel.dataset.lang = settings.language || 'en';
  renderCalendarHeader(now);
  renderWeekStrip(now);
  renderHolidayLine(now);
}

function renderUpcomingReminders(now) {
  remindersList.innerHTML = '';
  if (!settings || !settings.clock.showReminders) return;

  const dow = now.getDay();
  const nowHHMM = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Show ALL of today's reminders (past + upcoming), not just the ones still
  // ahead — each one is color-coded by status so you can see at a glance
  // what already fired and what's still coming.
  const todays = (settings.reminders || [])
    .filter(r => r.enabled)
    .filter(r => !r.days || !r.days.length || r.days.includes(dow))
    .sort((a, b) => a.time.localeCompare(b.time));

  if (todays.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = t('no_reminders_today');
    remindersList.appendChild(li);
    return;
  }

  for (const r of todays) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="rem-row">
        <span class="rem-time">${escapeHtml(r.time)}</span><span class="rem-title">${escapeHtml(r.title)}</span>
      </span>
      <button class="rem-edit-btn" data-id="${r.id}" title="Edit this reminder" aria-label="Edit this reminder">✎</button>`;
    li.dataset.reminderId = r.id;
    li.className = r.time < nowHHMM ? 'done' : (r.time > nowHHMM ? 'upcoming' : 'upcoming');
    // Re-apply an in-progress pulse/highlight across ticks so a fast
    // re-render never cuts the animation short.
    if (activeFiringIds.has(r.id)) li.classList.add('firing');
    if (activeSoonIds.has(r.id)) li.classList.add('soon');
    remindersList.appendChild(li);
  }

  remindersList.querySelectorAll('.rem-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(btn.dataset.id);
    });
  });
}

function applyTheme() {
  if (!settings) return;
  document.body.className = document.body.className
    .split(' ')
    .filter(c => !c.startsWith('theme-') && !c.startsWith('intensity-'))
    .concat(['theme-' + (settings.clock.theme || 'aurora'), 'intensity-' + (settings.others.pulseIntensity || 'strong')])
    .join(' ');
}

function applyClockVisibility() {
  if (!settings) return;
  renderHolidayCalendar(new Date());
  const showReminders = settings.clock.showReminders !== false;
  document.getElementById('remindersPanel').style.display = showReminders ? 'flex' : 'none';
  const divider = document.getElementById('stageDivider');
  if (divider) divider.style.display = showReminders ? 'block' : 'none';
  clockStage.className = 'clock-stage size-' + (settings.clock.textSize || 'large');
  applyTheme();
}

/* ---------- Reminders column fold/unfold — click the divider to hide the
   list and reclaim the space for the clock, click again to bring it
   back. Deliberately session-only (a plain JS variable, never saved to
   settings): every fresh launch always starts with the list shown. ---------- */
let remindersCollapsed = false;
function applyRemindersCollapse() {
  const panel = document.getElementById('remindersPanel');
  const arrow = document.getElementById('dividerArrow');
  if (!panel) return;
  panel.classList.toggle('collapsed', remindersCollapsed);
  if (arrow) arrow.textContent = remindersCollapsed ? '›' : '‹';
}
document.getElementById('stageDivider').addEventListener('click', () => {
  remindersCollapsed = !remindersCollapsed;
  applyRemindersCollapse();
});

function tickClock() {
  const now = new Date();
  renderTime(now);
  renderUpcomingReminders(now);
  renderHolidayCalendar(now);
}

/* =========================================================
   ATTENTION PULSE EFFECTS
   ========================================================= */
function triggerElementPulse(el) {
  if (!el) return;
  el.classList.remove('pulsing');
  // force reflow so the animation can restart if it's still running
  void el.offsetWidth;
  el.classList.add('pulsing');
  el.addEventListener('animationend', () => el.classList.remove('pulsing'), { once: true });
}

function triggerScreenFlash() {
  pulseFlash.classList.remove('active');
  void pulseFlash.offsetWidth;
  pulseFlash.classList.add('active');
  pulseFlash.addEventListener('animationend', () => pulseFlash.classList.remove('active'), { once: true });
}

function handleTimeAnnouncing() {
  triggerElementPulse(timeEl);
  triggerScreenFlash();
}

/* =========================================================
   REMINDER ATTENTION BANNER
   ========================================================= */
const reminderBanner = document.getElementById('reminderBanner');
const reminderBannerTitle = document.getElementById('reminderBannerTitle');

function showBanner(title) {
  reminderBannerTitle.textContent = title;
  reminderBanner.classList.add('show');
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(dismissBanner, 8000);
}
function dismissBanner() {
  reminderBanner.classList.remove('show');
  clearTimeout(bannerTimeout);
}
reminderBanner.addEventListener('click', dismissBanner);

function handleReminderPulse({ id, title, showBanner: shouldShowBanner }) {
  triggerScreenFlash();

  activeFiringIds.add(id);
  const li = remindersList.querySelector(`li[data-reminder-id="${CSS.escape(id)}"]`);
  if (li) { triggerElementPulse(li); li.classList.add('firing'); }
  setTimeout(() => {
    activeFiringIds.delete(id);
    const el = remindersList.querySelector(`li[data-reminder-id="${CSS.escape(id)}"]`);
    if (el) el.classList.remove('firing');
  }, 4000);

  if (shouldShowBanner) showBanner(title);
}

// Advance notice ("X minutes before") — a gentle amber highlight only,
// deliberately lighter than the strong pulse reserved for the exact firing.
function handleReminderAdvance({ id }) {
  activeSoonIds.add(id);
  const li = remindersList.querySelector(`li[data-reminder-id="${CSS.escape(id)}"]`);
  if (li) li.classList.add('soon');
  setTimeout(() => {
    activeSoonIds.delete(id);
    const el = remindersList.querySelector(`li[data-reminder-id="${CSS.escape(id)}"]`);
    if (el) el.classList.remove('soon');
  }, 6000);
}

/* =========================================================
   SETTINGS TABS
   ========================================================= */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

async function persist() {
  saveSettingsLocal(settings);
  applyClockVisibility();
}

// ---------- Custom Reminders ----------
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const dayNamesArShort = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

function formatRecurrence(r) {
  const names = isArabic() ? dayNamesArShort : dayNames;
  if (isArabic()) {
    const base = (!r.days || r.days.length === 7)
      ? `كل يوم في ${r.time}`
      : `كل أسبوع في ${[...r.days].sort().map(d => names[d]).join('، ')} الساعة ${r.time}`;
    if (r.advanceNotice && r.advanceNotice.enabled) {
      return `${base} • تنبيه قبل ${r.advanceNotice.minutesBefore} دقيقة`;
    }
    return base;
  }
  const base = (!r.days || r.days.length === 7)
    ? `Every day at ${r.time}`
    : `Every week on ${[...r.days].sort().map(d => names[d]).join(', ')} at ${r.time}`;
  if (r.advanceNotice && r.advanceNotice.enabled) {
    return `${base} • notifies ${r.advanceNotice.minutesBefore} min before`;
  }
  return base;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderReminders() {
  const container = document.getElementById('remindersContainer');
  container.innerHTML = '';
  // Always display sorted by time, ascending — regardless of the order
  // reminders were originally added in.
  const sorted = [...settings.reminders].sort((a, b) => a.time.localeCompare(b.time));
  for (const r of sorted) {
    const row = document.createElement('div');
    row.className = 'reminder-item';
    row.innerHTML = `
      <div class="reminder-main">
        <div class="title">${escapeHtml(r.title)}</div>
        <div class="sub">${formatRecurrence(r)}</div>
      </div>
      <div class="reminder-actions">
        <span class="toggle"><input type="checkbox" ${r.enabled ? 'checked' : ''} data-action="toggle" data-id="${r.id}"><span class="slider"></span></span>
        <button class="btn" data-action="test" data-id="${r.id}" title="${isArabic() ? 'معاينة التنبيه بالضبط كما سيعمل — صوت، بانر، وميض شاشة وتوهج بالقائمة' : 'Preview the alert exactly as it will fire — voice, banner, screen flash and list glow'}">${t('test')}</button>
        ${r.advanceNotice && r.advanceNotice.enabled
          ? `<button class="btn" data-action="test-advance" data-id="${r.id}" title="${isArabic() ? 'معاينة التنبيه المسبق' : 'Preview the advance notice'}">${t('test_advance')}</button>`
          : ''}
        <button class="btn" data-action="edit" data-id="${r.id}">${t('edit')}</button>
        <button class="btn danger" data-action="delete" data-id="${r.id}">${t('delete')}</button>
      </div>`;
    container.appendChild(row);
  }

  container.querySelectorAll('[data-action="toggle"]').forEach(el => {
    el.addEventListener('change', async () => {
      const r = settings.reminders.find(x => x.id === el.dataset.id);
      r.enabled = el.checked;
      await persist();
    });
  });
  container.querySelectorAll('[data-action="test"]').forEach(el => {
    el.addEventListener('click', async () => {
      const r = settings.reminders.find(x => x.id === el.dataset.id);
      if (!r) return;
      el.disabled = true;
      const original = el.textContent;
      el.textContent = isArabic() ? '🔔 يعمل الآن…' : '🔔 Firing…';
      await fireCustomReminder(r);
      setTimeout(() => { el.disabled = false; el.textContent = original; }, 1200);
    });
  });
  container.querySelectorAll('[data-action="test-advance"]').forEach(el => {
    el.addEventListener('click', async () => {
      const r = settings.reminders.find(x => x.id === el.dataset.id);
      if (!r) return;
      el.disabled = true;
      const original = el.textContent;
      el.textContent = isArabic() ? '⏱ يعمل الآن…' : '⏱ Firing…';
      await fireAdvanceNotice(r, (r.advanceNotice && r.advanceNotice.minutesBefore) || 5);
      setTimeout(() => { el.disabled = false; el.textContent = original; }, 1200);
    });
  });
  container.querySelectorAll('[data-action="edit"]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.id));
  });
  container.querySelectorAll('[data-action="delete"]').forEach(el => {
    el.addEventListener('click', async () => {
      settings.reminders = settings.reminders.filter(x => x.id !== el.dataset.id);
      await persist();
      renderReminders();
      renderUpcomingReminders(new Date());
    });
  });
}

document.getElementById('addReminderBtn').addEventListener('click', () => openModal(null));
document.getElementById('quickAddReminderBtn').addEventListener('click', () => openModal(null));

function clearModalErrors() {
  document.getElementById('m-title').classList.remove('input-error');
  document.getElementById('m-time').classList.remove('input-error');
  document.getElementById('m-title-error').classList.remove('show');
  document.getElementById('m-time-error').classList.remove('show');
}

function openModal(id) {
  editingReminderId = id;
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const mTitle = document.getElementById('m-title');
  const mTime = document.getElementById('m-time');
  const mEnabled = document.getElementById('m-enabled');
  const mAdvanceEnabled = document.getElementById('m-advance-enabled');
  const mAdvanceMinutes = document.getElementById('m-advance-minutes');
  const mAdvanceMinutesRow = document.getElementById('m-advance-minutes-row');
  const dayBoxes = document.querySelectorAll('#m-days input[type=checkbox]');

  clearModalErrors();

  if (id) {
    const r = settings.reminders.find(x => x.id === id);
    title.textContent = t('modal_edit_title');
    mTitle.value = r.title;
    mTime.value = r.time;
    mEnabled.checked = r.enabled;
    dayBoxes.forEach(cb => cb.checked = r.days.includes(Number(cb.value)));
    const adv = r.advanceNotice || { enabled: false, minutesBefore: 5 };
    mAdvanceEnabled.checked = !!adv.enabled;
    mAdvanceMinutes.value = adv.minutesBefore || 5;
  } else {
    title.textContent = t('modal_add_title');
    mTitle.value = '';
    mTime.value = '09:00';
    mEnabled.checked = true;
    dayBoxes.forEach(cb => cb.checked = true);
    mAdvanceEnabled.checked = false; // off by default, per-reminder opt-in
    mAdvanceMinutes.value = 5;
  }
  mAdvanceMinutesRow.style.display = mAdvanceEnabled.checked ? 'flex' : 'none';
  overlay.classList.add('open');
  mTitle.focus();
}

document.getElementById('m-advance-enabled').addEventListener('change', (e) => {
  document.getElementById('m-advance-minutes-row').style.display = e.target.checked ? 'flex' : 'none';
});

document.getElementById('m-cancel').addEventListener('click', () => {
  document.getElementById('modalOverlay').classList.remove('open');
});

document.getElementById('m-save').addEventListener('click', async () => {
  const mTitleInput = document.getElementById('m-title');
  const mTimeInput = document.getElementById('m-time');
  const mTitle = mTitleInput.value.trim();
  const mTime = mTimeInput.value;
  const mEnabled = document.getElementById('m-enabled').checked;
  const days = Array.from(document.querySelectorAll('#m-days input[type=checkbox]'))
    .filter(cb => cb.checked).map(cb => Number(cb.value));

  const advanceEnabled = document.getElementById('m-advance-enabled').checked;
  let advanceMinutes = parseInt(document.getElementById('m-advance-minutes').value, 10);
  if (isNaN(advanceMinutes) || advanceMinutes < 1) advanceMinutes = 1;
  if (advanceMinutes > 180) advanceMinutes = 180;
  const advanceNotice = { enabled: advanceEnabled, minutesBefore: advanceMinutes };

  clearModalErrors();
  let hasError = false;
  if (!mTitle) {
    mTitleInput.classList.add('input-error');
    document.getElementById('m-title-error').classList.add('show');
    hasError = true;
  }
  if (!mTime) {
    mTimeInput.classList.add('input-error');
    document.getElementById('m-time-error').classList.add('show');
    hasError = true;
  }
  if (hasError) {
    (mTitle ? mTimeInput : mTitleInput).focus();
    return;
  }

  if (editingReminderId) {
    const r = settings.reminders.find(x => x.id === editingReminderId);
    r.title = mTitle; r.time = mTime; r.enabled = mEnabled; r.days = days;
    r.advanceNotice = advanceNotice;
  } else {
    settings.reminders.push({
      id: 'r' + Date.now(),
      title: mTitle, time: mTime, enabled: mEnabled, days,
      advanceNotice
    });
  }
  await persist();
  renderReminders();
  renderUpcomingReminders(new Date());
  document.getElementById('modalOverlay').classList.remove('open');
});

// ---------- Time Reminder: custom interval (any number of minutes) ----------
function bindIntervalInput() {
  const input = document.getElementById('intervalMinutesInput');
  input.value = settings.timeReminder.intervalMinutes || 30;
  input.addEventListener('change', async () => {
    let val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 1440) val = 1440;
    input.value = val;
    settings.timeReminder.intervalMinutes = val;
    await persist();
  });
}

// ---------- Text size ----------
const sizeChoices = [
  { value: 'normal', key: 'size_normal' },
  { value: 'large', key: 'size_large' },
  { value: 'xlarge', key: 'size_xlarge' }
];

function renderSizeOptions() {
  const wrap = document.getElementById('sizeOptions');
  wrap.innerHTML = '';
  sizeChoices.forEach(choice => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="textSize" value="${choice.value}"> ${t(choice.key)}`;
    wrap.appendChild(label);
  });
  wrap.querySelectorAll('input[name=textSize]').forEach(radio => {
    radio.checked = radio.value === (settings.clock.textSize || 'large');
    radio.addEventListener('change', async () => {
      settings.clock.textSize = radio.value;
      await persist();
    });
  });
}

// ---------- Pulse intensity ----------
const pulseChoices = [
  { value: 'light', key: 'pulse_light' },
  { value: 'medium', key: 'pulse_medium' },
  { value: 'strong', key: 'pulse_strong' }
];

function renderPulseOptions() {
  const wrap = document.getElementById('pulseOptions');
  wrap.innerHTML = '';
  pulseChoices.forEach(choice => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="pulseIntensity" value="${choice.value}"> ${t(choice.key)}`;
    wrap.appendChild(label);
  });
  wrap.querySelectorAll('input[name=pulseIntensity]').forEach(radio => {
    radio.checked = radio.value === (settings.others.pulseIntensity || 'strong');
    radio.addEventListener('change', async () => {
      settings.others.pulseIntensity = radio.value;
      await persist();
    });
  });
}

document.getElementById('testPulseBtn').addEventListener('click', () => {
  handleTimeAnnouncing();
});

// ---------- Theme picker ----------
function renderThemeOptions() {
  const current = settings.clock.theme || 'aurora';
  document.querySelectorAll('#themeGrid input[name=theme]').forEach(radio => {
    radio.checked = radio.value === current;
    radio.addEventListener('change', async () => {
      settings.clock.theme = radio.value;
      await persist();
    });
  });
}

function bindTimeReminderForm() {
  const trEnable = document.getElementById('tr-enable');
  const trVoice = document.getElementById('tr-voice');
  const trNotif = document.getElementById('tr-notif');
  const trLocked = document.getElementById('tr-dnd-locked');
  const trFullscreen = document.getElementById('tr-dnd-fullscreen');
  const trMedia = document.getElementById('tr-dnd-media');

  trEnable.checked = settings.timeReminder.enabled;
  trVoice.checked = settings.timeReminder.voiceAnnouncement;
  trNotif.checked = settings.timeReminder.systemNotification;
  trLocked.checked = settings.timeReminder.dnd.whenLocked;
  trFullscreen.checked = settings.timeReminder.dnd.whenFullscreen;
  trMedia.checked = settings.timeReminder.dnd.whenMediaPlaying;

  trEnable.addEventListener('change', async () => { settings.timeReminder.enabled = trEnable.checked; await persist(); });
  trVoice.addEventListener('change', async () => { settings.timeReminder.voiceAnnouncement = trVoice.checked; await persist(); });
  trNotif.addEventListener('change', async () => { settings.timeReminder.systemNotification = trNotif.checked; await persist(); });
  trLocked.addEventListener('change', async () => { settings.timeReminder.dnd.whenLocked = trLocked.checked; await persist(); });
  trFullscreen.addEventListener('change', async () => { settings.timeReminder.dnd.whenFullscreen = trFullscreen.checked; await persist(); });
  trMedia.addEventListener('change', async () => { settings.timeReminder.dnd.whenMediaPlaying = trMedia.checked; await persist(); });
}

// ---------- Text to Speech ----------
function populateVoiceSelect() {
  const select = document.getElementById('voiceSelect');
  const voices = speechSynthesis.getVoices();
  select.innerHTML = '';
  const arabicVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('ar'));
  const otherVoices = voices.filter(v => !v.lang || !v.lang.toLowerCase().startsWith('ar'));

  if (arabicVoices.length === 0) {
    document.getElementById('voiceHint').textContent =
      'No Arabic system voice found. Install one in OS settings, or switch to ElevenLabs above.';
  } else {
    document.getElementById('voiceHint').textContent = `${arabicVoices.length} Arabic voice(s) available.`;
  }

  const opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = '(Default voice)';
  select.appendChild(opt0);

  [...arabicVoices, ...otherVoices].forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  });
  select.value = settings.tts.voiceName || '';
}

function bindTtsForm() {
  const engineSystem = document.getElementById('tts-engine-system');
  const engineEl = document.getElementById('tts-engine-el');
  const systemBlock = document.getElementById('systemVoiceBlock');
  const elBlock = document.getElementById('elevenLabsBlock');
  const voiceSelect = document.getElementById('voiceSelect');
  const rate = document.getElementById('ttsRate');
  const volume = document.getElementById('ttsVolume');
  const elApiKey = document.getElementById('elApiKey');
  const elVoiceId = document.getElementById('elVoiceId');
  const elModel = document.getElementById('elModel');

  function refreshBlocks() {
    const isEl = settings.tts.engine === 'elevenlabs';
    systemBlock.style.display = isEl ? 'none' : 'block';
    elBlock.style.display = isEl ? 'block' : 'none';
  }

  engineSystem.checked = settings.tts.engine !== 'elevenlabs';
  engineEl.checked = settings.tts.engine === 'elevenlabs';
  refreshBlocks();

  engineSystem.addEventListener('change', async () => {
    if (engineSystem.checked) { settings.tts.engine = 'system'; await persist(); refreshBlocks(); }
  });
  engineEl.addEventListener('change', async () => {
    if (engineEl.checked) { settings.tts.engine = 'elevenlabs'; await persist(); refreshBlocks(); }
  });

  rate.value = settings.tts.rate;
  volume.value = settings.tts.volume;
  rate.addEventListener('input', async () => { settings.tts.rate = Number(rate.value); await persist(); });
  volume.addEventListener('input', async () => { settings.tts.volume = Number(volume.value); await persist(); });

  voiceSelect.addEventListener('change', async () => {
    settings.tts.voiceName = voiceSelect.value;
    await persist();
  });

  elApiKey.value = settings.tts.elevenlabs.apiKey;
  elVoiceId.value = settings.tts.elevenlabs.voiceId;
  elModel.value = settings.tts.elevenlabs.modelId;

  elApiKey.addEventListener('input', async () => { settings.tts.elevenlabs.apiKey = elApiKey.value; await persist(); });
  elVoiceId.addEventListener('input', async () => { settings.tts.elevenlabs.voiceId = elVoiceId.value; await persist(); });
  elModel.addEventListener('change', async () => { settings.tts.elevenlabs.modelId = elModel.value; await persist(); });

  document.getElementById('testVoiceBtn').addEventListener('click', async () => {
    const text = document.getElementById('testText').value.trim() || 'This is a test of the talking clock voice.';
    const statusEl = document.getElementById('ttsTestStatus');
    const btn = document.getElementById('testVoiceBtn');
    statusEl.style.color = '#93a4c9';
    statusEl.textContent = 'Testing...';
    btn.disabled = true;
    const result = await window.TTS.speak(text, settings.tts);
    btn.disabled = false;
    if (result.ok) {
      statusEl.style.color = '#5fe08a';
      statusEl.textContent = `✓ Voice played successfully (${result.engine}).`;
    } else {
      statusEl.style.color = '#ff8a80';
      let msg = `✗ ${result.engine} failed — ${result.error}`;
      if (result.fallback) {
        msg += result.fallback.ok ? ' Fell back to the system voice, which played instead.'
                                   : ` System voice fallback also failed: ${result.fallback.error}`;
      }
      statusEl.textContent = msg;
    }
  });
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = populateVoiceSelect;
}

// ---------- Clock tab ----------
function bindClockForm() {
  document.getElementById('clock-digital').checked = true;
  document.getElementById('clock-seconds').checked = settings.clock.showSeconds;
  document.getElementById('clock-date').checked = settings.clock.showDate;
  document.getElementById('clock-reminders').checked = settings.clock.showReminders;
  document.getElementById('clock-holidays').checked = settings.clock.showHolidays !== false;
  document.getElementById('hour-12').checked = settings.clock.hourFormat === 12;
  document.getElementById('hour-24').checked = settings.clock.hourFormat === 24;

  document.getElementById('clock-seconds').addEventListener('change', async e => { settings.clock.showSeconds = e.target.checked; await persist(); });
  document.getElementById('clock-date').addEventListener('change', async e => { settings.clock.showDate = e.target.checked; lastHolidayRenderMinute = null; await persist(); });
  document.getElementById('clock-reminders').addEventListener('change', async e => { settings.clock.showReminders = e.target.checked; await persist(); });
  document.getElementById('clock-holidays').addEventListener('change', async e => { settings.clock.showHolidays = e.target.checked; lastHolidayRenderMinute = null; await persist(); });
  document.querySelectorAll('input[name=hourFormat]').forEach(r => {
    r.addEventListener('change', async e => { settings.clock.hourFormat = Number(e.target.value); await persist(); });
  });
}

// ---------- Language ----------
function bindLanguageForm() {
  const enRadio = document.getElementById('lang-en');
  const arRadio = document.getElementById('lang-ar');
  if (!enRadio || !arRadio) return;
  enRadio.checked = (settings.language || 'en') === 'en';
  arRadio.checked = settings.language === 'ar';
  [enRadio, arRadio].forEach(r => {
    r.addEventListener('change', async e => {
      if (!e.target.checked) return;
      settings.language = e.target.value;
      lastHolidayRenderMinute = null;
      applyLanguage();
      renderReminders();
      renderUpcomingReminders(new Date());
      renderSizeOptions();
      renderPulseOptions();
      await persist();
    });
  });
}

// ---------- Others tab ----------
function bindOthersForm() {
  const mute = document.getElementById('others-mute');
  const flash = document.getElementById('others-flash');
  const wakeLock = document.getElementById('others-wakelock');
  mute.checked = settings.others.mute;
  flash.checked = settings.others.fullscreenFlashOnReminders;
  wakeLock.checked = settings.others.wakeLock !== false;
  mute.addEventListener('change', async () => { settings.others.mute = mute.checked; await persist(); });
  flash.addEventListener('change', async () => { settings.others.fullscreenFlashOnReminders = flash.checked; await persist(); });
  wakeLock.addEventListener('change', async () => {
    settings.others.wakeLock = wakeLock.checked;
    await persist();
    if (wakeLock.checked) requestWakeLock(); else releaseWakeLock();
  });
}

/* =========================================================
   INIT
   ========================================================= */
async function init() {
  settings = loadSettingsLocal();
  applyLanguage();
  tickClock();
  applyClockVisibility();
  applyRemindersCollapse();
  updateFullscreenIcon();
  requestWakeLock();
  setInterval(tickClock, 1000);
  setInterval(schedulerTick, 1000);

  renderReminders();
  bindIntervalInput();
  renderSizeOptions();
  renderPulseOptions();
  renderThemeOptions();
  bindTimeReminderForm();
  bindTtsForm();
  populateVoiceSelect();
  bindClockForm();
  bindOthersForm();
  bindLanguageForm();

  if ('Notification' in window && Notification.permission === 'default') {
    // Ask once, quietly, only if system notifications end up enabled —
    // not on page load out of the blue.
  }
}

/* =========================================================
   ALERT BEEP — plays a short chime right before any spoken
   announcement (time or reminder), so you hear something even
   before the voice starts.
   ========================================================= */
function addChimeTone(destination, freq, t0, t1, peak) {
  const ctx = destination.context;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(gain).connect(destination);
  osc.start(t0);
  osc.stop(t1 + 0.03);
}

function playAlertBeep(volume) {
  return new Promise((resolve) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = Math.max(0, Math.min(1, typeof volume === 'number' ? volume : 1));
      master.connect(ctx.destination);

      // A soft three-note ascending "bell" chime, replacing the old flat
      // two-tone beep. Each note pairs a fundamental sine with a quiet
      // octave-up partial for a rounder, less buzzy tone, plus a quick
      // attack and smooth exponential decay so it never sounds harsh —
      // closer to a gentle notification chime than a computer beep.
      const now = ctx.currentTime;
      const notes = [
        { freq: 784.0,  start: 0.00, dur: 0.22, peak: 0.30 }, // G5
        { freq: 987.8,  start: 0.10, dur: 0.24, peak: 0.28 }, // B5
        { freq: 1174.7, start: 0.20, dur: 0.42, peak: 0.30 }  // D6 — lingers, "settles" the chime
      ];

      let totalDur = 0;
      notes.forEach(n => {
        const t0 = now + n.start;
        const t1 = t0 + n.dur;
        totalDur = Math.max(totalDur, n.start + n.dur);
        addChimeTone(master, n.freq, t0, t1, n.peak);
        addChimeTone(master, n.freq * 2, t0, t1, n.peak * 0.18); // octave partial
      });

      setTimeout(() => {
        try { ctx.close(); } catch (e) { /* ignore */ }
        resolve();
      }, totalDur * 1000 + 80);
    } catch (e) {
      resolve(); // never block speech if audio fails for any reason
    }
  });
}

function handleSpeak(text) {
  if (!settings) return;
  playAlertBeep(settings.tts && settings.tts.volume).then(() => {
    window.TTS.speak(text, settings.tts).then(result => {
      if (!result.ok) console.warn('TTS failed:', result.error, result.fallback);
    });
  });
}

init();
