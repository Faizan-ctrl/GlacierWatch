import {
  LAKES,
  LAKE_BY_ID,
  SCORE_COUNTS,
  AVG_CONFIDENCE,
  TIME_MACHINE,
  EVAC_ROUTES,
  TIERS,
  SCENARIO,
  buildAlertCopy,
  DRILL_MODE,
} from './data.js';
import { initOverviewMap, initTerrainMap } from './maps.js';
import { syncWithBackend, getVoiceAudioUrl, dispatchAlertToBackend, backendState } from './api.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const fmtNum = new Intl.NumberFormat('en-US');
const VIEWS = ['overview', 'timemachine', 'escape', 'alerts', 'method'];
const VIEW_TITLES = {
  overview: 'Overview',
  timemachine: 'Time Machine',
  escape: 'Escape Routes',
  alerts: 'Alerts',
  method: 'How it works',
};

const TRANSLATIONS = {
  en: {
    metaTitle: 'GlacierWatch — Glacial lake flood early warning, Northern Pakistan',
    skipLink: 'Skip to content',
    brandSub: 'GLOF early warning · Northern Pakistan',
    navOverview: 'Overview',
    navTimeMachine: 'Time Machine',
    navEscape: 'Escape Routes',
    navAlerts: 'Alerts',
    navMethod: 'How it works',
    liveEngineText: 'Live Engine · Data thru 14 Nov 2026',
    logOut: 'Log Out',
    heroEyebrow: 'Northern Pakistan · Karakoram & Hindu Kush',
    heroTitleRest: 'lakes need a closer look.',
    heroLede: "GlacierWatch watches 36 of the region's most dangerous glacial lakes from space — and tells you, in plain language, which ones are changing fastest.",
    lastScanLabel: 'Last scan',
    scanSyncText: '14 Nov 2026 · Telemetry Sync',
    completeStatus: 'Complete',
    coverageLabel: 'Coverage',
    coverageVal: '36 of 36 lakes',
    scanTimeLabel: 'Scan time',
    scanTimeVal: '27 seconds',
    newestPassLabel: 'Newest pass',
    scanNoteText: 'Verified telemetry: Sentinel-1/2, Landsat-9, NASA POWER & USGS feeds.',
    shisperBannerTitle: 'High risk at Shisper Lake, Hassanabad.',
    shisperBannerDesc: 'The lake is 43% larger than it was 15 days ago. A warning was issued on 4 May — three days before the breach.',
    hearUrduWarning: 'Hear the Urdu warning',
    seeHowUnfolded: 'See how it unfolded',
    kpiHighLabel: 'High risk',
    kpiHighSub: 'Above the warning line of 75',
    kpiTotalLabel: 'Lakes monitored',
    kpiTotalSub: 'The highest-exposure basins',
    kpiLeadLabel: 'Warning lead time',
    kpiLeadSub: 'Verified in the 2022 Shisper event',
    kpiConfLabel: 'Data confidence',
    kpiConfSub: 'Clear skies + recent radar',
    riskMapTitle: 'Where the risk is',
    riskMapSub: 'Tap a lake to see what the satellite measured.',
    terrain3d: '3D terrain',
    legendTitle: 'Risk score',
    legendHigh: 'High · 75–100',
    legendWatch: 'Watch · 45–74',
    legendStable: 'Stable · 0–44',
    loadingMap: 'Loading risk map…',
    mapErrorTitle: 'Map could not load.',
    mapErrorDesc: 'Check your connection, then refresh. The lake list still works.',
    mapCaptionLeft: 'Sentinel-1 radar · Sentinel-2 optical · Copernicus 30 m terrain',
    mapCaptionRight: '36 lakes shown',
    priorityTitle: 'Priority lakes',
    sortedByRisk: 'Sorted by risk.',
    monitoredCount: 'monitored.',
    liveDataBadge: 'Live Data',
    searchPlaceholder: 'Search a lake, valley or district',
    filterAll: 'All',
    filterHigh: 'High',
    filterWatch: 'Watch',
    filterStable: 'Stable',
    lakeEmpty: 'No lakes match that search. Try a valley name like “Hunza”.',
    popMillion: '7.1 million',
    popLiveDownstream: "people live downstream of the region's hazardous lakes.",
    whyEyebrow: 'Why these 36?',
    whyTitle: 'Thousands of lakes. Only some sit above people.',
    whyDesc: 'Northern Pakistan has 3,044 mapped glacial lakes. The 36 shown here are the ones with villages, bridges or roads directly in the flood path. Monitoring them all from space takes 27 seconds — no hardware on the mountain.',
    factElevation: '30 m',
    factElevationSub: 'elevation detail',
    factAudio: '< 45 KB',
    factAudioSub: 'Urdu voice warning',
    factWindow: '48 h+',
    factWindowSub: 'target warning window',
    // Time Machine
    tmEyebrow: 'Historical replay · Shisper GEE & NASA POWER timeline',
    tmHeading: 'The warning came three days early.',
    tmLede: 'In May 2022, Shisper Lake burst and destroyed the Hassanabad Bridge. Replay the season with the same rules used today, and watch the score cross the danger line before the flood.',
    proofLabel: 'Verified outcome',
    proofDays: '3 days',
    proofBetween: 'between the first HIGH alert and the breach',
    proofCrossed: 'Shisper crossed 75',
    proofDateMay4: '4 May',
    proofWashed: 'Bridge washed away',
    proofDateMay7: '7 May',
    proofFoot: 'Control lakes stayed below 45 — zero false alarms.',
    tmSpeedLabel: 'Speed',
    tmevent1Date: '4 May',
    tmevent1Text: 'Heat spike · 17.5°C',
    tmevent2Date: '7 May',
    tmevent2Text: 'Breach',
    chartAreaTitle: 'How fast the lake grew',
    chartAreaSub: 'Measured surface area in km². Shisper nearly doubled its growth rate in three weeks.',
    legendShisper: 'Shisper',
    legendPassu: 'Passu',
    legendChiantar: 'Chiantar',
    chartRiskTitle: 'When the warning fired',
    chartRiskSub: 'Risk score out of 100. The dashed line is the automatic alert threshold.',
    alertAt75: 'Alert at 75',
    conditionsTitle: 'Conditions that day',
    conditionsSub: 'What the weather and satellites saw on the selected date.',
    whyItMattersEyebrow: 'Why it matters',
    whyItMattersTitle: 'Every point is checkable.',
    whyItMattersDesc: 'The score uses only three measured signals: how fast the water is rising, how hot it has been, and how much rain fell. No hidden model, no black box.',
    readMethod: 'Read the method',
    // Escape
    escEyebrow: 'Last-mile safety · Hassanabad, Hunza',
    escHeading: 'Know exactly which way is up.',
    escLede: 'A warning only works if people know where to go. These routes lead from valley-floor villages to safe ground 96–132 m above the flood path, drawn from Copernicus 30-metre elevation data.',
    statSafeRoutes: 'safe routes',
    statHeightGained: 'height gained',
    statWalkingDist: 'walking distance',
    terrain3dSub: '3D terrain · tilt and drag to explore.',
    layerOptical: 'Optical',
    layerRadar: 'Radar',
    mapKey: 'Map key',
    keyEvacRoute: 'Evacuation route',
    keySafeGround: 'Safe ground',
    keyVillageStart: 'Village start',
    loadingTerrain: 'Loading 3D terrain…',
    terrainErrorTitle: '3D map could not load.',
    terrainErrorDesc: 'The route list below still shows each village, distance and height gain.',
    layerNote: 'Optical satellite basemap · OpenStreetMap Hunza road & village layer',
    escCaptionLeft: 'Dashed green lines are evacuation routes',
    escCaptionRight: 'Terrain: Copernicus 30 m · Imagery: Esri World Imagery',
    gainHeightTitle: 'Gain enough height',
    gainHeightDesc: 'Move uphill, away from the riverbed. These paths end above the estimated flood path, on open ground where people can wait for rescue.',
    evacTimeFoot: '35–50 min on foot',
    evacFamilies: 'Suitable for families',
    escapeRoutesHeading: 'Escape routes',
    escapeRoutesSub: 'Choose a route to focus the map.',
    sayItSimply: 'Say it simply: “Go uphill, not downstream.”',
    followDdma: 'Follow DDMA instructions. Help elders, children and animals first.',
    escFinePrint: 'Routes computed from Copernicus 30 m DEM elevation contours and OpenStreetMap Hunza village/road geometry. Field validation with local DDMA authorities is recommended prior to community drills.',
    // Alerts
    alertsEyebrow: 'Last-mile dispatch · Urdu voice + SMS',
    alertsHeading: 'A warning people can actually understand.',
    alertsLede: "Text bulletins don't help a farmer on a 2G phone. GlacierWatch turns the score into a short Urdu voice note, a 160-character SMS, and one clear instruction: go uphill.",
    previewWarningFor: 'Preview a warning for',
    trainingPreviewNotice: 'This lake is below the automatic alert threshold of 75. This is a training preview only.',
    urduVoiceWarning: 'Urdu voice warning',
    hearItInUrdu: 'Hear it in Urdu',
    voiceSpokenSub: 'Spoken from the alert text, small enough for a 2G phone.',
    worksOn2g: 'works on 2G',
    audioGenNote: 'Audio generated by the neural ur-PK-UzmaNeural voice engine and compressed below 45 KB.',
    playUrduPreview: 'Play Urdu preview',
    downloadAlertPkg: 'Download alert package',
    smsEyebrow: '160-character SMS',
    smsHeading: 'Written to be read on any phone',
    copyUrduSms: 'Copy Urdu SMS',
    copyEnglish: 'Copy English',
    engTranslationSummary: 'English translation for officers',
    whoReceives: 'Who receives it',
    chanSms: 'SMS to every registered phone',
    chanWhatsapp: 'Voice note for WhatsApp groups',
    chanBoard: 'Village noticeboard printout',
    whyAlertFired: 'Why this alert fired',
    triggeredAuto: 'Triggered automatically at 75. This lake is at',
    ddmaApproval: 'DDMA approval',
    ddmaDesc: 'Alerts never bypass local authority. A district officer reviews every message before it is sent.',
    step1Title: 'Risk crossed 75',
    step1Sub: 'Automatic trigger',
    step2Title: 'Warning drafted',
    step2Sub: 'Urdu text + voice ready',
    step3Title: 'DDMA review',
    waitingForOfficer: 'Waiting for an officer',
    step4Title: 'Sent to villages',
    step4Sub: 'SMS + WhatsApp + noticeboard',
    approveBtn: 'Approve & dispatch alert',
    approvalFinePrint: 'Approvals are logged to the DDMA dispatch audit file (live cellular SMS gateway disconnected).',
    // Method
    methodEyebrow: 'Method & guardrails',
    methodHeading: 'No black boxes. Every point has a reason.',
    methodLede: 'A district officer should be able to see exactly why a lake was flagged — and disagree with it. The score is a deterministic sum of three physical signs measured from orbit.',
    pts: 'pts',
    factorGrowthTitle: 'How fast the lake is growing',
    factorGrowthDesc: 'Surface area measured by radar or optical satellite, compared with the previous 15 days.',
    fullAt40: 'full at +40%',
    factorHeatTitle: 'How hot it has been',
    factorHeatDesc: 'Five-day maximum temperature compared with the seasonal normal for that lake.',
    normal: 'normal',
    fullAt15: 'full at +15°C',
    factorRainTitle: 'How much rain fell',
    factorRainDesc: 'Rainfall over the last 72 hours, which can push an already-full lake over the edge.',
    fullAt25: 'full at 25 mm',
    threeSimpleTiers: 'Three simple tiers',
    tiersSub: 'The same colors appear everywhere in GlacierWatch.',
    points100: '0–100 points',
    stableTier: 'Stable',
    stableTierDesc: 'Lake behaving normally for the season. No action.',
    watchTier: 'Watch',
    watchTierDesc: 'Measurable change. Check again after the next pass.',
    highTier: 'High risk',
    highTierDesc: 'Rapid growth plus heat or rain. Prepare downstream villages.',
    confidenceHeadTitle: 'How much to trust a reading',
    confidenceHeadDesc: 'Every score carries a confidence number. It is based on how much of the lake was visible through cloud, and how recently a radar pass saw it. Radar works through cloud, so a cloudy day does not automatically mean low confidence.',
    highConfLabel: 'High confidence',
    highConfDesc: 'Fresh radar pass, few clouds. Treat the score as a solid reading.',
    lowConfLabel: 'Low confidence',
    lowConfDesc: 'Old pass, heavy cloud. Treat the score as a prompt to look again — not a verdict.',
    notWhatTitle: 'What GlacierWatch is not',
    guard1Title: 'Not a flood clock.',
    guard1Desc: 'It is a decision-support risk indicator, not a prediction of when a lake will burst.',
    guard2Title: 'Not calibrated for every lake.',
    guard2Desc: 'The physical rules are tuned for ice-dammed surge lakes such as Shisper. Moraine-dammed lakes need separate calibration.',
    guard3Title: 'Never above local authority.',
    guard3Desc: 'Communities should always follow NDMA and DDMA evacuation orders.',
    openDataTitle: 'Open data, no proprietary hardware',
    openDataDesc: 'Every input is free and operational. No commercial satellite subscription is required.',
    src1: 'All-weather radar · 10 m',
    src2: 'Optical water mapping · 10 m',
    src3: 'Backup optical · 30 m',
    src4: 'Daily heat + rainfall',
    src5: 'Mountain rainfall · hourly',
    src6: '30 m elevation + routing',
    src7: '1,326 mapped polygons',
    src8: 'People, bridges, highways',
    pipelineEyebrow: 'From orbit to a village phone',
    pipelineTitle: 'Six steps, under 30 seconds.',
    p1Title: 'Load the terrain',
    p1Desc: 'Lake shapes, villages and 30 m elevation.',
    p2Title: 'Stream only the pixels',
    p2Desc: 'Under 200 KB per lake, no full scene downloads.',
    p3Title: 'Measure the water',
    p3Desc: 'Optical when clear, radar when cloudy.',
    p4Title: 'Score the change',
    p4Desc: 'Growth + heat + rain, itemised.',
    p5Title: 'Show the risk',
    p5Desc: 'Map, trend charts and a plain-language tier.',
    p6Title: 'Warn people',
    p6Desc: 'Urdu voice, SMS and an uphill route.',
    nasaChallenge: 'Built for NASA Space Apps Challenge 2026.',
    decisionSupportOnly: 'Decision support only.',
    footerDisclaimerText: 'GlacierWatch is not a flood prediction service. Ground conditions can change fast. Always follow official NDMA and DDMA instructions.',
    footerVerified: 'Verified telemetry · Sentinel, Landsat, NASA POWER & USGS',
    methodAndSources: 'Method & sources',
    highRiskChip: 'High risk',
    outOf100: 'out of 100',
    whatMovedScore: 'What moved the score',
    howConfidentReading: 'How confident is this reading?',
    latestObservations: 'Latest observations',
    downstreamExposure: 'Downstream exposure',
    peopleDownstream: 'people downstream',
    previewUrduWarning: 'Preview Urdu warning',
    showEscapeRoute: 'Show escape route',
    locateOnMap: 'Locate on map',
    technicalDetails: 'Technical details',
  },
  ur: {
    metaTitle: 'گلیشیر واچ — گلیشیائیھیل سیلاب کی ابتدائی وارننگ، شمالی پاکستان',
    skipLink: 'مشمول کی طرف جائیں',
    brandSub: 'گلیشیائیھیل سیلاب کی ابتدائی وارننگ · شمالی پاکستان',
    navOverview: 'جائزہ',
    navTimeMachine: 'ٹائم مشین',
    navEscape: 'محفوظ راستے',
    navAlerts: 'انتباہات',
    navMethod: 'طریقہ کار',
    liveEngineText: 'لائیو انجن · ڈیٹا بشمول 14 نومبر 2026',
    logOut: 'لاگ آؤٹ',
    heroEyebrow: 'شمالی پاکستان · قراقرم اور ہندوکش',
    heroTitleRest: 'جھیلوں کا قریب سے جائزہ لینے کی ضرورت ہے۔',
    heroLede: 'گلیشیر واچ خلاء سے خطرے سے دوچار جھیلوں پر نظر رکھتی ہے اور آسان الفاظ میں بتاتی ہے کہ کون سی جھیلیں تیزی سے بدل رہی ہیں۔',
    lastScanLabel: 'آخری سکین',
    scanSyncText: '14 نومبر 2026 · ٹیلی میٹری مطابقت پذیر',
    completeStatus: 'مکمل',
    coverageLabel: 'کوریج',
    coverageVal: '36 میں سے 36 جھیلیں',
    scanTimeLabel: 'سکین کا وقت',
    scanTimeVal: '27 سیکنڈز',
    newestPassLabel: 'نیا ترین پاس',
    scanNoteText: 'تصدیق شدہ ٹیلی میٹری: Sentinel-1/2, Landsat-9, NASA POWER & USGS فیڈز۔',
    shisperAlertTitle: 'شسپر جھیل، حسن آباد پر شدید خطرہ۔',
    shisperAlertDesc: 'جھیل 15 دن پہلے کے مقابلے میں 43% بڑی ہے۔ 4 مئی کو وارننگ جاری کی گئی تھی — سیلاب سے تین دن پہلے۔',
    hearUrduWarning: 'اردو وارننگ سنیں',
    seeHowUnfolded: 'دیکھیں یہ واقعہ کیسے ہوا',
    kpiHighLabel: 'زیادہ خطرہ',
    kpiHighSub: 'انتباہی حد 75 سے اوپر',
    kpiTotalLabel: 'زیر نظر جھیلیں',
    kpiTotalSub: 'سب سے زیادہ خطرے والے بیسن',
    kpiLeadLabel: 'پیشگی انتباہی وقت',
    kpiLeadSub: '2022 کے شسپر واقعے میں تصدیق شدہ',
    kpiConfLabel: 'ڈیٹا کا اعتماد',
    kpiConfSub: 'صاف آسمان + حالیہ راڈار',
    riskMapTitle: 'خطرہ کہاں ہے',
    riskMapSub: 'سیٹلائٹ کی پیمائش کردہ معلومات دیکھنے کے لیے کسی جھیل پر کلک کریں۔',
    terrain3d: 'تھری ڈی ٹرین',
    legendTitle: 'خطرے کا اسکور',
    legendHigh: 'زیادہ · 75–100',
    legendWatch: 'توجہ طلب · 45–74',
    legendStable: 'مستحکم · 0–44',
    loadingMap: 'رسک میپ لوڈ ہو رہا ہے…',
    mapErrorTitle: 'نقشہ لوڈ نہیں ہو سکا۔',
    mapErrorDesc: 'اپنا کنکشن چیک کریں اور ریفریش کریں۔ جھیل کی فہرست اب بھی کام کر رہی ہے۔',
    mapCaptionLeft: 'Sentinel-1 راڈار · Sentinel-2 آپٹیکل · کوپرنیکس 30 میٹر ٹرین',
    mapCaptionRight: '36 جھیلیں دکھائی گئی ہیں',
    priorityTitle: 'ترجیحی جھیلیں',
    sortedByRisk: 'خطرے کے لحاظ سے ترتیب دی گئی ہیں۔',
    monitoredCount: 'زیر نگرانی۔',
    liveDataBadge: 'لائیو ڈیٹا',
    searchPlaceholder: 'جھیل، وادی یا ضلع کا نام تلاش کریں',
    filterAll: 'سب',
    filterHigh: 'زیادہ خطرہ',
    filterWatch: 'توجہ طلب',
    filterStable: 'مستحکم',
    lakeEmpty: 'کوئی جھیل تلاش سے مطابقت نہیں رکھتی۔ "ہنزہ" جیسی وادی کا نام آزمائیں۔',
    popMillion: '7.1 ملین',
    popLiveDownstream: 'افراد خطرے سے دوچار جھیلوں کے نشیب میں آباد ہیں۔',
    whyEyebrow: 'یہ 36 جھیلیں کیوں؟',
    whyTitle: 'ہزاروں جھیلیں، لیکن صرف کچھ آبادی کے اوپر ہیں۔',
    whyDesc: 'شمالی پاکستان میں 3,044 گلیشیائی جھیلیں ہیں۔ یہاں دکھائی جانے والی 36 جھیلیں وہ ہیں جن کے نیچے دیہات، پل یا سڑکیں موجود ہیں۔ خلاء سے ان سب کی نگرانی میں صرف 27 سیکنڈز لگتے ہیں۔',
    factElevation: '30 میٹر',
    factElevationSub: 'بلندی کی تفصیل',
    factAudio: '< 45 KB',
    factAudioSub: 'اردو وائس وارننگ',
    factWindow: '48 گھنٹے+',
    factWindowSub: 'ہدف انتباہی ونڈو',
    // Time Machine
    tmEyebrow: 'تاریخی ریپلے · شسپر جی ای ای اور ناسا پاور ٹائم لائن',
    tmHeading: 'وارننگ تین دن پہلے موصول ہو گئی تھی۔',
    tmLede: 'مئی 2022 میں شسپر جھیل پھٹ گئی اور حسن آباد کا پل تباہ ہوگیا۔ آج کے اصولوں کے ساتھ اس سیزن کو دہرائیں اور دیکھیں کہ سیلاب سے پہلے اسکور خطرے کی لکیر سے کیسے آگے بڑھا۔',
    proofLabel: 'تصدیق شدہ نتیجہ',
    proofDays: '3 دن',
    proofBetween: 'پہلے شدید الرٹ اور سیلاب کے درمیان',
    proofCrossed: 'شسپر نے 75 عبور کیا',
    proofDateMay4: '4 مئی',
    proofWashed: 'پل بہہ گیا',
    proofDateMay7: '7 مئی',
    proofFoot: 'کنٹرول جھیلیں 45 سے نیچے رہیں — کوئی غلط الرٹ نہیں۔',
    tmSpeedLabel: 'اسپیڈ',
    tmevent1Date: '4 مئی',
    tmevent1Text: 'گرمی کی لہر · 17.5°C',
    tmevent2Date: '7 مئی',
    tmevent2Text: 'سیلاب / اخراج',
    chartAreaTitle: 'جھیل کتنی تیزی سے بڑی ہوئی',
    chartAreaSub: 'مربع کلومیٹر میں پیمائش شدہ رقبہ۔ شسپر نے تین ہفتوں میں اپنی بڑھوتری کی رفتار تقریباً دگنی کر دی۔',
    legendShisper: 'شسپر',
    legendPassu: 'پاسو',
    legendChiantar: 'چیانتار',
    chartRiskTitle: 'وارننگ کب جاری کی گئی',
    chartRiskSub: 'خطرے کا اسکور 100 میں سے۔ ڈیش لائن خودکار انتباہی حد ہے۔',
    alertAt75: '75 پر الرٹ',
    conditionsTitle: 'اُس دن کے حالات',
    conditionsSub: 'منتخب تاریخ پر موسم اور سیٹلائٹ نے کیا دیکھا۔',
    whyItMattersEyebrow: 'یہ کیوں اہم ہے',
    whyItMattersTitle: 'ہر پوائنٹ قابل تصدیق ہے۔',
    whyItMattersDesc: 'اسکور صرف تین پیمائش کردہ اشاریوں کا استعمال کرتا ہے: پانی کتنی تیزی سے بڑھ رہا ہے، کتنی گرمی ہے، اور کتنی بارش ہوئی۔ کوئی خفیہ ماڈل نہیں۔',
    readMethod: 'طریقہ کار پڑھیں',
    // Escape
    escEyebrow: 'نشیبی تحفظ · حسن آباد، ہنزہ',
    escHeading: 'یقینی بنائیں کہ کون سا راستہ اوپر جاتا ہے۔',
    escLede: 'وارننگ تب ہی کام کرتی ہے جب لوگوں کو پتا ہو کہاں جانا ہے۔ یہ راستے وادی کے فرش سے محفوظ مقام کی طرف لے جاتے ہیں۔',
    statSafeRoutes: 'محفوظ راستے',
    statHeightGained: 'حاصل کردہ بلندی',
    statWalkingDist: 'پیدل فاصلہ',
    terrain3dSub: 'تھری ڈی ٹرین · گھمانے اور دیکھنے کے لیے ڈریگ کریں۔',
    layerOptical: 'آپٹیکل',
    layerRadar: 'راڈار',
    mapKey: 'نقشے کی کلید',
    keyEvacRoute: 'انخلا کا راستہ',
    keySafeGround: 'محفوظ زمین',
    keyVillageStart: 'گاؤں کا نقطہ آغاز',
    loadingTerrain: 'تھری ڈی ٹرین لوڈ ہو رہا ہے…',
    terrainErrorTitle: 'تھری ڈی نقشہ لوڈ نہیں ہو سکا۔',
    terrainErrorDesc: 'نیچے دی گئی فہرست میں ہر گاؤں، فاصلہ اور بلندی دکھائی گئی ہے۔',
    layerNote: 'آپٹیکل سیٹلائٹ بیس میپ · اوپن اسٹریٹ میپ ہنزہ روڈ اور ولیج لیئر',
    escCaptionLeft: 'ڈیش والی سبز لکیریں انخلا کے راستے ہیں',
    escCaptionRight: 'ٹرین: کوپرنیکس 30 میٹر · امیجری: ایسری ورلڈ امیجری',
    gainHeightTitle: 'مناسب بلندی حاصل کریں',
    gainHeightDesc: 'دریا کے بستر سے دور، اوپر کی طرف جائیں۔ یہ راستے مجوزہ سیلاب کے راستے سے اوپر لے جاتے ہیں۔',
    evacTimeFoot: '35–50 منٹ پیدل',
    evacFamilies: 'خاندانوں کے لیے موزوں',
    escapeRoutesHeading: 'انخلا کے راستے',
    escapeRoutesSub: 'نقشے کو مرکوز کرنے کے لیے ایک راستہ منتخب کریں۔',
    sayItSimply: 'آسان الفاظ میں: "نیچے کی طرف نہیں، اوپر کی طرف جائیں۔"',
    followDdma: 'ڈی ڈی ایم اے کی ہدایات پر عمل کریں۔ پہلے بزرگوں، بچوں اور مویشیوں کی مدد کریں۔',
    escFinePrint: 'کوپرنیکس 30 میٹر ڈی ای ایم اور اوپن اسٹریٹ میپ کی مدد سے حساب لگایا گیا۔ مقامی ڈی ڈی ایم اے کے ساتھ فیلڈ توثیق کی سفارش کی جاتی ہے۔',
    // Alerts
    alertsEyebrow: 'آخری سرے کی ترسیل · اردو وائس + ایس ایم ایس',
    alertsHeading: 'ایک ایسی وارننگ جسے ہر کوئی سمجھ سکے۔',
    alertsLede: 'ٹیکسٹ بلیٹن 2G فون پر کام نہیں کرتے۔ گلیشیر واچ اسکور کو مختصر اردو وائس نوٹ اور 160 حروف کے ایس ایم ایس میں تبدیل کرتی ہے۔',
    previewWarningFor: 'وارننگ کا پیش نظارہ کریں',
    trainingPreviewNotice: 'یہ جھیل خودکار انتباہی حد 75 سے کم ہے۔ یہ صرف تربیتی پیش نظارہ ہے۔',
    urduVoiceWarning: 'اردو وائس وارننگ',
    hearItInUrdu: 'اردو میں سنیں',
    voiceSpokenSub: 'وارننگ ٹیکسٹ سے تیار کردہ، 2G فونز کے لیے موزوں۔',
    worksOn2g: '2G پر کام کرتا ہے',
    audioGenNote: 'آڈیو نیورل ur-PK-UzmaNeural وائس انجن سے تیار کی گئی ہے اور 45 KB سے کم کمپریس کی گئی ہے۔',
    playUrduPreview: 'اردو پریویو سنیں',
    downloadAlertPkg: 'الرٹ پیکج ڈاؤن لوڈ کریں',
    smsEyebrow: '160 حروف کا ایس ایم ایس',
    smsHeading: 'کسی بھی فون پر پڑھنے کے قابل',
    copyUrduSms: 'اردو ایس ایم ایس کاپی کریں',
    copyEnglish: 'انگریزی کاپی کریں',
    engTranslationSummary: 'افسران کے لیے انگریزی ترجمہ',
    whoReceives: 'کون وصول کرتا ہے',
    chanSms: 'ہر رجسٹرڈ فون پر ایس ایم ایس',
    chanWhatsapp: 'واٹس ایپ گروپس کے لیے وائس نوٹ',
    chanBoard: 'گاؤں کے نوٹس بورڈ کا پرنٹ آؤٹ',
    whyAlertFired: 'یہ الرٹ کیوں جاری ہوا',
    triggeredAuto: '75 پر خودکار طور پر شروع ہوا۔ یہ جھیل ہے',
    ddmaApproval: 'ڈی ڈی ایم اے کی منظوری',
    ddmaDesc: 'الرٹس کبھی بھی مقامی انتظامیہ کی منظوری کے بغیر جاری نہیں ہوتے۔ ضلعی افسر ہر پیغام کا جائزہ لیتا ہے۔',
    step1Title: 'خطرہ 75 سے تجاوز کر گیا',
    step1Sub: 'خودکار ٹ্রিگر',
    step2Title: 'وارننگ کا مسودہ تیار',
    step2Sub: 'اردو متن + وائس تیار',
    step3Title: 'ڈی ڈی ایم اے کا جائزہ',
    waitingForOfficer: 'افسر کے انتظار میں',
    step4Title: 'دیہات کو بھیج دیا گیا',
    step4Sub: 'ایس ایم ایس + واٹس ایپ + نوٹس بورڈ',
    approveBtn: 'منظور کریں اور الرٹ جاری کریں',
    approvalFinePrint: 'منظوریوں کو ڈی ڈی ایم اے ڈسپیچ آڈٹ فائل میں لاگ کیا جاتا ہے۔',
    // Method
    methodEyebrow: 'طریقہ کار اور حفاظتی تدابیر',
    methodHeading: 'کوئی بلیک باکس نہیں۔ ہر نقطے کی وجہ موجود ہے۔',
    methodLede: 'ضلعی افسر یہ دیکھ سکتا ہے کہ جھیل کو کیوں فلیگ کیا گیا۔ اسکور مدار سے ناپے گئے تین جسمانی اشاریوں کا مجموعہ ہے۔',
    pts: 'پوائنٹس',
    factorGrowthTitle: 'جھیل کتنی تیزی سے پھیل رہی ہے',
    factorGrowthDesc: 'پچھلے 15 دنوں کے مقابلے میں ریডার یا آپٹیکل سیٹلائٹ سے ناپا گیا رقبہ۔',
    fullAt40: '+40% پر مکمل',
    factorHeatTitle: 'گرمی کی شدت کتنی ہے',
    factorHeatDesc: 'اس جھیل کے موسمی اوسط کے مقابلے میں پانچ دن کا زیادہ سے زیادہ درجہ حرارت۔',
    normal: 'نارمل',
    fullAt15: '+15°C پر مکمل',
    factorRainTitle: 'کتنی بارش ہوئی',
    factorRainDesc: 'پچھلے 72 گھنٹوں میں ہونے والی بارش، جو پہلے سے بھری جھیل کو اور دباؤ میں ڈال سکتی ہے۔',
    fullAt25: '25 ملی میٹر پر مکمل',
    threeSimpleTiers: 'تین آسان درجات',
    tiersSub: 'گلیشیر واچ میں ہر جگہ یہی رنگ استعمال ہوتے ہیں۔',
    points100: '0–100 پوائنٹس',
    stableTier: 'مستحکم',
    stableTierDesc: 'جھیل موسم کے مطابق نارمل ہے۔ کوئی کارروائی درکار نہیں۔',
    watchTier: 'توجہ طلب',
    watchTierDesc: 'قابل پیمائش تبدیلی۔ اگلے پاس کے بعد دوبارہ چیک کریں۔',
    highTier: 'زیادہ خطرہ',
    highTierDesc: 'تیز رفتار بڑھوتری اور گرمی یا بارش۔ نشیبی دیہات کو تیار کریں۔',
    confidenceHeadTitle: 'پیمائش پر کتنا بھروسہ کیا جائے',
    confidenceHeadDesc: 'ہر اسکور کا ایک اعتمادی نمبر ہوتا ہے۔ یہ اس بات پر منحصر ہے کہ بادلوں میں جھیل کتنی واضح تھی۔',
    highConfLabel: 'زیادہ اعتماد',
    highConfDesc: 'تازہ راڈار پاس، کم بادل۔ اسکور کو پختہ پیمائش سمجھیں۔',
    lowConfLabel: 'کم اعتماد',
    lowConfDesc: 'پرانا پاس، زیادہ بادل۔ اسے دوبارہ چیک کرنے کا اشارہ سمجھیں۔',
    notWhatTitle: 'گلیشیر واچ کیا نہیں ہے',
    guard1Title: 'سیلاب کی گھڑی نہیں۔',
    guard1Desc: 'یہ فیصلہ سازی کا خطرے کا اشاریہ ہے، سیلاب کے وقت کی پیشگوئی نہیں۔',
    guard2Title: 'ہر جھیل کے لیے الگ کیलिब्रेटेड نہیں۔',
    guard2Desc: 'اصول شسپر جیسی جھیلوں کے لیے ہیں۔ مورین جھیلوں کے لیے الگ کیलिब्रেশন درکار ہے۔',
    guard3Title: 'مقامی انتظامیہ سے بالاتر نہیں۔',
    guard3Desc: 'برادریوں کو ہمیشہ این ڈی ایم اے اور ڈی ڈی ایم اے کے احکامات پر عمل کرنا چاہیے۔',
    openDataTitle: 'اوپن ڈیٹا، کوئی مہنگا ہارڈویئر نہیں',
    openDataDesc: 'ہر ان پٹ مفت اور قابل استعمال ہے۔ کسی تجارتی سیٹلائٹ سبسکرپشن کی ضرورت نہیں۔',
    src1: 'آل ویدر راڈار · 10 میٹر',
    src2: 'آپٹیکل واٹر میپنگ · 10 میٹر',
    src3: 'بیک اپ آپٹیکل · 30 میٹر',
    src4: 'روزانہ گرمی + بارش',
    src5: 'پہاڑی بارش · فی گھنٹہ',
    src6: '30 میٹر بلندی + روٹنگ',
    src7: '1,326 میپڈ پولیگون',
    src8: 'لوگ، پل، شاہراہیں',
    pipelineEyebrow: 'خلاء سے دیہاتی کے فون تک',
    pipelineTitle: 'چھ مراحل، 30 سیکنڈز سے کم میں۔',
    p1Title: 'ٹرین لوڈ کریں',
    p1Desc: 'جھیل کی شکلیں، دیہات اور 30 میٹر بلندی۔',
    p2Title: 'صرف پکسلز اسٹریم کریں',
    p2Desc: 'فی جھیل 200 KB سے کم۔',
    p3Title: 'پانی کی پیمائش کریں',
    p3Desc: 'صاف ہونے پر آپٹیکل، بادل ہونے پر راڈار۔',
    p4Title: 'تبدیلی کا اسکور بنائیں',
    p4Desc: 'بڑھوتری + گرمی + بارش۔',
    p5Title: 'خطرہ دکھائیں',
    p5Desc: 'نقشہ، ٹرینڈ چارٹس اور آسان زبان۔',
    p6Title: 'لوگوں کو خبردار کریں',
    p6Desc: 'اردو آواز، ایس ایم ایس اور اوپر کا راستہ۔',
    nasaChallenge: 'ناسا اسپیس ایپس چیلنج 2026 کے لیے بنایا گیا۔',
    decisionSupportOnly: 'فیصلہ سازی کی معاونت صرف۔',
    footerDisclaimerText: 'گلیشیر واچ سیلاب کی پیشگوئی کی سروس نہیں ہے۔ ہمیشہ سرکاری احکامات پر عمل کریں۔',
    footerVerified: 'تصدیق شدہ ٹیلی میٹری · سینٹینیل، لینڈسیٹ، ناسا پاور اور یو ایس جی ایس',
    methodAndSources: 'طریقہ کار اور ذرائع',
    highRiskChip: 'زیادہ خطرہ',
    outOf100: '100 میں سے',
    whatMovedScore: 'اسکور میں کس چیز نے تبدیلی کی',
    howConfidentReading: 'اس پیمائش پر کتنا بھروسہ ہے؟',
    latestObservations: 'حالیہ مشاہدات',
    downstreamExposure: 'نشیب کی آبادی',
    peopleDownstream: 'افراد نشیب میں',
    previewUrduWarning: 'اردو وارننگ کا پیش نظارہ کریں',
    showEscapeRoute: 'انخلا کا راستہ دکھائیں',
    locateOnMap: 'نقشے پر تلاش کریں',
    technicalDetails: 'تکنیکی تفصیلات',
  }
};

