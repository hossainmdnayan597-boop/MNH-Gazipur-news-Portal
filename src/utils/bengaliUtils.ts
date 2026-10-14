// Converts English digits to Bengali digits
export function toBengaliDigits(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

// Bengali month names
const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// Bengali week days
const BENGALI_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

export function formatBengaliDate(isoDateStr: string | Date): string {
  try {
    const date = typeof isoDateStr === 'string' ? new Date(isoDateStr) : isoDateStr;
    if (isNaN(date.getTime())) return 'সম্প্রতি';

    const dayName = BENGALI_DAYS[date.getDay()];
    const day = toBengaliDigits(date.getDate());
    const month = BENGALI_MONTHS[date.getMonth()];
    const year = toBengaliDigits(date.getFullYear());

    return `${dayName}, ${day} ${month} ${year}`;
  } catch (e) {
    return 'সম্প্রতি';
  }
}

export function formatBengaliDateTime(isoDateStr: string | Date): string {
  try {
    const date = typeof isoDateStr === 'string' ? new Date(isoDateStr) : isoDateStr;
    if (isNaN(date.getTime())) return 'সম্প্রতি';

    const datePart = formatBengaliDate(date);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'বিকাল/রাত' : 'সকাল';
    const displayHours = hours % 12 || 12;

    const timeStr = `${toBengaliDigits(displayHours)}:${minutes < 10 ? '০' : ''}${toBengaliDigits(minutes)}`;
    return `${datePart} | ${ampm} ${timeStr}`;
  } catch (e) {
    return 'সম্প্রতি';
  }
}

export function getRelativeBengaliTime(isoDateStr: string | Date): string {
  try {
    const date = typeof isoDateStr === 'string' ? new Date(isoDateStr) : isoDateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'এইমাত্র';
    if (diffMin < 60) return `${toBengaliDigits(diffMin)} মিনিট আগে`;
    if (diffHour < 24) return `${toBengaliDigits(diffHour)} ঘণ্টা আগে`;
    if (diffDay === 1) return 'গতকাল';
    if (diffDay < 7) return `${toBengaliDigits(diffDay)} দিন আগে`;
    return formatBengaliDate(date);
  } catch (e) {
    return 'সম্প্রতি';
  }
}

// Current Live Bengali Date string (with Bengali calendar approximation)
export function getLiveBengaliHeaderDate(): string {
  const now = new Date();
  const dayName = BENGALI_DAYS[now.getDay()];
  const day = toBengaliDigits(now.getDate());
  const month = BENGALI_MONTHS[now.getMonth()];
  const year = toBengaliDigits(now.getFullYear());
  
  // Approximate Bengali seasonal year (usually Gregorian - 593/594)
  const banglaYear = toBengaliDigits(now.getFullYear() - 593);

  return `${dayName}, ${day} ${month} ${year} বঙ্গাব্দ ${banglaYear}`;
}
