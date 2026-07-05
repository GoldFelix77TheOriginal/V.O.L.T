import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Mic, MicOff, Gauge } from "lucide-react";

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

function SpeedArc({ speed }) {
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
        <line
          x1={outer.x}
          y1={outer.y}
          x2={inner.x}
          y2={inner.y}
          stroke="#4A5040"
          strokeWidth="2"
        />
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
      <path
        d={arcPath(128, startAngle, endAngle)}
        fill="none"
        stroke="#1B1D16"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d={arcPath(128, startAngle, angle)}
        fill="none"
        stroke="#D7FF3D"
        strokeWidth="18"
        strokeLinecap="round"
        style={{ transition: "d 0.3s ease" }}
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
        KM/S
      </text>
    </svg>
  );
}

export default function Volt() {
  // Speed gauge (GPS)
  const [gaugeOn, setGaugeOn] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [gpsError, setGpsError] = useState("");
  const lastPosRef = useRef(null);
  const watchIdRef = useRef(null);

  // Session stats (since gauge was last turned on / reset)
  const [sessionMax, setSessionMax] = useState(0);
  const [sessionDistance, setSessionDistance] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionDistanceRef = useRef(0);
  const sessionSecondsRef = useRef(0);

  const resetSession = useCallback(() => {
    sessionDistanceRef.current = 0;
    sessionSecondsRef.current = 0;
    setSessionDistance(0);
    setSessionSeconds(0);
    setSessionMax(0);
    lastPosRef.current = null;
  }, []);

  const sessionAvg = sessionSeconds > 0 ? sessionDistance / (sessionSeconds / 3600) : 0;
  const sessionMaxRef = useRef(0);
  const sessionAvgRef = useRef(0);
  useEffect(() => {
    sessionMaxRef.current = sessionMax;
    sessionAvgRef.current = sessionAvg;
  }, [sessionMax, sessionAvg]);

  // Keep the screen awake while the gauge is in use (bike-mount use case)
  const wakeLockRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      try {
        if ("wakeLock" in navigator) {
          const lock = await navigator.wakeLock.request("screen");
          if (!cancelled) wakeLockRef.current = lock;
        }
      } catch (e) {
        // permission denied or unsupported, ignore
      }
    }
    async function release() {
      try {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch (e) {
        // ignore
      }
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
      if (
        gaugeOn &&
        document.visibilityState === "visible" &&
        "wakeLock" in navigator &&
        !wakeLockRef.current
      ) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (e) {
          // ignore
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [gaugeOn]);

  // Voice control ("Hey Volt")
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const currentSpeedRef = useRef(0);

  useEffect(() => {
    currentSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  const speak = useCallback(
    (text) => {
      if (!("speechSynthesis" in window)) return;
      isSpeakingRef.current = true;
      setSpeaking(true);
      try {
        recognitionRef.current && recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "tr-TR";
      utter.rate = 1;
      utter.onend = () => {
        isSpeakingRef.current = false;
        setSpeaking(false);
        if (voiceEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // ignore
          }
        }
      };
      window.speechSynthesis.speak(utter);
    },
    [voiceEnabled]
  );

  // GPS watch, active whenever the gauge is on
  useEffect(() => {
    if (gaugeOn) {
      if (!("geolocation" in navigator)) {
        setGpsError("Bu cihazda konum servisi bulunamadı.");
        return;
      }
      resetSession();
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsError("");
          const { latitude, longitude, speed } = pos.coords;
          let kmh = typeof speed === "number" && speed !== null && speed >= 0 ? speed * 3.6 : null;

          if (lastPosRef.current) {
            const { lat, lon, t } = lastPosRef.current;
            const dt = (pos.timestamp - t) / 1000;
            if (dt > 0) {
              const distKm = haversineKm(lat, lon, latitude, longitude);
              if (kmh === null) kmh = (distKm / dt) * 3600;
              // ignore implausible GPS jumps (>0.5km in one tick) when accumulating trip stats
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
          lastPosRef.current = { lat: latitude, lon: longitude, t: pos.timestamp };
        },
        (err) => {
          setGpsError(
            err.code === 1
              ? "Konum izni verilmedi. Hız göstergesi için izin gerekiyor."
              : "Konum alınamadı."
          );
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
  }, [gaugeOn, resetSession]);

  const askAI = useCallback(
    async (question) => {
      setVoiceStatus("Düşünüyor…");
      try {
        const context = `Şu anki hız: ${Math.round(currentSpeedRef.current)} km/s. En yüksek hız bu oturumda: ${Math.round(sessionMaxRef.current)} km/s. Ortalama hız: ${Math.round(sessionAvgRef.current)} km/s. Kat edilen mesafe: ${sessionDistanceRef.current.toFixed(1)} km.`;
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, context }),
        });
        const data = await response.json();
        const text = (data.text || "").trim();
        if (text) {
          setVoiceStatus(text);
          speak(text);
        } else {
          setVoiceStatus("Cevap alınamadı.");
          speak("Şu anda cevap veremiyorum.");
        }
      } catch (e) {
        setVoiceStatus("Yapay zekaya bağlanamadım.");
        speak("Şu anda sana yardımcı olamıyorum.");
      }
    },
    [speak]
  );

  // Voice control: "Hey Volt, hız göstergesini aç/kapat", "hızım kaç?", "en yüksek hızım?", "ne kadar yol gittim?", "sıfırla"
  const processTranscript = useCallback(
    (raw) => {
      const t = raw.toLowerCase();
      const heardWake =
        t.includes("volt") ||
        t.includes("volta") ||
        t.includes("vılt") ||
        t.includes("volta,") ||
        t.includes("hey volt");
      if (!heardWake) {
        setVoiceStatus(`Duydum ama "volt" geçmiyordu: "${raw}"`);
        return;
      }

      const mentionsSpeed = t.includes("hız") || t.includes("hiz");
      const mentionsOpen = t.includes("aç") || t.includes("ac");
      const mentionsClose = t.includes("kapat");
      const mentionsMax = t.includes("en yüksek") || t.includes("en yuksek") || t.includes("maksimum") || t.includes("max");
      const mentionsAvg = t.includes("ortalama");
      const mentionsDistance =
        t.includes("mesafe") || t.includes("yol gittim") || t.includes("kilometre gittim") || t.includes("kaç km") || t.includes("kac km");
      const mentionsReset = t.includes("sıfırla") || t.includes("sifirla");
      const isQuery = t.includes("kaç") || t.includes("kac") || t.includes("ne kadar") || t.includes("nedir");

      if (mentionsReset) {
        resetSession();
        setVoiceStatus('Anlaşıldı: "sıfırla"');
        speak("Oturumu sıfırladım.");
      } else if (mentionsSpeed && mentionsClose) {
        setGaugeOn(false);
        setVoiceStatus('Anlaşıldı: "hız göstergesini kapat"');
        speak("Hız göstergesini kapatıyorum.");
      } else if (mentionsSpeed && mentionsOpen) {
        setGaugeOn(true);
        setVoiceStatus('Anlaşıldı: "hız göstergesini aç"');
        speak("Hız göstergesini açıyorum.");
      } else if (mentionsMax && (mentionsSpeed || isQuery)) {
        const val = Math.round(sessionMaxRef.current);
        setVoiceStatus(`Anlaşıldı: en yüksek hız soruldu (${val} km/s)`);
        speak(`En yüksek hızın saatte ${val} kilometre.`);
      } else if (mentionsAvg && (mentionsSpeed || isQuery)) {
        const val = Math.round(sessionAvgRef.current);
        setVoiceStatus(`Anlaşıldı: ortalama hız soruldu (${val} km/s)`);
        speak(`Ortalama hızın saatte ${val} kilometre.`);
      } else if (mentionsDistance) {
        const val = sessionDistanceRef.current;
        setVoiceStatus(`Anlaşıldı: mesafe soruldu (${val.toFixed(1)} km)`);
        speak(`Şu ana kadar ${val.toFixed(1)} kilometre yol gittin.`);
      } else if (mentionsSpeed && isQuery) {
        const val = Math.round(currentSpeedRef.current);
        setVoiceStatus(`Anlaşıldı: hız soruldu (${val} km/s)`);
        if (val <= 1) {
          speak("Şu anda durmuş durumdasın.");
        } else {
          speak(`Şu anda saatte ${val} kilometre hızla gidiyorsun.`);
        }
      } else {
        askAI(raw);
      }
    },
    [speak, resetSession, askAI]
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
    recognition.lang = "tr-TR";

    recognition.onstart = () => setListening(true);
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setVoiceStatus("Mikrofon izni verilmedi.");
        setVoiceEnabled(false);
      } else if (e.error !== "no-speech") {
        setVoiceStatus("Ses tanıma hatası: " + e.error);
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
        } catch (e) {
          // already started or unavailable
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setVoiceStatus("Sesli komut başlatılamadı.");
    }

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  }, [voiceEnabled, processTranscript]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#12140F",
        overflow: "hidden",
      }}
    >
      <style>{`
        html, body { margin: 0; padding: 0; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
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
        .icon-btn {
          transition: transform 0.08s ease;
        }
        .icon-btn:active {
          transform: scale(0.92);
        }
      `}</style>

      <div className="volt-landscape">
        {/* Left: wordmark + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "#D7FF3D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={15} color="#12140F" strokeWidth={2.6} fill="#12140F" />
            </div>
            <span
              className="digit"
              style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1.5, color: "#EDEFE6" }}
            >
              VOLT
            </span>
          </div>

          <button
            className="icon-btn"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (next) {
                setVoiceStatus("");
                setTimeout(() => speak("Sesli komut hazır."), 400);
              }
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
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: speaking
                  ? "rgba(215,255,61,0.3)"
                  : listening
                  ? "rgba(215,255,61,0.15)"
                  : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {voiceEnabled ? (
                <Mic size={13} color={speaking || listening ? "#D7FF3D" : "#8A8F7C"} />
              ) : (
                <MicOff size={13} color="#8A8F7C" />
              )}
            </div>
            <span style={{ fontSize: 11.5, color: "#EDEFE6", fontWeight: 600, whiteSpace: "nowrap" }}>
              {voiceEnabled
                ? speaking
                  ? "Konuşuyor…"
                  : listening
                  ? "Dinliyor"
                  : "Sesli komut açık"
                : "Sesli komutu aç"}
            </span>
            {(listening || speaking) && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#D7FF3D",
                  animation: "pulse-dot 1.2s infinite",
                }}
              />
            )}
          </button>

          <div style={{ fontSize: 10.5, color: "#6B7268", maxWidth: 150, lineHeight: 1.4 }}>
            {!voiceSupported
              ? "Tarayıcı ses tanımayı desteklemiyor"
              : voiceStatus || '"Hey Volt" de, sonra istediğini sor'}
          </div>
        </div>

        {/* Center: speed gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {gaugeOn ? (
            <SpeedArc speed={currentSpeed} />
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
              <span style={{ fontSize: 12.5, color: "#6B7268" }}>Gösterge kapalı</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: gpsError ? "#E3574B" : gaugeOn ? "#D7FF3D" : "#4A5040",
              }}
            />
            <span style={{ fontSize: 10.5, color: "#6B7268", letterSpacing: 0.5 }}>
              {gpsError || (gaugeOn ? "GPS AKTİF" : "GPS KAPALI")}
            </span>
          </div>

          {gaugeOn && (
            <div style={{ display: "flex", gap: 18, marginTop: 4 }}>
              {[
                { label: "MAKS", value: `${sessionMax.toFixed(0)}` },
                { label: "ORT", value: `${sessionAvg.toFixed(0)}` },
                { label: "MESAFE", value: `${sessionDistance.toFixed(1)} km` },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div
                    className="digit"
                    style={{ fontSize: 15, fontWeight: 700, color: "#EDEFE6" }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 9, color: "#6B7268", letterSpacing: 0.8, marginTop: 1 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: manual toggle */}
        <div style={{ flexShrink: 0 }}>
          <button
            className="icon-btn"
            onClick={() => setGaugeOn((v) => !v)}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: gaugeOn ? "#1B1D16" : "#D7FF3D",
              border: gaugeOn ? "1px solid #262920" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={gaugeOn ? "Göstergeyi kapat" : "Göstergeyi aç"}
          >
            <Gauge size={22} color={gaugeOn ? "#8A8F7C" : "#12140F"} />
          </button>
        </div>
      </div>
    </div>
  );
}