const state = {
  view: 'overview',
  filter: 'all',
  search: '',
  selectedLakeId: null,
  tmIndex: TIME_MACHINE.meta.startIndex,
  tmTimer: null,
  chartsBooted: false,
  overviewMap: null,
  terrainMap: null,
  terrainBooted: false,
  evacLayer: 'optical',
  alertLakeId: 'shisper',
  alertApproved: false,
  voices: [],
  speaking: false,
  voiceTimer: null,
  voiceDuration: 18,
  voiceElapsed: 0,
  pendingRouteFocus: false,
  toastTimer: null,
  lang: 'en',
};

let activeAudio = null;

const icon = (name, className = '') =>
  `<svg class="icon ${className}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

/* ------------------------------- Language Toggle --------------------------- */

function toggleLanguage() {
  state.lang = state.lang === 'en' ? 'ur' : 'en';
  const html = document.documentElement;
  const t = TRANSLATIONS[state.lang];

  if (state.lang === 'ur') {
    html.setAttribute('lang', 'ur');
    html.setAttribute('dir', 'rtl');
    toast('زبان اردو میں تبدیل ہو گئی ہے');
  } else {
    html.setAttribute('lang', 'en');
    html.setAttribute('dir', 'ltr');
    toast('Language switched to English');
  }

  // 1. Scan and translate all elements with data-i18n attributes globally
  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // 2. Scan and translate placeholders
  $$('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  // 3. Re-render dynamic active components so they update immediately
  renderLakeList();
  renderTimeMachine(state.tmIndex);
  setupEscape();
  renderAlertPage();
}

function setupLanguageToggle() {
  const desktopBtn = $('#lang-toggle-btn');
  const mobileBtn = $('#lang-toggle-btn-mobile');

  [desktopBtn, mobileBtn].forEach((btn) => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLanguage();
    });
  });
}

/* ------------------------------- Navigation -------------------------------- */

function viewFromHash() {
  const value = window.location.hash.replace('#', '');
  return VIEWS.includes(value) ? value : 'overview';
}

function go(view, { scroll = true } = {}) {
  if (!VIEWS.includes(view)) view = 'overview';
  if (window.location.hash !== `#${view}`) {
    window.history.pushState(null, '', `#${view}`);
  }
  activateView(view);
  if (scroll) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function activateView(view) {
  state.view = view;
  $$('.view').forEach((panel) => {
    const active = panel.dataset.viewPanel === view;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  $$('.nav-link, [data-view], [data-nav], [data-jump]').forEach((button) => {
    const btnView = button.dataset.view || button.dataset.nav || button.dataset.jump;
    const active = btnView === view;
    button.classList.toggle('is-active', active);
    if (active && button.classList.contains('nav-link')) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  closeMobileNav();
  if (view !== 'timemachine') stopPlayback();
  if (view !== 'alerts') cancelSpeech();
  document.title = `${VIEW_TITLES[view] || 'Overview'} · GlacierWatch`;

  if (view === 'timemachine') {
    window.setTimeout(ensureCharts, 40);
  }
  if (view === 'escape') {
    window.setTimeout(ensureTerrain, 40);
    window.setTimeout(() => state.terrainMap?.resize(), 130);
  }
  if (view === 'alerts') renderAlertPage();
  if (view === 'overview') {
    window.setTimeout(() => state.overviewMap?.resize(), 40);
  }
}

function setupNavigation() {
  document.addEventListener('click', (event) => {
    const navBtn = event.target.closest('[data-view], [data-nav], [data-jump]');
    if (navBtn) {
      event.preventDefault();
      const targetView = navBtn.dataset.view || navBtn.dataset.nav || navBtn.dataset.jump;
      if (targetView) {
        go(targetView);
      }
      return;
    }
  });

  const menu = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    mobileNav?.classList.toggle('is-open', !open);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMobileNav();
  });

  window.addEventListener('popstate', () => {
    activateView(viewFromHash());
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

function closeMobileNav() {
  const menu = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');
  if (!menu || !mobileNav) return;
  menu.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('is-open');
}

/* --------------------------------- Helpers --------------------------------- */

function numberWord(value) {
  const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return words[value] ?? String(value);
}

function tierLabel(tier) {
  return tier === 'moderate' ? (state.lang === 'ur' ? 'توجہ طلب' : 'Watch') : (TIERS[tier]?.label ?? 'Stable');
}

function reportLine(count) {
  return state.lang === 'ur' ? `${count} دن` : `${count} ${count === 1 ? 'day' : 'days'}`;
}

function toast(message) {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => element.classList.remove('show'), 2600);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`${label} copied.`);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      toast(`${label} copied.`);
    } catch {
      toast('Could not copy on this device.');
    }
    area.remove();
  }
}

/* --------------------------------- Overview -------------------------------- */

function setupOverview() {
  const highCount = LAKES.filter((l) => l.tier === 'high').length;
  const modCount = LAKES.filter((l) => l.tier === 'moderate').length;
  const lowCount = LAKES.filter((l) => l.tier === 'low').length;

  $('#kpi-high').textContent = highCount;
  $('#kpi-total').textContent = LAKES.length;
  $('#kpi-lead').textContent = reportLine(TIME_MACHINE.meta.leadDays);
  $('#kpi-confidence').textContent = `${AVG_CONFIDENCE}%`;
  $('#hero-count-word').textContent = numberWord(highCount);
  $('#chip-all').textContent = LAKES.length;
  $('#chip-high').textContent = highCount;
  $('#chip-moderate').textContent = modCount;
  $('#chip-low').textContent = lowCount;
  $('#lake-count').textContent = LAKES.length;

  renderLakeList();

  $('#lake-search')?.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderLakeList();
  });

  $$('.filter-row .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter;
      $$('.filter-row .chip').forEach((item) => item.classList.toggle('is-active', item === chip));
      renderLakeList();
    });
  });

  $('#lake-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-lake]');
    if (button) openLake(button.dataset.lake);
  });

  state.overviewMap = initOverviewMap($('#overview-map'), {
    lakes: LAKES,
    onSelect: openLake,
  });

  const terrainButton = $('#map-3d-toggle');
  if (terrainButton) {
    if (!state.overviewMap) {
      terrainButton.disabled = true;
      terrainButton.setAttribute('aria-checked', 'false');
    } else {
      terrainButton.setAttribute('aria-checked', String(state.overviewMap.isTerrainOn()));
      terrainButton.addEventListener('click', () => {
        const on = state.overviewMap.toggleTerrain();
        terrainButton.setAttribute('aria-checked', String(on));
      });
    }
  }
}

