import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Gauge, Mic, MicOff, Settings, X, AlertTriangle, SkipBack, SkipForward, Play, Pause, BatteryWarning } from "lucide-react";

const LANG_LOCALE = {
  tr: "tr-TR",
  en: "en-US",
  ru: "ru-RU",
  de: "de-DE",
  zh: "zh-CN",
  ko: "ko-KR",
};

const UNIT_WORDS = {
  tr: { km: "kilometre", mi: "mil" },
  en: { km: "kilometers", mi: "miles" },
  ru: { km: "километров", mi: "миль" },
  de: { km: "Kilometer", mi: "Meilen" },
  zh: { km: "公里", mi: "英里" },
  ko: { km: "킬로미터", mi: "마일" },
};

const KM_TO_MI = 0.621371;

const SENSITIVITY_THRESHOLD = { low: 10, medium: 7, high: 4 };
const AUTO_PAUSE_THRESHOLD_KMH = 3;

const THEMES = {
  green: { hex: "#D7FF3D", on: "#12140F", light: false },
  red: { hex: "#FF5A5A", on: "#12140F", light: false },
  blue: { hex: "#5AC8FA", on: "#12140F", light: false },
  white: { hex: "#2B2E24", on: "#F5F5F0", light: true },
};

const T = {
  tr: {
    langName: "Türkçe",
    tagline: "AKILLI SÜRÜŞ BİLGİSAYARI",
    max: "MAKS", avg: "ORT", dist: "MESAFE", unit: "km/s",
    gpsActive: "GPS AKTİF", gpsOff: "GPS KAPALI", gaugeOff: "Gösterge kapalı",
    noGeo: "Bu cihazda konum servisi bulunamadı.",
    permDenied: "Konum izni verilmedi. Hız göstergesi için izin gerekiyor.",
    locUnavailable: "Konum alınamadı.",
    turnOff: "Göstergeyi kapat", turnOn: "Göstergeyi aç",
    settings: "Ayarlar", language: "Dil", sound: "Uygulama sesi", theme: "Tema rengi",
    colorRed: "Kırmızı", colorBlue: "Mavi", colorGreen: "Yeşil", colorWhite: "Beyaz",
    voiceOn: "Sesli komut açık", voiceOff: "Sesli komutu aç",
    tapToTalk: "Konuşmak için dokun",
    listening: "Dinliyor", speaking: "Konuşuyor…",
    hint: '"Hey Volt" de, sonra istediğini sor',
    notUnderstood: "Seni duydum ama anlayamadım.",
    greeting: "Merhaba, ben Volt, akıllı sürüş asistanınızım. Size nasıl yardımcı olabilirim?",
    micNotSupported: "Bu tarayıcı ses tanımayı desteklemiyor",
    speedIs: (v, u) => `Şu anda saatte ${v} ${u} hızla gidiyorsun.`,
    stopped: "Şu anda durmuş durumdasın.",
    maxIs: (v, u) => `En yüksek hızın saatte ${v} ${u}.`,
    avgIs: (v, u) => `Ortalama hızın saatte ${v} ${u}.`,
    distIs: (v, u) => `Şu ana kadar ${v} ${u} yol gittin.`,
    gaugeOpened: "Hız göstergesini açıyorum.",
    gaugeClosed: "Hız göstergesini kapatıyorum.",
    sessionReset: "Oturumu sıfırladım.",
    roadWarning: "Dikkat, yol bozuk! Yavaşla.",
    unitLabel: "Hız birimi",
    sensitivityLabel: "Çukur uyarı hassasiyeti",
    voiceControlLabel: "Sesli komut",
    fullscreenLabel: "Tam ekran",
    on: "Açık", off: "Kapalı",
    sensLow: "Düşük", sensMedium: "Orta", sensHigh: "Yüksek",
    compassOpened: "Pusulayı açıyorum.",
    compassClosed: "Pusulayı kapatıyorum.",
    compassLabel: "PUSULA",
    compass_kw: ["pusula"],
    mapOpened: "Haritayı açıyorum.",
    mapClosed: "Haritayı kapatıyorum.",
    mapLabel: "HARİTA",
    mapLoading: "Konum bekleniyor…",
    timeIs: (s) => `Şu an saat ${s}.`,
    dateIs: (s) => `Bugün ${s}.`,
    time_kw: ["saat kaç", "saat ne"],
    date_kw: ["tarih", "ayın kaçı", "hangi gün", "bugün günlerden"],
    resultIs: (a, b, op, r) => `${a} ${op} ${b} eşittir ${r}.`,
    divideByZero: "Sıfıra bölemem.",
    sunsetChecking: "Gün batımına bakıyorum…",
    sunsetError: "Gün batımı bilgisini alamadım.",
    sunsetIn: (h, m) => (h > 0 ? `Karanlık olmadan ${h} saat ${m} dakikan var.` : `Karanlık olmadan ${m} dakikan var.`),
    sunset_kw: ["karanlık", "gün batımı", "güneş ne zaman batar"],
    locationChecking: "Konumuna bakıyorum…",
    locationError: "Konumunu bulamadım.",
    locationIntro: "Şu anki konumun: ",
    locLabels: { province: "İl", district: "İlçe", neighborhood: "Mahalle", street: "Sokak" },
    whereAmI_kw: ["neredeyim", "nerede", "konumum ne"],
    batteryLow: (pct) => `Telefonunun bataryası yüzde ${pct}'e düştü.`,
    batteryCritical: (pct) => `Dikkat, bataryan çok düşük, yüzde ${pct}. Şarj etmen gerekebilir.`,
    batteryLowLabel: "DÜŞÜK PİL",
    batteryCriticalLabel: "KRİTİK PİL",
    navApproaching: (d) => `${d} metre sonra `,
    navStarting: (dist, dur) => `Navigasyon başladı. Mesafe ${dist} kilometre, tahmini süre ${dur} dakika.`,
    navNotFound: "Bu adresi bulamadım.",
    navRouteError: "Rota hesaplayamadım.",
    navStopped: "Navigasyonu durduruyorum.",
    navNoActive: "Şu an aktif bir navigasyon yok.",
    nav_close_kw: ["navigasyonu kapat", "navigasyonu durdur", "yol tarifini durdur"],
    next_direction_kw: ["sıradaki yön", "sonraki tarif", "ne yapmalıyım", "sıradaki talimat"],
    sosLabel: "Acil durum numarası",
    sosNoNumber: "Ayarlardan önce acil durum numarası eklemen gerekiyor.",
    sosCalling: "Acil durum numaranı arıyorum.",
    sos_kw: ["yardım çağır", "acil durum", "imdat"],
    autoPausedLabel: "Otomatik duraklatıldı",
    historyLabel: "Geçmiş sürüşler",
    historyEmpty: "Henüz kayıtlı sürüş yok.",
    historyClear: "Geçmişi temizle",
    lastRideNone: "Henüz kayıtlı bir sürüşün yok.",
    lastRideIs: (dist, avg, max) => `Son sürüşünde ${dist} kilometre gittin, ortalama ${avg}, en yüksek ${max} kilometre hızla.`,
    lastRide_kw: ["son sürüşüm", "geçen sürüşüm", "önceki sürüşüm"],
    radioOpened: (name) => `${name} çalıyor.`,
    radioClosed: "Radyoyu kapatıyorum.",
    radioNext: (name) => `Şimdi ${name} çalıyor.`,
    radio_kw: ["radyo"],
    radioNext_kw: ["sonraki istasyon", "istasyon değiştir", "başka istasyon"],
    reminderSet: (n, unit) => `Tamam, ${n} ${unit} sonra hatırlatacağım.`,
    reminderFired: "Hatırlatma zamanı geldi!",
    reminder_kw: ["hatırlat"],
    minuteWord: "dakika", secondWord: "saniye",
    emergencyLabel: "Acil durum numarası",
    emergencyPlaceholder: "Telefon numarası",
    emergencyCalling: "Yardım çağırıyorum.",
    emergencyNotSet: "Önce ayarlardan bir acil durum numarası kaydetmen lazım.",
    emergency_kw: ["yardım çağır", "acil durum"],
    map_kw: ["harita"],
    wake: ["hey volt", "volt", "vılt", "hey wolt", "hey bolt", "bolt", "hey bot", " bot", "bot,", "hey jolt", "jolt", "hey colt", "colt", "hey wolf", "wolf"],
    open: ["aç", "ac"],
    close: ["kapat"],
    reset: ["sıfırla", "sifirla"],
    max_kw: ["en yüksek", "en yuksek", "maksimum", "max"],
    avg_kw: ["ortalama"],
    dist_kw: ["mesafe", "yol gittim", "kilometre gittim", "kaç km", "kac km"],
    speed_kw: ["hız", "hiz"],
    query_kw: ["kaç", "kac", "ne kadar", "nedir"],
    weatherChecking: "Hava durumuna bakıyorum…",
    weatherError: "Hava durumu bilgisini alamadım.",
    weatherIs: (temp, cond) => `Şu anda hava ${temp} derece ve ${cond}.`,
    weather_kw: ["hava durumu", "hava nasıl", "hava"],
  },
  en: {
    langName: "English",
    tagline: "SMART RIDE COMPUTER",
    max: "MAX", avg: "AVG", dist: "DIST", unit: "km/h",
    gpsActive: "GPS ACTIVE", gpsOff: "GPS OFF", gaugeOff: "Gauge off",
    noGeo: "Location services aren't available on this device.",
    permDenied: "Location permission denied. The speed gauge needs it.",
    locUnavailable: "Couldn't get location.",
    turnOff: "Turn off gauge", turnOn: "Turn on gauge",
    settings: "Settings", language: "Language", sound: "App sound", theme: "Theme color",
    colorRed: "Red", colorBlue: "Blue", colorGreen: "Green", colorWhite: "White",
    voiceOn: "Voice control on", voiceOff: "Enable voice control",
    tapToTalk: "Tap to talk",
    listening: "Listening", speaking: "Speaking…",
    hint: 'Say "Hey Volt" then ask anything',
    notUnderstood: "I heard you but didn't understand.",
    greeting: "Hi, I'm Volt, your smart ride assistant. How can I help?",
    micNotSupported: "This browser doesn't support speech recognition",
    speedIs: (v, u) => `You're currently going ${v} ${u} per hour.`,
    stopped: "You're currently stopped.",
    maxIs: (v, u) => `Your top speed is ${v} ${u} per hour.`,
    avgIs: (v, u) => `Your average speed is ${v} ${u} per hour.`,
    distIs: (v, u) => `You've covered ${v} ${u} so far.`,
    gaugeOpened: "Turning the speed gauge on.",
    gaugeClosed: "Turning the speed gauge off.",
    sessionReset: "Session reset.",
    roadWarning: "Watch out, rough road! Slow down.",
    unitLabel: "Speed unit",
    sensitivityLabel: "Road alert sensitivity",
    voiceControlLabel: "Voice control",
    fullscreenLabel: "Fullscreen",
    on: "On", off: "Off",
    sensLow: "Low", sensMedium: "Medium", sensHigh: "High",
    compassOpened: "Turning the compass on.",
    compassClosed: "Turning the compass off.",
    compassLabel: "COMPASS",
    compass_kw: ["compass"],
    mapOpened: "Opening the map.",
    mapClosed: "Closing the map.",
    mapLabel: "MAP",
    mapLoading: "Waiting for location…",
    timeIs: (s) => `It's currently ${s}.`,
    dateIs: (s) => `Today is ${s}.`,
    time_kw: ["what time", "what's the time", "time is it"],
    date_kw: ["what day", "today's date", "what's the date"],
    resultIs: (a, b, op, r) => `${a} ${op} ${b} equals ${r}.`,
    divideByZero: "I can't divide by zero.",
    sunsetChecking: "Checking sunset time…",
    sunsetError: "I couldn't get the sunset time.",
    sunsetIn: (h, m) => (h > 0 ? `You have ${h} hours and ${m} minutes before it gets dark.` : `You have ${m} minutes before it gets dark.`),
    sunset_kw: ["sunset", "get dark", "before dark"],
    locationChecking: "Checking your location…",
    locationError: "I couldn't find your location.",
    locationIntro: "Your current location: ",
    locLabels: { province: "Province", district: "District", neighborhood: "Neighborhood", street: "Street" },
    whereAmI_kw: ["where am i", "my location", "where are we"],
    batteryLow: (pct) => `Your phone battery has dropped to ${pct} percent.`,
    batteryCritical: (pct) => `Warning, your battery is very low, ${pct} percent. You may need to charge soon.`,
    batteryLowLabel: "LOW BATTERY",
    batteryCriticalLabel: "CRITICAL BATTERY",
    navApproaching: (d) => `In ${d} meters, `,
    navStarting: (dist, dur) => `Navigation started. Distance ${dist} kilometers, estimated time ${dur} minutes.`,
    navNotFound: "I couldn't find that place.",
    navRouteError: "I couldn't calculate a route.",
    navStopped: "Stopping navigation.",
    navNoActive: "There's no active navigation right now.",
    nav_close_kw: ["stop navigation", "cancel navigation", "end navigation"],
    next_direction_kw: ["next direction", "next instruction", "what's next"],
    sosLabel: "Emergency number",
    sosNoNumber: "You need to add an emergency number in settings first.",
    sosCalling: "Calling your emergency number.",
    sos_kw: ["call for help", "emergency call", "help me"],
    autoPausedLabel: "Auto-paused",
    historyLabel: "Ride history",
    historyEmpty: "No rides recorded yet.",
    historyClear: "Clear history",
    lastRideNone: "You don't have a recorded ride yet.",
    lastRideIs: (dist, avg, max) => `Your last ride covered ${dist} kilometers, averaging ${avg} with a top speed of ${max} kilometers per hour.`,
    lastRide_kw: ["last ride", "my previous ride", "how was my last ride"],
    radioOpened: (name) => `${name} is now playing.`,
    radioClosed: "Turning the radio off.",
    radioNext: (name) => `Now playing ${name}.`,
    radio_kw: ["radio"],
    radioNext_kw: ["next station", "change station", "another station"],
    reminderSet: (n, unit) => `Okay, I'll remind you in ${n} ${unit}.`,
    reminderFired: "Time's up for your reminder!",
    reminder_kw: ["remind"],
    minuteWord: "minutes", secondWord: "seconds",
    emergencyLabel: "Emergency number",
    emergencyPlaceholder: "Phone number",
    emergencyCalling: "Calling for help.",
    emergencyNotSet: "Set an emergency number in settings first.",
    emergency_kw: ["call for help", "emergency"],
    map_kw: ["map"],
    wake: [
      "hey volt", "volt",
      "hey bolt", "bolt",
      "hey bot", " bot", "bot,",
      "hey jolt", "jolt",
      "hey colt", "colt",
      "hey wolf", "wolf",
    ],
    open: ["turn on", "open", "show"],
    close: ["turn off", "close", "hide"],
    reset: ["reset"],
    max_kw: ["top speed", "max speed", "maximum"],
    avg_kw: ["average"],
    dist_kw: ["distance", "how far", "how many kilometers", "how many kilometres"],
    speed_kw: ["speed", "how fast"],
    query_kw: ["what", "how"],
    weatherChecking: "Checking the weather…",
    weatherError: "I couldn't get the weather.",
    weatherIs: (temp, cond) => `It's currently ${temp} degrees and ${cond}.`,
    weather_kw: ["weather"],
  },
  ru: {
    langName: "Русский",
    tagline: "УМНЫЙ ВЕЛОКОМПЬЮТЕР",
    max: "МАКС", avg: "СР", dist: "РАССТ", unit: "км/ч",
    gpsActive: "GPS АКТИВЕН", gpsOff: "GPS ВЫКЛ", gaugeOff: "Датчик выключен",
    noGeo: "Служба геолокации недоступна на этом устройстве.",
    permDenied: "Доступ к геолокации запрещён. Он нужен для спидометра.",
    locUnavailable: "Не удалось определить местоположение.",
    turnOff: "Выключить датчик", turnOn: "Включить датчик",
    settings: "Настройки", language: "Язык", sound: "Звук приложения", theme: "Цвет темы",
    colorRed: "Красный", colorBlue: "Синий", colorGreen: "Зелёный", colorWhite: "Белый",
    voiceOn: "Голосовое управление включено", voiceOff: "Включить голосовое управление",
    tapToTalk: "Нажми, чтобы говорить",
    listening: "Слушаю", speaking: "Говорю…",
    hint: 'Скажи «Хэй Волт», затем спроси что угодно',
    notUnderstood: "Я услышал, но не понял.",
    greeting: "Привет, я Вольт, твой умный ассистент для езды. Чем могу помочь?",
    micNotSupported: "Этот браузер не поддерживает распознавание речи",
    speedIs: (v, u) => `Сейчас ты едешь со скоростью ${v} ${u} в час.`,
    stopped: "Сейчас ты стоишь на месте.",
    maxIs: (v, u) => `Твоя максимальная скорость — ${v} ${u} в час.`,
    avgIs: (v, u) => `Твоя средняя скорость — ${v} ${u} в час.`,
    distIs: (v, u) => `Ты проехал ${v} ${u}.`,
    gaugeOpened: "Включаю спидометр.",
    gaugeClosed: "Выключаю спидометр.",
    sessionReset: "Сессия сброшена.",
    roadWarning: "Осторожно, плохая дорога! Сбавь скорость.",
    unitLabel: "Единица скорости",
    sensitivityLabel: "Чувствительность оповещения о дороге",
    voiceControlLabel: "Голосовое управление",
    fullscreenLabel: "Полноэкранный режим",
    on: "Вкл", off: "Выкл",
    sensLow: "Низкая", sensMedium: "Средняя", sensHigh: "Высокая",
    compassOpened: "Включаю компас.",
    compassClosed: "Выключаю компас.",
    compassLabel: "КОМПАС",
    compass_kw: ["компас"],
    mapOpened: "Открываю карту.",
    mapClosed: "Закрываю карту.",
    mapLabel: "КАРТА",
    mapLoading: "Ожидание местоположения…",
    timeIs: (s) => `Сейчас ${s}.`,
    dateIs: (s) => `Сегодня ${s}.`,
    time_kw: ["который час", "сколько времени"],
    date_kw: ["какое сегодня число", "какой сегодня день"],
    resultIs: (a, b, op, r) => `${a} ${op} ${b} равно ${r}.`,
    divideByZero: "Я не могу делить на ноль.",
    sunsetChecking: "Проверяю время заката…",
    sunsetError: "Не удалось узнать время заката.",
    sunsetIn: (h, m) => (h > 0 ? `У тебя есть ${h} часов и ${m} минут до темноты.` : `У тебя есть ${m} минут до темноты.`),
    sunset_kw: ["закат", "стемнеет"],
    locationChecking: "Проверяю твоё местоположение…",
    locationError: "Не удалось определить твоё местоположение.",
    locationIntro: "Твоё текущее местоположение: ",
    locLabels: { province: "Область", district: "Район", neighborhood: "Микрорайон", street: "Улица" },
    whereAmI_kw: ["где я", "моё местоположение"],
    batteryLow: (pct) => `Заряд твоего телефона упал до ${pct} процентов.`,
    batteryCritical: (pct) => `Внимание, заряд батареи очень низкий, ${pct} процентов. Возможно, пора зарядить телефон.`,
    batteryLowLabel: "НИЗКИЙ ЗАРЯД",
    batteryCriticalLabel: "КРИТИЧЕСКИЙ ЗАРЯД",
    navApproaching: (d) => `Через ${d} метров `,
    navStarting: (dist, dur) => `Навигация началась. Расстояние ${dist} километров, примерное время ${dur} минут.`,
    navNotFound: "Я не смог найти это место.",
    navRouteError: "Не удалось рассчитать маршрут.",
    navStopped: "Останавливаю навигацию.",
    navNoActive: "Сейчас нет активной навигации.",
    nav_close_kw: ["останови навигацию", "отмени навигацию", "заверши навигацию"],
    next_direction_kw: ["следующее направление", "следующая инструкция", "что дальше"],
    sosLabel: "Экстренный номер",
    sosNoNumber: "Сначала добавь экстренный номер в настройках.",
    sosCalling: "Звоню на твой экстренный номер.",
    sos_kw: ["позови на помощь", "экстренный вызов", "помоги мне"],
    autoPausedLabel: "Автопауза",
    historyLabel: "История поездок",
    historyEmpty: "Пока нет записанных поездок.",
    historyClear: "Очистить историю",
    lastRideNone: "У тебя пока нет записанных поездок.",
    lastRideIs: (dist, avg, max) => `Твоя последняя поездка — ${dist} километров, средняя ${avg}, максимальная ${max} километров в час.`,
    lastRide_kw: ["последняя поездка", "моя предыдущая поездка", "как прошла последняя поездка"],
    radioOpened: (name) => `Сейчас играет ${name}.`,
    radioClosed: "Выключаю радио.",
    radioNext: (name) => `Теперь играет ${name}.`,
    radio_kw: ["радио"],
    radioNext_kw: ["следующая станция", "смени станцию", "другая станция"],
    reminderSet: (n, unit) => `Хорошо, напомню через ${n} ${unit}.`,
    reminderFired: "Время напоминания!",
    reminder_kw: ["напомни"],
    minuteWord: "минут", secondWord: "секунд",
    emergencyLabel: "Номер экстренной связи",
    emergencyPlaceholder: "Номер телефона",
    emergencyCalling: "Вызываю помощь.",
    emergencyNotSet: "Сначала сохрани номер экстренной связи в настройках.",
    emergency_kw: ["вызови помощь", "экстренный вызов"],
    map_kw: ["карта", "карту"],
    wake: ["хэй волт", "хей волт", "волт", "hey bolt", "bolt", "hey bot", " bot", "bot,", "hey jolt", "jolt", "hey colt", "colt", "hey wolf", "wolf"],
    open: ["включи", "открой", "покажи"],
    close: ["выключи", "закрой", "скрой"],
    reset: ["сбрось", "сброс"],
    max_kw: ["максимальная", "максимум"],
    avg_kw: ["средняя", "средню"],
    dist_kw: ["расстояние", "сколько проехал", "сколько километров"],
    speed_kw: ["скорость"],
    query_kw: ["какая", "сколько"],
    weatherChecking: "Проверяю погоду…",
    weatherError: "Не удалось получить погоду.",
    weatherIs: (temp, cond) => `Сейчас ${temp} градусов и ${cond}.`,
    weather_kw: ["погода", "какая погода"],
  },
  de: {
    langName: "Deutsch",
    tagline: "INTELLIGENTER FAHRRADCOMPUTER",
    max: "MAX", avg: "DURCHSCHN", dist: "ENTF", unit: "km/h",
    gpsActive: "GPS AKTIV", gpsOff: "GPS AUS", gaugeOff: "Anzeige aus",
    noGeo: "Standortdienste sind auf diesem Gerät nicht verfügbar.",
    permDenied: "Standortzugriff verweigert. Der Tacho benötigt ihn.",
    locUnavailable: "Standort konnte nicht ermittelt werden.",
    turnOff: "Anzeige ausschalten", turnOn: "Anzeige einschalten",
    settings: "Einstellungen", language: "Sprache", sound: "App-Ton", theme: "Themenfarbe",
    colorRed: "Rot", colorBlue: "Blau", colorGreen: "Grün", colorWhite: "Weiß",
    voiceOn: "Sprachsteuerung an", voiceOff: "Sprachsteuerung aktivieren",
    tapToTalk: "Zum Sprechen tippen",
    listening: "Hört zu", speaking: "Spricht…",
    hint: 'Sag "Hey Volt" und frag mich alles',
    notUnderstood: "Ich habe dich gehört, aber nicht verstanden.",
    greeting: "Hallo, ich bin Volt, dein intelligenter Fahrassistent. Wie kann ich helfen?",
    micNotSupported: "Dieser Browser unterstützt keine Spracherkennung",
    speedIs: (v, u) => `Du fährst gerade ${v} ${u} pro Stunde.`,
    stopped: "Du stehst gerade still.",
    maxIs: (v, u) => `Deine Höchstgeschwindigkeit ist ${v} ${u} pro Stunde.`,
    avgIs: (v, u) => `Deine Durchschnittsgeschwindigkeit ist ${v} ${u} pro Stunde.`,
    distIs: (v, u) => `Du bist bisher ${v} ${u} gefahren.`,
    gaugeOpened: "Ich schalte den Tacho ein.",
    gaugeClosed: "Ich schalte den Tacho aus.",
    sessionReset: "Sitzung zurückgesetzt.",
    roadWarning: "Achtung, holprige Straße! Langsamer fahren.",
    unitLabel: "Geschwindigkeitseinheit",
    sensitivityLabel: "Empfindlichkeit der Straßenwarnung",
    voiceControlLabel: "Sprachsteuerung",
    fullscreenLabel: "Vollbild",
    on: "An", off: "Aus",
    sensLow: "Niedrig", sensMedium: "Mittel", sensHigh: "Hoch",
    compassOpened: "Ich schalte den Kompass ein.",
    compassClosed: "Ich schalte den Kompass aus.",
    compassLabel: "KOMPASS",
    compass_kw: ["kompass"],
    mapOpened: "Ich öffne die Karte.",
    mapClosed: "Ich schließe die Karte.",
    mapLabel: "KARTE",
    mapLoading: "Warte auf Standort…",
    timeIs: (s) => `Es ist jetzt ${s} Uhr.`,
    dateIs: (s) => `Heute ist ${s}.`,
    time_kw: ["wie spät", "wieviel uhr"],
    date_kw: ["welcher tag", "das datum", "den wievielten"],
    resultIs: (a, b, op, r) => `${a} ${op} ${b} ist gleich ${r}.`,
    divideByZero: "Ich kann nicht durch null teilen.",
    sunsetChecking: "Ich prüfe den Sonnenuntergang…",
    sunsetError: "Ich konnte den Sonnenuntergang nicht ermitteln.",
    sunsetIn: (h, m) => (h > 0 ? `Du hast noch ${h} Stunden und ${m} Minuten bis es dunkel wird.` : `Du hast noch ${m} Minuten bis es dunkel wird.`),
    sunset_kw: ["sonnenuntergang", "dunkel wird"],
    locationChecking: "Ich prüfe deinen Standort…",
    locationError: "Ich konnte deinen Standort nicht finden.",
    locationIntro: "Dein aktueller Standort: ",
    locLabels: { province: "Provinz", district: "Bezirk", neighborhood: "Stadtteil", street: "Straße" },
    whereAmI_kw: ["wo bin ich", "mein standort"],
    batteryLow: (pct) => `Dein Akku ist auf ${pct} Prozent gesunken.`,
    batteryCritical: (pct) => `Achtung, dein Akku ist sehr niedrig, ${pct} Prozent. Du solltest bald aufladen.`,
    batteryLowLabel: "AKKU SCHWACH",
    batteryCriticalLabel: "AKKU KRITISCH",
    navApproaching: (d) => `In ${d} Metern `,
    navStarting: (dist, dur) => `Navigation gestartet. Entfernung ${dist} Kilometer, geschätzte Zeit ${dur} Minuten.`,
    navNotFound: "Ich konnte diesen Ort nicht finden.",
    navRouteError: "Ich konnte keine Route berechnen.",
    navStopped: "Ich stoppe die Navigation.",
    navNoActive: "Gerade läuft keine Navigation.",
    nav_close_kw: ["navigation stoppen", "navigation beenden", "navigation abbrechen"],
    next_direction_kw: ["nächste richtung", "nächste anweisung", "was kommt jetzt"],
    sosLabel: "Notfallnummer",
    sosNoNumber: "Du musst zuerst eine Notfallnummer in den Einstellungen hinzufügen.",
    sosCalling: "Ich rufe deine Notfallnummer an.",
    sos_kw: ["hilfe rufen", "notruf", "hilf mir"],
    autoPausedLabel: "Automatisch pausiert",
    historyLabel: "Fahrtenverlauf",
    historyEmpty: "Noch keine Fahrten aufgezeichnet.",
    historyClear: "Verlauf löschen",
    lastRideNone: "Du hast noch keine aufgezeichnete Fahrt.",
    lastRideIs: (dist, avg, max) => `Deine letzte Fahrt waren ${dist} Kilometer, im Schnitt ${avg}, mit einer Höchstgeschwindigkeit von ${max} Kilometern pro Stunde.`,
    lastRide_kw: ["letzte fahrt", "meine vorherige fahrt", "wie war meine letzte fahrt"],
    radioOpened: (name) => `${name} läuft jetzt.`,
    radioClosed: "Ich schalte das Radio aus.",
    radioNext: (name) => `Jetzt läuft ${name}.`,
    radio_kw: ["radio"],
    radioNext_kw: ["nächster sender", "sender wechseln", "anderer sender"],
    reminderSet: (n, unit) => `Okay, ich erinnere dich in ${n} ${unit}.`,
    reminderFired: "Zeit für deine Erinnerung!",
    reminder_kw: ["erinnere"],
    minuteWord: "Minuten", secondWord: "Sekunden",
    emergencyLabel: "Notfallnummer",
    emergencyPlaceholder: "Telefonnummer",
    emergencyCalling: "Ich rufe Hilfe.",
    emergencyNotSet: "Lege zuerst eine Notfallnummer in den Einstellungen fest.",
    emergency_kw: ["hilfe rufen", "notfall"],
    map_kw: ["karte"],
    wake: ["hey volt", "volt", "hey bolt", "bolt", "hey bot", " bot", "bot,", "hey jolt", "jolt", "hey colt", "colt", "hey wolf", "wolf"],
    open: ["schalte ein", "öffne", "zeig"],
    close: ["schalte aus", "schließe", "verstecke"],
    reset: ["zurücksetzen", "reset"],
    max_kw: ["höchstgeschwindigkeit", "maximal"],
    avg_kw: ["durchschnitt"],
    dist_kw: ["entfernung", "wie weit", "wie viele kilometer"],
    speed_kw: ["geschwindigkeit", "wie schnell"],
    query_kw: ["was", "wie"],
    weatherChecking: "Ich prüfe das Wetter…",
    weatherError: "Ich konnte das Wetter nicht abrufen.",
    weatherIs: (temp, cond) => `Es sind gerade ${temp} Grad und ${cond}.`,
    weather_kw: ["wetter"],
  },
  zh: {
    langName: "中文",
    tagline: "智能骑行电脑",
    max: "最高", avg: "平均", dist: "距离", unit: "km/h",
    gpsActive: "GPS 已开启", gpsOff: "GPS 已关闭", gaugeOff: "仪表已关闭",
    noGeo: "此设备不支持定位服务。",
    permDenied: "定位权限被拒绝,速度表需要该权限。",
    locUnavailable: "无法获取定位。",
    turnOff: "关闭仪表", turnOn: "打开仪表",
    settings: "设置", language: "语言", sound: "应用声音", theme: "主题颜色",
    colorRed: "红色", colorBlue: "蓝色", colorGreen: "绿色", colorWhite: "白色",
    voiceOn: "语音已开启", voiceOff: "开启语音控制",
    tapToTalk: "点击说话",
    listening: "正在聆听", speaking: "正在说话…",
    hint: '说"嘿 Volt",然后随便问',
    notUnderstood: "我听到了,但没听懂。",
    greeting: "你好,我是Volt,你的智能骑行助手。有什么可以帮你的吗?",
    micNotSupported: "此浏览器不支持语音识别",
    speedIs: (v, u) => `你现在的速度是每小时${v}${u}。`,
    stopped: "你现在处于静止状态。",
    maxIs: (v, u) => `你的最高速度是每小时${v}${u}。`,
    avgIs: (v, u) => `你的平均速度是每小时${v}${u}。`,
    distIs: (v, u) => `你目前已经骑了${v}${u}。`,
    gaugeOpened: "正在打开速度表。",
    gaugeClosed: "正在关闭速度表。",
    sessionReset: "已重置本次记录。",
    roadWarning: "注意,路面颠簸!减速慢行。",
    unitLabel: "速度单位",
    sensitivityLabel: "路面警报灵敏度",
    voiceControlLabel: "语音控制",
    fullscreenLabel: "全屏",
    on: "开", off: "关",
    sensLow: "低", sensMedium: "中", sensHigh: "高",
    compassOpened: "正在打开指南针。",
    compassClosed: "正在关闭指南针。",
    compassLabel: "指南针",
    compass_kw: ["指南针"],
    mapOpened: "正在打开地图。",
    mapClosed: "正在关闭地图。",
    mapLabel: "地图",
    mapLoading: "正在等待定位…",
    timeIs: (s) => `现在是${s}。`,
    dateIs: (s) => `今天是${s}。`,
    time_kw: ["几点", "现在几点"],
    date_kw: ["今天几号", "星期几", "今天日期"],
    resultIs: (a, b, op, r) => `${a}${op}${b}等于${r}。`,
    divideByZero: "不能除以零。",
    sunsetChecking: "正在查看日落时间…",
    sunsetError: "无法获取日落时间。",
    sunsetIn: (h, m) => (h > 0 ? `距离天黑还有${h}小时${m}分钟。` : `距离天黑还有${m}分钟。`),
    sunset_kw: ["天黑", "日落"],
    locationChecking: "正在查看你的位置…",
    locationError: "无法获取你的位置。",
    locationIntro: "你现在的位置:",
    locLabels: { province: "省", district: "区", neighborhood: "社区", street: "街道" },
    whereAmI_kw: ["我在哪", "我的位置"],
    batteryLow: (pct) => `你的手机电量已降至百分之${pct}。`,
    batteryCritical: (pct) => `注意,电量非常低,百分之${pct}。你可能需要尽快充电。`,
    batteryLowLabel: "电量低",
    batteryCriticalLabel: "电量严重不足",
    navApproaching: (d) => `${d}米后,`,
    navStarting: (dist, dur) => `导航已开始。距离${dist}公里,预计时间${dur}分钟。`,
    navNotFound: "我找不到那个地方。",
    navRouteError: "无法计算路线。",
    navStopped: "正在停止导航。",
    navNoActive: "目前没有正在进行的导航。",
    nav_close_kw: ["停止导航", "取消导航", "结束导航"],
    next_direction_kw: ["下一个方向", "下一个指示", "接下来做什么"],
    sosLabel: "紧急联系电话",
    sosNoNumber: "你需要先在设置中添加紧急联系电话。",
    sosCalling: "正在拨打你的紧急联系电话。",
    sos_kw: ["呼叫救援", "紧急呼叫", "救命"],
    autoPausedLabel: "自动暂停",
    historyLabel: "骑行记录",
    historyEmpty: "还没有骑行记录。",
    historyClear: "清除记录",
    lastRideNone: "你还没有骑行记录。",
    lastRideIs: (dist, avg, max) => `你上次骑行了${dist}公里,平均时速${avg},最高时速${max}公里。`,
    lastRide_kw: ["上次骑行", "我上一次骑行", "上次骑得怎么样"],
    radioOpened: (name) => `正在播放${name}。`,
    radioClosed: "正在关闭电台。",
    radioNext: (name) => `现在播放${name}。`,
    radio_kw: ["电台", "广播"],
    radioNext_kw: ["下一个电台", "换一个电台", "换台"],
    reminderSet: (n, unit) => `好的,${n}${unit}后提醒你。`,
    reminderFired: "提醒时间到!",
    reminder_kw: ["提醒"],
    minuteWord: "分钟", secondWord: "秒",
    emergencyLabel: "紧急联系号码",
    emergencyPlaceholder: "电话号码",
    emergencyCalling: "正在呼叫救援。",
    emergencyNotSet: "请先在设置中保存紧急联系号码。",
    emergency_kw: ["呼叫救援", "紧急情况"],
    map_kw: ["地图"],
    wake: ["嘿volt", "嘿 volt", "volt", "hey bolt", "bolt", "hey bot", " bot", "bot,", "hey jolt", "jolt", "hey colt", "colt", "hey wolf", "wolf"],
    open: ["打开", "开启"],
    close: ["关闭", "关掉"],
    reset: ["重置"],
    max_kw: ["最高速度", "最大速度"],
    avg_kw: ["平均速度"],
    dist_kw: ["距离", "骑了多远", "多少公里"],
    speed_kw: ["速度", "多快"],
    query_kw: ["多少", "什么"],
    weatherChecking: "正在查看天气…",
    weatherError: "无法获取天气信息。",
    weatherIs: (temp, cond) => `现在气温${temp}度,天气${cond}。`,
    weather_kw: ["天气"],
  },
  ko: {
    langName: "한국어",
    tagline: "스마트 라이딩 컴퓨터",
    max: "최고", avg: "평균", dist: "거리", unit: "km/h",
    gpsActive: "GPS 켜짐", gpsOff: "GPS 꺼짐", gaugeOff: "게이지 꺼짐",
    noGeo: "이 기기에서는 위치 서비스를 사용할 수 없습니다.",
    permDenied: "위치 권한이 거부되었습니다. 속도계에는 위치 권한이 필요합니다.",
    locUnavailable: "위치를 가져올 수 없습니다.",
    turnOff: "게이지 끄기", turnOn: "게이지 켜기",
    settings: "설정", language: "언어", sound: "앱 소리", theme: "테마 색상",
    colorRed: "빨강", colorBlue: "파랑", colorGreen: "초록", colorWhite: "흰색",
    voiceOn: "음성 제어 켜짐", voiceOff: "음성 제어 켜기",
    tapToTalk: "탭하여 말하기",
    listening: "듣는 중", speaking: "말하는 중…",
    hint: '"헤이 볼트"라고 말한 후 무엇이든 물어보세요',
    notUnderstood: "들었지만 이해하지 못했어요.",
    greeting: "안녕하세요, 저는 당신의 스마트 라이딩 어시스턴트 볼트입니다. 무엇을 도와드릴까요?",
    micNotSupported: "이 브라우저는 음성 인식을 지원하지 않습니다",
    speedIs: (v, u) => `현재 시속 ${v}${u}로 이동 중입니다.`,
    stopped: "현재 정지해 있습니다.",
    maxIs: (v, u) => `최고 속도는 시속 ${v}${u}입니다.`,
    avgIs: (v, u) => `평균 속도는 시속 ${v}${u}입니다.`,
    distIs: (v, u) => `지금까지 ${v}${u}를 이동했습니다.`,
    gaugeOpened: "속도계를 켭니다.",
    gaugeClosed: "속도계를 끕니다.",
    sessionReset: "세션을 초기화했습니다.",
    roadWarning: "주의, 도로가 울퉁불퉁해요! 속도를 줄이세요.",
    unitLabel: "속도 단위",
    sensitivityLabel: "도로 경고 민감도",
    voiceControlLabel: "음성 제어",
    fullscreenLabel: "전체 화면",
    on: "켜짐", off: "꺼짐",
    sensLow: "낮음", sensMedium: "보통", sensHigh: "높음",
    compassOpened: "나침반을 켭니다.",
    compassClosed: "나침반을 끕니다.",
    compassLabel: "나침반",
    compass_kw: ["나침반"],
    mapOpened: "지도를 엽니다.",
    mapClosed: "지도를 닫습니다.",
    mapLabel: "지도",
    mapLoading: "위치를 기다리는 중…",
    timeIs: (s) => `지금은 ${s}입니다.`,
    dateIs: (s) => `오늘은 ${s}입니다.`,
    time_kw: ["몇 시", "지금 몇시"],
    date_kw: ["오늘 며칠", "무슨 요일", "오늘 날짜"],
    resultIs: (a, b, op, r) => `${a} ${op} ${b}는 ${r}입니다.`,
    divideByZero: "0으로 나눌 수 없어요.",
    sunsetChecking: "일몰 시간을 확인 중…",
    sunsetError: "일몰 시간을 가져올 수 없습니다.",
    sunsetIn: (h, m) => (h > 0 ? `어두워지기까지 ${h}시간 ${m}분 남았습니다.` : `어두워지기까지 ${m}분 남았습니다.`),
    sunset_kw: ["일몰", "어두워지"],
    locationChecking: "위치를 확인 중…",
    locationError: "위치를 찾을 수 없습니다.",
    locationIntro: "현재 위치: ",
    locLabels: { province: "도", district: "구", neighborhood: "동네", street: "거리" },
    whereAmI_kw: ["나 어디", "내 위치"],
    batteryLow: (pct) => `휴대폰 배터리가 ${pct}퍼센트로 떨어졌습니다.`,
    batteryCritical: (pct) => `주의하세요, 배터리가 매우 부족합니다, ${pct}퍼센트. 곧 충전이 필요할 수 있습니다.`,
    batteryLowLabel: "배터리 부족",
    batteryCriticalLabel: "배터리 위험",
    navApproaching: (d) => `${d}미터 후 `,
    navStarting: (dist, dur) => `내비게이션을 시작합니다. 거리 ${dist}킬로미터, 예상 시간 ${dur}분.`,
    navNotFound: "그 장소를 찾을 수 없습니다.",
    navRouteError: "경로를 계산할 수 없습니다.",
    navStopped: "내비게이션을 중지합니다.",
    navNoActive: "현재 진행 중인 내비게이션이 없습니다.",
    nav_close_kw: ["내비게이션 중지", "내비게이션 취소", "내비게이션 종료"],
    next_direction_kw: ["다음 방향", "다음 안내", "다음에 뭐해"],
    sosLabel: "비상 연락처",
    sosNoNumber: "먼저 설정에서 비상 연락처를 추가해야 합니다.",
    sosCalling: "비상 연락처로 전화를 겁니다.",
    sos_kw: ["도움 요청", "긴급 전화", "도와줘"],
    autoPausedLabel: "자동 일시정지",
    historyLabel: "라이딩 기록",
    historyEmpty: "아직 기록된 라이딩이 없습니다.",
    historyClear: "기록 지우기",
    lastRideNone: "아직 기록된 라이딩이 없습니다.",
    lastRideIs: (dist, avg, max) => `지난 라이딩은 ${dist}킬로미터였고, 평균 ${avg}, 최고 시속 ${max}킬로미터였습니다.`,
    lastRide_kw: ["지난 라이딩", "이전 라이딩", "지난번 라이딩 어땠어"],
    radioOpened: (name) => `${name} 재생 중입니다.`,
    radioClosed: "라디오를 끕니다.",
    radioNext: (name) => `이제 ${name}이(가) 재생됩니다.`,
    radio_kw: ["라디오"],
    radioNext_kw: ["다음 방송국", "방송국 바꿔", "다른 방송국"],
    reminderSet: (n, unit) => `알겠습니다, ${n}${unit} 후에 알려드릴게요.`,
    reminderFired: "알림 시간이 되었습니다!",
    reminder_kw: ["알려줘", "알림"],
    minuteWord: "분", secondWord: "초",
    emergencyLabel: "긴급 연락처",
    emergencyPlaceholder: "전화번호",
    emergencyCalling: "도움을 요청합니다.",
    emergencyNotSet: "먼저 설정에서 긴급 연락처를 저장하세요.",
    emergency_kw: ["도움 요청", "긴급 상황"],
    map_kw: ["지도"],
    wake: ["헤이 볼트", "볼트", "hey bolt", "bolt", "hey bot", " bot", "bot,", "hey jolt", "jolt", "hey colt", "colt", "hey wolf", "wolf"],
    open: ["켜", "열어", "보여"],
    close: ["꺼", "닫아", "숨겨"],
    reset: ["초기화", "리셋"],
    max_kw: ["최고 속도", "최대 속도"],
    avg_kw: ["평균 속도"],
    dist_kw: ["거리", "얼마나 갔", "몇 킬로"],
    speed_kw: ["속도", "얼마나 빨리"],
    query_kw: ["뭐", "얼마"],
    weatherChecking: "날씨를 확인 중…",
    weatherError: "날씨 정보를 가져올 수 없습니다.",
    weatherIs: (temp, cond) => `현재 기온은 ${temp}도이고 날씨는 ${cond}입니다.`,
    weather_kw: ["날씨"],
  },
};

