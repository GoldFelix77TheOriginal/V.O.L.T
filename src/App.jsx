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
  Gauge,
  Compass as CompassIcon,
  MapPin,
  Radio,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  History,
  Trash2,
  Maximize2,
  Minimize2,
  Wrench,
  ShoppingBag,
  Download,
  Navigation
} from "lucide-react";

// --- 1. Dil Sözlüğü (i18n) ---
const T = {
  tr: {
    speed: "HIZ",
    maxSpeed: "MAKS",
    avgSpeed: "ORT",
    distance: "MESAFE",
    time: "SÜRE",
    pause: "DURAKLAT",
    resume: "DEVAM ET",
    reset: "SIFIRLA",
    altitude: "RAKIM",
    grade: "EĞİM",
    findingBicycleShop: "En yakın bisiklet tamircisi aranıyor...",
    findingMarket: "En yakın market aranıyor...",
    noBicycleShopFound: "Yakında bisiklet tamircisi bulunamadı.",
    noMarketFound: "Yakında market bulunamadı.",
    shopFound: "Nokta bulundu, rota çiziliyor.",
    settings: "AYARLAR",
    language: "DİL",
    theme: "TEMA",
    sensitivity: "SARSINTI HASSASİYETİ",
    clearHistory: "GEÇMİŞİ TEMİZLE",
    close: "KAPAT",
    potholeWarning: "ÇUKUR/SARSINTI ALGILANDI",
    kmh: "km/s",
    km: "km",
    m: "m",
    radio: "RADYO",
    voiceAssistant: "SESLİ ASİSTAN",
    map: "HARİTA",
    compass: "PUSULA",
    hud: "GÖSTERGE",
    exportGpx: "GPX İNDİR",
    headingN: "K",
    headingNE: "KB",
    headingE: "D",
    headingSE: "GD",
    headingS: "G",
    headingSW: "GB",
    headingW: "B",
    headingNW: "KD"
  },
  en: {
    speed: "SPEED",
    maxSpeed: "MAX",
    avgSpeed: "AVG",
    distance: "DISTANCE",
    time: "TIME",
    pause: "PAUSE",
    resume: "RESUME",
    reset: "RESET",
    altitude: "ALTITUDE",
    grade: "GRADE",
    findingBicycleShop: "Searching for nearest bicycle shop...",
    findingMarket: "Searching for nearest market...",
    noBicycleShopFound: "No bicycle shop found nearby.",
    noMarketFound: "No market found nearby.",
    shopFound: "Found, mapping route.",
    settings: "SETTINGS",
    language: "LANGUAGE",
    theme: "THEME",
    sensitivity: "SHAKE SENSITIVITY",
    clearHistory: "CLEAR HISTORY",
    close: "CLOSE",
    potholeWarning: "POTHOLE DETECTED",
    kmh: "km/h",
    km: "km",
    m: "m",
    radio: "RADIO",
    voiceAssistant: "VOICE ASSISTANT",
    map: "MAP",
    compass: "COMPASS",
    hud: "HUD",
    exportGpx: "EXPORT GPX",
    headingN: "N",
    headingNE: "NE",
    headingE: "E",
    headingSE: "SE",
    headingS: "S",
    headingSW: "SW",
    headingW: "W",
    headingNW: "NW"
  }
};

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

  // Konum & Rota Kaydı (GPX İçi)
  const [userCoords, setUserCoords] = useState(null);
  const [trackPoints, setTrackPoints] = useState([]); // [{lat, lon, alt, time}]
  const [targetPOI, setTargetPOI] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

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

  const t = T[lang];
  const theme = THEMES[themeKey];
  const prevCoordsRef = useRef({ lat: null, lon: null, alt: null });
  const audioRef = useRef(new Audio(RADIO_STATIONS[0].url));
  const recognitionRef = useRef(null);

  // --- TTS ---
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "tr" ? "tr-TR" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- GPS, Hız, Mesafe, Rakım, Eğim & İz Kaydı ---
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

        // GPX İzi İçin Nokta Ekle
        setTrackPoints((prev) => [
          ...prev,
          { lat: latitude, lon: longitude, alt: currentAlt, time: new Date().toISOString() }
        ]);

        // Mesafe ve Eğim Hesabı
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

  // --- Süre Sayacı ---
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // --- Pusula ---
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.webkitCompassHeading) {
        setHeading(e.webkitCompassHeading);
      } else if (e.alpha) {
        setHeading(360 - e.alpha);
      }
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  // Yön Metni (K, B, D, G)
  const getHeadingText = (deg) => {
    const directions = [t.headingN, t.headingNE, t.headingE, t.headingSE, t.headingS, t.headingSW, t.headingW, t.headingNW];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // --- Akselerometre (Sarsıntı) ---
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

  // --- Pil Takibi ---
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        setBatteryLevel(Math.round(b.level * 100));
        b.addEventListener("levelchange", () => setBatteryLevel(Math.round(b.level * 100)));
      });
    }
  }, []);

  // --- POI & Rota Arama ---
  const searchNearbyPOI = async (type) => {
    if (!userCoords) {
      speakText(lang === "tr" ? "GPS konumu bekleniyor." : "Waiting for GPS location.");
      return;
    }

    const isBike = type === "bike";
    speakText(isBike ? t.findingBicycleShop : t.findingMarket);

    try {
      const query = isBike ? "bisiklet" : "market";
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&lat=${userCoords.lat}&lon=${userCoords.lon}&bounded=1&viewbox=${userCoords.lon - 0.05},${userCoords.lat + 0.05},${userCoords.lon + 0.05},${userCoords.lat - 0.05}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const dest = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
        setTargetPOI(dest);
        speakText(t.shopFound);
        calculateRoute(userCoords, dest);
      } else {
        speakText(isBike ? t.noBicycleShopFound : t.noMarketFound);
      }
    } catch (err) {
      console.error("POI arama hatası:", err);
    }
  };

  const calculateRoute = async (start, end) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/biking/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60)
        });
        setActiveTab("map");
      }
    } catch (err) {
      console.error("OSRM Rota hatası:", err);
    }
  };

  // --- GPX Dosyası Dışa Aktarma ---
  const exportGPX = () => {
    if (trackPoints.length === 0) {
      alert("Henüz kaydedilmiş bir sürüş izi yok.");
      return;
    }

    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VOLT Bike Computer">
  <trk>
    <name>Sürüş Kaydı - ${new Date().toLocaleDateString()}</name>
    <trkseg>`;

    trackPoints.forEach((pt) => {
      gpxContent += `
      <trkpt lat="${pt.lat}" lon="${pt.lon}">
        <ele>${pt.alt}</ele>
        <time>${pt.time}</time>
      </trkpt>`;
    });

    gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VOLT_Surus_${Date.now()}.gpx`;
    a.click();
  };

  // --- Sesli Asistan ---
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanıma özelliğini desteklemiyor.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === "tr" ? "tr-TR" : "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setAssistantMsg("Dinleniyor...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setAssistantMsg(`"${transcript}"`);
      processVoiceCommand(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const processVoiceCommand = (cmd) => {
    if (cmd.includes("tamirci") || cmd.includes("bisiklet")) {
      searchNearbyPOI("bike");
    } else if (cmd.includes("market") || cmd.includes("bakkal")) {
      searchNearbyPOI("market");
    } else if (cmd.includes("radyo aç")) {
      playRadio();
    } else if (cmd.includes("radyo kapat")) {
      pauseRadio();
    } else if (cmd.includes("harita")) {
      setActiveTab("map");
    } else if (cmd.includes("pusula")) {
      setActiveTab("compass");
    } else if (cmd.includes("gösterge")) {
      setActiveTab("hud");
    } else if (cmd.includes("duraklat")) {
      setIsPaused(true);
    } else if (cmd.includes("devam et")) {
      setIsPaused(false);
    } else {
      speakText(lang === "tr" ? "Anlaşılamadı." : "Not understood.");
    }
  };

  // --- Radyo Kontrolleri ---
  const playRadio = () => {
    audioRef.current.play();
    setIsPlayingRadio(true);
  };

  const pauseRadio = () => {
    audioRef.current.pause();
    setIsPlayingRadio(false);
  };

  const changeRadioStation = (dir) => {
    let nextIdx = currentRadioIndex + dir;
    if (nextIdx < 0) nextIdx = RADIO_STATIONS.length - 1;
    if (nextIdx >= RADIO_STATIONS.length) nextIdx = 0;
    setCurrentRadioIndex(nextIdx);
    audioRef.current.src = RADIO_STATIONS[nextIdx].url;
    if (isPlayingRadio) audioRef.current.play();
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
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.bg,
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none"
      }}
    >
      {/* Üst Bar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={26} color={theme.primary} />
          <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "2px", color: theme.primary }}>
            V.O.L.T
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={exportGPX}
            title={t.exportGpx}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
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
          <div
            style={{
              backgroundColor: "#FF2A5F",
              color: "#fff",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <AlertTriangle size={18} /> {t.potholeWarning}
          </div>
        )}

        {/* HUD Sekmesi */}
        {activeTab === "hud" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center", margin: "15px 0" }}>
              <div
                style={{
                  fontSize: "90px",
                  fontWeight: "900",
                  lineHeight: "1",
                  color: theme.primary,
                  textShadow: `0 0 25px ${theme.primary}30`
                }}
              >
                {speed}
              </div>
              <div style={{ fontSize: "14px", color: "#888", letterSpacing: "2px", marginTop: "4px" }}>{t.kmh}</div>
            </div>

            {/* Temel Metrikler */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.maxSpeed}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {maxSpeed} <small style={{ fontSize: "10px" }}>{t.kmh}</small>
                </span>
              </div>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.distance}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {distance.toFixed(2)} <small style={{ fontSize: "10px" }}>{t.km}</small>
                </span>
              </div>
            </div>

            {/* Rakım & Eğim Metrikleri */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.altitude}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {altitude} <small style={{ fontSize: "10px" }}>{t.m}</small>
                </span>
              </div>
              <div style={{ background: theme.cardBg, padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#888", display: "block" }}>{t.grade}</span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: grade > 4 ? "#FF2A5F" : grade < -4 ? "#4CAF50" : "#fff"
                  }}
                >
                  {grade > 0 ? `+${grade}` : grade}%
                </span>
              </div>
            </div>

            {/* POI Kısayolları */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                onClick={() => searchNearbyPOI("bike")}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                <Wrench size={16} color={theme.primary} /> Tamirci
              </button>
              <button
                onClick={() => searchNearbyPOI("market")}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                <ShoppingBag size={16} color={theme.primary} /> Market
              </button>
            </div>

            {/* Sayaç Barı */}
            <div
              style={{
                display: "flex",
                justify: "space-between",
                alignItems: "center",
                marginTop: "15px",
                background: theme.cardBg,
                padding: "12px 16px",
                borderRadius: "14px"
              }}
            >
              <div>
                <span style={{ fontSize: "10px", color: "#888", display: "block" }}>{t.time}</span>
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>{formatTime(elapsedTime)}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  style={{
                    backgroundColor: theme.primary,
                    color: "#000",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {isPaused ? t.resume : t.pause}
                </button>
                <button
                  onClick={() => {
                    setDistance(0);
                    setElapsedTime(0);
                    setMaxSpeed(0);
                    setTrackPoints([]);
                  }}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  {t.reset}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pusula Sekmesi */}
        {activeTab === "compass" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: `4px solid ${theme.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transform: `rotate(${-heading}deg)`,
                transition: "transform 0.2s ease-out"
              }}
            >
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

        {/* Harita Sekmesi */}
        {activeTab === "map" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Navigation size={48} color={theme.primary} style={{ marginBottom: "15px" }} />
            {userCoords ? (
              <div style={{ background: theme.cardBg, padding: "16px", borderRadius: "14px", width: "100%", maxWidth: "320px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#aaa" }}>Mevcut Koordinatlar</p>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {userCoords.lat.toFixed(5)}, {userCoords.lon.toFixed(5)}
                </div>
                {routeInfo && (
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p style={{ margin: 0, color: theme.primary, fontWeight: "bold" }}>Hedef Rota Bilgisi</p>
                    <p style={{ margin: "4px 0 0", fontSize: "14px" }}>Mesafe: {routeInfo.distance} km</p>
                    <p style={{ margin: "2px 0 0", fontSize: "14px" }}>Süre: ~{routeInfo.duration} dk</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "#888" }}>GPS Konumu Yükleniyor...</p>
            )}
          </div>
        )}

        {/* Radyo Sekmesi */}
        {activeTab === "radio" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
            <Radio size={56} color={theme.primary} />
            <h2 style={{ margin: 0 }}>{RADIO_STATIONS[currentRadioIndex].name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <button onClick={() => changeRadioStation(-1)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <SkipBack size={28} />
              </button>
              <button
                onClick={isPlayingRadio ? pauseRadio : playRadio}
                style={{ backgroundColor: theme.primary, border: "none", borderRadius: "50%", padding: "16px", cursor: "pointer" }}
              >
                {isPlayingRadio ? <Pause size={28} color="#000" /> : <Play size={28} color="#000" />}
              </button>
              <button onClick={() => changeRadioStation(1)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <SkipForward size={28} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sesli Asistan Kontrol Barı */}
      <div
        style={{
          background: "rgba(0,0,0,0.5)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <span style={{ fontSize: "12px", color: isListening ? theme.primary : "#888" }}>
          {isListening ? assistantMsg : "Sesli Komut Dinleme Hazır"}
        </span>
        <button
          onClick={toggleListening}
          style={{
            backgroundColor: isListening ? "#FF2A5F" : theme.primary,
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          {isListening ? <MicOff size={18} color="#fff" /> : <Mic size={18} color="#000" />}
        </button>
      </div>

      {/* Alt Navigasyon Barı */}
      <nav
        style={{
          display: "flex",
          justify: "space-around",
          padding: "10px 0",
          backgroundColor: "#0A0B08",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <button
          onClick={() => setActiveTab("hud")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "hud" ? theme.primary : "#666",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer"
          }}
        >
          <Gauge size={18} />
          <span style={{ fontSize: "10px" }}>{t.hud}</span>
        </button>
        <button
          onClick={() => setActiveTab("compass")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "compass" ? theme.primary : "#666",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer"
          }}
        >
          <CompassIcon size={18} />
          <span style={{ fontSize: "10px" }}>{t.compass}</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "map" ? theme.primary : "#666",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer"
          }}
        >
          <MapPin size={18} />
          <span style={{ fontSize: "10px" }}>{t.map}</span>
        </button>
        <button
          onClick={() => setActiveTab("radio")}
          style={{
            background: "none",
            border: "none",
            color: activeTab === "radio" ? theme.primary : "#666",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            cursor: "pointer"
          }}
        >
          <Radio size={18} />
          <span style={{ fontSize: "10px" }}>{t.radio}</span>
        </button>
      </nav>

      {/* Ayarlar Modalı */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#181A15",
              borderRadius: "16px",
              padding: "20px",
              width: "100%",
              maxWidth: "340px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>{t.settings}</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px" }}>{t.language}</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setLang("tr")}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: lang === "tr" ? theme.primary : "rgba(255,255,255,0.05)",
                    color: lang === "tr" ? "#000" : "#fff",
                    fontWeight: "bold"
                  }}
                >
                  Türkçe
                </button>
                <button
                  onClick={() => setLang("en")}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: lang === "en" ? theme.primary : "rgba(255,255,255,0.05)",
                    color: lang === "en" ? "#000" : "#fff",
                    fontWeight: "bold"
                  }}
                >
                  English
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
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

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: theme.primary,
                color: "#000",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
