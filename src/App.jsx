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
  Download
} from "lucide-react";

// --- 1. 7 Dilli Sözlük (i18n) ---
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
    findingLocation: "Hedef konum aranıyor...",
    noLocationFound: "Konum bulunamadı.",
    routeCreated: "Rota oluşturuldu, haritaya yönlendiriliyorsunuz.",
    settings: "AYARLAR",
    language: "DİL SEÇİMİ",
    theme: "TEMA",
    sensitivity: "SARSINTI HASSASİYETİ",
    close: "KAPAT",
    potholeWarning: "ÇUKUR/SARSINTI ALGILANDI",
    kmh: "km/s",
    km: "km",
    m: "m",
    radio: "RADYO",
    compass: "PUSULA",
    map: "HARİTA",
    hud: "GÖSTERGE",
    exportGpx: "GPX İNDİR",
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
    findingLocation: "Searching location...",
    noLocationFound: "Location not found.",
    routeCreated: "Route created, redirecting to map.",
    settings: "SETTINGS",
    language: "LANGUAGE",
    theme: "THEME",
    sensitivity: "SHAKE SENSITIVITY",
    close: "CLOSE",
    potholeWarning: "POTHOLE DETECTED",
    kmh: "km/h",
    km: "km",
    m: "m",
    radio: "RADIO",
    compass: "COMPASS",
    map: "MAP",
    hud: "HUD",
    exportGpx: "EXPORT GPX",
    headingN: "N", headingNE: "NE", headingE: "E", headingSE: "SE",
    headingS: "S", headingSW: "SW", headingW: "W", headingNW: "NW"
  },
  ru: {
    speed: "СКОРОСТЬ",
    maxSpeed: "МАКС. СКОРОСТЬ",
    avgSpeed: "СРЕД. СКОРОСТЬ",
    distance: "ДИСТАНЦИЯ",
    time: "ВРЕМЯ",
    pause: "ПАУЗА",
    resume: "ПРОДОЛЖИТЬ",
    reset: "СБРОС",
    altitude: "ВЫСОТА",
    grade: "УКЛОН",
    findingLocation: "Поиск локации...",
    noLocationFound: "Локация не найдена.",
    routeCreated: "Маршрут создан.",
    settings: "НАСТРОЙКИ",
    language: "ЯЗЫК",
    theme: "ТЕМА",
    sensitivity: "ЧУВСТВИТЕЛЬНОСТЬ",
    close: "ЗАКРЫТЬ",
    potholeWarning: "ОБНАРУЖЕНА ВЫБОИНА",
    kmh: "км/ч",
    km: "км",
    m: "м",
    radio: "РАДИО",
    compass: "КОМПАС",
    map: "КАРТА",
    hud: "СПИДОМЕТР",
    exportGpx: "СКАЧАТЬ GPX",
    headingN: "С", headingNE: "СВ", headingE: "В", headingSE: "ЮВ",
    headingS: "Ю", headingSW: "ЮЗ", headingW: "З", headingNW: "СЗ"
  },
  ko: {
    speed: "속도",
    maxSpeed: "최고 속도",
    avgSpeed: "평균 속도",
    distance: "거리",
    time: "시간",
    pause: "일시정지",
    resume: "재개",
    reset: "초기화",
    altitude: "고도",
    grade: "경사도",
    findingLocation: "위치 검색 중...",
    noLocationFound: "위치를 찾을 수 없습니다.",
    routeCreated: "경로가 생성되었습니다.",
    settings: "설정",
    language: "언어",
    theme: "테마",
    sensitivity: "충격 감도",
    close: "닫기",
    potholeWarning: "충격 감지됨",
    kmh: "km/h",
    km: "km",
    m: "m",
    radio: "라디오",
    compass: "나침반",
    map: "지도",
    hud: "계기판",
    exportGpx: "GPX 내보내기",
    headingN: "북", headingNE: "북동", headingE: "동", headingSE: "남동",
    headingS: "남", headingSW: "남서", headingW: "서", headingNW: "북서"
  },
  zh: {
    speed: "速度",
    maxSpeed: "最高速度",
    avgSpeed: "平均速度",
    distance: "距离",
    time: "时间",
    pause: "暂停",
    resume: "继续",
    reset: "重置",
    altitude: "海拔",
    grade: "坡度",
    findingLocation: "正在搜索位置...",
    noLocationFound: "未找到位置。",
    routeCreated: "路线已生成。",
    settings: "设置",
    language: "语言",
    theme: "主题",
    sensitivity: "震动敏感度",
    close: "关闭",
    potholeWarning: "检测到坑洼/震动",
    kmh: "km/h",
    km: "km",
    m: "m",
    radio: "收音机",
    compass: "指南针",
    map: "地图",
    hud: "仪表盘",
    exportGpx: "导出 GPX",
    headingN: "北", headingNE: "东北", headingE: "东", headingSE: "东南",
    headingS: "南", headingSW: "西南", headingW: "西", headingNW: "西北"
  },
  az: {
    speed: "SÜRƏT",
    maxSpeed: "MAKS SÜRƏT",
    avgSpeed: "ORT SÜRƏT",
    distance: "MƏSAFƏ",
    time: "MÜDDƏT",
    pause: "DAYANDIR",
    resume: "DAVAM ET",
    reset: "SIFIRLA",
    altitude: "HÜNDÜRLÜK",
    grade: "MEYİLLİLİK",
    findingLocation: "Məkan axtarılır...",
    noLocationFound: "Məkan tapılmadı.",
    routeCreated: "Marşrut yaradıldı.",
    settings: "TƏNZİMLƏMƏLƏR",
    language: "DİL SEÇİMİ",
    theme: "MÖVZU",
    sensitivity: "SƏS/TƏKAN HƏSSASLIĞI",
    close: "BAĞLA",
    potholeWarning: "ÇUXUR/TƏKAN AŞKARLANDI",
    kmh: "km/saat",
    km: "km",
    m: "m",
    radio: "RADİO",
    compass: "COMPASS",
    map: "XƏRİTƏ",
    hud: "GÖSTƏRİCİ",
    exportGpx: "GPX YÜKLƏ",
    headingN: "Şm", headingNE: "Şm-Şə", headingE: "Şə", headingSE: "C-Şə",
    headingS: "C", headingSW: "C-Qə", headingW: "Qə", headingNW: "Şm-Qə"
  },
  es: {
    speed: "VELOCIDAD",
    maxSpeed: "VEL. MÁXIMA",
    avgSpeed: "VEL. MEDIA",
    distance: "DISTANCIA",
    time: "TIEMPO",
    pause: "PAUSAR",
    resume: "REANUDAR",
    reset: "REINICIAR",
    altitude: "ALTITUD",
    grade: "PENDIENTE",
    findingLocation: "Buscando ubicación...",
    noLocationFound: "Ubicación no encontrada.",
    routeCreated: "Ruta creada.",
    settings: "AJUSTES",
    language: "IDIOMA",
    theme: "TEMA",
    sensitivity: "SENSIBILIDAD DE IMPACTO",
    close: "CERRAR",
    potholeWarning: "BACHE DETECTADO",
    kmh: "km/h",
    km: "km",
    m: "m",
    radio: "RADIO",
    compass: "BRÚJULA",
    map: "MAPA",
    hud: "VELOCÍMETRO",
    exportGpx: "EXPORTAR GPX",
    headingN: "N", headingNE: "NE", headingE: "E", headingSE: "SE",
    headingS: "S", headingSW: "SO", headingW: "O", headingNW: "NO"
  }
};