const WEATHER_WORDS = {
  tr: { clear: "açık", cloudy: "bulutlu", fog: "sisli", drizzle: "çisenti yağıyor", rain: "yağmurlu", snow: "karlı", showers: "sağanak yağışlı", thunderstorm: "gök gürültülü fırtınalı" },
  en: { clear: "clear", cloudy: "cloudy", fog: "foggy", drizzle: "drizzling", rain: "rainy", snow: "snowy", showers: "showery", thunderstorm: "stormy" },
  ru: { clear: "ясно", cloudy: "облачно", fog: "туманно", drizzle: "морось", rain: "дождливо", snow: "снежно", showers: "ливень", thunderstorm: "гроза" },
  de: { clear: "klar", cloudy: "bewölkt", fog: "neblig", drizzle: "nieselt", rain: "regnerisch", snow: "schneit", showers: "schauerartig", thunderstorm: "gewittrig" },
  zh: { clear: "晴朗", cloudy: "多云", fog: "有雾", drizzle: "毛毛雨", rain: "下雨", snow: "下雪", showers: "阵雨", thunderstorm: "雷暴" },
  ko: { clear: "맑음", cloudy: "흐림", fog: "안개", drizzle: "이슬비", rain: "비", snow: "눈", showers: "소나기", thunderstorm: "뇌우" },
};

