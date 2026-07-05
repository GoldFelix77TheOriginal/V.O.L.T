import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Gauge, Mic, MicOff, Settings, X } from "lucide-react";

const LANG_LOCALE = {
  tr: "tr-TR",
  en: "en-US",
  ru: "ru-RU",
  de: "de-DE",
  zh: "zh-CN",
  ko: "ko-KR",
};

const THEMES = {
  green: { hex: "#D7FF3D", on: "#12140F" },
  red: { hex: "#FF5A5A", on: "#12140F" },
  blue: { hex: "#5AC8FA", on: "#12140F" },
  white: { hex: "#F5F5F0", on: "#12140F" },
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
    listening: "Dinliyor", speaking: "Konuşuyor…",
    hint: '"Hey Volt" de, sonra istediğini sor',
    notUnderstood: "Seni duydum ama anlayamadım.",
    greeting: "Merhaba, ben Volt, akıllı sürüş asistanınızım. Size nasıl yardımcı olabilirim?",
    micNotSupported: "Bu tarayıcı ses tanımayı desteklemiyor",
    speedIs: (v) => `Şu anda saatte ${v} kilometre hızla gidiyorsun.`,
    stopped: "Şu anda durmuş durumdasın.",
    maxIs: (v) => `En yüksek hızın saatte ${v} kilometre.`,
    avgIs: (v) => `Ortalama hızın saatte ${v} kilometre.`,
    distIs: (v) => `Şu ana kadar ${v} kilometre yol gittin.`,
    gaugeOpened: "Hız göstergesini açıyorum.",
    gaugeClosed: "Hız göstergesini kapatıyorum.",
    sessionReset: "Oturumu sıfırladım.",
    wake: ["hey volt", "volt", "vılt", "hey wolt"],
    open: ["aç", "ac"],
    close: ["kapat"],
    reset: ["sıfırla", "sifirla"],
    max_kw: ["en yüksek", "en yuksek", "maksimum", "max"],
    avg_kw: ["ortalama"],
    dist_kw: ["mesafe", "yol gittim", "kilometre gittim", "kaç km", "kac km"],
    speed_kw: ["hız", "hiz"],
    query_kw: ["kaç", "kac", "ne kadar", "nedir"],
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
    listening: "Listening", speaking: "Speaking…",
    hint: 'Say "Hey Volt" then ask anything',
    notUnderstood: "I heard you but didn't understand.",
    greeting: "Hi, I'm Volt, your smart ride assistant. How can I help?",
    micNotSupported: "This browser doesn't support speech recognition",
    speedIs: (v) => `You're currently going ${v} kilometers per hour.`,
    stopped: "You're currently stopped.",
    maxIs: (v) => `Your top speed is ${v} kilometers per hour.`,
    avgIs: (v) => `Your average speed is ${v} kilometers per hour.`,
    distIs: (v) => `You've covered ${v} kilometers so far.`,
    gaugeOpened: "Turning the speed gauge on.",
    gaugeClosed: "Turning the speed gauge off.",
    sessionReset: "Session reset.",
    wake: ["hey volt", "volt"],
    open: ["turn on", "open", "show"],
    close: ["turn off", "close", "hide"],
    reset: ["reset"],
    max_kw: ["top speed", "max speed", "maximum"],
    avg_kw: ["average"],
    dist_kw: ["distance", "how far", "how many kilometers", "how many kilometres"],
    speed_kw: ["speed", "how fast"],
    query_kw: ["what", "how"],
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
    listening: "Слушаю", speaking: "Говорю…",
    hint: 'Скажи «Хэй Волт», затем спроси что угодно',
    notUnderstood: "Я услышал, но не понял.",
    greeting: "Привет, я Вольт, твой умный ассистент для езды. Чем могу помочь?",
    micNotSupported: "Этот браузер не поддерживает распознавание речи",
    speedIs: (v) => `Сейчас ты едешь со скоростью ${v} километров в час.`,
    stopped: "Сейчас ты стоишь на месте.",
    maxIs: (v) => `Твоя максимальная скорость — ${v} километров в час.`,
    avgIs: (v) => `Твоя средняя скорость — ${v} километров в час.`,
    distIs: (v) => `Ты проехал ${v} километров.`,
    gaugeOpened: "Включаю спидометр.",
    gaugeClosed: "Выключаю спидометр.",
    sessionReset: "Сессия сброшена.",
    wake: ["хэй волт", "хей волт", "волт"],
    open: ["включи", "открой", "покажи"],
    close: ["выключи", "закрой", "скрой"],
    reset: ["сбрось", "сброс"],
    max_kw: ["максимальная", "максимум"],
    avg_kw: ["средняя", "средню"],
    dist_kw: ["расстояние", "сколько проехал", "сколько километров"],
    speed_kw: ["скорость"],
    query_kw: ["какая", "сколько"],
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
    listening: "Hört zu", speaking: "Spricht…",
    hint: 'Sag "Hey Volt" und frag mich alles',
    notUnderstood: "Ich habe dich gehört, aber nicht verstanden.",
    greeting: "Hallo, ich bin Volt, dein intelligenter Fahrassistent. Wie kann ich helfen?",
    micNotSupported: "Dieser Browser unterstützt keine Spracherkennung",
    speedIs: (v) => `Du fährst gerade ${v} Kilometer pro Stunde.`,
    stopped: "Du stehst gerade still.",
    maxIs: (v) => `Deine Höchstgeschwindigkeit ist ${v} Kilometer pro Stunde.`,
    avgIs: (v) => `Deine Durchschnittsgeschwindigkeit ist ${v} Kilometer pro Stunde.`,
    distIs: (v) => `Du bist bisher ${v} Kilometer gefahren.`,
    gaugeOpened: "Ich schalte den Tacho ein.",
    gaugeClosed: "Ich schalte den Tacho aus.",
    sessionReset: "Sitzung zurückgesetzt.",
    wake: ["hey volt", "volt"],
    open: ["schalte ein", "öffne", "zeig"],
    close: ["schalte aus", "schließe", "verstecke"],
    reset: ["zurücksetzen", "reset"],
    max_kw: ["höchstgeschwindigkeit", "maximal"],
    avg_kw: ["durchschnitt"],
    dist_kw: ["entfernung", "wie weit", "wie viele kilometer"],
    speed_kw: ["geschwindigkeit", "wie schnell"],
    query_kw: ["was", "wie"],
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
    listening: "正在聆听", speaking: "正在说话…",
    hint: '说"嘿 Volt",然后随便问',
    notUnderstood: "我听到了,但没听懂。",
    greeting: "你好,我是Volt,你的智能骑行助手。有什么可以帮你的吗?",
    micNotSupported: "此浏览器不支持语音识别",
    speedIs: (v) => `你现在的速度是每小时${v}公里。`,
    stopped: "你现在处于静止状态。",
    maxIs: (v) => `你的最高速度是每小时${v}公里。`,
    avgIs: (v) => `你的平均速度是每小时${v}公里。`,
    distIs: (v) => `你目前已经骑了${v}公里。`,
    gaugeOpened: "正在打开速度表。",
    gaugeClosed: "正在关闭速度表。",
    sessionReset: "已重置本次记录。",
    wake: ["嘿volt", "嘿 volt", "volt"],
    open: ["打开", "开启"],
    close: ["关闭", "关掉"],
    reset: ["重置"],
    max_kw: ["最高速度", "最大速度"],
    avg_kw: ["平均速度"],
    dist_kw: ["距离", "骑了多远", "多少公里"],
    speed_kw: ["速度", "多快"],
    query_kw: ["多少", "什么"],
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
    listening: "듣는 중", speaking: "말하는 중…",
    hint: '"헤이 볼트"라고 말한 후 무엇이든 물어보세요',
    notUnderstood: "들었지만 이해하지 못했어요.",
    greeting: "안녕하세요, 저는 당신의 스마트 라이딩 어시스턴트 볼트입니다. 무엇을 도와드릴까요?",
    micNotSupported: "이 브라우저는 음성 인식을 지원하지 않습니다",
    speedIs: (v) => `현재 시속 ${v}킬로미터로 이동 중입니다.`,
    stopped: "현재 정지해 있습니다.",
    maxIs: (v) => `최고 속도는 시속 ${v}킬로미터입니다.`,
    avgIs: (v) => `평균 속도는 시속 ${v}킬로미터입니다.`,
    distIs: (v) => `지금까지 ${v}킬로미터를 이동했습니다.`,
    gaugeOpened: "속도계를 켭니다.",
    gaugeClosed: "속도계를 끕니다.",
    sessionReset: "세션을 초기화했습니다.",
    wake: ["헤이 볼트", "볼트"],
    open: ["켜", "열어", "보여"],
    close: ["꺼", "닫아", "숨겨"],
    reset: ["초기화", "리셋"],
    max_kw: ["최고 속도", "최대 속도"],
    avg_kw: ["평균 속도"],
    dist_kw: ["거리", "얼마나 갔", "몇 킬로"],
    speed_kw: ["속도", "얼마나 빨리"],
    query_kw: ["뭐", "얼마"],
  },
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

