import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Mic,
  MicOff,
  Settings,
  AlertTriangle,
  BatteryWarning,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Compass as CompassIcon,
  Radio,
  X,
  Maximize2,
  Minimize2,
  Download,
  Terminal,
  KeyRound,
  Wrench,
  ShoppingBag,
  PhoneCall,
  ShieldCheck,
  ShieldOff,
  Sliders
} from "lucide-react";

// --- 1. 6 Dilli Sözlük ve Varsayılan Acil Durum Numaraları ---
const EMERGENCY_NUMBERS = {
  tr: "112",
  en: "911",
  ru: "112",
  de: "112",
  zh: "120",
  ko: "119"
};

const T = {
  tr: {
    speed: "HIZ",
    maxSpeed: "MAKS HIZ",
    avgSpeed: "ORT HIZ",
    distance: "MESAFE",
    time: "SÜRE",
    pause: "DURAKLAT",
    resume: "DEVAM ET",
    reset: "SIFIRLA",
    altitude: "RAKIM",
    grade: "EĞİM",
    settings: "AYARLAR",
    language: "DİL SEÇİMİ",
    theme: "TEMA",
    unit: "HIZ BİRİMİ",
    sensitivity: "SARSINTI HASSASİYETİ",
    potholeDetection: "ÇUKUR ALGILAMA",
    emergencyNum: "ACİL DURUM NUMARASI",
    history: "GEÇMİŞ SÜRÜŞLER",
    clearHistory: "GEÇMİŞİ TEMİZLE",
    close: "KAPAT",
    potholeWarning: "ÇUKUR ALGILANDI!",
    lowBattery: "DÜŞÜK PİL UYARISI!",
    kmh: "km/s",
    mph: "mph",
    km: "km",
    mi: "mi",
    m: "m",
    radio: "RADYO",
    compass: "PUSULA",
    map: "HARİTA",
    hud: "GÖSTERGE",
    exportGpx: "GPX İNDİR",
    devOptions: "GELİŞTİRİCİ SEÇENEKLERİ",
    devHud: "Gösterge Panel",
    devCompass: "Pusula Modu",
    devMap: "Harita Modu",
    devRadio: "Radyo Modu",
    devRepair: "Tamirci Tarifi",
    devMarket: "Market Tarifi",
    voiceDevUnlocked: "Geliştirici seçenekleri açıldı.",
    voiceDevLocked: "Geliştirici seçenekleri kapatıldı.",
    voiceNav: "için yol tarifi hazırlanıyor.",
    voiceCompass: "Pusula modu açılıyor.",
    voiceRadio: "Radyo açılıyor.",
    voiceMap: "Harita modu açılıyor.",
    voiceHud: "Gösterge paneli açılıyor.",
    voiceReset: "Sürüş verileri sıfırlandı.",
    headingN: "K", headingNE: "KD", headingE: "D", headingSE: "GD",
    headingS: "G", headingSW: "GB", headingW: "B", headingNW: "KB"
  },
  en: {
    speed: "SPEED",
    maxSpeed: "MAX SPEED",
    avgSpeed: "AVG SPEED",
    distance: "DISTANCE",
    time: "TIME",
    pause: "PAUSE",
    resume: "RESUME",
    reset: "RESET",
    altitude: "ALTITUDE",
    grade: "GRADE",
    settings: "SETTINGS",
    language: "LANGUAGE",
    theme: "THEME",
    unit: "SPEED UNIT",
    sensitivity: "SHAKE SENSITIVITY",
    potholeDetection: "POTHOLE DETECTION",
    emergencyNum: "EMERGENCY NUMBER",
    history: "RIDE HISTORY",
    clearHistory: "CLEAR HISTORY",
    close: "CLOSE",
    potholeWarning: "POTHOLE DETECTED!",
    lowBattery: "LOW BATTERY WARNING!",
    kmh: "km/h",
    mph: "mph",
    km: "km",
    mi: "mi",
    m: "m",
    radio: "RADIO",
    compass: "COMPASS",
    map: "MAP",
    hud: "HUD",
    exportGpx: "EXPORT GPX",
    devOptions: "DEVELOPER OPTIONS",
    devHud: "HUD Panel",
    devCompass: "Compass Mode",
    devMap: "Map Mode",
    devRadio: "Radio Mode",
    devRepair: "Repair Route",
    devMarket: "Market Route",
    voiceDevUnlocked: "Developer options unlocked.",
    voiceDevLocked: "Developer options locked.",
    voiceNav: "Getting directions for",
    voiceCompass: "Opening compass mode.",
    voiceRadio: "Opening radio.",
    voiceMap: "Opening map mode.",
    voiceHud: "Opening dashboard.",
    voiceReset: "Ride data reset.",
    headingN: "N", headingNE: "NE", headingE: "E", headingSE: "SE",
    headingS: "S", headingSW: "SW", headingW: "W", headingNW: "NW"
  },
  ru: {
    speed: "СКОРОСТЬ", maxSpeed: "МАКС.", avgSpeed: "СРЕД.", distance: "ДИСТАНЦИЯ", time: "ВРЕМЯ", pause: "ПАУЗА", resume: "ПРОДОЛЖИТЬ", reset: "СБРОС", altitude: "ВЫСОТА", grade: "УКЛОН", settings: "НАСТРОЙКИ", language: "ЯЗЫК", theme: "ТЕМА", unit: "ЕД. СКОРОСТИ", sensitivity: "ЧУВСТВИТЕЛЬНОСТЬ", potholeDetection: "ДЕТЕКЦИЯ ВЫБОИН", emergencyNum: "АВАРИЙНЫЙ НОМЕР", history: "ИСТОРИЯ", clearHistory: "ОЧИСТИТЬ", close: "ЗАКРЫТЬ", potholeWarning: "ВЫБОИНА!", lowBattery: "НИЗКИЙ ЗАРЯД!", kmh: "км/ч", mph: "миль/ч", km: "км", mi: "миль", m: "м", radio: "РАДИО", compass: "КОМПАС", map: "КАРТА", hud: "СПИДОМЕТР", exportGpx: "GPX", devOptions: "ОПЦИИ РАЗРАБОТЧИКА", devHud: "Спидометр", devCompass: "Компас", devMap: "Карта", devRadio: "Радио", devRepair: "Ремонт", devMarket: "Магазин", voiceDevUnlocked: "Режим разработчика включен.", voiceDevLocked: "Режим разработчика выключен.", voiceNav: "Маршрут для", voiceCompass: "Открываю компас.", voiceRadio: "Включаю радио.", voiceMap: "Открываю карту.", voiceHud: "Открываю спидометр.", voiceReset: "Данные сброшены.", headingN: "С", headingNE: "СВ", headingE: "В", headingSE: "ЮВ", headingS: "Ю", headingSW: "ЮЗ", headingW: "З", headingNW: "СЗ"
  },
  de: {
    speed: "GESCHWINDIGKEIT", maxSpeed: "MAX", avgSpeed: "SCHNITT", distance: "STRECKE", time: "ZEIT", pause: "PAUSE", resume: "WEITER", reset: "RESET", altitude: "HÖHE", grade: "STEIGUNG", settings: "EINSTELLUNGEN", language: "SPRACHE", theme: "THEMA", unit: "EINHEIT", sensitivity: "EMPFINDLICHKEIT", potholeDetection: "SCHLAGLOCHERKENNUNG", emergencyNum: "NOTRUFNUMMER", history: "VERLAUF", clearHistory: "VERLAUF LÖSCHEN", close: "SCHLIESSEN", potholeWarning: "SCHLAGLOCH!", lowBattery: "AKKU FAST LEER!", kmh: "km/h", mph: "mph", km: "km", mi: "mi", m: "m", radio: "RADIO", compass: "KOMPASS", map: "KARTE", hud: "HUD", exportGpx: "GPX", devOptions: "ENTWICKLEROPTIONEN", devHud: "Tacho Panel", devCompass: "Kompass Modus", devMap: "Karten Modus", devRadio: "Radio Modus", devRepair: "Werkstatt Route", devMarket: "Markt Route", voiceDevUnlocked: "Entwickleroptionen freigeschaltet.", voiceDevLocked: "Entwickleroptionen gesperrt.", voiceNav: "Route wird berechnet für", voiceCompass: "Kompass wird geöffnet.", voiceRadio: "Radio wird geöffnet.", voiceMap: "Karte wird geöffnet.", voiceHud: "Tacho wird geöffnet.", voiceReset: "Fahrdaten zurückgesetzt.", headingN: "N", headingNE: "NO", headingE: "O", headingSE: "SO", headingS: "S", headingSW: "SW", headingW: "W", headingNW: "NW"
  },
  zh: {
    speed: "速度", maxSpeed: "最高速", avgSpeed: "均速", distance: "距离", time: "时间", pause: "暂停", resume: "继续", reset: "重置", altitude: "海拔", grade: "坡度", settings: "设置", language: "语言", theme: "主题", unit: "单位", sensitivity: "灵敏度", potholeDetection: "坑洼检测", emergencyNum: "紧急电话", history: "历史记录", clearHistory: "清除历史", close: "关闭", potholeWarning: "检测到坑洼!", lowBattery: "电量低!", kmh: "km/h", mph: "mph", km: "km", mi: "mi", m: "m", radio: "收音机", compass: "指南针", map: "地图", hud: "仪表盘", exportGpx: "GPX", devOptions: "开发者选项", devHud: "仪表盘模式", devCompass: "指南针模式", devMap: "地图模式", devRadio: "收音机模式", devRepair: "修车店路线", devMarket: "超市路线", voiceDevUnlocked: "开发者选项已解锁。", voiceDevLocked: "开发者选项已锁定。", voiceNav: "正在导航至", voiceCompass: "打开指南针。", voiceRadio: "打开收音机。", voiceMap: "打开地图。", voiceHud: "打开仪表盘。", voiceReset: "骑行数据已重置。", headingN: "北", headingNE: "东北", headingE: "东", headingSE: "东南", headingS: "南", headingSW: "西南", headingW: "西", headingNW: "西北"
  },
  ko: {
    speed: "속도", maxSpeed: "최고속도", avgSpeed: "평균속도", distance: "거리", time: "시간", pause: "일시정지", resume: "재개", reset: "초기화", altitude: "고도", grade: "경사도", settings: "설정", language: "언어", theme: "테마", unit: "단위", sensitivity: "감도", potholeDetection: "포트홀 감지", emergencyNum: "비상 연락처", history: "주행 기록", clearHistory: "기록 삭제", close: "닫기", potholeWarning: "충격 감지!", lowBattery: "배터리 부족!", kmh: "km/h", mph: "mph", km: "km", mi: "mi", m: "m", radio: "라디오", compass: "나침반", map: "지도", hud: "계기판", exportGpx: "GPX", devOptions: "개발자 옵션", devHud: "계기판 모드", devCompass: "나침반 모드", devMap: "지도 모드", devRadio: "라디오 모드", devRepair: "정비소 경로", devMarket: "마트 경로", voiceDevUnlocked: "개발자 옵션이 해제되었습니다.", voiceDevLocked: "개발자 옵션이 잠겼습니다.", voiceNav: "경로를 검색합니다:", voiceCompass: "나침반을 엽니다.", voiceRadio: "라디오를 켭니다.", voiceMap: "지도를 엽니다.", voiceHud: "계기판을 엽니다.", voiceReset: "주행 데이터가 초기화되었습니다.", headingN: "북", headingNE: "북동", headingE: "동", headingSE: "남동", headingS: "남", headingSW: "남서", headingW: "서", headingNW: "북서"
  }
};