function describeWeatherCode(code, lang) {
  const w = WEATHER_WORDS[lang] || WEATHER_WORDS.en;
  if (code === 0) return w.clear;
  if ([1, 2, 3].includes(code)) return w.cloudy;
  if ([45, 48].includes(code)) return w.fog;
  if ([51, 53, 55, 56, 57].includes(code)) return w.drizzle;
  if ([61, 63, 65, 66, 67].includes(code)) return w.rain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return w.snow;
  if ([80, 81, 82].includes(code)) return w.showers;
  if ([95, 96, 99].includes(code)) return w.thunderstorm;
  return w.cloudy;
}

const CALC_OPS = {
  tr: { multiply: ["çarpı", "kere"], plus: ["artı"], minus: ["eksi"], divide: ["bölü"] },
  en: { multiply: ["times", "multiplied by"], plus: ["plus"], minus: ["minus"], divide: ["divided by"] },
  ru: { multiply: ["умножить на"], plus: ["плюс"], minus: ["минус"], divide: ["разделить на"] },
  de: { multiply: ["mal"], plus: ["plus"], minus: ["minus"], divide: ["geteilt durch"] },
  zh: { multiply: ["乘以"], plus: ["加"], minus: ["减"], divide: ["除以"] },
  ko: { multiply: ["곱하기"], plus: ["더하기"], minus: ["빼기"], divide: ["나누기"] },
};

