// Converts a Date into a natural spoken English phrase for TTS engines.
// Without this, some TTS voices read "16:00" literally as
// "sixteen hundred hours" (military-style) instead of "four PM".
// We always speak in 12-hour words + AM/PM, regardless of the
// clock's display hour format (12h/24h), since that's what sounds natural.
// Browser-safe version (attaches to window instead of module.exports).

const ONES = [
  'zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

function numberToWords(n) {
  n = Math.max(0, Math.min(59, Math.round(n)));
  if (n < 20) return ONES[n];
  const tensPart = Math.floor(n / 10);
  const onesPart = n % 10;
  return TENS[tensPart] + (onesPart ? '-' + ONES[onesPart] : '');
}

function formatSpokenTime(date) {
  const h24 = date.getHours();
  const m = date.getMinutes();
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  const hourWord = numberToWords(h12);
  let minutePhrase;
  if (m === 0) {
    minutePhrase = "o'clock";
  } else if (m < 10) {
    minutePhrase = 'oh ' + numberToWords(m);
  } else {
    minutePhrase = numberToWords(m);
  }

  return `${hourWord} ${minutePhrase} ${ampm}`;
}

window.formatSpokenTime = formatSpokenTime;
window.numberToWords = numberToWords;