function SpeedArc({ speed, flash, unit }) {
  const max = 60;
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
        <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#4A5040" strokeWidth="2" />
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#6B7268"
          fontFamily="'Roboto Mono', 'SF Mono', ui-monospace, monospace"
        >
          {v}
        </text>
      </g>
    );
  }

  return (
    <svg width="300" height="230" viewBox="0 0 300 230">
      <path d={arcPath(128, startAngle, endAngle)} fill="none" stroke="#1B1D16" strokeWidth="18" strokeLinecap="round" />
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
        fill="#EDEFE6"
        fontFamily="'Roboto Mono', 'SF Mono', ui-monospace, monospace"
      >
        {clamped.toFixed(0)}
      </text>
      <text x="150" y="175" textAnchor="middle" fontSize="13" fill="#8A8F7C" letterSpacing="2">
        {unit.toUpperCase()}
      </text>
    </svg>
  );
}

export default function Volt() {
  const [language, setLanguage] = useState("en");
  const [themeColor, setThemeColor] = useState("green");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = T[language];
  const accent = THEMES[themeColor];

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
    const peak = 55;
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
  const lastPosRef = useRef(null);
  const watchIdRef = useRef(null);

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
              if (distKm < 0.5) {
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
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaugeOn]);

  // Voice control
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
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
        if (voiceEnabled && recognitionRef.current) {
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
    [voiceEnabled, soundEnabled, language]
  );

  const greetedRef = useRef(false);
  useEffect(() => {
    const greet = () => {
      if (greetedRef.current) return;
      greetedRef.current = true;
      speak(t.greeting);
    };
    document.addEventListener("pointerdown", greet, { once: true });
    return () => document.removeEventListener("pointerdown", greet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processTranscript = useCallback(
    (raw) => {
      const raw_l = raw.toLowerCase();
      const has = (arr) => arr.some((w) => raw_l.includes(w));
      if (!has(t.wake)) {
        setVoiceStatus(`"${raw}"`);
        return;
      }
      if (has(t.reset)) {
        resetSession();
        setVoiceStatus(t.sessionReset);
        speak(t.sessionReset);
      } else if (has(t.close)) {
        setGaugeOn(false);
        setVoiceStatus(t.gaugeClosed);
        speak(t.gaugeClosed);
      } else if (has(t.open)) {
        setGaugeOn(true);
        setVoiceStatus(t.gaugeOpened);
        speak(t.gaugeOpened);
      } else if (has(t.max_kw)) {
        const v = Math.round(sessionMaxRef.current);
        setVoiceStatus(t.maxIs(v));
        speak(t.maxIs(v));
      } else if (has(t.avg_kw)) {
        const v = Math.round(sessionAvgRef.current);
        setVoiceStatus(t.avgIs(v));
        speak(t.avgIs(v));
      } else if (has(t.dist_kw)) {
        const v = sessionDistanceRef.current.toFixed(1);
        setVoiceStatus(t.distIs(v));
        speak(t.distIs(v));
      } else if (has(t.speed_kw)) {
        const v = Math.round(currentSpeedRef.current);
        if (v <= 1) {
          setVoiceStatus(t.stopped);
          speak(t.stopped);
        } else {
          setVoiceStatus(t.speedIs(v));
          speak(t.speedIs(v));
        }
      } else {
        setVoiceStatus(t.notUnderstood);
        speak(t.notUnderstood);
      }
    },
    [t, speak, resetSession]
  );

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    if (!voiceEnabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setVoiceStatus(t.micNotSupported);
        setVoiceEnabled(false);
      }
    };
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      processTranscript(last[0].transcript);
    };
    recognition.onend = () => {
      setListening(false);
      if (voiceEnabled && !isSpeakingRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (e) {}
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
  }, [voiceEnabled, language, processTranscript, t]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#12140F",
        overflow: "hidden",
        "--accent": accent.hex,
        "--on-accent": accent.on,
      }}
    >
      <style>{`
        html, body { margin: 0; padding: 0; }
        .volt-landscape {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5vw;
          box-sizing: border-box;
        }
        @media screen and (orientation: portrait) {
          .volt-landscape {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vh;
            height: 100vw;
            transform-origin: top left;
            transform: rotate(90deg) translateY(-100%);
          }
        }
        .digit {
          font-family: 'Roboto Mono', 'SF Mono', ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
        }
        .icon-btn { transition: transform 0.08s ease; }
        .icon-btn:active { transform: scale(0.92); }

        .volt-splash {
          position: fixed; inset: 0; z-index: 100; background: #12140F;
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
          font-size: 12px; color: #6B7268; letter-spacing: 1.5px; opacity: 0;
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
          background: #1B1D16; border: 1px solid #2B2E24; border-radius: 16px;
          padding: 20px; width: 100%; max-width: 460px; max-height: 85vh; overflow-y: auto;
        }
        .pill {
          padding: 7px 12px; border-radius: 999px; border: 1px solid #2B2E24; background: #12140F;
          color: #EDEFE6; font-size: 12px; cursor: pointer;
        }
        .pill.active { background: var(--accent); color: var(--on-accent); border-color: transparent; font-weight: 700; }
        .swatch {
          width: 34px; height: 34px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;
        }
        .swatch.active { border-color: #EDEFE6; }
      `}</style>

      {showSplash && (
        <div className={`volt-splash ${splashExiting ? "splash-exit" : ""}`}>
          <div className="splash-logo">
            <div className="splash-bolt">
              <Zap size={28} color="var(--on-accent)" strokeWidth={2.6} fill="var(--on-accent)" />
            </div>
            <span className="digit" style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4, color: "#EDEFE6" }}>
              VOLT
            </span>
          </div>
          <div className="splash-tagline">{t.tagline}</div>
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
          border: "1px solid #262920",
          background: "#1B1D16",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label={t.settings}
      >
        <Settings size={17} color="#8A8F7C" />
      </button>

      {settingsOpen && (
        <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="settings-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#EDEFE6" }}>{t.settings}</span>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
                aria-label="Close"
              >
                <X size={18} color="#8A8F7C" />
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "#8A8F7C", marginBottom: 8, letterSpacing: 0.5 }}>{t.language}</div>
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
              <div style={{ fontSize: 11, color: "#8A8F7C", marginBottom: 8, letterSpacing: 0.5 }}>{t.sound}</div>
              <button
                className={`pill ${soundEnabled ? "active" : ""}`}
                onClick={() => setSoundEnabled((v) => !v)}
              >
                {soundEnabled ? "On" : "Off"}
              </button>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#8A8F7C", marginBottom: 8, letterSpacing: 0.5 }}>{t.theme}</div>
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
          </div>
        </div>
      )}

      <div className="volt-landscape">
        {/* Left: wordmark + voice + stats */}
        <div className="enter-left" style={{ display: "flex", flexDirection: "column", gap: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={15} color="var(--on-accent)" strokeWidth={2.6} fill="var(--on-accent)" />
            </div>
            <span className="digit" style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1.5, color: "#EDEFE6" }}>
              VOLT
            </span>
          </div>

          <button
            className="icon-btn"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (next) setVoiceStatus("");
            }}
            disabled={!voiceSupported}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#1B1D16",
              border: "1px solid #262920",
              borderRadius: 999,
              padding: "8px 14px 8px 10px",
              cursor: voiceSupported ? "pointer" : "not-allowed",
              opacity: voiceSupported ? 1 : 0.4,
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: speaking ? "color-mix(in srgb, var(--accent) 30%, transparent)" : listening ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {voiceEnabled ? (
                <Mic size={13} color={speaking || listening ? "var(--accent)" : "#8A8F7C"} />
              ) : (
                <MicOff size={13} color="#8A8F7C" />
              )}
            </div>
            <span style={{ fontSize: 11.5, color: "#EDEFE6", fontWeight: 600, whiteSpace: "nowrap" }}>
              {voiceEnabled ? (speaking ? t.speaking : listening ? t.listening : t.voiceOn) : t.voiceOff}
            </span>
            {(listening || speaking) && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
            )}
          </button>

          <div style={{ fontSize: 10.5, color: "#6B7268", maxWidth: 160, lineHeight: 1.4 }}>
            {!voiceSupported ? t.micNotSupported : voiceStatus || t.hint}
          </div>

          {gaugeOn && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: t.max, value: `${sessionMax.toFixed(0)} ${t.unit}` },
                { label: t.avg, value: `${sessionAvg.toFixed(0)} ${t.unit}` },
                { label: t.dist, value: `${sessionDistance.toFixed(1)} km` },
              ].map((s, i) => (
                <div key={s.label} className="stat-item" style={{ animationDelay: `${0.35 + i * 0.1}s` }}>
                  <div className="digit" style={{ fontSize: 15, fontWeight: 700, color: "#EDEFE6" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 9, color: "#6B7268", letterSpacing: 0.8, marginTop: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: speed gauge */}
        <div className="enter-center" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {gaugeOn ? (
            <SpeedArc speed={bootDone ? currentSpeed : bootValue} flash={splashExiting && !bootDone} unit={t.unit} />
          ) : (
            <div
              style={{
                width: 300,
                height: 230,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Gauge size={30} color="#4A5040" />
              <span style={{ fontSize: 12.5, color: "#6B7268" }}>{t.gaugeOff}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: gpsError ? "#E3574B" : gaugeOn ? "var(--accent)" : "#4A5040",
              }}
            />
            <span style={{ fontSize: 10.5, color: "#6B7268", letterSpacing: 0.5 }}>
              {gpsError || (gaugeOn ? t.gpsActive : t.gpsOff)}
            </span>
          </div>
        </div>

        {/* Right: manual toggle */}
        <div className="enter-right" style={{ flexShrink: 0 }}>
          <button
            className="icon-btn"
            onClick={() => setGaugeOn((v) => !v)}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: gaugeOn ? "1px solid #262920" : "none",
              cursor: "pointer",
              background: gaugeOn ? "#1B1D16" : "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={gaugeOn ? t.turnOff : t.turnOn}
          >
            <Gauge size={22} color={gaugeOn ? "#8A8F7C" : "var(--on-accent)"} />
          </button>
        </div>
      </div>
    </div>
  );
}