function filteredLakes() {
  const query = state.search.trim().toLowerCase();
  return LAKES.filter((lake) => {
    const matchesTier = state.filter === 'all' || lake.tier === state.filter;
    if (!matchesTier) return false;
    if (!query) return true;
    return [lake.name, lake.basin, lake.district, lake.damType, lake.villages.join(' '), lake.urdu]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function renderLakeList() {
  const list = $('#lake-list');
  const empty = $('#lake-empty');
  if (!list) return;
  const lakes = filteredLakes();

  list.innerHTML = lakes
    .map(
      (lake) => `
      <li class="lake-item">
        <button type="button" data-lake="${lake.id}" aria-label="Open details for ${lake.name}, risk score ${lake.total} out of 100">
          <span class="lake-dot ${lake.tier}" aria-hidden="true"></span>
          <span class="lake-item-name">
            <strong>${state.lang === 'ur' && lake.urdu ? lake.urdu : lake.name}</strong>
            <span>${lake.district} · ${lake.damType}</span>
          </span>
          <span class="risk-pill ${lake.tier}">${lake.total}</span>
          ${icon('chevron', 'chevron')}
        </button>
      </li>`,
    )
    .join('');

  list.scrollTop = 0;
  if (empty) empty.hidden = lakes.length > 0;
}

/* ------------------------------ Lake details ------------------------------- */

const VERDICTS = {
  high: 'Water is rising fast, and heat or rain is adding pressure. People downstream should be ready to move.',
  moderate: 'The lake is changing. Keep watching — the next satellite pass decides whether this escalates.',
  low: 'The lake is behaving normally for this season. No action is needed today.',
};

const VERDICT_NOTES = {
  high: 'Above the automatic warning line of 75.',
  moderate: 'Between the watch line of 45 and the warning line of 75.',
  low: 'Below the watch line of 45.',
};

function openLake(id) {
  const lake = LAKE_BY_ID.get(id);
  if (!lake) return;
  const dialog = $('#lake-dialog');
  if (!dialog) return;

  state.selectedLakeId = id;
  state.overviewMap?.selectMarker(id);

  const chip = $('#dialog-chip');
  if (chip) {
    chip.className = `risk-chip ${lake.tier}`;
    chip.innerHTML = `<i class="dot dot-${lake.tier === 'moderate' ? 'moderate' : lake.tier}"></i><span>${tierLabel(lake.tier)}</span>`;
  }

  if ($('#dialog-title')) $('#dialog-title').textContent = state.lang === 'ur' && lake.urdu ? lake.urdu : lake.name;
  if ($('#dialog-urdu')) $('#dialog-urdu').textContent = lake.urdu;
  if ($('#dialog-location')) $('#dialog-location').textContent = `${lake.basin} basin · ${lake.district} district · ${lake.damType}`;
  if ($('#dialog-score')) $('#dialog-score').textContent = lake.total;
  if ($('#dialog-verdict')) $('#dialog-verdict').textContent = lake.reason || VERDICTS[lake.tier];
  if ($('#dialog-verdict-note')) {
    $('#dialog-verdict-note').textContent = lake.seismicWatch
      ? `${VERDICT_NOTES[lake.tier]} · ${lake.seismicWatch}`
      : VERDICT_NOTES[lake.tier];
  }

  const ring = $('#ring-fill');
  if (ring) {
    ring.setAttribute('class', `ring-fill ${lake.tier}`);
    const circumference = 326.73;
    ring.style.strokeDashoffset = String((1 - lake.total / 100) * circumference);
  }

  const breakdown = $('#dialog-breakdown');
  if (breakdown) {
    breakdown.innerHTML = `
      <div class="bd-row" data-factor="growth">
        <div class="bd-head"><span class="bd-label">Lake growth</span><span class="bd-points">${lake.expansion} of 50</span></div>
        <p class="bd-measure">${lake.growthPct}% larger than 15 days ago</p>
        <div class="bd-bar"><i style="width:${(lake.expansion / 50) * 100}%"></i></div>
      </div>
      <div class="bd-row" data-factor="heat">
        <div class="bd-head"><span class="bd-label">Heat</span><span class="bd-points">${lake.thermal} of 30</span></div>
        <p class="bd-measure">${lake.tempAnomaly}°C above the seasonal normal</p>
        <div class="bd-bar"><i style="width:${(lake.thermal / 30) * 100}%"></i></div>
      </div>
      <div class="bd-row" data-factor="rain">
        <div class="bd-head"><span class="bd-label">Rain</span><span class="bd-points">${lake.rain} of 20</span></div>
        <p class="bd-measure">${lake.rain72} mm in the last 72 hours</p>
        <div class="bd-bar"><i style="width:${(lake.rain / 20) * 100}%"></i></div>
      </div>`;
  }

  if ($('#dialog-confidence')) $('#dialog-confidence').textContent = `${lake.confidence}%`;
  const confidenceBar = $('#dialog-confidence-bar');
  if (confidenceBar) {
    confidenceBar.style.setProperty('--fill', `${lake.confidence}%`);
    confidenceBar.style.setProperty('--bar-color', lake.confidence >= 70 ? '#0f8a5f' : lake.confidence >= 50 ? '#d97706' : '#d63b3b');
  }
  if ($('#dialog-confidence-copy')) $('#dialog-confidence-copy').textContent = `Based on ${lake.cloudPct}% cloud cover and a radar pass ${reportLine(lake.sarDays)} old.`;

  if ($('#dialog-obs')) {
    $('#dialog-obs').innerHTML = [
      ['Lake area', `${lake.areaKm2} km²`],
      ['15-day change', `+${lake.growthPct}%`],
      ['Heat anomaly', `+${lake.tempAnomaly}°C`],
      ['72 h rainfall', `${lake.rain72} mm`],
      ['Cloud cover', `${lake.cloudPct}%`],
      ['Sensor used', lake.sensor === 'Radar (SAR)' ? 'Radar' : 'Optical'],
    ]
      .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
      .join('');
  }

  if ($('#dialog-pop')) $('#dialog-pop').textContent = fmtNum.format(lake.population);
  if ($('#dialog-villages')) {
    $('#dialog-villages').innerHTML = lake.villages
      .map((village) => `<span class="recipient-chip">${village}</span>`)
      .join('');
  }

  const routeButton = $('#dialog-route-btn');
  const isShisper = lake.id === 'shisper';
  if (routeButton) {
    routeButton.disabled = !isShisper;
    routeButton.title = isShisper ? 'Show the Hassanabad evacuation route' : 'Escape routes are mapped for Shisper only';
  }

  if ($('#dialog-tech-list')) {
    $('#dialog-tech-list').innerHTML = [
      ['Primary sensor', lake.sensor],
      ['Last radar pass', `${reportLine(lake.sarDays)} ago`],
      ['Last optical pass', `${lake.opticalDays} days ago`],
      ['Cloud cover', `${lake.cloudPct}%`],
      ['Baseline', '15-day rolling minimum lake area'],
      ['Score formula', `Expansion ${lake.expansion}/50 + Heat ${lake.thermal}/30 + Rain ${lake.rain}/20`],
      ['Calibration', 'Tuned for ice-dammed surge lakes; moraine lakes need local calibration'],
    ]
      .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
      .join('');
  }

  if (!dialog.open) dialog.showModal();
}

function setupLakeDialog() {
  const dialog = $('#lake-dialog');
  if (!dialog) return;

  $('#dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  $('#dialog-alert-btn')?.addEventListener('click', () => {
    const lake = LAKE_BY_ID.get(state.selectedLakeId);
    if (!lake) return;
    dialog.close();
    state.alertLakeId = lake.id;
    go('alerts');
    window.setTimeout(toggleVoice, 380);
  });

  $('#dialog-route-btn')?.addEventListener('click', () => {
    if (state.selectedLakeId !== 'shisper') return;
    dialog.close();
    state.pendingRouteFocus = true;
    go('escape');
    window.setTimeout(() => {
      state.terrainMap?.focusRoute('hassanabad-village');
      state.pendingRouteFocus = false;
    }, 1500);
  });

  $('#dialog-locate-btn')?.addEventListener('click', () => {
    const id = state.selectedLakeId;
    dialog.close();
    go('overview');
    window.setTimeout(() => state.overviewMap?.focusLake(id), 260);
  });
}

/* ------------------------------- Time Machine ------------------------------ */

let areaChart = null;
let riskChart = null;

function tmNarrative(index) {
  const tmMeta = TIME_MACHINE.meta;
  if (index >= tmMeta.breachIndex) return 'Shisper has burst. The bridge is gone, and the lake is draining.';
  if (index >= tmMeta.breachIndex - 1) return 'Shisper is at its peak. The alert has been live for two days.';
  if (index >= tmMeta.firstHighIndex) return `The heat spike pushed Shisper above the danger line — ${reportLine(tmMeta.leadDays)} before the breach.`;
  if (index >= tmMeta.firstHighIndex - 2) return 'Rain and heat are building, but the score is still below the danger line.';
  return 'The lake is growing slowly. No alert has been issued.';
}

function sparkline(values, color) {
  if (values.length < 2) {
    return '<svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"></svg>';
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 28 - ((value - min) / range) * 23;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point}`).join(' ');
  return `<svg class="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
    <path class="spark-fill" d="${line} L100 30 L0 30 Z" fill="${color}"></path>
    <path d="${line}" stroke="${color}"></path>
  </svg>`;
}

function renderSnapshots(index) {
  const container = $('#tm-snapshots');
  if (!container) return;
  const markup = Object.entries(TIME_MACHINE.lakes)
    .map(([key, lake]) => {
      const day = lake.series[Math.min(index, lake.series.length - 1)];
      const first = lake.series[0];
      const change = ((day.area - first.area) / first.area) * 100;
      const sub = key === 'shisper' ? 'Ice-dammed · Hassanabad' : 'Control lake';
      const cls = change < 5 ? 'neutral' : '';
      return `
        <article class="snapshot ${day.tier}">
          <div class="snapshot-head">
            <div>
              <span class="snapshot-name">${lake.name}</span>
              <span class="snapshot-sub">${sub}</span>
            </div>
            <span class="snapshot-score ${day.tier}" aria-label="Risk score ${day.total} out of 100">${day.total}</span>
          </div>
          <div class="snapshot-mid">
            <span class="snapshot-area">Lake area<strong>${day.area.toFixed(2)} km²</strong></span>
            <span class="snapshot-change ${cls}">${change >= 0 ? '+' : ''}${change.toFixed(1)}%</span>
          </div>
          ${sparkline(lake.series.slice(0, index + 1).map((item) => item.area), lake.color)}
        </article>`;
    })
    .join('');
  container.innerHTML = markup;
}

function renderConditions(index) {
  const container = $('#tm-conditions');
  if (!container) return;
  const series = TIME_MACHINE.lakes.shisper.series;
  const day = series[Math.min(index, series.length - 1)];
  const items = [
    ['thermo', 'Max temperature', `${day.tmax}°C`, `Heat anomaly +${day.tempAnomaly}°C`],
    ['rain', 'Rain · 72 hours', `${day.rain72} mm`, `24 h total ${day.rain24} mm`],
    ['cloud', 'Cloud cover', `${day.cloudPct}%`, 'Radar sees through cloud'],
    ['signal', 'Data confidence', `${day.confidence}%`, 'Recency + clear-sky score'],
  ];
  container.innerHTML = items
    .map(
      ([iconName, label, value, sub]) => `
      <div class="condition">
        <span class="condition-label">${icon(iconName)} ${label}</span>
        <span class="condition-value">${value}</span>
        <span class="condition-sub">${sub}</span>
      </div>`,
    )
    .join('');
}

function renderTimeMachine(index) {
  const clamped = Math.max(0, Math.min(TIME_MACHINE.dates.length - 1, index));
  state.tmIndex = clamped;
  const series = TIME_MACHINE.lakes.shisper.series;
  const day = series[Math.min(clamped, series.length - 1)];

  if ($('#tm-day-label')) $('#tm-day-label').textContent = `Day ${clamped + 1} of ${TIME_MACHINE.dates.length}`;
  if ($('#tm-date-label')) $('#tm-date-label').textContent = day.dateLong;
  if ($('#tm-note')) $('#tm-note').textContent = tmNarrative(clamped);

  const slider = $('#tm-slider');
  if (slider) {
    slider.value = String(clamped);
    const maxIdx = Math.max(1, TIME_MACHINE.dates.length - 1);
    slider.style.setProperty('--progress', `${(clamped / maxIdx) * 100}%`);
  }

  renderSnapshots(clamped);
  renderConditions(clamped);
  updateChartMarker();

  const sensorBadge = $('#tm-sensor-badge');
  if (sensorBadge) sensorBadge.textContent = day.cloudPct >= 60 ? 'Sentinel-1 radar' : 'Sentinel-2 optical';
}

function setupTimeMachine() {
  state.tmIndex = TIME_MACHINE.meta.startIndex;
  const slider = $('#tm-slider');
  if (!slider) return;
  slider.max = String(TIME_MACHINE.dates.length - 1);
  slider.value = String(state.tmIndex);
  renderTimeMachine(state.tmIndex);

  slider.addEventListener('input', () => {
    stopPlayback();
    renderTimeMachine(Number(slider.value));
  });

  $('#tm-play')?.addEventListener('click', togglePlayback);
  $('#tm-speed')?.addEventListener('change', () => {
    if (state.tmTimer) {
      startPlayback();
    }
  });
}

function togglePlayback() {
  if (state.tmTimer) {
    stopPlayback();
    return;
  }
  if (state.tmIndex >= TIME_MACHINE.dates.length - 1) {
    renderTimeMachine(0);
  }
  startPlayback();
}

function startPlayback() {
  stopPlayback();
  const speed = Number($('#tm-speed')?.value) || 1;
  const delay = speed === 2 ? 430 : 880;
  const button = $('#tm-play');
  button?.classList.add('is-playing');
  button?.setAttribute('aria-label', 'Pause the timeline');
  state.tmTimer = window.setInterval(() => {
    if (state.tmIndex >= TIME_MACHINE.dates.length - 1) {
      stopPlayback();
      return;
    }
    renderTimeMachine(state.tmIndex + 1);
  }, delay);
}

function stopPlayback() {
  if (state.tmTimer) {
    window.clearInterval(state.tmTimer);
    state.tmTimer = null;
  }
  const button = $('#tm-play');
  if (button) {
    button.classList.remove('is-playing');
    button.setAttribute('aria-label', 'Play the timeline');
  }
}

const dayMarkerPlugin = {
  id: 'dayMarker',
  afterDatasetsDraw(chart) {
    const index = chart.options?.plugins?.dayMarker?.index;
    if (index == null) return;
    const { ctx, chartArea } = chart;
    const x = chart.scales.x.getPixelForValue(index);
    if (!Number.isFinite(x)) return;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(11, 110, 130, .45)';
    ctx.lineWidth = 1;
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#0b6e82';
    ctx.beginPath();
    ctx.arc(x, chartArea.top + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};

function chartOptions(yOptions, index) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 300 },
    layout: { padding: { top: 6, right: 6, left: 0, bottom: 0 } },
    plugins: {
      legend: { display: false },
      dayMarker: { index },
      tooltip: {
        backgroundColor: '#0c2533',
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        boxWidth: 7,
        boxHeight: 7,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { maxTicksLimit: 6, font: { family: 'Inter', size: 11 }, color: '#5f7889', maxRotation: 0 },
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(12, 37, 51, .07)' },
        ticks: { font: { family: 'Inter', size: 11 }, color: '#5f7889', ...(yOptions.ticks || {}) },
        ...yOptions,
      },
    },
  };
}

function ensureCharts() {
  if (state.chartsBooted) {
    areaChart?.resize();
    riskChart?.resize();
    return;
  }
  state.chartsBooted = true;

  if (!window.Chart) {
    $$('.chart-wrap').forEach((wrap) => {
      wrap.innerHTML = '<p class="empty-state">Trend charts could not load. The daily numbers above are still accurate.</p>';
    });
    return;
  }

  const Chart = window.Chart;
  Chart.defaults.font.family = '"Inter", ui-sans-serif, system-ui, sans-serif';
  Chart.defaults.color = '#5f7889';
  Chart.register(dayMarkerPlugin);

  const labels = TIME_MACHINE.labels;
  const series = TIME_MACHINE.lakes;
  const threshold = labels.map(() => 75);

  const areaDatasets = Object.entries(series).map(([key, lake]) => ({
    label: lake.name.replace(' Lake', ''),
    data: lake.series.map((day) => day.area),
    borderColor: lake.color,
    backgroundColor: key === 'shisper' ? 'rgba(214, 59, 59, .08)' : 'transparent',
    fill: key === 'shisper',
    borderWidth: 2.2,
    tension: 0.32,
    pointRadius: 0,
    pointHoverRadius: 3.5,
    pointHoverBackgroundColor: lake.color,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
  }));

  const riskDatasets = Object.entries(series).map(([key, lake]) => ({
    label: lake.name.replace(' Lake', ''),
    data: lake.series.map((day) => day.total),
    borderColor: lake.color,
    backgroundColor: 'transparent',
    fill: false,
    borderWidth: key === 'shisper' ? 2.4 : 1.8,
    tension: 0.28,
    pointRadius: 0,
    pointHoverRadius: 3.5,
    pointHoverBackgroundColor: lake.color,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
  }));

  riskDatasets.push({
    label: 'Alert threshold',
    data: threshold,
    borderColor: 'rgba(214, 59, 59, .7)',
    borderDash: [5, 5],
    borderWidth: 1.4,
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
    order: 10,
  });

  const areaCanvas = $('#chart-area');
  const riskCanvas = $('#chart-risk');

  if (areaCanvas) {
    areaChart = new Chart(areaCanvas, {
      type: 'line',
      data: { labels, datasets: areaDatasets },
      options: chartOptions(
        {
          min: 0.2,
          max: 0.42,
          ticks: {
            callback: (value) => Number(value).toFixed(2),
          },
        },
        state.tmIndex,
      ),
    });
  }

  if (riskCanvas) {
    riskChart = new Chart(riskCanvas, {
      type: 'line',
      data: { labels, datasets: riskDatasets },
      options: chartOptions(
        {
          min: 0,
          max: 100,
          ticks: { stepSize: 25 },
        },
        state.tmIndex,
      ),
    });
  }

  const tooltip = (context) => {
    const label = context.dataset.label;
    const value = context.parsed.y;
    if (label === 'Alert threshold') return 'Automatic alert · 75';
    if (context.chart === areaChart) return `${label}: ${Number(value).toFixed(2)} km²`;
    return `${label}: ${value}/100`;
  };

  if (areaChart) areaChart.options.plugins.tooltip.callbacks = { label: tooltip };
  if (riskChart) riskChart.options.plugins.tooltip.callbacks = { label: tooltip };
  areaChart?.update('none');
  riskChart?.update('none');
}

function updateChartMarker() {
  [areaChart, riskChart].forEach((chart) => {
    if (!chart) return;
    chart.options.plugins.dayMarker.index = state.tmIndex;
    chart.update('none');
  });
}

/* --------------------------------- Escape ---------------------------------- */

function setupEscape() {
  const routeList = $('#route-list');
  if (!routeList) return;
  routeList.innerHTML = EVAC_ROUTES.map(
    (route) => `
      <li>
        <button type="button" class="route-item" data-route="${route.id}">
          <span class="route-item-top">
            <strong>${route.name}</strong>
            <span class="route-gain">+${route.elevationEnd - route.elevationStart} m</span>
          </span>
          <span class="route-item-meta">
            <span>${icon('route')} ${route.distanceKm} km</span>
            <span>${icon('clock')} ${route.minutes} min</span>
          </span>
          <p>${route.description}</p>
        </button>
      </li>`,
  ).join('');

  routeList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-route]');
    if (!button) return;
    markRouteActive(button.dataset.route);
    state.terrainMap?.focusRoute(button.dataset.route);
  });

  $$('.layer-toggle button').forEach((button) => {
    button.addEventListener('click', () => {
      state.evacLayer = button.dataset.layer;
      $$('.layer-toggle button').forEach((item) => item.classList.toggle('is-active', item === button));
      const note = $('#layer-note');
      if (note) {
        note.textContent =
          state.evacLayer === 'sar'
            ? 'Simulated radar texture · production streams Sentinel-1'
            : 'Optical imagery · illustrative basemap';
      }
      if (state.terrainMap) {
        state.terrainMap.setLayer(state.evacLayer);
      } else {
        window.setTimeout(() => state.terrainMap?.setLayer(state.evacLayer), 900);
      }
    });
  });
}

function markRouteActive(id) {
  $$('.route-item').forEach((item) => item.classList.toggle('is-active', item.dataset.route === id));
}

function ensureTerrain() {
  if (state.terrainBooted) {
    state.terrainMap?.resize();
    return;
  }
  state.terrainBooted = true;
  state.terrainMap = initTerrainMap($('#terrain-map'), {
    routes: EVAC_ROUTES,
    onRouteSelect: markRouteActive,
  });
  window.setTimeout(() => {
    state.terrainMap?.resize();
    state.terrainMap?.setLayer(state.evacLayer);
    if (state.pendingRouteFocus) {
      state.terrainMap?.focusRoute('hassanabad-village');
      state.pendingRouteFocus = false;
    }
  }, 1600);
}

/* --------------------------------- Alerts ---------------------------------- */

function setupAlerts() {
  const select = $('#alert-lake-select');
  if (!select) return;
  const groups = [
    ['High risk', LAKES.filter((lake) => lake.tier === 'high')],
    ['Watch', LAKES.filter((lake) => lake.tier === 'moderate')],
    ['Stable · training only', LAKES.filter((lake) => lake.tier === 'low')],
  ];
  select.innerHTML = groups
    .filter(([, lakes]) => lakes.length)
    .map(
      ([label, lakes]) => `
        <optgroup label="${label}">
          ${lakes.map((lake) => `<option value="${lake.id}">${state.lang === 'ur' && lake.urdu ? lake.urdu : lake.name} · ${lake.total}/100</option>`).join('')}
        </optgroup>`,
    )
    .join('');

  select.value = state.alertLakeId;
  select.addEventListener('change', () => setAlertLake(select.value));

  buildWaveform();
  setupSpeech();

  $('#voice-play')?.addEventListener('click', toggleVoice);
  $('#voice-preview')?.addEventListener('click', toggleVoice);
  $('#hero-voice')?.addEventListener('click', () => {
    go('alerts');
    window.setTimeout(toggleVoice, 420);
  });
  $('#approve-btn')?.addEventListener('click', approveDispatch);
  $('#download-package')?.addEventListener('click', downloadAlertPackage);

  $('#copy-sms')?.addEventListener('click', () => {
    const lake = LAKE_BY_ID.get(state.alertLakeId);
    if (!lake) return;
    copyText(buildAlertCopy(lake).urduSms, 'Urdu SMS');
  });

  $('#copy-english')?.addEventListener('click', () => {
    const lake = LAKE_BY_ID.get(state.alertLakeId);
    if (!lake) return;
    copyText(buildAlertCopy(lake).englishSms, 'English SMS');
  });
}

function buildWaveform() {
  const waveform = $('#waveform');
  if (!waveform) return;
  const heights = [26, 42, 62, 38, 72, 54, 30, 66, 84, 48, 70, 36, 58, 88, 44, 68, 32, 62, 78, 40, 56, 86, 46, 64, 34, 52, 74, 42];
  waveform.innerHTML = heights
    .map((height, index) => {
      const delay = ((index % 7) * 0.07).toFixed(2);
      return `<span class="wave" style="--h:${height}%; --d:${delay}s"></span>`;
    })
    .join('');
}

function setupSpeech() {
  if (!('speechSynthesis' in window)) {
    updateVoiceNote();
    return;
  }
  const load = () => {
    state.voices = window.speechSynthesis.getVoices();
    updateVoiceNote();
  };
  load();
  window.speechSynthesis.addEventListener?.('voiceschanged', load);
  window.speechSynthesis.onvoiceschanged = load;
  window.setTimeout(load, 500);
}

function urduVoice() {
  return state.voices.find((voice) => voice.lang && voice.lang.toLowerCase().startsWith('ur')) || null;
}

function updateVoiceNote() {
  const note = $('#voice-note');
  if (!note) return;
  if (backendState.connected) {
    note.textContent = 'Connected to Python backend · Neural ur-PK-UzmaNeural voice active.';
    return;
  }
  if (!('speechSynthesis' in window)) {
    note.textContent = 'This browser cannot preview audio. Production audio is generated by the ur-PK-UzmaNeural voice and compressed below 45 KB.';
    const playBtn = $('#voice-play');
    const previewBtn = $('#voice-preview');
    if (playBtn) playBtn.disabled = true;
    if (previewBtn) previewBtn.disabled = true;
    return;
  }
  const voice = urduVoice();
  if (voice) {
    note.textContent = `Preview voice: ${voice.name} (${voice.lang}). Production uses the neural ur-PK-UzmaNeural voice.`;
  } else {
    note.textContent = 'No Urdu voice is installed on this device, so the preview may sound incorrect. Production uses the neural ur-PK-UzmaNeural voice.';
  }
}

function setAlertLake(id) {
  state.alertLakeId = id;
  cancelSpeech();
  renderAlertPage();
}

function renderAlertPage() {
  const lake = LAKE_BY_ID.get(state.alertLakeId) || LAKES[0];
  if (!lake) return;
  const copy = buildAlertCopy(lake);
  const select = $('#alert-lake-select');
  if (select && select.value !== lake.id) select.value = lake.id;

  if ($('#picker-hint')) {
    const tag = lake.urduAlertLevel ? ` · ${lake.urduAlertLevel}` : '';
    const lakeDisplayName = state.lang === 'ur' && lake.urdu ? lake.urdu : lake.name;
    $('#picker-hint').textContent = `${lake.total >= 75 ? 'Warning template' : 'Training preview'} · ${lakeDisplayName}${tag}`;
  }
  if ($('#sms-urdu')) $('#sms-urdu').textContent = copy.urduSms;
  if ($('#sms-english')) $('#sms-english').textContent = copy.english;
  const voiceScript = $('#voice-script');
  if (voiceScript) voiceScript.textContent = copy.urduVoice;
  const voiceScriptEn = $('#voice-script-en');
  if (voiceScriptEn) voiceScriptEn.textContent = copy.english;

  const smsCount = $('#sms-count');
  if (smsCount) {
    smsCount.textContent = `${copy.urduSms.length} / 160`;
    smsCount.classList.toggle('over', copy.urduSms.length > 160);
  }

  const notice = $('#alert-notice');
  if (notice) {
    notice.hidden = lake.total >= 75 && !DRILL_MODE;
    if (notice.querySelector('span')) {
      const lakeDisplayName = state.lang === 'ur' && lake.urdu ? lake.urdu : lake.name;
      if (DRILL_MODE) {
        notice.querySelector('span').textContent = `DRILL MODE ACTIVE: All alerts are prefixed with simulation notices. (${lakeDisplayName} score: ${lake.total}/100)`;
      } else {
        notice.querySelector('span').textContent =
          `${lakeDisplayName} is at ${lake.total}/100 — below the automatic threshold of 75. This is a training preview only.`;
      }
    }
  }

  if ($('#recipient-summary')) $('#recipient-summary').textContent = `${fmtNum.format(lake.population)} people across ${lake.villages.length} settlements downstream.`;
  if ($('#recipient-chips')) {
    $('#recipient-chips').innerHTML = lake.villages
      .map((village) => `<span class="recipient-chip">${village}</span>`)
      .join('');
  }

  if ($('#alert-audit')) {
    $('#alert-audit').innerHTML = `
      <div class="audit-row" data-factor="growth">
        <div class="audit-row-head"><span>Lake growth</span><strong>${lake.expansion} / 50</strong></div>
        <p>${lake.growthPct}% above the 15-day baseline</p>
        <div class="bar"><i style="width:${(lake.expansion / 50) * 100}%"></i></div>
      </div>
      <div class="audit-row" data-factor="heat">
        <div class="audit-row-head"><span>Heat</span><strong>${lake.thermal} / 30</strong></div>
        <p>+${lake.tempAnomaly}°C above the seasonal normal</p>
        <div class="bar"><i style="width:${(lake.thermal / 30) * 100}%"></i></div>
      </div>
      <div class="audit-row" data-factor="rain">
        <div class="audit-row-head"><span>Rain</span><strong>${lake.rain} / 20</strong></div>
        <p>${lake.rain72} mm in the last 72 hours</p>
        <div class="bar"><i style="width:${(lake.rain / 20) * 100}%"></i></div>
      </div>`;
  }

  const auditFoot = $('.audit-foot');
  if (auditFoot) {
    auditFoot.innerHTML =
      lake.total >= 75
        ? `Triggered automatically at 75. This lake is at <strong id="alert-score">${lake.total}</strong>.`
        : `Below the automatic threshold of 75. Manual training preview at <strong id="alert-score">${lake.total}</strong>.`;
  }

  const seconds = Math.max(12, Math.min(34, Math.round(copy.urduVoice.length / 12)));
  state.voiceDuration = seconds;
  if ($('#voice-total')) $('#voice-total').textContent = formatClock(seconds);
  if ($('#voice-size')) $('#voice-size').textContent = `~${Math.ceil((seconds * 16) / 8)} KB`;
  if ($('#voice-elapsed')) $('#voice-elapsed').textContent = '0:00';
  const progress = $('#voice-progress');
  if (progress) progress.style.width = '0%';

  resetApproval();
  updateVoiceNote();
}

function resetApproval() {
  state.alertApproved = false;
  const lake = LAKE_BY_ID.get(state.alertLakeId);
  const isBelowThreshold = lake && lake.total < 75;

  const steps = $$('#approval-steps li');
  steps.forEach((step, index) => {
    step.classList.toggle('is-done', index < 2);
    step.classList.toggle('is-current', index === 2);
  });
  
  if ($('#step-approve-hint')) {
    $('#step-approve-hint').textContent = isBelowThreshold ? 'Blocked: Risk score below 75' : 'Waiting for an officer';
  }

  const button = $('#approve-btn');
  if (button) {
    if (isBelowThreshold) {
      button.disabled = true;
      button.textContent = 'Dispatch Blocked (< 75)';
    } else {
      button.disabled = false;
      button.textContent = backendState.connected ? 'Approve & dispatch alert' : 'Approve for dispatch';
    }
  }
  $('.approval-card')?.classList.remove('is-approved');
}

function approveDispatch() {
  if (state.alertApproved) return;
  const lake = LAKE_BY_ID.get(state.alertLakeId);
  if (!lake || lake.total < 75) {
    toast('Dispatch blocked: Risk score must be 75 or greater.');
    return;
  }

  state.alertApproved = true;
  const steps = $$('#approval-steps li');
  const button = $('#approve-btn');
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending…';
  }
  if (steps[2]) {
    steps[2].classList.remove('is-current');
    steps[2].classList.add('is-done');
  }
  if (steps[3]) {
    steps[3].classList.add('is-current');
  }
  if ($('#step-approve-hint')) $('#step-approve-hint').textContent = 'Approved by duty officer';

  const finishUi = (receiptId) => {
    if (steps[3]) {
      steps[3].classList.remove('is-current');
      steps[3].classList.add('is-done');
    }
    if (button) button.textContent = receiptId ? `Dispatched (${receiptId})` : 'Delivered';
    $('.approval-card')?.classList.add('is-approved');
    toast(
      receiptId
        ? `Alert ${receiptId} logged & dispatched to ${lake?.villages.length ?? 0} village channels.`
        : `Warning delivered to ${lake?.villages.length ?? 0} village channels. No real messages were sent.`,
    );
  };

  if (DRILL_MODE) {
    window.setTimeout(() => finishUi('DRILL-MODE-NO-OP'), 600);
    return;
  }

  dispatchAlertToBackend(state.alertLakeId)
    .then((res) => finishUi(res.alert_id))
    .catch(() => window.setTimeout(() => finishUi(null), 900));
}

function formatClock(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, Math.round(seconds % 60));
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function toggleVoice() {
  if (state.speaking) {
    cancelSpeech();
    return;
  }
  const lake = LAKE_BY_ID.get(state.alertLakeId);
  if (!lake) return;
  const copy = buildAlertCopy(lake);

  state.speaking = true;
  state.voiceElapsed = 0;
  startVoiceUi();

  const audio = new Audio(getVoiceAudioUrl(lake.id, copy.urduVoice));
  activeAudio = audio;
  audio.onended = cancelSpeech;
  audio.onerror = () => {
    activeAudio = null;
    if (!('speechSynthesis' in window)) {
      cancelSpeech();
      toast('Voice preview is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume?.();
    const utterance = new SpeechSynthesisUtterance(copy.urduVoice);
    utterance.lang = 'ur-PK';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const voice = urduVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = cancelSpeech;
    utterance.onerror = (event) => {
      const interrupted = event?.error === 'interrupted' || event?.error === 'canceled';
      cancelSpeech();
      if (!interrupted) toast('The voice preview could not play on this device.');
    };
    window.speechSynthesis.speak(utterance);
  };

  audio.play().catch(() => audio.onerror());
}

function startVoiceUi() {
  const waveform = $('#waveform');
  waveform?.classList.add('is-playing');
  $('#voice-play')?.classList.add('is-playing');
  const button = $('#voice-preview');
  if (button) button.innerHTML = `${icon('pause')} Stop preview`;
  if ($('#voice-elapsed')) $('#voice-elapsed').textContent = '0:00';
  const progress = $('#voice-progress');
  if (progress) progress.style.width = '0%';

  const started = Date.now();
  window.clearInterval(state.voiceTimer);
  state.voiceTimer = window.setInterval(() => {
    const elapsed = Math.min(state.voiceDuration, (Date.now() - started) / 1000);
    if ($('#voice-elapsed')) $('#voice-elapsed').textContent = formatClock(elapsed);
    if (progress && state.voiceDuration) {
      progress.style.width = `${Math.min(100, (elapsed / state.voiceDuration) * 100)}%`;
    }
    state.voiceElapsed = elapsed;
    if (elapsed >= state.voiceDuration) {
      window.clearInterval(state.voiceTimer);
      state.voiceTimer = null;
    }
  }, 400);
}

function cancelSpeech() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  state.speaking = false;
  window.clearInterval(state.voiceTimer);
  state.voiceTimer = null;
  $('#waveform')?.classList.remove('is-playing');
  $('#voice-play')?.classList.remove('is-playing');
  const elapsed = $('#voice-elapsed');
  if (elapsed) elapsed.textContent = '0:00';
  const progress = $('#voice-progress');
  if (progress) progress.style.width = '0%';
  const button = $('#voice-preview');
  if (button) button.innerHTML = `${icon('play')} Play Urdu preview`;
}

function downloadAlertPackage() {
  const lake = LAKE_BY_ID.get(state.alertLakeId);
  if (!lake) return;
  const copy = buildAlertCopy(lake);
  const district = lake.district.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  const payload = {
    alert_id: `GW-20220504-${district}-${lake.id.toUpperCase()}`,
    training_preview: lake.total < 75,
    drill_mode: DRILL_MODE,
    scenario: 'GlacierWatch May 2022 replay · Northern Pakistan',
    issued_at: '2022-05-04T18:40:00+05:00',
    lake: {
      name: lake.name,
      urdu_name: lake.urdu,
      district: lake.district,
      basin: lake.basin,
      risk_score: lake.total,
      tier: lake.tier,
      breakdown: { expansion: lake.expansion, thermal: lake.thermal, rain: lake.rain },
      confidence_pct: lake.confidence,
    },
    villages: lake.villages,
    safe_ascent_m: lake.safeAscent,
    channels: ['SMS', 'WhatsApp voice note', 'Village noticeboard'],
    urdu_sms: copy.urduSms,
    english_sms: copy.englishSms,
    urdu_voice_script: copy.urduVoice,
    voice: { model: 'ur-PK-UzmaNeural', target: 'mono MP3, <45 KB' },
    approval: {
      required: true,
      authority: 'DDMA',
      status: state.alertApproved ? 'approved' : 'pending',
    },
    disclaimer:
      'Decision-support only. Not a flood prediction. Follow official NDMA/DDMA instructions.',
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `GlacierWatch_${lake.id}_alert_package.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Alert package downloaded.');
}

/* ---------------------------------- Login ---------------------------------- */

const loginState = {
  phone: '',
  otp: '',
  expiresAt: 0,
  attempts: 0,
  resendTimer: null,
};

function isLocalEnv() {
  return (
    window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

function normalizePakistanPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length === 12) return digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) return digits.slice(1);
  return digits;
}

function startResendCountdown(seconds = 30) {
  const btn = $('#resend-otp-btn');
  if (!btn) return;
  window.clearInterval(loginState.resendTimer);
  let remaining = seconds;
  btn.disabled = true;
  btn.textContent = `Resend in ${remaining}s`;

  loginState.resendTimer = window.setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      window.clearInterval(loginState.resendTimer);
      btn.disabled = false;
      btn.textContent = 'Resend code';
    } else {
      btn.textContent = `Resend in ${remaining}s`;
    }
  }, 1000);
}

