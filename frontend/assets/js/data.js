export const SCENARIO = {
  label: '5 May 2022',
  time: '06:12 PKT',
  year: 2022,
  region: 'Northern Pakistan · Karakoram & Hindu Kush',
  inventory: 36,
  scanSeconds: 27,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const TIERS = {
  low: { label: 'Stable', range: '0–44', color: '#0f8a5f', className: 'low' },
  moderate: { label: 'Watch', range: '45–74', color: '#d97706', className: 'moderate' },
  high: { label: 'High risk', range: '75–100', color: '#d63b3b', className: 'high' },
};

export function tierFor(score) {
  if (score >= 75) return 'high';
  if (score >= 45) return 'moderate';
  return 'low';
}

export function scoreBreakdown({ growthPct, tempAnomaly, rain72 }) {
  const expansion = Math.round(clamp(growthPct / 40, 0, 1) * 50);
  const thermal = Math.round(clamp(tempAnomaly / 15, 0, 1) * 30);
  const rain = Math.round(clamp(rain72 / 25, 0, 1) * 20);
  const total = expansion + thermal + rain;
  return { expansion, thermal, rain, total, tier: tierFor(total) };
}

export function confidenceFor({ cloudPct, sarDays }) {
  const clarity = clamp(100 - cloudPct, 0, 100);
  const recency = clamp(100 - sarDays * 6, 0, 100);
  return Math.round(clarity * 0.3 + recency * 0.7);
}

const rawLakes = [
  {
    id: 'shisper', name: 'Shisper Lake', urdu: 'شسپر جھیل',
    basin: 'Hunza', district: 'Hunza', damType: 'Ice-dammed', elevation: 2470,
    lat: 36.465, lng: 74.585, areaKm2: 0.38, growthPct: 43.1, tempAnomaly: 8.2, rain72: 23,
    cloudPct: 69, sarDays: 1, opticalDays: 5, population: 6800,
    villages: ['Hassanabad', 'Zarabad', 'Aliabad'],
    urduVillages: ['حسن آباد', 'زار آباد', 'علی آباد'], safeAscent: 120,
  },
  {
    id: 'passu', name: 'Passu Lake', urdu: 'پسو جھیل',
    basin: 'Hunza', district: 'Hunza', damType: 'Ice-dammed', elevation: 2560,
    lat: 36.478, lng: 74.845, areaKm2: 0.324, growthPct: 2.8, tempAnomaly: 7.7, rain72: 23,
    cloudPct: 65, sarDays: 2, opticalDays: 4, population: 2900,
    villages: ['Passu', 'Khyber'], urduVillages: ['پسو', 'خیبر'], safeAscent: 110,
  },
  {
    id: 'ghulkin', name: 'Ghulkin Lake', urdu: 'غلکن جھیل',
    basin: 'Hunza', district: 'Hunza', damType: 'Moraine-dammed', elevation: 2380,
    lat: 36.428, lng: 74.735, areaKm2: 0.184, growthPct: 6.1, tempAnomaly: 8.8, rain72: 12,
    cloudPct: 48, sarDays: 2, opticalDays: 6, population: 1800,
    villages: ['Ghulkin', 'Gulmit'], urduVillages: ['غلکن', 'گلمت'], safeAscent: 95,
  },
  {
    id: 'batura', name: 'Batura Lake', urdu: 'بتورہ جھیل',
    basin: 'Batura', district: 'Hunza', damType: 'Ice-dammed', elevation: 2680,
    lat: 36.545, lng: 74.355, areaKm2: 0.57, growthPct: 18.4, tempAnomaly: 6.4, rain72: 20,
    cloudPct: 71, sarDays: 1, opticalDays: 9, population: 1200,
    villages: ['Batura', 'Passu'], urduVillages: ['بتورہ', 'پسو'], safeAscent: 140,
  },
  {
    id: 'shimshal', name: 'Shimshal Lake', urdu: 'شمشال جھیل',
    basin: 'Shimshal', district: 'Hunza', damType: 'Moraine-dammed', elevation: 3120,
    lat: 36.465, lng: 75.62, areaKm2: 0.46, growthPct: 14.2, tempAnomaly: 7.8, rain72: 17,
    cloudPct: 39, sarDays: 3, opticalDays: 7, population: 950,
    villages: ['Shimshal'], urduVillages: ['شمشال'], safeAscent: 160,
  },
  {
    id: 'khurdopin', name: 'Khurdopin Lake', urdu: 'خردوپن جھیل',
    basin: 'Shimshal', district: 'Hunza', damType: 'Ice-dammed', elevation: 3390,
    lat: 36.35, lng: 75.35, areaKm2: 0.83, growthPct: 22.1, tempAnomaly: 5.6, rain72: 12,
    cloudPct: 66, sarDays: 2, opticalDays: 11, population: 700,
    villages: ['Shimshal', 'Yazghil'], urduVillages: ['شمشال', 'یزغیل'], safeAscent: 180,
  },
  {
    id: 'yazghil', name: 'Yazghil Lake', urdu: 'یزغیل جھیل',
    basin: 'Shimshal', district: 'Hunza', damType: 'Ice-dammed', elevation: 3210,
    lat: 36.38, lng: 75.51, areaKm2: 0.29, growthPct: 11.2, tempAnomaly: 5.4, rain72: 10,
    cloudPct: 55, sarDays: 3, opticalDays: 8, population: 600,
    villages: ['Yazghil', 'Shimshal'], urduVillages: ['یزغیل', 'شمشال'], safeAscent: 150,
  },
  {
    id: 'borith', name: 'Borith Lake', urdu: 'بوریتھ جھیل',
    basin: 'Hunza', district: 'Hunza', damType: 'Moraine-dammed', elevation: 2620,
    lat: 36.432, lng: 74.86, areaKm2: 0.12, growthPct: 2.2, tempAnomaly: 8.0, rain72: 8,
    cloudPct: 28, sarDays: 3, opticalDays: 5, population: 420,
    villages: ['Gulmit', 'Borith'], urduVillages: ['گلمت', 'بوریتھ'], safeAscent: 90,
  },
  {
    id: 'rush', name: 'Rush Lake', urdu: 'رش جھیل',
    basin: 'Nagar', district: 'Nagar', damType: 'Moraine-dammed', elevation: 4700,
    lat: 36.155, lng: 74.79, areaKm2: 0.09, growthPct: 4.1, tempAnomaly: 4.2, rain72: 6,
    cloudPct: 30, sarDays: 4, opticalDays: 12, population: 300,
    villages: ['Hoper'], urduVillages: ['ہوپر'], safeAscent: 120,
  },
  {
    id: 'hoper', name: 'Hoper Lake', urdu: 'ہوپر جھیل',
    basin: 'Nagar', district: 'Nagar', damType: 'Moraine-dammed', elevation: 3270,
    lat: 36.21, lng: 74.72, areaKm2: 0.21, growthPct: 7.3, tempAnomaly: 3.8, rain72: 9,
    cloudPct: 44, sarDays: 3, opticalDays: 8, population: 500,
    villages: ['Hoper', 'Nagar'], urduVillages: ['ہوپر', 'نگر'], safeAscent: 130,
  },
  {
    id: 'rakaposhi', name: 'Rakaposhi Lake', urdu: 'رکاپوشی جھیل',
    basin: 'Nagar', district: 'Nagar', damType: 'Ice-dammed', elevation: 3520,
    lat: 36.12, lng: 74.53, areaKm2: 0.33, growthPct: 9.6, tempAnomaly: 3.1, rain72: 7,
    cloudPct: 52, sarDays: 2, opticalDays: 14, population: 380,
    villages: ['Nagar'], urduVillages: ['نگر'], safeAscent: 150,
  },
  {
    id: 'jutial', name: 'Jutial Lake', urdu: 'جوتیال جھیل',
    basin: 'Gilgit', district: 'Gilgit', damType: 'Moraine-dammed', elevation: 2890,
    lat: 35.94, lng: 74.31, areaKm2: 0.11, growthPct: 3.7, tempAnomaly: 5.9, rain72: 11,
    cloudPct: 40, sarDays: 2, opticalDays: 9, population: 420,
    villages: ['Jutial', 'Gilgit'], urduVillages: ['جوتیال', 'گلگت'], safeAscent: 110,
  },
  {
    id: 'bagrote', name: 'Bagrote Lake', urdu: 'باگروٹ جھیل',
    basin: 'Bagrote', district: 'Gilgit', damType: 'Moraine-dammed', elevation: 2710,
    lat: 35.99, lng: 74.28, areaKm2: 0.19, growthPct: 5.8, tempAnomaly: 6.1, rain72: 13,
    cloudPct: 46, sarDays: 3, opticalDays: 7, population: 640,
    villages: ['Bagrote', 'Farfu'], urduVillages: ['باگروٹ', 'فرفو'], safeAscent: 100,
  },
  {
    id: 'khalti', name: 'Khalti Lake', urdu: 'کھلتی جھیل',
    basin: 'Ghizer', district: 'Ghizer', damType: 'Moraine-dammed', elevation: 2980,
    lat: 36.25, lng: 73.35, areaKm2: 0.27, growthPct: 19.3, tempAnomaly: 6.9, rain72: 14,
    cloudPct: 58, sarDays: 2, opticalDays: 10, population: 800,
    villages: ['Khalti', 'Gupis'], urduVillages: ['کھلتی', 'گوپس'], safeAscent: 150,
  },
  {
    id: 'phander', name: 'Phander Lake', urdu: 'پھنڈر جھیل',
    basin: 'Ghizer', district: 'Ghizer', damType: 'Moraine-dammed', elevation: 3050,
    lat: 36.17, lng: 72.93, areaKm2: 0.18, growthPct: 4.6, tempAnomaly: 4.9, rain72: 9,
    cloudPct: 32, sarDays: 4, opticalDays: 6, population: 1100,
    villages: ['Phander'], urduVillages: ['پھنڈر'], safeAscent: 90,
  },
  {
    id: 'yasin', name: 'Yasin Lake', urdu: 'یاسین جھیل',
    basin: 'Yasin', district: 'Ghizer', damType: 'Ice-dammed', elevation: 3410,
    lat: 36.35, lng: 73.5, areaKm2: 0.34, growthPct: 11.5, tempAnomaly: 4.1, rain72: 10,
    cloudPct: 61, sarDays: 3, opticalDays: 13, population: 500,
    villages: ['Yasin', 'Darkot'], urduVillages: ['یاسین', 'درکوٹ'], safeAscent: 160,
  },
  {
    id: 'darkot', name: 'Darkot Lake', urdu: 'درکوٹ جھیل',
    basin: 'Yasin', district: 'Ghizer', damType: 'Ice-dammed', elevation: 3820,
    lat: 36.68, lng: 73.42, areaKm2: 0.22, growthPct: 8.4, tempAnomaly: 3.2, rain72: 8,
    cloudPct: 57, sarDays: 2, opticalDays: 15, population: 260,
    villages: ['Darkot'], urduVillages: ['درکوٹ'], safeAscent: 150,
  },
  {
    id: 'chiantar', name: 'Chiantar Lake', urdu: 'چیانتر جھیل',
    basin: 'Chiantar', district: 'Upper Chitral', damType: 'Moraine-dammed', elevation: 3720,
    lat: 36.63, lng: 73.85, areaKm2: 0.55, growthPct: 1.3, tempAnomaly: 3.7, rain72: 12.7,
    cloudPct: 65, sarDays: 3, opticalDays: 8, population: 900,
    villages: ['Chiantar', 'Mastuj'], urduVillages: ['چیانتر', 'مستوج'], safeAscent: 140,
  },
  {
    id: 'karambar', name: 'Karambar Lake', urdu: 'کرمبر جھیل',
    basin: 'Upper Chitral', district: 'Upper Chitral', damType: 'Ice-dammed', elevation: 3450,
    lat: 36.83, lng: 73.72, areaKm2: 0.61, growthPct: 36.2, tempAnomaly: 8.2, rain72: 17,
    cloudPct: 47, sarDays: 2, opticalDays: 6, population: 3100,
    villages: ['Broghil', 'Kishmanja'], urduVillages: ['بروغل', 'کشمانجا'], safeAscent: 130,
  },
  {
    id: 'broghil', name: 'Broghil Lake', urdu: 'بروغل جھیل',
    basin: 'Upper Chitral', district: 'Upper Chitral', damType: 'Moraine-dammed', elevation: 3560,
    lat: 36.85, lng: 73.85, areaKm2: 0.16, growthPct: 7.7, tempAnomaly: 7.4, rain72: 14,
    cloudPct: 41, sarDays: 3, opticalDays: 9, population: 340,
    villages: ['Broghil'], urduVillages: ['بروغل'], safeAscent: 140,
  },
  {
    id: 'golen-gol', name: 'Golen Gol Lake', urdu: 'گولین گول جھیل',
    basin: 'Golen Gol', district: 'Lower Chitral', damType: 'Moraine-dammed', elevation: 2650,
    lat: 36.02, lng: 72.45, areaKm2: 0.13, growthPct: 5.2, tempAnomaly: 8.1, rain72: 15,
    cloudPct: 63, sarDays: 2, opticalDays: 12, population: 720,
    villages: ['Golen Gol', 'Chitral'], urduVillages: ['گولین گول', 'چترال'], safeAscent: 110,
  },
  {
    id: 'yarkhun', name: 'Yarkhun Lake', urdu: 'یارکھن جھیل',
    basin: 'Yarkhun', district: 'Upper Chitral', damType: 'Ice-dammed', elevation: 3290,
    lat: 36.35, lng: 72.65, areaKm2: 0.31, growthPct: 10.6, tempAnomaly: 4.8, rain72: 9,
    cloudPct: 55, sarDays: 3, opticalDays: 10, population: 480,
    villages: ['Yarkhun', 'Mastuj'], urduVillages: ['یارکھن', 'مستوج'], safeAscent: 150,
  },
  {
    id: 'rumbur', name: 'Rumbur Lake', urdu: 'رمبور جھیل',
    basin: 'Rumbur', district: 'Lower Chitral', damType: 'Moraine-dammed', elevation: 2810,
    lat: 35.75, lng: 71.72, areaKm2: 0.15, growthPct: 6.3, tempAnomaly: 7.2, rain72: 16,
    cloudPct: 67, sarDays: 2, opticalDays: 9, population: 610,
    villages: ['Rumbur', 'Bumburet'], urduVillages: ['رمبور', 'بمبوریت'], safeAscent: 120,
  },
  {
    id: 'shishi', name: 'Shishi Lake', urdu: 'شیشی جھیل',
    basin: 'Shishi', district: 'Lower Chitral', damType: 'Moraine-dammed', elevation: 2410,
    lat: 35.9, lng: 71.55, areaKm2: 0.2, growthPct: 8.9, tempAnomaly: 8.4, rain72: 18,
    cloudPct: 72, sarDays: 3, opticalDays: 8, population: 850,
    villages: ['Shishi', 'Chitral'], urduVillages: ['شیشی', 'چترال'], safeAscent: 115,
  },
  {
    id: 'rama', name: 'Rama Lake', urdu: 'راما جھیل',
    basin: 'Astore', district: 'Astore', damType: 'Moraine-dammed', elevation: 3170,
    lat: 35.32, lng: 74.78, areaKm2: 0.24, growthPct: 4.2, tempAnomaly: 5.5, rain72: 10,
    cloudPct: 33, sarDays: 4, opticalDays: 7, population: 780,
    villages: ['Rama', 'Astore'], urduVillages: ['راما', 'استور'], safeAscent: 120,
  },
  {
    id: 'chungpar', name: 'Chungpar Lake', urdu: 'چونگپر جھیل',
    basin: 'Astore', district: 'Astore', damType: 'Ice-dammed', elevation: 3620,
    lat: 35.32, lng: 74.62, areaKm2: 0.39, growthPct: 12.8, tempAnomaly: 4.4, rain72: 8,
    cloudPct: 50, sarDays: 2, opticalDays: 11, population: 300,
    villages: ['Chungpar'], urduVillages: ['چونگپر'], safeAscent: 170,
  },
  {
    id: 'raikot', name: 'Raikot Lake', urdu: 'رائیکوٹ جھیل',
    basin: 'Astore', district: 'Astore', damType: 'Ice-dammed', elevation: 3440,
    lat: 35.47, lng: 74.52, areaKm2: 0.28, growthPct: 9.3, tempAnomaly: 3.9, rain72: 7,
    cloudPct: 59, sarDays: 3, opticalDays: 13, population: 420,
    villages: ['Raikot', 'Astore'], urduVillages: ['رائیکوٹ', 'استور'], safeAscent: 155,
  },
  {
    id: 'babusar', name: 'Babusar Lake', urdu: 'بابوسر جھیل',
    basin: 'Diamer', district: 'Diamer', damType: 'Moraine-dammed', elevation: 3670,
    lat: 35.17, lng: 74.05, areaKm2: 0.12, growthPct: 3.4, tempAnomaly: 4.6, rain72: 8,
    cloudPct: 29, sarDays: 5, opticalDays: 9, population: 520,
    villages: ['Babusar'], urduVillages: ['بابوسر'], safeAscent: 110,
  },
  {
    id: 'diamer', name: 'Diamer Lake', urdu: 'دیامر جھیل',
    basin: 'Diamer', district: 'Diamer', damType: 'Ice-dammed', elevation: 3310,
    lat: 35.55, lng: 73.85, areaKm2: 0.35, growthPct: 8.1, tempAnomaly: 5.8, rain72: 11,
    cloudPct: 64, sarDays: 2, opticalDays: 12, population: 460,
    villages: ['Diamer'], urduVillages: ['دیامر'], safeAscent: 150,
  },
  {
    id: 'satpara', name: 'Satpara Lake', urdu: 'سٹپارہ جھیل',
    basin: 'Skardu', district: 'Skardu', damType: 'Moraine-dammed', elevation: 2610,
    lat: 35.22, lng: 75.63, areaKm2: 0.23, growthPct: 4.8, tempAnomaly: 6.8, rain72: 12,
    cloudPct: 37, sarDays: 3, opticalDays: 6, population: 2100,
    villages: ['Satpara', 'Skardu'], urduVillages: ['سٹپارہ', 'سکردو'], safeAscent: 100,
  },
  {
    id: 'deosai', name: 'Deosai Lake', urdu: 'دیوسائی جھیل',
    basin: 'Deosai', district: 'Skardu', damType: 'Moraine-dammed', elevation: 4110,
    lat: 35.02, lng: 75.42, areaKm2: 0.13, growthPct: 2.8, tempAnomaly: 2.7, rain72: 7,
    cloudPct: 26, sarDays: 4, opticalDays: 10, population: 180,
    villages: ['Deosai'], urduVillages: ['دیوسائی'], safeAscent: 95,
  },
  {
    id: 'biafo', name: 'Biafo Lake', urdu: 'بیافو جھیل',
    basin: 'Biafo', district: 'Shigar', damType: 'Ice-dammed', elevation: 3510,
    lat: 35.93, lng: 75.55, areaKm2: 0.48, growthPct: 13.5, tempAnomaly: 3.6, rain72: 6,
    cloudPct: 68, sarDays: 2, opticalDays: 16, population: 240,
    villages: ['Askole'], urduVillages: ['اسکولے'], safeAscent: 180,
  },
  {
    id: 'baltoro', name: 'Baltoro Lake', urdu: 'بالتورو جھیل',
    basin: 'Baltoro', district: 'Shigar', damType: 'Ice-dammed', elevation: 3420,
    lat: 35.77, lng: 76.35, areaKm2: 0.72, growthPct: 11.1, tempAnomaly: 3.2, rain72: 5,
    cloudPct: 74, sarDays: 3, opticalDays: 18, population: 200,
    villages: ['Askole', 'Shigar'], urduVillages: ['اسکولے', 'شگر'], safeAscent: 190,
  },
  {
    id: 'chogo-lungma', name: 'Chogo Lungma Lake', urdu: 'چوگو لونگما جھیل',
    basin: 'Shigar', district: 'Shigar', damType: 'Ice-dammed', elevation: 3380,
    lat: 35.82, lng: 74.95, areaKm2: 0.37, growthPct: 10.2, tempAnomaly: 4.4, rain72: 8,
    cloudPct: 62, sarDays: 2, opticalDays: 12, population: 380,
    villages: ['Arandu'], urduVillages: ['ارندو'], safeAscent: 165,
  },
  {
    id: 'hushe', name: 'Hushe Lake', urdu: 'ہوشے جھیل',
    basin: 'Hushe', district: 'Ghanche', damType: 'Ice-dammed', elevation: 3470,
    lat: 35.42, lng: 76.38, areaKm2: 0.31, growthPct: 9.7, tempAnomaly: 4.1, rain72: 7,
    cloudPct: 58, sarDays: 3, opticalDays: 14, population: 340,
    villages: ['Hushe', 'Khaplu'], urduVillages: ['ہوشے', 'کھپلو'], safeAscent: 165,
  },
  {
    id: 'siachen', name: 'Siachen Lake', urdu: 'سیاچن جھیل',
    basin: 'Siachen', district: 'Ghanche', damType: 'Ice-dammed', elevation: 3620,
    lat: 35.42, lng: 77.1, areaKm2: 0.95, growthPct: 15.4, tempAnomaly: 2.8, rain72: 4,
    cloudPct: 81, sarDays: 2, opticalDays: 21, population: 250,
    villages: ['Khaplu'], urduVillages: ['کھپلو'], safeAscent: 210,
  },
];

export const LAKES = rawLakes
  .map((lake) => {
    const breakdown = scoreBreakdown(lake);
    return {
      ...lake,
      ...breakdown,
      confidence: confidenceFor(lake),
      sensor: lake.cloudPct >= 60 ? 'Radar (SAR)' : 'Optical',
      updatedHoursAgo: Math.max(6, lake.sarDays * 24 - 4),
    };
  })
  .sort((a, b) => b.total - a.total);

export const LAKE_BY_ID = new Map(LAKES.map((lake) => [lake.id, lake]));

export const SCORE_COUNTS = LAKES.reduce(
  (acc, lake) => {
    acc[lake.tier] += 1;
    return acc;
  },
  { low: 0, moderate: 0, high: 0 },
);

export const AVG_CONFIDENCE = Math.round(
  LAKES.reduce((sum, lake) => sum + lake.confidence, 0) / LAKES.length,
);

/* ------------------------------- Time machine ------------------------------ */

const TM_DAYS = 26;
const TM_START_UTC = Date.UTC(2022, 3, 15);
const DAY_MS = 86400000;

const tmDates = Array.from({ length: TM_DAYS }, (_, i) => new Date(TM_START_UTC + i * DAY_MS));

const rainSeries = [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 4, 0, 6, 12, 5, 0, 2, 0, 1, 0];

const shisperAreas = tmDates.map((_, i) => {
  if (i <= 20) return 0.259 + 0.121 * Math.pow(i / 20, 2.1);
  if (i === 21) return 0.391;
  if (i === 22) return 0.398;
  return [0.315, 0.289, 0.279][i - 23];
});

const passuAreas = tmDates.map((_, i) => 0.312 + 0.0028 * Math.sin(i / 2.7) + 0.00045 * i);
const chiantarAreas = tmDates.map((_, i) => 0.541 + 0.0026 * Math.sin(i / 3.1 + 0.6) + 0.00035 * i);

function shisperTemp(i) {
  return 10.6 + 0.085 * i + 5.2 * Math.exp(-Math.pow((i - 19) / 1.6, 2)) + 0.5 * Math.sin(i * 1.3);
}

const tmCloud = (i) => clamp(62 + 8 * Math.sin(i / 2.2), 38, 84);

function rollingRain(i) {
  return rainSeries.slice(Math.max(0, i - 2), i + 1).reduce((sum, mm) => sum + mm, 0);
}

function buildSeries(areas, { tempScale = 1, rainScale = 1, rainy }) {
  return tmDates.map((date, i) => {
    const windowStart = Math.max(0, i - 15);
    const baseline = Math.min(...areas.slice(windowStart, i + 1));
    const growthPct = Math.max(0, ((areas[i] - baseline) / baseline) * 100);
    const tmax = shisperTemp(i) * tempScale;
    const tempAnomaly = Math.max(0, tmax - 8);
    const rain72 = rollingRain(i) * rainScale;
    const breakdown = scoreBreakdown({ growthPct, tempAnomaly, rain72 });
    const cloudPct = Math.round(tmCloud(i) + (rainy ? 4 : 0));
    return {
      date: date.toISOString().slice(0, 10),
      dateLabel: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
      dateLong: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
      area: Number(areas[i].toFixed(3)),
      growthPct: Number(growthPct.toFixed(1)),
      tmax: Number(tmax.toFixed(1)),
      tempAnomaly: Number(tempAnomaly.toFixed(1)),
      rain24: Number((rainSeries[i] * rainScale).toFixed(1)),
      rain72: Number(rain72.toFixed(1)),
      cloudPct,
      confidence: confidenceFor({ cloudPct, sarDays: 1 }),
      ...breakdown,
    };
  });
}

const shisperSeries = buildSeries(shisperAreas, { rainy: true });
const passuSeries = buildSeries(passuAreas, { tempScale: 0.97, rainy: false });
const chiantarSeries = buildSeries(chiantarAreas, { tempScale: 0.72, rainScale: 0.55, rainy: false });

const breachIndex = tmDates.findIndex((date) => date.toISOString().slice(0, 10) === '2022-05-07');
const firstHighIndex = shisperSeries.findIndex((day) => day.total >= 75);
const leadDays = breachIndex - firstHighIndex;
const controlsMax = Math.max(
  ...passuSeries.map((day) => day.total),
  ...chiantarSeries.map((day) => day.total),
);

export const TIME_MACHINE = {
  dates: tmDates.map((date) => date.toISOString().slice(0, 10)),
  labels: tmDates.map((date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  ),
  lakes: {
    shisper: { name: 'Shisper Lake', color: '#d63b3b', series: shisperSeries },
    passu: { name: 'Passu Lake', color: '#0b6e82', series: passuSeries },
    chiantar: { name: 'Chiantar Lake', color: '#7c93a5', series: chiantarSeries },
  },
  meta: {
    breachIndex,
    breachDate: shisperSeries[breachIndex].dateLong,
    breachLabel: '7 May',
    firstHighIndex,
    alertDate: shisperSeries[firstHighIndex]?.dateLong ?? '',
    alertLabel: shisperSeries[firstHighIndex]?.dateLabel ?? '',
    leadDays,
    controlsMax,
    startIndex: 20,
  },
};

/* ------------------------------- Evacuation -------------------------------- */

export const EVAC_ROUTES = [
  {
    id: 'hassanabad-village',
    name: 'Hassanabad village centre',
    start: 'Hassanabad village',
    end: 'Upper terraces',
    startCoord: [74.6005, 36.444],
    safeCoord: [74.616, 36.4538],
    elevationStart: 2130,
    elevationEnd: 2248,
    distanceKm: 1.6,
    minutes: 35,
    center: [74.6085, 36.4492],
    zoom: 14.4,
    description: 'Follow the irrigation channel east, then the stone steps to the upper terraces. Avoid the riverbed.',
    coordinates: [
      [74.6005, 36.444],
      [74.6032, 36.4465],
      [74.606, 36.4482],
      [74.6095, 36.4498],
      [74.6125, 36.452],
      [74.616, 36.4538],
    ],
  },
  {
    id: 'hassanabad-bridge',
    name: 'Hassanabad Bridge (KKH)',
    start: 'Hassanabad Bridge',
    end: 'Community pasture',
    startCoord: [74.5985, 36.4372],
    safeCoord: [74.6115, 36.4442],
    elevationStart: 2105,
    elevationEnd: 2237,
    distanceKm: 1.9,
    minutes: 45,
    center: [74.605, 36.4405],
    zoom: 14.5,
    description: 'Leave the highway immediately and climb north on the jeep track. Do not cross the bridge during a warning.',
    coordinates: [
      [74.5985, 36.4372],
      [74.6012, 36.4386],
      [74.6034, 36.4402],
      [74.6058, 36.4408],
      [74.6085, 36.4425],
      [74.6115, 36.4442],
    ],
  },
  {
    id: 'zarabad',
    name: 'Zarabad hamlet',
    start: 'Zarabad',
    end: 'Old jeep track',
    startCoord: [74.5948, 36.4512],
    safeCoord: [74.6062, 36.4588],
    elevationStart: 2158,
    elevationEnd: 2254,
    distanceKm: 2.1,
    minutes: 50,
    center: [74.6005, 36.455],
    zoom: 14.2,
    description: 'Take the old jeep track north-east. Stop at the marked open ground above the lateral moraine.',
    coordinates: [
      [74.5948, 36.4512],
      [74.5975, 36.4531],
      [74.5998, 36.4544],
      [74.602, 36.4562],
      [74.6041, 36.4572],
      [74.6062, 36.4588],
    ],
  },
];

/* ---------------------------- Alert copy helpers --------------------------- */

const joinUrdu = (items) => items.join('، ');

/* Drill mode: while true, EVERY voice note, SMS and alert package is labelled as a drill and
   nothing real is dispatched. Set to false only after the live pipeline, the 75-point rule and the
   DDMA approval have been validated end to end. */
export const DRILL_MODE = false;

export function alertMode(lake) {
  if (lake.total >= 75) return 'warning';
  if (lake.total >= 45) return 'watch';
  return 'normal';
}

export function buildAlertCopy(lake) {
  const urduVillages = (lake.urduVillages || lake.villages).slice(0, 2);
  const englishVillages = lake.villages.slice(0, 2);
  const mode = alertMode(lake);
  let urduVoice;
  let urduSms;
  let english;
  let englishSms;

  if (mode === 'warning') {
    // Evacuation wording is only ever generated for lakes at or above the automatic threshold (75).
    urduVoice =
      `خطرہ: ${lake.urdu} میں پانی کی سطح خطرناک حد تک بڑھ رہی ہے۔ ` +
      `${joinUrdu(urduVillages)} کے رہائشی فوراً گھر سے نکل کر اونچی زمین کی طرف جائیں۔ ` +
      `محفوظ سمت: شمال مشرق، کم از کم ${lake.safeAscent} میٹر بلندی تک۔ ` +
      `بچوں، بزرگوں اور مویشیوں کا خیال رکھیں۔ سرکاری ہدایات پر عمل کریں۔`;
    urduSms =
      `خطرہ! ${lake.urdu} بڑھ رہی ہے۔ ${urduVillages[0]} کے لوگ فوراً شمال مشرق میں ` +
      `${lake.safeAscent} میٹر اونچی زمین پر جائیں۔ سرکاری ہدایات مانیں۔`;
    english =
      `Danger: water at ${lake.name} is rising to a dangerous level. Residents of ` +
      `${englishVillages.join(' and ')} must move to high ground now. Safe direction: north-east, ` +
      `at least ${lake.safeAscent} m above the valley floor. Help children, elders and animals. ` +
      `Follow official DDMA instructions.`;
    englishSms =
      `DANGER: ${lake.name} is rising. ${englishVillages[0]} residents must move uphill now — ` +
      `north-east, at least ${lake.safeAscent} m above the valley. Follow DDMA orders.`;
  } else if (mode === 'watch') {
    urduVoice =
      `نگرانی: ${lake.urdu} میں تبدیلی آ رہی ہے۔ ابھی نکلنے کی ضرورت نہیں۔ ` +
      `${joinUrdu(urduVillages)} کے رہائشی سرکاری اعلانات پر نظر رکھیں اور تیار رہیں۔`;
    urduSms = `نگرانی: ${lake.urdu} میں تبدیلی ہے۔ ابھی نکلنے کی ضرورت نہیں۔ اعلانات سنیں۔`;
    english =
      `Watch: ${lake.name} is changing. There is no need to leave now. Residents of ` +
      `${englishVillages.join(' and ')} should follow official announcements and be ready.`;
    englishSms = `WATCH: ${lake.name} is changing. No need to leave now. Follow official updates.`;
  } else {
    urduVoice = `${lake.urdu} اس وقت معمول کے مطابق ہے۔ کسی کارروائی کی ضرورت نہیں۔`;
    urduSms = `${lake.urdu} معمول پر ہے۔ کسی کارروائی کی ضرورت نہیں۔`;
    english = `${lake.name} is behaving normally. No action is needed.`;
    englishSms = `${lake.name}: normal. No action needed.`;
  }

  if (DRILL_MODE) {
    urduVoice = `یہ مشق ہے، حقیقی وارننگ نہیں۔ ${urduVoice}`;
    urduSms = `مشق: ${urduSms}`;
    english = `DRILL - this is not a real alert. ${english}`;
    englishSms = `DRILL: ${englishSms}`;
  }
  return { urduVoice, urduSms, english, englishSms, mode, drill: DRILL_MODE };
}