const OP_WORDS = {
  tr: { multiply: "çarpı", plus: "artı", minus: "eksi", divide: "bölü" },
  en: { multiply: "times", plus: "plus", minus: "minus", divide: "divided by" },
  ru: { multiply: "умножить на", plus: "плюс", minus: "минус", divide: "разделить на" },
  de: { multiply: "mal", plus: "plus", minus: "minus", divide: "geteilt durch" },
  zh: { multiply: "乘以", plus: "加", minus: "减", divide: "除以" },
  ko: { multiply: "곱하기", plus: "더하기", minus: "빼기", divide: "나누기" },
};

function parseCalculation(raw, lang) {
  const t = raw.toLowerCase();
  const ops = CALC_OPS[lang] || CALC_OPS.en;
  for (const opKey of Object.keys(ops)) {
    for (const phrase of ops[opKey]) {
      const idx = t.indexOf(phrase);
      if (idx === -1) continue;
      const before = t.slice(0, idx);
      const after = t.slice(idx + phrase.length);
      const beforeMatches = before.match(/\d+(\.\d+)?/g);
      const afterMatch = after.match(/\d+(\.\d+)?/);
      if (beforeMatches && beforeMatches.length && afterMatch) {
        const a = parseFloat(beforeMatches[beforeMatches.length - 1]);
        const b = parseFloat(afterMatch[0]);
        let result;
        if (opKey === "multiply") result = a * b;
        else if (opKey === "plus") result = a + b;
        else if (opKey === "minus") result = a - b;
        else if (opKey === "divide") result = b !== 0 ? a / b : null;
        return { a, b, opKey, result };
      }
    }
  }
  return null;
}