function dispatchOtp(tenDigits) {
  loginState.phone = `+92 ${tenDigits.slice(0, 3)} ${tenDigits.slice(3)}`;
  loginState.otp = String(Math.floor(100000 + Math.random() * 900000));
  loginState.expiresAt = Date.now() + 5 * 60 * 1000;
  loginState.attempts = 0;

  $('#phone-form').hidden = true;
  $('#otp-form').hidden = false;
  $('#otp-sent-to').textContent = `Sent to ${loginState.phone}`;
  $('#login-subtitle').textContent = 'Enter the 6-digit One-Time PIN sent to your mobile device.';

  const banner = $('#demo-sms-text');
  if (banner) {
    banner.innerHTML = `<strong>SMS Received:</strong> Your GlacierWatch verification code is <strong style="font-family:'JetBrains Mono',monospace;">${loginState.otp}</strong> (valid for 5 min).`;
  }

  const otpInput = $('#otp');
  if (otpInput) {
    otpInput.value = '';
    otpInput.focus();
  }

  startResendCountdown(30);
  toast(`OTP sent to ${loginState.phone}`);
}

function bootLogin() {
  const dashUrl = isLocalEnv() ? 'index.html' : '/';
  if (localStorage.getItem('auth_token')) {
    window.location.replace(dashUrl);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('logged_out')) {
    toast('You have been signed out.');
    window.history.replaceState(null, '', window.location.pathname);
  }

  const phoneInput = $('#phone');
  phoneInput?.addEventListener('input', () => {
    const clean = normalizePakistanPhone(phoneInput.value).slice(0, 10);
    phoneInput.value = clean.length > 3 ? `${clean.slice(0, 3)} ${clean.slice(3)}` : clean;
  });

  $('#phone-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const tenDigits = normalizePakistanPhone(phoneInput?.value || '');
    if (!/^3\d{9}$/.test(tenDigits)) {
      toast('Enter a valid 10-digit Pakistani mobile number (e.g., 300 1234567).');
      phoneInput?.focus();
      return;
    }
    dispatchOtp(tenDigits);
  });

  $('#change-phone-btn')?.addEventListener('click', () => {
    window.clearInterval(loginState.resendTimer);
    $('#otp-form').hidden = true;
    $('#phone-form').hidden = false;
    $('#login-subtitle').textContent = 'Enter your registered mobile number. We will text you a 6-digit code to sign in.';
    const banner = $('#demo-sms-text');
    if (banner) {
      banner.innerHTML = '<strong>SMS Gateway:</strong> Enter any 10-digit mobile number to generate a simulated One-Time PIN.';
    }
    phoneInput?.focus();
  });

  $('#resend-otp-btn')?.addEventListener('click', () => {
    const tenDigits = normalizePakistanPhone(phoneInput?.value || '');
    if (/^3\d{9}$/.test(tenDigits)) dispatchOtp(tenDigits);
  });

  const otpInput = $('#otp');
  otpInput?.addEventListener('input', () => {
    otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
  });

  $('#otp-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const entered = (otpInput?.value || '').trim();

    if (Date.now() > loginState.expiresAt) {
      toast('This OTP has expired. Request a new code.');
      return;
    }
    if (loginState.attempts >= 5) {
      toast('Too many failed attempts. Please request a new code.');
      return;
    }
    if (entered !== loginState.otp) {
      loginState.attempts += 1;
      toast('Incorrect PIN. Check the SMS banner below and try again.');
      otpInput?.focus();
      return;
    }

    localStorage.setItem('auth_token', `gw_otp_${Date.now()}`);
    localStorage.setItem('user_phone', loginState.phone);
    window.location.href = dashUrl;
  });
}