const LANGUAGES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "az", name: "Azərbaycan" },
  { code: "es", name: "Español" }
];

const RADIO_STATIONS = [
  { name: "Kral FM", url: "https://radyokralfm.rtp.org.tr/stream" },
  { name: "Power FM", url: "https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio" },
  { name: "TRT FM", url: "https://radio-trtfm.medya.trt.com.tr/stream" },
  { name: "Radyo D", url: "https://stream.radyod.com.tr/radyod.stream" }
];

const THEMES = {
  volt: { primary: "#CCFF00", bg: "#12140F", cardBg: "rgba(255,255,255,0.05)" },
  cyan: { primary: "#00E5FF", bg: "#0A1218", cardBg: "rgba(255,255,255,0.05)" },
  crimson: { primary: "#FF2A5F", bg: "#180A0D", cardBg: "rgba(255,255,255,0.05)" },
  orange: { primary: "#FF9100", bg: "#18110A", cardBg: "rgba(255,255,255,0.05)" }
};

export default function App() {
  const [lang, setLang] = useState("tr");
  const [themeKey, setThemeKey] = useState("volt");
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

  // Sensörler
  const [heading, setHeading] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [potholeAlert, setPotholeAlert] = useState(false);
  const [shakeSensitivity, setShakeSensitivity] = useState(18);

  // Sesli Asistan & Medya
  const [isListening, setIsListening] = useState(false);
  const [assistantMsg, setAssistantMsg] = useState("");
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const [currentRadioIndex, setCurrentRadioIndex] = useState(0);

  // Modal & Tam Ekran
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const t = T[lang] || T.tr;
  const theme = THEMES[themeKey];
  const prevCoordsRef = useRef({ lat: null, lon: null, alt: null });
  const audioRef = useRef(new Audio(RADIO_STATIONS[0].url));
  const recognitionRef = useRef(null);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voiceLangs = { tr: "tr-TR", en: "en-US", ru: "ru-RU", ko: "ko-KR", zh: "zh-CN", az: "az-AZ", es: "es-ES" };
      utterance.lang = voiceLangs[lang] || "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // GPS & Telemetri
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (isPaused) return;

        const { latitude, longitude, speed: gpsSpeed, altitude: gpsAltitude } = position.coords;
        const currentAlt = gpsAltitude ? Math.round(gpsAltitude) : 0;
        const currentSpeedKmh = gpsSpeed ? Math.round(gpsSpeed * 3.6) : 0;

        setUserCoords({ lat: latitude, lon: longitude });
        setSpeed(currentSpeedKmh);
        setMaxSpeed((prev) => Math.max(prev, currentSpeedKmh));
        setAltitude(currentAlt);

        setTrackPoints((prev) => [
          ...prev,
          { lat: latitude, lon: longitude, alt: currentAlt, time: new Date().toISOString() }
        ]);

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

          if (dDist > 2) {
            setDistance((prev) => prev + dDist / 1000);
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
  }, [isPaused]);

  // Sayaç
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Pusula Sensörü
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.webkitCompassHeading) setHeading(e.webkitCompassHeading);
      else if (e.alpha) setHeading(360 - e.alpha);
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  const getHeadingText = (deg) => {
    const directions = [t.headingN, t.headingNE, t.headingE, t.headingSE, t.headingS, t.headingSW, t.headingW, t.headingNW];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Akselerometre
  useEffect(() => {
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const totalAcc = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      if (totalAcc > shakeSensitivity) {
        setPotholeAlert(true);
        setTimeout(() => setPotholeAlert(false), 3000);
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [shakeSensitivity]);

  // Pil
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        setBatteryLevel(Math.round(b.level * 100));
        b.addEventListener("levelchange", () => setBatteryLevel(Math.round(b.level * 100)));
      });
    }
  }, []);

  const navigateToLocation = (target) => {
    if (!target) return;
    speakText(`${target} için yol tarifi hazırlanıyor.`);
    setDestinationQuery(target);
    setActiveTab("map");
  };

  const exportGPX = () => {
    if (trackPoints.length === 0) return;
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="VOLT"><trk><trkseg>`;
    trackPoints.forEach((pt) => {
      gpxContent += `<trkpt lat="${pt.lat}" lon="${pt.lon}"><ele>${pt.alt}</ele><time>${pt.time}</time></trkpt>`;
    });
    gpxContent += `</trkseg></trk></gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VOLT_Ride_${Date.now()}.gpx`;
    a.click();
  };

  // Sesli Asistan Kontrolcüsü
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === "tr" ? "tr-TR" : "en-US";
    recognition.onstart = () => { setIsListening(true); setAssistantMsg("Dinleniyor..."); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      setAssistantMsg(`"${transcript}"`);

      if (transcript.includes("beni") && transcript.includes("götür")) {
        let destination = transcript.replace(/.*beni\s+/, "").replace(/\s+götür.*/, "").trim();
        destination = destination.replace(/(e|a|ye|ya|ne|na)$/i, "");
        if (destination) {
          navigateToLocation(destination);
        }
      } 
      else if (transcript.includes("pusula") || transcript.includes("compass")) {
        setActiveTab("compass");
        speakText("Pusula açılıyor.");
      } else if (transcript.includes("radyo") || transcript.includes("radio")) {
        setActiveTab("radio");
        speakText("Radyo açılıyor.");
      } else if (transcript.includes("harita") || transcript.includes("map")) {
        setActiveTab("map");
        speakText("Harita açılıyor.");
      } else if (transcript.includes("gösterge") || transcript.includes("hud") || transcript.includes("hız")) {
        setActiveTab("hud");
        speakText("Gösterge paneli açılıyor.");
      } else if (transcript.includes("tamirci") || transcript.includes("bisiklet tamircisi")) {
        navigateToLocation("bisiklet tamircisi");
      } else if (transcript.includes("market") || transcript.includes("bakkal")) {
        navigateToLocation("market");
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
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

  return (
    <div style={{ backgroundColor: theme.bg, color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", userSelect: "none" }}>
      {/* Üst Bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={26} color={theme.primary} />
          <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "2px", color: theme.primary }}>V.O.L.T</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button onClick={exportGPX} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "6px 10px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", cursor: "pointer" }}>
            <Download size={14} color={theme.primary} /> GPX
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#aaa" }}>
            <BatteryWarning size={16} color={batteryLevel <= 15 ? "#FF2A5F" : theme.primary} />
            <span>%{batteryLevel}</span>
          </div>
          <button onClick={toggleFullScreen} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Ana İçerik */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px" }}>
        {potholeAlert && (
          <div style={{ backgroundColor: "#FF2A5F", color: "#fff", padding: "10px", borderRadius: "10px", textAlign: "center", fontWeight: "bold", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <AlertTriangle size={18} /> {t.potholeWarning}
          </div>
        )}

        {/* HUD Sekmesi */}
        {activeTab === "hud" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center", margin: "25px 0" }}>
              <span style={{ fontSize: "12px", color: "#888", letterSpacing: "3px", display: "block", marginBottom: "4px" }}>{t.speed}</span>
              <div style={{ fontSize: "110px", fontWeight: "900", lineHeight: "0.9", color: theme.primary, textShadow: `0 0 35px ${theme.primary}40` }}>
                {speed}
              </div>
              <div style={{ fontSize: "16px", color: "#aaa", letterSpacing: "2px", marginTop: "8px", fontWeight: "bold" }}>{t.kmh}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.maxSpeed}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{maxSpeed} <small style={{ fontSize: "10px" }}>{t.kmh}</small></span>
              </div>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.distance}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{distance.toFixed(2)} <small style={{ fontSize: "10px" }}>{t.km}</small></span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.altitude}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{altitude} <small style={{ fontSize: "10px" }}>{t.m}</small></span>
              </div>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.grade}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold", color: grade > 4 ? "#FF2A5F" : grade < -4 ? "#4CAF50" : "#fff" }}>
                  {grade > 0 ? `+${grade}` : grade}%
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", background: theme.cardBg, padding: "12px 16px", borderRadius: "14px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#888", display: "block" }}>{t.time}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{formatTime(elapsedTime)}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setIsPaused(!isPaused)} style={{ backgroundColor: theme.primary, color: "#000", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                  {isPaused ? t.resume : t.pause}
                </button>
                <button onClick={() => { setDistance(0); setElapsedTime(0); setMaxSpeed(0); setTrackPoints([]); }} style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>
                  {t.reset}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pusula Sekmesi */}
        {activeTab === "compass" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "200px", height: "200px", borderRadius: "50%", border: `4px solid ${theme.primary}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transform: `rotate(${-heading}deg)`, transition: "transform 0.2s ease-out" }}>
              <div style={{ position: "absolute", top: "10px", fontWeight: "bold", color: "#FF2A5F" }}>K</div>
              <div style={{ position: "absolute", bottom: "10px", fontWeight: "bold" }}>G</div>
              <div style={{ position: "absolute", left: "10px", fontWeight: "bold" }}>B</div>
              <div style={{ position: "absolute", right: "10px", fontWeight: "bold" }}>D</div>
              <CompassIcon size={70} color={theme.primary} />
            </div>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", fontWeight: "bold" }}>{Math.round(heading)}°</div>
              <div style={{ fontSize: "18px", color: theme.primary, fontWeight: "bold" }}>{getHeadingText(heading)}</div>
            </div>
          </div>
        )}

        {/* Harita / Google Navigasyon Sekmesi */}
        {activeTab === "map" && (
          <div style={{ flex: 1, width: "100%", height: "100%", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <iframe
              title="Google Maps Navigation"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
            <Radio size={56} color={theme.primary} />
            <h2 style={{ margin: 0 }}>{RADIO_STATIONS[currentRadioIndex].name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <button onClick={() => {
                let next = currentRadioIndex - 1 < 0 ? RADIO_STATIONS.length - 1 : currentRadioIndex - 1;
                setCurrentRadioIndex(next);
                audioRef.current.src = RADIO_STATIONS[next].url;
                if (isPlayingRadio) audioRef.current.play();
              }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <SkipBack size={28} />
              </button>
              <button onClick={() => {
                if (isPlayingRadio) { audioRef.current.pause(); setIsPlayingRadio(false); }
                else { audioRef.current.play(); setIsPlayingRadio(true); }
              }} style={{ backgroundColor: theme.primary, border: "none", borderRadius: "50%", padding: "16px", cursor: "pointer" }}>
                {isPlayingRadio ? <Pause size={28} color="#000" /> : <Play size={28} color="#000" />}
              </button>
              <button onClick={() => {
                let next = (currentRadioIndex + 1) % RADIO_STATIONS.length;
                setCurrentRadioIndex(next);
                audioRef.current.src = RADIO_STATIONS[next].url;
                if (isPlayingRadio) audioRef.current.play();
              }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <SkipForward size={28} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Ses Kontrol Barı (Tek Etkileşim Noktası) */}
      <div style={{ background: "rgba(0,0,0,0.5)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize: "12px", color: isListening ? theme.primary : "#888" }}>{isListening ? assistantMsg : "Sesli Komut Hazır"}</span>
        <button onClick={toggleListening} style={{ backgroundColor: isListening ? "#FF2A5F" : theme.primary, border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#000" />}
        </button>
      </div>

      {/* Ayarlar Modalı (7 Dil Seçeneği) */}
      {showSettings && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#181A15", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "360px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>{t.settings}</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "8px" }}>{t.language}</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setLang(item.code)}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: lang === item.code ? theme.primary : "rgba(255,255,255,0.05)",
                      color: lang === item.code ? "#000" : "#fff",
                      fontWeight: "bold",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>{t.theme}</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {Object.keys(THEMES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setThemeKey(key)}
                    style={{
                      flex: 1,
                      height: "32px",
                      borderRadius: "6px",
                      border: themeKey === key ? "2px solid #fff" : "none",
                      backgroundColor: THEMES[key].primary,
                      cursor: "pointer"
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>
                {t.sensitivity}: {shakeSensitivity} m/s²
              </label>
              <input
                type="range"
                min="12"
                max="30"
                value={shakeSensitivity}
                onChange={(e) => setShakeSensitivity(Number(e.target.value))}
                style={{ width: "100%", accentColor: theme.primary }}
              />
            </div>

            <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: theme.primary, color: "#000", fontWeight: "bold", cursor: "pointer" }}>
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