// Local sunset calculation (NOAA/Almanac simplified algorithm) — no external API needed
function calculateSunset(lat, lon, date) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((date - start) / 86400000);
  const lngHour = lon / 15;
  const tCalc = dayOfYear + (18 - lngHour) / 24;
  const M = 0.9856 * tCalc - 3.289;
  let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
  L = ((L % 360) + 360) % 360;
  let RA = deg * Math.atan(0.91764 * Math.tan(L * rad));
  RA = ((RA % 360) + 360) % 360;
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;
  const sinDec = 0.39782 * Math.sin(L * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const zenith = 90.833;
  const cosH = (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;
  const H = (deg * Math.acos(cosH)) / 15;
  const T = H + RA - 0.06571 * tCalc - 6.622;
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;
  const hours = Math.floor(UT);
  const minutes = Math.floor((UT - hours) * 60);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes));
}

const NAV_TRIGGERS = {
  tr: ["git", "götür", "gidelim"],
  en: ["navigate to", "take me to", "go to"],
  ru: ["поезжай в", "веди меня в", "навигация до"],
  de: ["navigiere nach", "bring mich nach", "fahre nach"],
  zh: ["导航到", "带我去", "去"],
  ko: ["안내해줘", "데려다줘", "가자"],
};

const NAV_WORDS = {
  tr: {
    turnLeft: "sola dön", turnRight: "sağa dön",
    turnSlightLeft: "hafif sola dön", turnSlightRight: "hafif sağa dön",
    turnSharpLeft: "keskin sola dön", turnSharpRight: "keskin sağa dön",
    uturn: "U dönüşü yap", straight: "düz devam et", continueWord: "devam et",
    depart: "Yola çık.", arrive: "Hedefine ulaştın.",
    roundabout: (exit) => `Dönel kavşakta ${exit}. çıkıştan çık.`,
    continueOnto: (street) => `${street} üzerinde devam et.`,
    continueStraight: "Düz devam et.",
    turnOnto: (dir, street) => `${street} üzerine ${dir}.`,
  },
  en: {
    turnLeft: "turn left", turnRight: "turn right",
    turnSlightLeft: "turn slightly left", turnSlightRight: "turn slightly right",
    turnSharpLeft: "turn sharply left", turnSharpRight: "turn sharply right",
    uturn: "make a U-turn", straight: "go straight", continueWord: "continue",
    depart: "Head out.", arrive: "You've arrived at your destination.",
    roundabout: (exit) => `At the roundabout, take exit ${exit}.`,
    continueOnto: (street) => `Continue on ${street}.`,
    continueStraight: "Continue straight.",
    turnOnto: (dir, street) => `${dir.charAt(0).toUpperCase() + dir.slice(1)} onto ${street}.`,
  },
  ru: {
    turnLeft: "поверни налево", turnRight: "поверни направо",
    turnSlightLeft: "плавно налево", turnSlightRight: "плавно направо",
    turnSharpLeft: "резко налево", turnSharpRight: "резко направо",
    uturn: "развернись", straight: "продолжай прямо", continueWord: "продолжай",
    depart: "Начни движение.", arrive: "Ты прибыл в пункт назначения.",
    roundabout: (exit) => `На круге съезжай на ${exit}-м съезде.`,
    continueOnto: (street) => `Продолжай по ${street}.`,
    continueStraight: "Продолжай прямо.",
    turnOnto: (dir, street) => `${dir} на ${street}.`,
  },
  de: {
    turnLeft: "links abbiegen", turnRight: "rechts abbiegen",
    turnSlightLeft: "leicht links abbiegen", turnSlightRight: "leicht rechts abbiegen",
    turnSharpLeft: "scharf links abbiegen", turnSharpRight: "scharf rechts abbiegen",
    uturn: "wenden", straight: "geradeaus fahren", continueWord: "weiterfahren",
    depart: "Los geht's.", arrive: "Du hast dein Ziel erreicht.",
    roundabout: (exit) => `Nimm im Kreisverkehr die ${exit}. Ausfahrt.`,
    continueOnto: (street) => `Weiter auf ${street}.`,
    continueStraight: "Geradeaus weiterfahren.",
    turnOnto: (dir, street) => `${dir} auf ${street}.`,
  },
  zh: {
    turnLeft: "左转", turnRight: "右转",
    turnSlightLeft: "稍微左转", turnSlightRight: "稍微右转",
    turnSharpLeft: "急左转", turnSharpRight: "急右转",
    uturn: "掉头", straight: "直行", continueWord: "继续前行",
    depart: "出发吧。", arrive: "你已到达目的地。",
    roundabout: (exit) => `在环岛走第${exit}个出口。`,
    continueOnto: (street) => `继续沿${street}行驶。`,
    continueStraight: "继续直行。",
    turnOnto: (dir, street) => `${dir},进入${street}。`,
  },
  ko: {
    turnLeft: "좌회전하세요", turnRight: "우회전하세요",
    turnSlightLeft: "완만하게 좌회전하세요", turnSlightRight: "완만하게 우회전하세요",
    turnSharpLeft: "급좌회전하세요", turnSharpRight: "급우회전하세요",
    uturn: "유턴하세요", straight: "직진하세요", continueWord: "계속 가세요",
    depart: "출발하세요.", arrive: "목적지에 도착했습니다.",
    roundabout: (exit) => `로터리에서 ${exit}번째 출구로 나가세요.`,
    continueOnto: (street) => `${street}을(를) 따라 계속 가세요.`,
    continueStraight: "계속 직진하세요.",
    turnOnto: (dir, street) => `${street}(으)로 ${dir}.`,
  },
};

function phraseForStep(step, lang) {
  const NW = NAV_WORDS[lang] || NAV_WORDS.en;
  const { type, modifier, exit } = step.maneuver;
  const street = step.name;
  const dirWord =
    {
      uturn: NW.uturn,
      "sharp right": NW.turnSharpRight,
      right: NW.turnRight,
      "slight right": NW.turnSlightRight,
      straight: NW.straight,
      "slight left": NW.turnSlightLeft,
      left: NW.turnLeft,
      "sharp left": NW.turnSharpLeft,
    }[modifier] || NW.continueWord;

  if (type === "depart") return NW.depart;
  if (type === "arrive") return NW.arrive;
  if (type === "roundabout" || type === "rotary") return NW.roundabout(exit || 1);
  if (type === "continue" || type === "new name") return street ? NW.continueOnto(street) : NW.continueStraight;
  return street ? NW.turnOnto(dirWord, street) : dirWord;
}