/* --------------------------------- Logout Hook ----------------------------- */

function setupLogout() {
  document.addEventListener('click', (event) => {
    const logoutTrigger = event.target.closest('#logout-btn, #logout-btn-mobile, .logout-btn, .logout-nav-link');
    if (!logoutTrigger) return;
    event.preventDefault();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_phone');
    sessionStorage.clear();
    window.location.href = isLocalEnv() ? 'login.html?logged_out=1' : '/login?logged_out=1';
  });
}

/* ---------------------------------- Boot ----------------------------------- */

async function boot() {
  if ($('#phone-form')) {
    bootLogin();
    return;
  }

  if (!localStorage.getItem('auth_token')) {
    window.location.replace(isLocalEnv() ? 'login.html' : '/login');
    return;
  }

  await syncWithBackend();

  setupNavigation();
  setupLanguageToggle();
  setupLogout();

  try { setupOverview(); } catch (err) { console.error('setupOverview failed:', err); }
  try { setupTimeMachine(); } catch (err) { console.error('setupTimeMachine failed:', err); }
  try { setupLakeDialog(); } catch (err) { console.error('setupLakeDialog failed:', err); }
  try { setupEscape(); } catch (err) { console.error('setupEscape failed:', err); }
  try { setupAlerts(); } catch (err) { console.error('setupAlerts failed:', err); }

  const initial = viewFromHash();
  activateView(initial);
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  window.addEventListener('beforeunload', () => {
    if (activeAudio) activeAudio.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}