const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" }
];

const RADIO_STATIONS_BY_LANG = {
  tr: [
    { name: "Kral FM", url: "https://radyokralfm.rtp.org.tr/stream" },
    { name: "Power FM", url: "https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio" },
    { name: "TRT FM", url: "https://radio-trtfm.medya.trt.com.tr/stream" },
    { name: "Radyo D", url: "https://stream.radyod.com.tr/radyod.stream" }
  ],
  en: [
    { name: "Capital FM UK", url: "https://stream-capital.musicradio.com/capitalmp3" },
    { name: "BBC Radio 1", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one" }
  ],
  ru: [
    { name: "Европа Плюс", url: "https://ep128.hostingradio.ru:8030/ep128" },
    { name: "Авторадио", url: "https://pub0202.101.ru:8443/stream/air/aac/64/100" }
  ],
  de: [
    { name: "1LIVE", url: "https://wdr-1live-live.icecast.wdr.de/wdr/1live/live/mp3/128/stream.mp3" }
  ],
  zh: [
    { name: "CNR Music Radio", url: "https://ngcdn001.cnr.cn/live/yyzs/index.m3u8" }
  ],
  ko: [
    { name: "KBS World Radio", url: "https://world-stream.kbs.co.kr/valive/world/world_32k.m3u8" }
  ]
};

const THEMES = {
  green: { primary: "#CCFF00", bg: "#12140F", cardBg: "rgba(255,255,255,0.05)", text: "#ffffff" },
  blue: { primary: "#00E5FF", bg: "#0A1218", cardBg: "rgba(255,255,255,0.05)", text: "#ffffff" },
  red: { primary: "#FF2A5F", bg: "#180A0D", cardBg: "rgba(255,255,255,0.05)", text: "#ffffff" },
  white: { primary: "#000000", bg: "#FFFFFF", cardBg: "rgba(0,0,0,0.05)", text: "#000000" }
};

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootTestSpeed, setBootTestSpeed] = useState(0);

  const [lang, setLang] = useState("tr");
  const [themeKey, setThemeKey] = useState("green");
  const [unit, setUnit] = useState("kmh");
  const [activeTab, setActiveTab] = useState("hud");

  // Telemetri
  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [altitude, setAltitude] = useState(0);
  const [grade, setGrade] = useState(0);

  // Konum
  const [userCoords, setUserCoords] = useState({ lat: 40.6549, lon: 29.2842 });
  const [destinationQuery, setDestinationQuery] = useState("");
  const [trackPoints, setTrackPoints] = useState([]);

  // Sensörler, Güvenlik & Çukur Hassasiyeti
  const [heading, setHeading] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [potholeAlert, setPotholeAlert] = useState(false);
  const [isPotholeEnabled, setIsPotholeEnabled] = useState(true);
  const [shakeSensitivity, setShakeSensitivity] = useState(18); // 10 hassas, 30 az hassas
  const [emergencyPhone, setEmergencyPhone] = useState(EMERGENCY_NUMBERS.tr);

  // Geliştirici Seçenekleri & Versiyona 5 Kere Tıklama
  const [devClicks, setDevClicks] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);

  // Sesli Asistan & Medya
  const [isListening, setIsListening] = useState(false);
  const [assistantMsg, setAssistantMsg] = useState("");
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [currentRadioIndex, setCurrentRadioIndex] = useState(0);

  // Modal & Tam Ekran
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const t = T[lang] || T.tr;
  const theme = THEMES[themeKey] || THEMES.green;
  const currentRadioList = RADIO_STATIONS_BY_LANG[lang] || RADIO_STATIONS_BY_LANG.tr;

  const prevCoordsRef = useRef({ lat: null, lon: null, alt: null });
  const audioRef = useRef(new Audio(currentRadioList[0].url));
  const recognitionRef = useRef(null);

  // Ses Motoru
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceLangs = { tr: "tr-TR", en: "en-US", ru: "ru-RU", de: "de-DE", zh: "zh-CN", ko: "ko-KR" };
      utterance.lang = voiceLangs[lang] || "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Açılış Animasyonu
  useEffect(() => {
    let speedVal = 0;
    let direction = 1;
    const interval = setInterval(() => {
      if (direction === 1) {
        speedVal += 4;
        if (speedVal >= 120) direction = -1;
      } else {
        speedVal -= 6;
        if (speedVal <= 0) {
          speedVal = 0;
          clearInterval(interval);
          setIsBooting(false);
        }
      }
      setBootTestSpeed(speedVal);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  // Dile Göre Radyo & Otomatik Acil Durum Numarası Güncelleme
  useEffect(() => {
    const newStations = RADIO_STATIONS_BY_LANG[lang] || RADIO_STATIONS_BY_LANG.tr;
    setCurrentRadioIndex(0);
    if (audioRef.current) {
      audioRef.current.src = newStations[0].url;
      if (isPlayingRadio) audioRef.current.play();
    }
    setEmergencyPhone(EMERGENCY_NUMBERS[lang] || "112");
  }, [lang]);

  // GPS & Telemetri
  useEffect(() => {
    if (!navigator.geolocation || isBooting) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed: gpsSpeed, altitude: gpsAltitude } = position.coords;
        const currentAlt = gpsAltitude ? Math.round(gpsAltitude) : 0;
        let currentSpeedKmh = gpsSpeed ? Math.round(gpsSpeed * 3.6) : 0;

        if (currentSpeedKmh < 1.5) {
          setIsPaused(true);
          currentSpeedKmh = 0;
        } else {
          setIsPaused(false);
        }

        const displaySpeed = unit === "mph" ? Math.round(currentSpeedKmh * 0.621371) : currentSpeedKmh;

        setUserCoords({ lat: latitude, lon: longitude });
        setSpeed(displaySpeed);
        setMaxSpeed((prev) => Math.max(prev, displaySpeed));
        setAltitude(currentAlt);

        if (!isPaused) {
          setTrackPoints((prev) => [
            ...prev,
            { lat: latitude, lon: longitude, alt: currentAlt, time: new Date().toISOString() }
          ]);
        }

        if (prevCoordsRef.current.lat !== null && prevCoordsRef.current.alt !== null) {
          const lat1 = prevCoordsRef.current.lat;
          const lon1 = prevCoordsRef.current.lon;
          const alt1 = prevCoordsRef.current.alt;

          const R = 6371000;
          const dLat = ((latitude - lat1) * Math.PI) / 180;
          const dLon = ((longitude - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((latitude * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dDist = R * c;

          if (dDist > 2 && !isPaused) {
            const addedDist = unit === "mph" ? (dDist / 1000) * 0.621371 : dDist / 1000;
            setDistance((prev) => prev + addedDist);

            const dAlt = currentAlt - alt1;
            const calculatedGrade = (dAlt / dDist) * 100;
            setGrade(Math.round(Math.max(-30, Math.min(30, calculatedGrade))));
            prevCoordsRef.current = { lat: latitude, lon: longitude, alt: currentAlt };
          }
        } else {
          prevCoordsRef.current = { lat: latitude, lon: longitude, alt: currentAlt };
        }
      },
      (err) => console.error("GPS Hatası:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isPaused, unit, isBooting]);

  // Sayaç
  useEffect(() => {
    let interval;
    if (!isPaused && !isBooting) {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isBooting]);

  // Sensörler & Çukur
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.webkitCompassHeading) setHeading(e.webkitCompassHeading);
      else if (e.alpha) setHeading(360 - e.alpha);
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  useEffect(() => {
    if (!isPotholeEnabled) return;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const totalAcc = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      if (totalAcc > shakeSensitivity) {
        setPotholeAlert(true);
        speakText(t.potholeWarning);
        setTimeout(() => setPotholeAlert(false), 3000);
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [shakeSensitivity, isPotholeEnabled, lang]);

  // Versiyon Metnine 5 Kere Tıklayınca Parola Modalını Açma
  const handleVersionClick = () => {
    const newClicks = devClicks + 1;
    setDevClicks(newClicks);
    if (newClicks >= 5) {
      setShowPasswordModal(true);
      setDevClicks(0);
    }
  };

  // Parola Doğrulama
  const handlePasswordSubmit = () => {
    if (inputPassword === "130782") {
      if (isDevUnlocked) {
        setIsDevUnlocked(false);
        speakText(t.voiceDevLocked);
      } else {
        setIsDevUnlocked(true);
        speakText(t.voiceDevUnlocked);
      }
      setShowPasswordModal(false);
      setInputPassword("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setInputPassword("");
    }
  };

  // Sesli Asistan
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (isPlayingRadio && audioRef.current) {
      audioRef.current.volume = 0.2;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    const voiceLangs = { tr: "tr-TR", en: "en-US", ru: "ru-RU", de: "de-DE", zh: "zh-CN", ko: "ko-KR" };
    recognition.lang = voiceLangs[lang] || "en-US";

    recognition.onstart = () => { setIsListening(true); setAssistantMsg("..."); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      setAssistantMsg(`"${transcript}"`);

      if (transcript.includes("tamirci") || transcript.includes("bisiklet tamircisi") || transcript.includes("repair") || transcript.includes("mechanic")) {
        setDestinationQuery("bisiklet tamircisi");
        setActiveTab("map");
        speakText(`${t.voiceNav} bisiklet tamircisi`);
      } else if (transcript.includes("market") || transcript.includes("bakkal") || transcript.includes("store") || transcript.includes("shop")) {
        setDestinationQuery("market");
        setActiveTab("map");
        speakText(`${t.voiceNav} market`);
      } else if (transcript.includes("beni") || transcript.includes("take me") || transcript.includes("führung")) {
        let destination = transcript.replace(/.*(beni|take me to|führung)\s+/, "").replace(/\s+(götür|to|führen).*/, "").trim();
        destination = destination.replace(/(e|a|ye|ya|ne|na)$/i, "");
        if (destination) {
          setDestinationQuery(destination);
          setActiveTab("map");
          speakText(`${destination} ${t.voiceNav}`);
        }
      } else if (transcript.includes("pusula") || transcript.includes("compass") || transcript.includes("компас")) {
        setActiveTab("compass");
        speakText(t.voiceCompass);
      } else if (transcript.includes("radyo") || transcript.includes("radio") || transcript.includes("радио")) {
        setActiveTab("radio");
        speakText(t.voiceRadio);
      } else if (transcript.includes("harita") || transcript.includes("map") || transcript.includes("карта")) {
        setActiveTab("map");
        speakText(t.voiceMap);
      } else if (transcript.includes("gösterge") || transcript.includes("hud") || transcript.includes("speed")) {
        setActiveTab("hud");
        speakText(t.voiceHud);
      } else if (transcript.includes("acil") || transcript.includes("emergency") || transcript.includes("sos")) {
        window.location.href = `tel:${emergencyPhone}`;
      } else if (transcript.includes("sıfırla") || transcript.includes("reset")) {
        setDistance(0); setElapsedTime(0); setMaxSpeed(0);
        speakText(t.voiceReset);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (isPlayingRadio && audioRef.current) audioRef.current.volume = 1.0;
    };
    recognition.start();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Kadran Açı Hesabı (0-180 km/h -> -120 deg ile +120 deg arası)
  const needleAngle = Math.min(Math.max((speed / 180) * 240 - 120, -120), 120);

  if (isBooting) {
    return (
      <div style={{ backgroundColor: "#000", color: "#CCFF00", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <Zap size={64} />
        <h1 style={{ fontSize: "36px", letterSpacing: "4px", margin: "10px 0" }}>V.O.L.T</h1>
        <p style={{ color: "#aaa", fontSize: "12px" }}>SELF TEST SYSTEM...</p>
        <div style={{ fontSize: "48px", fontWeight: "bold", marginTop: "20px" }}>{bootTestSpeed} <small style={{ fontSize: "14px" }}>KM/H</small></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, height: "100vh", width: "100vw", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", userSelect: "none", overflow: "hidden" }}>
      {/* Üst Bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${themeKey === "white" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={26} color={theme.primary} />
          <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "2px", color: theme.primary }}>V.O.L.T</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <a href={`tel:${emergencyPhone}`} style={{ color: "#FF2A5F", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}>
            <PhoneCall size={16} /> {emergencyPhone}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px" }}>
            <BatteryWarning size={16} color={batteryLevel <= 20 ? "#FF2A5F" : theme.primary} />
            <span>%{batteryLevel}</span>
          </div>
          <button onClick={toggleFullScreen} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer" }}>
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer" }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Ana Ekran */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        {potholeAlert && (
          <div style={{ backgroundColor: "#FF2A5F", color: "#fff", padding: "10px", textAlign: "center", fontWeight: "bold", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
            <AlertTriangle size={18} /> {t.potholeWarning}
          </div>
        )}

        {/* HUD Sekmesi - GERÇEK ARABA TARZI ANALOG İBRELİ KADRAN */}
        {activeTab === "hud" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px" }}>
            <div style={{ textAlign: "center", margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "240px", height: "240px", borderRadius: "50%", border: `8px solid ${theme.cardBg}`, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: `0 0 20px ${theme.primary}22` }}>
                
                {/* Kadran Çizgileri & Sayılar */}
                {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180].map((val) => {
                  const angle = (val / 180) * 240 - 120;
                  return (
                    <div
                      key={val}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        transform: `rotate(${angle}deg)`,
                        padding: "8px",
                        boxSizing: "border-box"
                      }}
                    >
                      <div style={{ width: "2px", height: "8px", backgroundColor: theme.primary, margin: "0 auto", borderRadius: "2px" }} />
                      <span style={{ display: "block", fontSize: "9px", fontWeight: "bold", transform: `rotate(${-angle}deg)`, textAlign: "center", marginTop: "2px", opacity: 0.8 }}>
                        {val}
                      </span>
                    </div>
                  );
                })}

                {/* Dönen Analog İbre (Car Needle) */}
                <div
                  style={{
                    position: "absolute",
                    width: "4px",
                    height: "90px",
                    bottom: "50%",
                    transformOrigin: "bottom center",
                    transform: `rotate(${needleAngle}deg)`,
                    transition: "transform 0.2s cubic-bezier(0.1, 0.7, 0.1, 1)"
                  }}
                >
                  <div style={{ width: "100%", height: "100%", backgroundColor: "#FF2A5F", borderRadius: "4px", boxShadow: "0 0 8px #FF2A5F" }} />
                </div>

                {/* Gösterge Göbeği & Dijital Hız Ekranı */}
                <div style={{ width: "90px", height: "90px", borderRadius: "50%", backgroundColor: theme.bg, border: `3px solid ${theme.primary}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 5, boxShadow: "0 0 10px rgba(0,0,0,0.8)" }}>
                  <div style={{ fontSize: "36px", fontWeight: "900", lineHeight: "1", color: theme.primary }}>{speed}</div>
                  <div style={{ fontSize: "10px", fontWeight: "bold", letterSpacing: "1px", opacity: 0.8, marginTop: "2px" }}>{unit === "kmh" ? t.kmh : t.mph}</div>
                </div>

              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, display: "block" }}>{t.maxSpeed}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{maxSpeed} <small style={{ fontSize: "10px" }}>{unit}</small></span>
              </div>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, display: "block" }}>{t.distance}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{distance.toFixed(2)} <small style={{ fontSize: "10px" }}>{unit === "kmh" ? t.km : t.mi}</small></span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, display: "block" }}>{t.altitude}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{altitude} <small style={{ fontSize: "10px" }}>{t.m}</small></span>
              </div>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", opacity: 0.7, display: "block" }}>{t.grade}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold", color: grade > 4 ? "#FF2A5F" : grade < -4 ? "#4CAF50" : theme.text }}>
                  {grade > 0 ? `+${grade}` : grade}%
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", background: theme.cardBg, padding: "12px 16px", borderRadius: "14px" }}>
              <div>
                <span style={{ fontSize: "10px", opacity: 0.7, display: "block" }}>{t.time}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{formatTime(elapsedTime)}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setIsPaused(!isPaused)} style={{ backgroundColor: theme.primary, color: "#000", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                  {isPaused ? t.resume : t.pause}
                </button>
                <button onClick={() => { setDistance(0); setElapsedTime(0); setMaxSpeed(0); }} style={{ backgroundColor: "rgba(255,255,255,0.1)", color: theme.text, border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>
                  {t.reset}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pusula Sekmesi */}
        {activeTab === "compass" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ width: "200px", height: "200px", borderRadius: "50%", border: `4px solid ${theme.primary}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transform: `rotate(${-heading}deg)`, transition: "transform 0.2s ease-out" }}>
              <div style={{ position: "absolute", top: "10px", fontWeight: "bold", color: "#FF2A5F" }}>K</div>
              <div style={{ position: "absolute", bottom: "10px", fontWeight: "bold" }}>G</div>
              <div style={{ position: "absolute", left: "10px", fontWeight: "bold" }}>B</div>
              <div style={{ position: "absolute", right: "10px", fontWeight: "bold" }}>D</div>
              <CompassIcon size={70} color={theme.primary} />
            </div>
            <div style={{ marginTop: "20px", fontSize: "32px", fontWeight: "bold" }}>{Math.round(heading)}°</div>
          </div>
        )}

        {/* Harita Sekmesi */}
        {activeTab === "map" && (
          <div style={{ width: "100%", height: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
            <iframe
              title="Google Maps Navigation"
              width="100%"
              height="100%"
              style={{ border: 0, width: "100%", height: "100%", flex: 1, filter: themeKey === "white" ? "none" : "invert(90%) hue-rotate(180deg)" }}
              loading="lazy"
              allowFullScreen
              src={
                destinationQuery
                  ? `https://maps.google.com/maps?saddr=${userCoords.lat},${userCoords.lon}&daddr=${encodeURIComponent(destinationQuery)}&output=embed`
                  : `https://maps.google.com/maps?q=${userCoords.lat},${userCoords.lon}&z=15&output=embed`
              }
            />
          </div>
        )}

        {/* Radyo Sekmesi */}
        {activeTab === "radio" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "16px" }}>
            <Radio size={56} color={theme.primary} />
            <h2 style={{ margin: 0 }}>{currentRadioList[currentRadioIndex]?.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <button onClick={() => {
                let next = currentRadioIndex - 1 < 0 ? currentRadioList.length - 1 : currentRadioIndex - 1;
                setCurrentRadioIndex(next);
                audioRef.current.src = currentRadioList[next].url;
                if (isPlayingRadio) audioRef.current.play();
              }} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer" }}>
                <SkipBack size={28} />
              </button>
              <button onClick={() => {
                if (isPlayingRadio) { audioRef.current.pause(); setIsPlayingRadio(false); }
                else { audioRef.current.play(); setIsPlayingRadio(true); }
              }} style={{ backgroundColor: theme.primary, border: "none", borderRadius: "50%", padding: "16px", cursor: "pointer" }}>
                {isPlayingRadio ? <Pause size={28} color="#000" /> : <Play size={28} color="#000" />}
              </button>
              <button onClick={() => {
                let next = (currentRadioIndex + 1) % currentRadioList.length;
                setCurrentRadioIndex(next);
                audioRef.current.src = currentRadioList[next].url;
                if (isPlayingRadio) audioRef.current.play();
              }} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer" }}>
                <SkipForward size={28} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Ses Kontrol Barı */}
      <div style={{ background: "rgba(0,0,0,0.5)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <span style={{ fontSize: "12px", color: isListening ? theme.primary : "#888" }}>{isListening ? assistantMsg : "Sesli Komut Hazır"}</span>
        <button onClick={toggleListening} style={{ backgroundColor: isListening ? "#FF2A5F" : theme.primary, border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#000" />}
        </button>
      </div>

      {/* Parola Modalı */}
      {showPasswordModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
          <div style={{ backgroundColor: "#181A15", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "320px", border: `1px solid ${theme.primary}`, textAlign: "center" }}>
            <KeyRound size={36} color={theme.primary} style={{ margin: "0 auto 10px" }} />
            <h4 style={{ margin: "0 0 10px", color: "#fff" }}>{isDevUnlocked ? "Geliştirici Modunu Kapat" : "Geliştirici Parolası"}</h4>
            <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 16px" }}>Lütfen 6 haneli erişim kodunu girin.</p>
            
            <input
              type="password"
              maxLength={6}
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="••••••"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: passwordError ? "1px solid #FF2A5F" : "1px solid #444", backgroundColor: "#0A0B08", color: "#fff", fontSize: "20px", textAlign: "center", letterSpacing: "8px", marginBottom: "12px" }}
            />

            {passwordError && <p style={{ color: "#FF2A5F", fontSize: "12px", margin: "0 0 12px" }}>Hatalı Parola!</p>}

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setShowPasswordModal(false); setInputPassword(""); setPasswordError(false); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer" }}>
                İptal
              </button>
              <button onClick={handlePasswordSubmit} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: theme.primary, color: "#000", fontWeight: "bold", cursor: "pointer" }}>
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ayarlar Modalı */}
      {showSettings && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: themeKey === "white" ? "#fff" : "#181A15", color: themeKey === "white" ? "#000" : "#fff", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "380px", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>{t.settings}</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: theme.text, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Dil Seçeneği */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", opacity: 0.7, display: "block", marginBottom: "6px" }}>{t.language}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                {LANGUAGES.map((item) => (
                  <button key={item.code} onClick={() => setLang(item.code)} style={{ padding: "6px", borderRadius: "6px", border: "none", backgroundColor: lang === item.code ? theme.primary : "rgba(255,255,255,0.1)", color: lang === item.code ? "#000" : theme.text, fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hız Birimi */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", opacity: 0.7, display: "block", marginBottom: "6px" }}>{t.unit}</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => setUnit("kmh")} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", backgroundColor: unit === "kmh" ? theme.primary : "rgba(255,255,255,0.1)", color: unit === "kmh" ? "#000" : theme.text, fontWeight: "bold" }}>KM/H</button>
                <button onClick={() => setUnit("mph")} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", backgroundColor: unit === "mph" ? theme.primary : "rgba(255,255,255,0.1)", color: unit === "mph" ? "#000" : theme.text, fontWeight: "bold" }}>MPH</button>
              </div>
            </div>

            {/* Çukur Algılama Aç/Kapat & Hassasiyet Slider'ı */}
            <div style={{ marginBottom: "14px", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isPotholeEnabled ? "10px" : "0" }}>
                <label style={{ fontSize: "11px", opacity: 0.7 }}>{t.potholeDetection}</label>
                <button
                  onClick={() => setIsPotholeEnabled(!isPotholeEnabled)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: isPotholeEnabled ? theme.primary : "rgba(255,255,255,0.1)",
                    color: isPotholeEnabled ? "#000" : theme.text,
                    fontWeight: "bold",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {isPotholeEnabled ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                  {isPotholeEnabled ? "AÇIK" : "KAPALI"}
                </button>
              </div>

              {isPotholeEnabled && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", opacity: 0.7, marginBottom: "4px" }}>
                    <span>{t.sensitivity}</span>
                    <span>{shakeSensitivity} (10 = Hassas, 30 = Sert)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="1"
                    value={shakeSensitivity}
                    onChange={(e) => setShakeSensitivity(Number(e.target.value))}
                    style={{ width: "100%", accentColor: theme.primary, cursor: "pointer" }}
                  />
                </div>
              )}
            </div>

            {/* Acil Durum Numarası Girişi */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", opacity: 0.7, display: "block", marginBottom: "6px" }}>{t.emergencyNum}</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  color: theme.text,
                  fontWeight: "bold",
                  fontSize: "12px"
                }}
              />
            </div>

            {/* Tema Seçimi */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", opacity: 0.7, display: "block", marginBottom: "6px" }}>{t.theme}</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {Object.keys(THEMES).map((key) => (
                  <button key={key} onClick={() => setThemeKey(key)} style={{ flex: 1, height: "30px", borderRadius: "6px", border: themeKey === key ? "2px solid #000" : "1px solid #666", backgroundColor: THEMES[key].primary, cursor: "pointer" }} />
                ))}
              </div>
            </div>

            {/* Çok Dilli Geliştirici Seçenekleri Panel Alanı */}
            {isDevUnlocked && (
              <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: `1px solid ${theme.primary}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "bold", color: theme.primary, marginBottom: "8px" }}>
                  <Terminal size={14} /> {t.devOptions}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <button onClick={() => { setActiveTab("hud"); setShowSettings(false); }} style={{ padding: "6px", fontSize: "11px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.1)", color: theme.text, cursor: "pointer" }}>{t.devHud}</button>
                  <button onClick={() => { setActiveTab("compass"); setShowSettings(false); }} style={{ padding: "6px", fontSize: "11px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.1)", color: theme.text, cursor: "pointer" }}>{t.devCompass}</button>
                  <button onClick={() => { setActiveTab("map"); setShowSettings(false); }} style={{ padding: "6px", fontSize: "11px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.1)", color: theme.text, cursor: "pointer" }}>{t.devMap}</button>
                  <button onClick={() => { setActiveTab("radio"); setShowSettings(false); }} style={{ padding: "6px", fontSize: "11px", borderRadius: "6px", border: "none", background: "rgba(255,255,255,0.1)", color: theme.text, cursor: "pointer" }}>{t.devRadio}</button>

                  <button onClick={() => { setDestinationQuery("bisiklet tamircisi"); setActiveTab("map"); setShowSettings(false); speakText(`${t.voiceNav} bisiklet tamircisi`); }} style={{ padding: "6px", fontSize: "11px", borderRadius: "6px", border: "none", background: "rgba(204,255,0,0.2)", color: theme.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <Wrench size={12} /> {t.devRepair}
                  </button>
                  <button onClick={() => { setDestinationQuery("market"); setActiveTab("map"); setShowSettings(false); speakText(`${t.voiceNav} market`); }} style={{ padding: "6px", fontSize: "11px", borderRadius: "6px", border: "none", background: "rgba(204,255,0,0.2)", color: theme.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <ShoppingBag size={12} /> {t.devMarket}
                  </button>
                </div>
              </div>
            )}

            <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: theme.primary, color: "#000", fontWeight: "bold", cursor: "pointer" }}>
              {t.close}
            </button>

            {/* Versiyon Bilgisi */}
            <div onClick={handleVersionClick} style={{ textAlign: "center", marginTop: "16px", opacity: 0.4, fontSize: "10px", letterSpacing: "1px", cursor: "pointer", userSelect: "none" }}>
              v0304.2 - VOLT System {isDevUnlocked && "(DEV ACTIVE)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