function extractDestination(raw, lang, wakeWords, triggerWords) {
  let cleaned = raw.toLowerCase();
  [...wakeWords, ...triggerWords].forEach((w) => {
    cleaned = cleaned.split(w).join(" ");
  });
  return cleaned
    .replace(/['’,]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const RADIO_STATIONS = {
  tr: [
    { name: "Power FM", url: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio" },
    { name: "Joy FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FM.mp3" },
    { name: "Joy Türk", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK.mp3" },
    { name: "Metro FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM.mp3" },
    { name: "Virgin Radio Türkiye", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC.mp3" },
    { name: "Number 1 FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/NUMBER1FM.mp3" },
    { name: "Number 1 Türk FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/NUMBER1TURK_FMAAC.aac" },
    { name: "Radyo Mydonose", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_MYDONOSE.mp3" },
    { name: "Kiss FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/KISS_FM128AAC.aac" },
    { name: "80'ler Gold", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/FLASHBACK.mp3" },
  ],
  en: [
    { name: "SomaFM Groove Salad", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
    { name: "SomaFM Indie Pop Rocks", url: "https://ice1.somafm.com/indiepop-128-mp3" },
    { name: "SomaFM Beat Blender", url: "https://ice1.somafm.com/beatblender-128-mp3" },
    { name: "Radio Paradise", url: "https://stream.radioparadise.com/mp3-192" },
  ],
  ru: [
    { name: "Europa Plus", url: "http://ep128.hostingradio.ru:8030/ep128" },
    { name: "Radio Record", url: "http://air.radiorecord.ru:805/rr_320" },
  ],
  de: [
    { name: "Deutschlandfunk", url: "https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3" },
    { name: "SWR3", url: "https://liveradio.swr.de/sw282p3/swr3/play.mp3" },
    { name: "WDR 1LIVE", url: "https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3" },
  ],
  zh: [{ name: "Big B Radio CPOP", url: "http://cpop.bigbradio.net/s" }],
  ko: [{ name: "Big B Radio KPOP", url: "http://kpop.bigbradio.net/s" }],
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function SpeedArc({ speed, flash, unit, max = 60 }) {
  const clamped = Math.max(0, Math.min(speed, max));
  const pct = clamped / max;
  const startAngle = -120;
  const endAngle = 120;
  const angle = startAngle + pct * (endAngle - startAngle);

  const polar = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arcPath = (r, a1, a2) => {
    const p1 = polar(150, 150, r, a1);
    const p2 = polar(150, 150, r, a2);
    const largeArc = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  const ticks = [];
  for (let v = 0; v <= max; v += 10) {
    const a = startAngle + (v / max) * (endAngle - startAngle);
    const outer = polar(150, 150, 128, a);
    const inner = polar(150, 150, 114, a);
    const label = polar(150, 150, 98, a);
    ticks.push(
      <g key={v}>
        <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="var(--tick)" strokeWidth="2" />
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="var(--dim)"
          fontFamily="'Roboto Mono', 'SF Mono', ui-monospace, monospace"
        >
          {v}
        </text>
      </g>
    );
  }

  return (
    <svg width="300" height="230" viewBox="0 0 300 230">
      <path d={arcPath(128, startAngle, endAngle)} fill="none" stroke="var(--panel)" strokeWidth="18" strokeLinecap="round" />
      <path
        d={arcPath(128, startAngle, angle)}
        fill="none"
        strokeWidth="18"
        strokeLinecap="round"
        className={flash ? "gauge-flash" : ""}
        style={{ stroke: "var(--accent)", transition: "d 0.3s ease" }}
      />
      {ticks}
      <text
        x="150"
        y="145"
        textAnchor="middle"
        fontSize="64"
        fontWeight="700"
        fill="var(--text)"
        fontFamily="'Roboto Mono', 'SF Mono', ui-monospace, monospace"
      >
        {clamped.toFixed(0)}
      </text>
      <text x="150" y="175" textAnchor="middle" fontSize="13" fill="var(--dim2)" letterSpacing="2">
        {unit.toUpperCase()}
      </text>
    </svg>
  );
}

function Compass({ heading }) {
  const dirLabels = [
    { deg: 0, label: "N" },
    { deg: 45, label: "NE" },
    { deg: 90, label: "E" },
    { deg: 135, label: "SE" },
    { deg: 180, label: "S" },
    { deg: 225, label: "SW" },
    { deg: 270, label: "W" },
    { deg: 315, label: "NW" },
  ];
  const cardinalOf = (h) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(h / 45) % 8];
  };

  return (
    <div style={{ position: "relative", width: 220, height: 220 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          transform: `rotate(${-heading}deg)`,
          transition: "transform 0.15s linear",
        }}
      >
        {dirLabels.map((d) => {
          const rad = ((d.deg - 90) * Math.PI) / 180;
          const r = 92;
          const x = 110 + r * Math.cos(rad);
          const y = 110 + r * Math.sin(rad);
          return (
            <div
              key={d.label}
              className="digit"
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                fontSize: d.label.length === 1 ? 15 : 11,
                fontWeight: 700,
                color: d.label === "N" ? "var(--accent)" : "var(--dim)",
              }}
            >
              {d.label}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: -2,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderBottom: "14px solid var(--accent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="digit" style={{ fontSize: 34, fontWeight: 700, color: "var(--text)" }}>
          {Math.round(heading)}°
        </div>
        <div style={{ fontSize: 13, color: "var(--dim2)", letterSpacing: 2 }}>{cardinalOf(heading)}</div>
      </div>
    </div>
  );
}

export default function Volt() {
  const [language, setLanguage] = useState("en");
  const [themeColor, setThemeColor] = useState("green");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [speedUnit, setSpeedUnit] = useState("kmh");
  const [roadSensitivity, setRoadSensitivity] = useState("medium");
  const [micEnabled, setMicEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = T[language];
  const accent = THEMES[themeColor];
  const isLight = accent.light;
  const surface = isLight
    ? {
        bg: "#F5F5F0",
        panel: "#E7E7E1",
        border: "#D6D6D0",
        text: "#12140F",
        dim: "#6E7260",
        dim2: "#5A5D52",
        tick: "#9A9D92",
      }
    : {
        bg: "#12140F",
        panel: "#1B1D16",
        border: "#262920",
        text: "#EDEFE6",
        dim: "#6B7268",
        dim2: "#8A8F7C",
        tick: "#4A5040",
      };
  const unitWord = UNIT_WORDS[language][speedUnit === "mph" ? "mi" : "km"];
  const displayUnit = speedUnit === "mph" ? "mph" : t.unit;
  const displayDistUnit = speedUnit === "mph" ? "mi" : "km";
  const toDisplay = useCallback((kmhOrKm) => (speedUnit === "mph" ? kmhOrKm * KM_TO_MI : kmhOrKm), [speedUnit]);

  // Splash screen
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setSplashExiting(true), 1300);
    const t2 = setTimeout(() => setShowSplash(false), 1300 + 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Boot "self-test" needle sweep, played once the splash starts clearing
  const [bootValue, setBootValue] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  useEffect(() => {
    if (!splashExiting) return;
    let raf;
    let start = null;
    const duration = 900;
    const peak = (speedUnit === "mph" ? 40 : 60) * 0.92;
    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const tt = Math.min(elapsed / duration, 1);
      const val = tt < 0.6 ? (tt / 0.6) * peak : peak * (1 - (tt - 0.6) / 0.4);
      setBootValue(val);
      if (tt < 1) raf = requestAnimationFrame(step);
      else setBootDone(true);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [splashExiting]);

  // Speed gauge (GPS)
  const [gaugeOn, setGaugeOn] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [gpsError, setGpsError] = useState("");
  const [autoPaused, setAutoPaused] = useState(false);
  const lastPosRef = useRef(null);
  const watchIdRef = useRef(null);

  const [rideHistory, setRideHistory] = useState([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("volt-ride-history");
      if (saved) setRideHistory(JSON.parse(saved));
    } catch (e) {}
  }, []);
  const clearHistory = useCallback(() => {
    setRideHistory([]);
    try {
      localStorage.removeItem("volt-ride-history");
    } catch (e) {}
  }, []);

  // Session stats
  const [sessionMax, setSessionMax] = useState(0);
  const [sessionDistance, setSessionDistance] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionDistanceRef = useRef(0);
  const sessionSecondsRef = useRef(0);
  const sessionMaxRef = useRef(0);
  const sessionAvgRef = useRef(0);
  const currentSpeedRef = useRef(0);

  const resetSession = useCallback(() => {
    sessionDistanceRef.current = 0;
    sessionSecondsRef.current = 0;
    setSessionDistance(0);
    setSessionSeconds(0);
    setSessionMax(0);
    lastPosRef.current = null;
  }, []);

  const sessionAvg = sessionSeconds > 0 ? sessionDistance / (sessionSeconds / 3600) : 0;

  useEffect(() => {
    sessionMaxRef.current = sessionMax;
    sessionAvgRef.current = sessionAvg;
    currentSpeedRef.current = currentSpeed;
  }, [sessionMax, sessionAvg, currentSpeed]);

  // Keep the screen awake while the gauge is in use
  const wakeLockRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      try {
        if ("wakeLock" in navigator) {
          const lock = await navigator.wakeLock.request("screen");
          if (!cancelled) wakeLockRef.current = lock;
        }
      } catch (e) {}
    }
    async function release() {
      try {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch (e) {}
    }
    if (gaugeOn) acquire();
    else release();
    return () => {
      cancelled = true;
      release();
    };
  }, [gaugeOn]);

  useEffect(() => {
    const handleVisibility = async () => {
      if (gaugeOn && document.visibilityState === "visible" && "wakeLock" in navigator && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (e) {}
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [gaugeOn]);

  // GPS watch
  useEffect(() => {
    if (gaugeOn) {
      if (!("geolocation" in navigator)) {
        setGpsError(t.noGeo);
        return;
      }
      resetSession();
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsError("");
          const { latitude, longitude, speed } = pos.coords;
          let kmh = typeof speed === "number" && speed !== null && speed >= 0 ? speed * 3.6 : null;
          if (lastPosRef.current) {
            const { lat, lon, tms } = lastPosRef.current;
            const dt = (pos.timestamp - tms) / 1000;
            if (dt > 0) {
              const distKm = haversineKm(lat, lon, latitude, longitude);
              if (kmh === null) kmh = (distKm / dt) * 3600;
              const isMoving = kmh >= AUTO_PAUSE_THRESHOLD_KMH;
              setAutoPaused(!isMoving);
              if (distKm < 0.5 && isMoving) {
                sessionDistanceRef.current += distKm;
                sessionSecondsRef.current += dt;
                setSessionDistance(sessionDistanceRef.current);
                setSessionSeconds(sessionSecondsRef.current);
              }
            }
          }
          if (kmh !== null) {
            setCurrentSpeed(kmh);
            setSessionMax((prev) => Math.max(prev, kmh));
          }
          lastPosRef.current = { lat: latitude, lon: longitude, tms: pos.timestamp };
        },
        (err) => {
          setGpsError(err.code === 1 ? t.permDenied : t.locUnavailable);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setCurrentSpeed(0);
      setGpsError("");
      setAutoPaused(false);
      if (sessionDistanceRef.current >= 0.05) {
        const ride = {
          date: new Date().toISOString(),
          distance: sessionDistanceRef.current,
          avgSpeed: sessionAvgRef.current,
          maxSpeed: sessionMaxRef.current,
          durationSeconds: sessionSecondsRef.current,
        };
        setRideHistory((prev) => {
          const next = [ride, ...prev].slice(0, 50);
          try {
            localStorage.setItem("volt-ride-history", JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaugeOn]);

  // Voice control — always listening for the wake word, no manual toggle
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [micBlocked, setMicBlocked] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const speak = useCallback(
    (text) => {
      if (!("speechSynthesis" in window)) return;
      isSpeakingRef.current = true;
      setSpeaking(true);
      try {
        recognitionRef.current && recognitionRef.current.stop();
      } catch (e) {}

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        isSpeakingRef.current = false;
        setSpeaking(false);
        if (!micBlocked && micEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {}
        }
      };

      if (!soundEnabled) {
        finish();
        return;
      }

      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = LANG_LOCALE[language];
      utter.rate = 1;
      utter.onend = finish;
      utter.onerror = finish;
      window.speechSynthesis.speak(utter);
      const timeoutMs = Math.max(3500, text.length * 110);
      setTimeout(finish, timeoutMs);
    },
    [soundEnabled, language, micBlocked, micEnabled]
  );

  const greetedRef = useRef(false);
  useEffect(() => {
    const greet = () => {
      if (greetedRef.current) return;
      greetedRef.current = true;
      speak(t.greeting);
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().catch(() => {});
      }
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission().catch(() => {});
      }
    };
    document.addEventListener("pointerdown", greet, { once: true });
    return () => document.removeEventListener("pointerdown", greet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rough road / pothole detection via the device's motion sensor
  const [roadWarning, setRoadWarning] = useState(false);
  const motionBaselineRef = useRef(9.8);
  const motionInitRef = useRef(false);
  const lastRoadAlertRef = useRef(0);

  const beep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      [880, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startAt = ctx.currentTime + i * 0.16;
        osc.start(startAt);
        osc.stop(startAt + 0.14);
      });
      setTimeout(() => ctx.close(), 500);
    } catch (e) {}
  }, [soundEnabled]);

  const triggerRoadAlert = useCallback(() => {
    setRoadWarning(true);
    beep();
    speak(t.roadWarning);
    setTimeout(() => setRoadWarning(false), 2500);
  }, [beep, speak, t]);

  useEffect(() => {
    if (typeof window.DeviceMotionEvent === "undefined") return;
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc || acc.x === null || acc.x === undefined) return;
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      if (!motionInitRef.current) {
        motionBaselineRef.current = mag;
        motionInitRef.current = true;
        return;
      }
      const deviation = Math.abs(mag - motionBaselineRef.current);
      motionBaselineRef.current = motionBaselineRef.current * 0.92 + mag * 0.08;

      const now = Date.now();
      if (
        roadSensitivity !== "off" &&
        deviation > SENSITIVITY_THRESHOLD[roadSensitivity] &&
        gaugeOn &&
        currentSpeedRef.current > 8 &&
        now - lastRoadAlertRef.current > 4000
      ) {
        lastRoadAlertRef.current = now;
        triggerRoadAlert();
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [gaugeOn, roadSensitivity, triggerRoadAlert]);

  // Compass
  const [compassOn, setCompassOn] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  useEffect(() => {
    if (!compassOn) return;
    const handler = (e) => {
      let heading = null;
      if (typeof e.webkitCompassHeading === "number") {
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        heading = 360 - e.alpha;
      }
      if (heading !== null) {
        setCompassHeading((heading + 360) % 360);
      }
    };
    const eventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(eventName, handler, true);
    return () => window.removeEventListener(eventName, handler, true);
  }, [compassOn]);

  // In-app map
  const [mapOn, setMapOn] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  useEffect(() => {
    if (!mapOn) return;
    if (lastPosRef.current) {
      setMapCoords({ lat: lastPosRef.current.lat, lon: lastPosRef.current.lon });
      return;
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setMapCoords(null)
      );
    }
  }, [mapOn]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      const request =
        el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (request) request.call(el).catch(() => {});
    } else {
      const exit =
        document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) exit.call(document).catch(() => {});
    }
  }, []);

  // Internet radio
  const [radioOn, setRadioOn] = useState(false);
  const [radioActivated, setRadioActivated] = useState(false);
  const [radioIndex, setRadioIndex] = useState(0);
  const audioRef = useRef(null);

  const playStation = useCallback(
    (index) => {
      const stations = RADIO_STATIONS[language] || RADIO_STATIONS.en;
      const station = stations[((index % stations.length) + stations.length) % stations.length];
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = station.url;
      audioRef.current.play().catch(() => {});
      setRadioIndex(index);
      setRadioOn(true);
      return station;
    },
    [language]
  );

  const stopRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setRadioOn(false);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const toggleRadioPlayback = useCallback(() => {
    if (!audioRef.current || !audioRef.current.src) {
      playStation(0);
      return;
    }
    if (radioOn) {
      audioRef.current.pause();
      setRadioOn(false);
    } else {
      audioRef.current.play().catch(() => {});
      setRadioOn(true);
    }
  }, [radioOn, playStation]);

  const stepStation = useCallback(
    (delta) => {
      const stations = RADIO_STATIONS[language] || RADIO_STATIONS.en;
      const newIndex = ((radioIndex + delta) % stations.length + stations.length) % stations.length;
      playStation(newIndex);
    },
    [radioIndex, language, playStation]
  );

  // Low battery warning (Android Chrome; not supported on iOS Safari or desktop browsers)
  const [batteryWarning, setBatteryWarning] = useState(null);
  const batteryWarnedRef = useRef({ low: false, critical: false });
  useEffect(() => {
    if (!navigator.getBattery) return;
    let battery;
    let handler;
    let cancelled = false;
    navigator.getBattery().then((b) => {
      if (cancelled) return;
      battery = b;
      const check = () => {
        if (battery.charging) {
          batteryWarnedRef.current = { low: false, critical: false };
          return;
        }
        const pct = Math.round(battery.level * 100);
        if (pct <= 10 && !batteryWarnedRef.current.critical) {
          batteryWarnedRef.current.critical = true;
          setBatteryWarning("critical");
          speak(t.batteryCritical(pct));
          setTimeout(() => setBatteryWarning(null), 6000);
        } else if (pct <= 20 && !batteryWarnedRef.current.low) {
          batteryWarnedRef.current.low = true;
          setBatteryWarning("low");
          speak(t.batteryLow(pct));
          setTimeout(() => setBatteryWarning(null), 6000);
        }
      };
      handler = check;
      battery.addEventListener("levelchange", handler);
      battery.addEventListener("chargingchange", handler);
      check();
    });
    return () => {
      cancelled = true;
      if (battery && handler) {
        battery.removeEventListener("levelchange", handler);
        battery.removeEventListener("chargingchange", handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, t]);

  // Turn-by-turn navigation (Nominatim geocoding + OSRM routing, both free/no key)
  const [navActive, setNavActive] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [destCoords, setDestCoords] = useState(null);
  const navStepIndexRef = useRef(0);
  const routeStepsRef = useRef([]);

  const startNavigation = useCallback(
    async (destinationQuery) => {
      setVoiceStatus(t.sunsetChecking); // reuse a generic "checking..." style status briefly
      try {
        const getPos = () =>
          new Promise((resolve, reject) => {
            if (lastPosRef.current) {
              resolve({ lat: lastPosRef.current.lat, lon: lastPosRef.current.lon });
            } else if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                reject,
                { enableHighAccuracy: true, timeout: 10000 }
              );
            } else {
              reject(new Error("no geolocation"));
            }
          });
        const origin = await getPos();

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationQuery)}&format=json&limit=1&accept-language=${language}`
        );
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) {
          setVoiceStatus(t.navNotFound);
          speak(t.navNotFound);
          return;
        }
        const dest = { lat: parseFloat(geoData[0].lat), lon: parseFloat(geoData[0].lon) };

        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=full&geometries=geojson&steps=true`
        );
        const routeData = await routeRes.json();
        if (!routeData.routes || routeData.routes.length === 0) {
          setVoiceStatus(t.navRouteError);
          speak(t.navRouteError);
          return;
        }
        const route = routeData.routes[0];
        const steps = route.legs[0].steps;
        setRouteSteps(steps);
        routeStepsRef.current = steps;
        setNavStepIndex(0);
        navStepIndexRef.current = 0;
        setDestCoords(dest);
        setNavActive(true);
        setMapOn(true);
        setCompassOn(false);

        const distKm = (route.distance / 1000).toFixed(1);
        const durMin = Math.round(route.duration / 60);
        const msg = t.navStarting(distKm, durMin);
        setVoiceStatus(msg);
        speak(msg);
      } catch (e) {
        setVoiceStatus(t.navRouteError);
        speak(t.navRouteError);
      }
    },
    [t, language, speak]
  );

  const stopNavigation = useCallback(() => {
    setNavActive(false);
    setRouteSteps([]);
    routeStepsRef.current = [];
    setNavStepIndex(0);
    navStepIndexRef.current = 0;
    setDestCoords(null);
  }, []);

  const announceCurrentDirection = useCallback(() => {
    const steps = routeStepsRef.current;
    const idx = navStepIndexRef.current;
    if (!navActive || steps.length === 0 || idx >= steps.length) {
      setVoiceStatus(t.navNoActive);
      speak(t.navNoActive);
      return;
    }
    const msg = phraseForStep(steps[idx], language);
    setVoiceStatus(msg);
    speak(msg);
  }, [navActive, language, speak, t]);

  // Auto-announce the next maneuver when GPS gets close to it
  useEffect(() => {
    if (!navActive || routeSteps.length === 0) return;
    const idx = navStepIndex;
    if (idx >= routeSteps.length) return;
    if (!lastPosRef.current) return;
    const step = routeSteps[idx];
    const [maneuverLon, maneuverLat] = step.maneuver.location;
    const distToManeuver =
      haversineKm(lastPosRef.current.lat, lastPosRef.current.lon, maneuverLat, maneuverLon) * 1000;
    if (distToManeuver < 40) {
      const msg = phraseForStep(step, language);
      setVoiceStatus(msg);
      speak(msg);
      if (step.maneuver.type === "arrive") {
        stopNavigation();
      } else {
        const next = idx + 1;
        setNavStepIndex(next);
        navStepIndexRef.current = next;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSpeed]);

  const triggerSOS = useCallback(() => {
    if (!emergencyNumber) {
      setVoiceStatus(t.sosNoNumber);
      speak(t.sosNoNumber);
      return;
    }
    setVoiceStatus(t.sosCalling);
    speak(t.sosCalling);
    setTimeout(() => {
      window.location.href = `tel:${emergencyNumber}`;
    }, 1200);
  }, [emergencyNumber, t, speak]);

  const getLastRide = useCallback(() => {
    if (rideHistory.length === 0) {
      setVoiceStatus(t.lastRideNone);
      speak(t.lastRideNone);
      return;
    }
    const r = rideHistory[0];
    const dist = toDisplay(r.distance).toFixed(1);
    const avg = `${Math.round(toDisplay(r.avgSpeed))} ${unitWord}`;
    const max = Math.round(toDisplay(r.maxSpeed));
    const msg = t.lastRideIs(dist, avg, max);
    setVoiceStatus(msg);
    speak(msg);
  }, [rideHistory, t, speak, toDisplay, unitWord]);

  const getMyLocation = useCallback(() => {
    setVoiceStatus(t.locationChecking);
    const getPos = () =>
      new Promise((resolve, reject) => {
        if (lastPosRef.current) {
          resolve({ coords: { latitude: lastPosRef.current.lat, longitude: lastPosRef.current.lon } });
        } else if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        } else {
          reject(new Error("no geolocation"));
        }
      });
    getPos()
      .then((pos) => {
        const { latitude, longitude } = pos.coords;
        return fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=${language}`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        const a = data.address || {};
        const province = a.province || a.state;
        const district = a.county || a.city_district || a.town || a.district;
        const neighborhood = a.suburb || a.neighbourhood || a.quarter;
        const street = a.road;
        const parts = [
          province,
          district,
          neighborhood,
          street,
        ].filter(Boolean);
        if (parts.length === 0) throw new Error("no address parts");
        const msg = t.locationIntro + parts.join(", ") + ".";
        setVoiceStatus(msg);
        speak(msg);
      })
      .catch(() => {
        setVoiceStatus(t.locationError);
        speak(t.locationError);
      });
  }, [t, language, speak]);

  const getSunsetInfo = useCallback(() => {
    setVoiceStatus(t.sunsetChecking);
    const getPos = () =>
      new Promise((resolve, reject) => {
        if (lastPosRef.current) {
          resolve({ coords: { latitude: lastPosRef.current.lat, longitude: lastPosRef.current.lon } });
        } else if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        } else {
          reject(new Error("no geolocation"));
        }
      });
    getPos()
      .then((pos) => {
        const { latitude, longitude } = pos.coords;
        const now = new Date();
        let sunset = calculateSunset(latitude, longitude, now);
        if (sunset && sunset < now) {
          const tomorrow = new Date(now.getTime() + 86400000);
          sunset = calculateSunset(latitude, longitude, tomorrow);
        }
        if (!sunset) throw new Error("no sunset");
        const diffMs = sunset - now;
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.max(0, Math.round((diffMs % 3600000) / 60000));
        const msg = t.sunsetIn(hours, minutes);
        setVoiceStatus(msg);
        speak(msg);
      })
      .catch(() => {
        setVoiceStatus(t.sunsetError);
        speak(t.sunsetError);
      });
  }, [t, speak]);

  const getWeather = useCallback(async () => {
    setVoiceStatus(t.weatherChecking);
    try {
      const getPos = () =>
        new Promise((resolve, reject) => {
          if (lastPosRef.current) {
            resolve({ coords: { latitude: lastPosRef.current.lat, longitude: lastPosRef.current.lon } });
          } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          } else {
            reject(new Error("no geolocation"));
          }
        });
      const pos = await getPos();
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      );
      const data = await res.json();
      const temp = Math.round(data.current.temperature_2m);
      const cond = describeWeatherCode(data.current.weather_code, language);
      const msg = t.weatherIs(temp, cond);
      setVoiceStatus(msg);
      speak(msg);
    } catch (e) {
      setVoiceStatus(t.weatherError);
      speak(t.weatherError);
    }
  }, [t, language, speak]);

  const processTranscript = useCallback(
    (raw) => {
      const raw_l = raw.toLowerCase();
      const has = (arr) => arr.some((w) => raw_l.includes(w));
      if (!has(t.wake)) {
        setVoiceStatus(`"${raw}"`);
        return;
      }

      if (has(t.sos_kw)) {
        triggerSOS();
        return;
      }

      const calc = parseCalculation(raw_l, language);
      if (calc) {
        if (calc.result === null) {
          setVoiceStatus(t.divideByZero);
          speak(t.divideByZero);
        } else {
          const opWord = OP_WORDS[language][calc.opKey];
          const r = Number.isInteger(calc.result) ? calc.result : Math.round(calc.result * 100) / 100;
          const msg = t.resultIs(calc.a, calc.b, opWord, r);
          setVoiceStatus(msg);
          speak(msg);
        }
        return;
      }

      if (has(t.time_kw)) {
        const s = new Date().toLocaleTimeString(LANG_LOCALE[language], { hour: "2-digit", minute: "2-digit" });
        const msg = t.timeIs(s);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.date_kw)) {
        const s = new Date().toLocaleDateString(LANG_LOCALE[language], {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        const msg = t.dateIs(s);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.sunset_kw)) {
        getSunsetInfo();
      } else if (has(t.whereAmI_kw)) {
        getMyLocation();
      } else if (has(t.lastRide_kw)) {
        getLastRide();
      } else if (has(t.nav_close_kw)) {
        stopNavigation();
        setVoiceStatus(t.navStopped);
        speak(t.navStopped);
      } else if (has(t.next_direction_kw)) {
        announceCurrentDirection();
      } else if ((NAV_TRIGGERS[language] || NAV_TRIGGERS.en).some((trig) => raw_l.includes(trig))) {
        const destination = extractDestination(raw, language, t.wake, NAV_TRIGGERS[language] || NAV_TRIGGERS.en);
        if (destination) {
          startNavigation(destination);
        } else {
          setVoiceStatus(t.navNotFound);
          speak(t.navNotFound);
        }
      } else if (has(t.reset)) {
        resetSession();
        setVoiceStatus(t.sessionReset);
        speak(t.sessionReset);
      } else if (has(t.radio_kw) && has(t.radioNext_kw)) {
        const stations = RADIO_STATIONS[language] || RADIO_STATIONS.en;
        const nextIndex = (radioIndex + 1) % stations.length;
        const station = playStation(nextIndex);
        const msg = t.radioNext(station.name);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.radio_kw) && has(t.close)) {
        stopRadio();
        setRadioActivated(false);
        setVoiceStatus(t.radioClosed);
        speak(t.radioClosed);
      } else if (has(t.radio_kw) && has(t.open)) {
        const station = playStation(0);
        setRadioActivated(true);
        const msg = t.radioOpened(station.name);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.compass_kw) && has(t.close)) {
        setCompassOn(false);
        setVoiceStatus(t.compassClosed);
        speak(t.compassClosed);
      } else if (has(t.compass_kw) && has(t.open)) {
        setCompassOn(true);
        setMapOn(false);
        setVoiceStatus(t.compassOpened);
        speak(t.compassOpened);
      } else if (has(t.map_kw) && has(t.close)) {
        setMapOn(false);
        setVoiceStatus(t.mapClosed);
        speak(t.mapClosed);
      } else if (has(t.map_kw) && has(t.open)) {
        setMapOn(true);
        setCompassOn(false);
        setVoiceStatus(t.mapOpened);
        speak(t.mapOpened);
      } else if (has(t.close)) {
        setGaugeOn(false);
        setVoiceStatus(t.gaugeClosed);
        speak(t.gaugeClosed);
      } else if (has(t.open)) {
        setGaugeOn(true);
        setVoiceStatus(t.gaugeOpened);
        speak(t.gaugeOpened);
      } else if (has(t.weather_kw)) {
        getWeather();
      } else if (has(t.max_kw)) {
        const v = Math.round(toDisplay(sessionMaxRef.current));
        const msg = t.maxIs(v, unitWord);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.avg_kw)) {
        const v = Math.round(toDisplay(sessionAvgRef.current));
        const msg = t.avgIs(v, unitWord);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.dist_kw)) {
        const v = toDisplay(sessionDistanceRef.current).toFixed(1);
        const distWord = UNIT_WORDS[language][speedUnit === "mph" ? "mi" : "km"];
        const msg = t.distIs(v, distWord);
        setVoiceStatus(msg);
        speak(msg);
      } else if (has(t.speed_kw)) {
        const raw = currentSpeedRef.current;
        const v = Math.round(toDisplay(raw));
        if (raw <= 1) {
          setVoiceStatus(t.stopped);
          speak(t.stopped);
        } else {
          const msg = t.speedIs(v, unitWord);
          setVoiceStatus(msg);
          speak(msg);
        }
      } else {
        setVoiceStatus(t.notUnderstood);
        speak(t.notUnderstood);
      }
    },
    [t, speak, resetSession, getWeather, getSunsetInfo, getMyLocation, getLastRide, triggerSOS, startNavigation, stopNavigation, announceCurrentDirection, playStation, stopRadio, radioIndex, toDisplay, unitWord, speedUnit, language]
  );

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    if (micBlocked || !micEnabled || radioOn) {
      // While the radio is playing, continuous listening fights the OS for
      // audio focus and cuts the broadcast — switch to push-to-talk instead
      // (see pushToTalk()), and don't auto-listen here.
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = LANG_LOCALE[language];

    recognition.onstart = () => setListening(true);
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setListening(false);
        setVoiceStatus(t.micNotSupported);
        setMicBlocked(true);
      }
      // Other errors (no-speech, aborted, network, audio-capture) are transient —
      // 'onend' fires right after and silently restarts the engine without
      // flickering the "Listening" indicator.
    };
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      processTranscript(last[0].transcript);
    };
    recognition.onend = () => {
      if (!isSpeakingRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (e) {
          setListening(false);
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {}

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  }, [language, processTranscript, t, micBlocked, micEnabled, radioOn]);

  // Push-to-talk: used instead of continuous listening while the radio plays
  const pushToTalk = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || micBlocked || !micEnabled || listening) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_LOCALE[language];
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      processTranscript(last[0].transcript);
    };
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setVoiceStatus(t.micNotSupported);
        setMicBlocked(true);
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {}
  }, [micBlocked, micEnabled, listening, language, processTranscript, t]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
        "--accent": accent.hex,
        "--on-accent": accent.on,
        "--bg": surface.bg,
        "--panel": surface.panel,
        "--border": surface.border,
        "--text": surface.text,
        "--dim": surface.dim,
        "--dim2": surface.dim2,
        "--tick": surface.tick,
      }}
    >
      <style>{`
        html, body { margin: 0; padding: 0; }
        .volt-layout {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5vw;
          box-sizing: border-box;
        }
        @media screen and (orientation: portrait) {
          .volt-layout {
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: 64px 20px 32px;
            gap: 18px;
            overflow-y: auto;
            text-align: center;
          }
          .volt-layout .portrait-spacer { display: none; }
          .volt-layout .portrait-left-align { align-items: center !important; }
        }
        .digit {
          font-family: 'Roboto Mono', 'SF Mono', ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
        }
        .icon-btn { transition: transform 0.08s ease; }
        .icon-btn:active { transform: scale(0.92); }

        .volt-splash {
          position: fixed; inset: 0; z-index: 100; background: var(--bg);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
        }
        .splash-exit { animation: splashOut 0.5s ease forwards; }
        @keyframes splashOut { to { opacity: 0; transform: scale(1.08); } }
        .splash-logo {
          display: flex; align-items: center; gap: 12px;
          animation: splashPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes splashPop {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
        .splash-bolt {
          width: 54px; height: 54px; border-radius: 14px; background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          animation: boltGlow 1.4s ease-in-out infinite;
        }
        @keyframes boltGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(215,255,61,0); }
          50% { box-shadow: 0 0 30px var(--accent); }
        }
        .splash-tagline {
          font-size: 12px; color: var(--dim); letter-spacing: 1.5px; opacity: 0;
          animation: fadeIn 0.5s 0.5s ease forwards;
        }
        @keyframes fadeIn { to { opacity: 1; } }

        .enter-left { animation: slideInLeft 0.5s ease both; }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .enter-center { animation: popCenter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; animation-delay: 0.05s; }
        @keyframes popCenter {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .enter-right { animation: slideInRight 0.5s ease both; animation-delay: 0.2s; }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .stat-item { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gauge-flash { animation: gaugeFlash 0.9s ease-out both; }
        @keyframes gaugeFlash {
          0% { stroke: #ffffff; filter: drop-shadow(0 0 24px rgba(255,255,255,0.9)); }
          55% { stroke: #ffffff; filter: drop-shadow(0 0 18px rgba(255,255,255,0.6)); }
          100% { stroke: var(--accent); filter: drop-shadow(0 0 0px rgba(255,255,255,0)); }
        }

        .settings-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center; z-index: 90; padding: 16px;
        }
        .settings-card {
          background: var(--panel); border: 1px solid var(--border); border-radius: 16px;
          padding: 20px; width: 100%; max-width: 460px; max-height: 85vh; overflow-y: auto;
        }
        .pill {
          padding: 7px 12px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg);
          color: var(--text); font-size: 12px; cursor: pointer;
        }
        .pill.active { background: var(--accent); color: var(--on-accent); border-color: transparent; font-weight: 700; }
        .swatch {
          width: 34px; height: 34px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;
        }
        .swatch.active { border-color: var(--text); }

        .road-alert {
          position: fixed;
          top: 14px;
          left: 50%;
          background: #FFD23B;
          color: #12140F;
          padding: 10px 20px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          z-index: 95;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          animation: alertIn 0.25s ease, alertPulse 0.6s ease-in-out 0.25s infinite alternate;
        }
        @keyframes alertIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes alertPulse {
          from { transform: translateX(-50%) scale(1); }
          to { transform: translateX(-50%) scale(1.04); }
        }
        .battery-alert {
          position: fixed;
          top: 14px;
          left: 50%;
          padding: 10px 20px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          z-index: 95;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
          animation: alertIn 0.25s ease;
        }
        .battery-alert.low { background: #FFA53B; color: #12140F; }
        .battery-alert.critical { background: #E3574B; color: #F5F5F0; }
      `}</style>

      {showSplash && (
        <div className={`volt-splash ${splashExiting ? "splash-exit" : ""}`}>
          <div className="splash-logo">
            <div className="splash-bolt">
              <Zap size={28} color="var(--on-accent)" strokeWidth={2.6} fill="var(--on-accent)" />
            </div>
            <span className="digit" style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4, color: "var(--text)" }}>
              VOLT
            </span>
          </div>
          <div className="splash-tagline">{t.tagline}</div>
        </div>
      )}

      {roadWarning && (
        <div className="road-alert">
          <AlertTriangle size={18} color="#12140F" />
          <span>{t.roadWarning}</span>
        </div>
      )}

      {batteryWarning && (
        <div className={`battery-alert ${batteryWarning}`}>
          <BatteryWarning size={18} color={batteryWarning === "critical" ? "#F5F5F0" : "#12140F"} />
          <span>{batteryWarning === "critical" ? t.batteryCriticalLabel : t.batteryLowLabel}</span>
        </div>
      )}

      {/* Settings gear, top-right */}
      <button
        className="icon-btn"
        onClick={() => setSettingsOpen(true)}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 20,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--panel)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label={t.settings}
      >
        <Settings size={17} color="var(--dim2)" />
      </button>

      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{t.settings}</span>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
                aria-label="Close"
              >
                <X size={18} color="var(--dim2)" />
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.language}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.keys(T).map((code) => (
                  <button
                    key={code}
                    className={`pill ${language === code ? "active" : ""}`}
                    onClick={() => setLanguage(code)}
                  >
                    {T[code].langName}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.unitLabel}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`pill ${speedUnit === "kmh" ? "active" : ""}`}
                  onClick={() => setSpeedUnit("kmh")}
                >
                  {t.unit}
                </button>
                <button
                  className={`pill ${speedUnit === "mph" ? "active" : ""}`}
                  onClick={() => setSpeedUnit("mph")}
                >
                  mph
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.sensitivityLabel}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { key: "off", label: t.off },
                  { key: "low", label: t.sensLow },
                  { key: "medium", label: t.sensMedium },
                  { key: "high", label: t.sensHigh },
                ].map((s) => (
                  <button
                    key={s.key}
                    className={`pill ${roadSensitivity === s.key ? "active" : ""}`}
                    onClick={() => setRoadSensitivity(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.voiceControlLabel}</div>
              <button
                className={`pill ${micEnabled ? "active" : ""}`}
                onClick={() => setMicEnabled((v) => !v)}
              >
                {micEnabled ? t.on : t.off}
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.sosLabel}</div>
              <input
                type="tel"
                value={emergencyNumber}
                onChange={(e) => setEmergencyNumber(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.fullscreenLabel}</div>
              <button
                className={`pill ${isFullscreen ? "active" : ""}`}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? t.on : t.off}
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.sound}</div>
              <button
                className={`pill ${soundEnabled ? "active" : ""}`}
                onClick={() => setSoundEnabled((v) => !v)}
              >
                {soundEnabled ? t.on : t.off}
              </button>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "var(--dim2)", marginBottom: 8, letterSpacing: 0.5 }}>{t.theme}</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { key: "red", label: t.colorRed },
                  { key: "blue", label: t.colorBlue },
                  { key: "green", label: t.colorGreen },
                  { key: "white", label: t.colorWhite },
                ].map((c) => (
                  <button
                    key={c.key}
                    className={`swatch ${themeColor === c.key ? "active" : ""}`}
                    style={{ background: THEMES[c.key].hex }}
                    onClick={() => setThemeColor(c.key)}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--dim2)", letterSpacing: 0.5 }}>{t.historyLabel}</span>
                {rideHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    style={{ background: "none", border: "none", color: "var(--dim)", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
                  >
                    {t.historyClear}
                  </button>
                )}
              </div>
              {rideHistory.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--dim)" }}>{t.historyEmpty}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "au
