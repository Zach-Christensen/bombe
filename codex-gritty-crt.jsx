import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// --- Word List (curated common 5-letter words) ---
const WORD_LIST = [
  "CRANE","STALE","BRAVE","GHOST","PLUMB","SHRUG","DWELT","OCEAN",
  "JUDGE","KNELT","WOVEN","FRAME","SIGHT","BLOOM","CHASE","DRIFT","GLEAM",
  "HOIST","JOUST","LIVER","MOUNT","ORBIT","PRISM","QUILT","REIGN",
  "STOMP","TRUNK","VIGOR","WHISK","BLAZE","CHARM",
  "DENIM","ELBOW","FROST","GRIND","JUMBO","LEMON",
  "MANGO","NOBLE","OLIVE","PEARL","QUOTA","REBEL","SWIRL","THORN","ULTRA",
  "VIVID","WHEAT","AMBER","BENCH","CEDAR","DELTA","EMBER","FLASK",
  "GRASP","HAVEN","ICING","JEWEL","KARMA","LUNAR","MEDAL","NICHE","OPTIC",
  "PLAZA","QUIRK","ROVER","SWORN","TULIP","UMBRA","VAULT","WRIST",
  "BRINE","CRUST","DODGE","FORGE","HUMID","INGOT",
  "KNACK","LUCID","MARSH","ONSET","PLAID","RAVEN","SCALD",
  "USHER","VALVE","WINCH","ABODE","BLUNT","CIGAR","DRAPE","EPOCH","FLINT",
  "GOURD","HEIST","MOCHA","NOTCH",
  "PRANK","SCALP","TOKEN","ULCER","WRECK","ZEBRA",
  "CLOTH","NUDGE","SPORE","BROIL","FLARE","STONE","CAULK",
  "SIREN","GLOBE","TRUCE","PERCH","HOUND","SMELT","BUDGE",
  "REIGN","CLAMP","SHOVE","BRAID","FUDGE","PLUME","ROAST",
  "DWELL","FLUME","GROUT","CLIMB","SMEAR","BLOKE","TROUT",
];

const MAX_QUERIES = 14;
const ALPHABET = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","O","P","Q","R","S","T","U","V","W","XY","Z",
];

// Get daily word based on date seed
function getDailyWord() {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return WORD_LIST[seed % WORD_LIST.length];
}

function getDayNumber() {
  const start = new Date(2026, 2, 5); // March 5 2026
  const now = new Date();
  return Math.floor((now - start) / 86400000) + 1;
}

// --- Stats helpers ---
function loadStats() {
  try {
    const raw = window._gameStats;
    if (raw) return raw;
  } catch {}
  return { played: 0, won: 0, streak: 0, maxStreak: 0, queryDist: {}, lastDate: null };
}

function saveStats(stats) {
  window._gameStats = stats;
}

function loadDailyState() {
  try {
    const raw = window._dailyState;
    if (raw && raw.date === new Date().toDateString()) return raw;
  } catch {}
  return null;
}

function saveDailyState(state) {
  window._dailyState = { ...state, date: new Date().toDateString() };
}

// --- CRT Style Injection ---
const CRT_STYLE_ID = "crt-signal-intercept-styles";

function injectCRTStyles() {
  if (document.getElementById(CRT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = CRT_STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

    @keyframes crt-flicker {
      0%, 100% { opacity: 1.0; }
      50% { opacity: 0.97; }
    }

    @keyframes scanline-scroll {
      0% { background-position: 0 0; }
      100% { background-position: 0 4px; }
    }

    @keyframes signal-decoded-flash {
      0% { background: rgba(51, 255, 51, 0.3); }
      30% { background: rgba(51, 255, 51, 0.08); }
      100% { background: transparent; }
    }

    @keyframes signal-lost-static {
      0% { opacity: 0.15; }
      10% { opacity: 0.4; }
      20% { opacity: 0.1; }
      30% { opacity: 0.35; }
      40% { opacity: 0.05; }
      50% { opacity: 0.3; }
      60% { opacity: 0.1; }
      70% { opacity: 0.25; }
      80% { opacity: 0.05; }
      100% { opacity: 0.08; }
    }

    @keyframes cursor-blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }

    @keyframes tile-scramble {
      0% { content: attr(data-scramble-0); }
      25% { content: attr(data-scramble-1); }
      50% { content: attr(data-scramble-2); }
      75% { content: attr(data-scramble-3); }
      100% { content: attr(data-final); }
    }
  `;
  document.head.appendChild(style);
}

// --- Scramble Hook (adapted for reveal mechanic) ---
function useRevealScramble(letter, isRevealed) {
  const finalChar = isRevealed ? (letter || "\u2013") : "";
  const [display, setDisplay] = useState(isRevealed ? finalChar : "");
  const prevRevealedRef = useRef(isRevealed);
  const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  useEffect(() => {
    if (!prevRevealedRef.current && isRevealed) {
      let step = 0;
      const totalSteps = 4;
      const interval = setInterval(() => {
        if (step < totalSteps) {
          const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          setDisplay(randChar);
          step++;
        } else {
          setDisplay(finalChar);
          clearInterval(interval);
        }
      }, 50);
      prevRevealedRef.current = isRevealed;
      return () => clearInterval(interval);
    } else {
      setDisplay(isRevealed ? finalChar : "");
    }
    prevRevealedRef.current = isRevealed;
  }, [isRevealed, finalChar]);

  return display;
}

// --- Components ---

function Tile({ letter, isRevealed, onClick, disabled, index }) {
  const displayChar = useRevealScramble(letter, isRevealed);

  let tileStyle;
  if (!isRevealed) {
    // Unrevealed: blank tile with glowing green border, dark bg
    tileStyle = {
      bg: "rgba(51,255,51,0.03)",
      border: "rgba(51,255,51,0.15)",
      color: "#33ff33",
      shadow: "0 0 4px rgba(51,255,51,0.15)",
      textShadow: "0 0 8px rgba(51,255,51,0.5)",
    };
  } else {
    // Revealed with letter: dimmer green glow
    tileStyle = {
      bg: "rgba(51,255,51,0.12)",
      border: "#33ff33",
      color: "#33ff33",
      shadow: "0 0 12px rgba(51,255,51,0.4), inset 0 0 8px rgba(51,255,51,0.1)",
      textShadow: "0 0 8px rgba(51,255,51,0.5)",
    };
  }

  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      style={{
        width: "100%", aspectRatio: "1 / 1.1",
        border: `1px solid ${tileStyle.border}`,
        borderRadius: 2,
        background: tileStyle.bg,
        color: tileStyle.color,
        fontSize: 17,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.05s steps(1)",
        transform: isRevealed ? "scale(1.05)" : "scale(1)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        textShadow: tileStyle.textShadow,
        boxShadow: tileStyle.shadow,
        letterSpacing: 1,
      }}
    >
      {displayChar}
      {isRevealed && (
        <span style={{
          position: "absolute", top: -3, right: -3,
          width: 8, height: 8, borderRadius: 1,
          background: "#33ff33",
          border: "1px solid #0a0f0a",
          boxShadow: "0 0 6px rgba(51,255,51,0.6)",
        }} />
      )}
    </button>
  );
}

function StatsModal({ stats, onClose }) {
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const statItems = [
    { label: "OPS", value: stats.played },
    { label: "DECR %", value: winPct },
    { label: "STREAK", value: stats.streak },
    { label: "BEST", value: stats.maxStreak },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0f0a", border: "1px solid rgba(51,255,51,0.3)",
        borderRadius: 2, padding: "32px 28px", maxWidth: 340, width: "90%",
        boxShadow: "0 0 30px rgba(51,255,51,0.1), inset 0 0 60px rgba(0,0,0,0.5)",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 12, letterSpacing: 6,
          textTransform: "uppercase", color: "#33ff33", margin: "0 0 24px",
          fontFamily: "'IBM Plex Mono', monospace",
          textShadow: "0 0 8px rgba(51,255,51,0.5)",
        }}>MISSION LOG</h3>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 28 }}>
          {statItems.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 28, fontWeight: 700, color: "#33ff33",
                fontFamily: "'IBM Plex Mono', monospace",
                textShadow: "0 0 10px rgba(51,255,51,0.6)",
              }}>{s.value}</div>
              <div style={{
                fontSize: 10, color: "#1a5a1a", marginTop: 4, letterSpacing: 2,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px",
          background: "rgba(51,255,51,0.05)",
          border: "1px solid rgba(51,255,51,0.2)", borderRadius: 2,
          color: "#33ff33", fontSize: 12, cursor: "pointer", letterSpacing: 3,
          fontFamily: "'IBM Plex Mono', monospace",
          textShadow: "0 0 6px rgba(51,255,51,0.4)",
        }}>DISMISS</button>
      </div>
    </div>
  );
}

function HowToModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0f0a", border: "1px solid rgba(51,255,51,0.3)",
        borderRadius: 2, padding: "32px 24px", maxWidth: 380, width: "90%",
        boxShadow: "0 0 30px rgba(51,255,51,0.1), inset 0 0 60px rgba(0,0,0,0.5)",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 12, letterSpacing: 6,
          textTransform: "uppercase", color: "#33ff33", margin: "0 0 20px",
          fontFamily: "'IBM Plex Mono', monospace",
          textShadow: "0 0 8px rgba(51,255,51,0.5)",
        }}>FIELD MANUAL</h3>
        <div style={{
          fontSize: 13, lineHeight: 1.8, color: "#2a8a2a",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <p style={{ margin: "0 0 16px" }}>
            A classified 5-character signal has been intercepted. Its characters have been <span style={{ color: "#33ff33", fontWeight: 700 }}>removed</span> from the frequency grid, and remaining frequencies shift to fill the gaps.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            The grid shows <span style={{ color: "#33ff33", fontWeight: 700 }}>20 blank nodes</span>. Scan any node to reveal which frequency now occupies that position.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            <span style={{ color: "#33ff33", fontWeight: 700 }}>Compare</span> the revealed frequency to what you'd expect. If a frequency is skipped, it's part of the intercepted signal.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            You have <strong style={{ color: "#33ff33" }}>14 scans</strong> to identify all 5 characters.
            Once located, reassemble them and submit your decryption key.
          </p>
          <p style={{ margin: "0 0 4px", color: "#1a5a1a", fontSize: 12 }}>
            // STRATEGY: scan spaced-out nodes to detect shifts and pinpoint removed frequencies.
          </p>
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", marginTop: 16,
          background: "rgba(51,255,51,0.08)",
          border: "1px solid rgba(51,255,51,0.25)", borderRadius: 2,
          color: "#33ff33", fontSize: 12, cursor: "pointer", letterSpacing: 3,
          fontFamily: "'IBM Plex Mono', monospace",
          textShadow: "0 0 6px rgba(51,255,51,0.4)",
        }}>ACKNOWLEDGED</button>
      </div>
    </div>
  );
}

function ResultModal({ won, word, queriesUsed, onShare, onClose }) {
  const [showFlash, setShowFlash] = useState(won);

  useEffect(() => {
    if (won) {
      const t = setTimeout(() => setShowFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [won]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      {/* Win flash overlay */}
      {showFlash && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          animation: "signal-decoded-flash 0.6s ease-out forwards",
          zIndex: 101,
        }} />
      )}
      {/* Loss static overlay */}
      {!won && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          animation: "signal-lost-static 0.8s steps(8) forwards",
          zIndex: 101,
        }} />
      )}
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0a0f0a", border: `1px solid ${won ? "rgba(51,255,51,0.4)" : "rgba(255,50,50,0.3)"}`,
        borderRadius: 2, padding: "32px 28px", maxWidth: 340, width: "90%",
        textAlign: "center", zIndex: 102,
        boxShadow: won
          ? "0 0 40px rgba(51,255,51,0.15), inset 0 0 60px rgba(0,0,0,0.5)"
          : "0 0 40px rgba(255,50,50,0.1), inset 0 0 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          fontSize: 14, marginBottom: 12, letterSpacing: 4,
          fontFamily: "'IBM Plex Mono', monospace",
          color: won ? "#33ff33" : "#ff3333",
          textShadow: won ? "0 0 10px rgba(51,255,51,0.6)" : "0 0 10px rgba(255,50,50,0.6)",
        }}>
          {won ? "[SIGNAL DECODED]" : "[SIGNAL LOST]"}
        </div>
        <h3 style={{
          fontSize: 18, fontWeight: 700, color: won ? "#33ff33" : "#ff3333", margin: "0 0 8px",
          fontFamily: "'IBM Plex Mono', monospace",
          textShadow: won ? "0 0 12px rgba(51,255,51,0.5)" : "0 0 12px rgba(255,50,50,0.5)",
        }}>
          {won ? "DECRYPTION COMPLETE" : "TRANSMISSION TERMINATED"}
        </h3>
        <p style={{
          color: "#1a5a1a", fontSize: 13, margin: "0 0 4px",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          // INTERCEPTED SIGNAL
        </p>
        <p style={{
          fontSize: 26, fontWeight: 700,
          color: won ? "#33ff33" : "#ff3333",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: 8, margin: "0 0 20px",
          textShadow: won ? "0 0 16px rgba(51,255,51,0.6)" : "0 0 16px rgba(255,50,50,0.6)",
        }}>{word}</p>
        {won && (
          <p style={{
            color: "#1a5a1a", fontSize: 12, margin: "0 0 20px",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {queriesUsed} / {MAX_QUERIES} scans utilized
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onShare} style={{
            flex: 1, padding: "12px",
            background: "rgba(51,255,51,0.15)",
            border: "1px solid rgba(51,255,51,0.4)", borderRadius: 2,
            color: "#33ff33", fontSize: 12, fontWeight: 700,
            cursor: "pointer", letterSpacing: 3,
            fontFamily: "'IBM Plex Mono', monospace",
            textShadow: "0 0 6px rgba(51,255,51,0.4)",
          }}>TRANSMIT</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px",
            background: "rgba(51,255,51,0.03)",
            border: "1px solid rgba(51,255,51,0.15)", borderRadius: 2,
            color: "#1a5a1a", fontSize: 12, cursor: "pointer", letterSpacing: 2,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>DISMISS</button>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [secretWord] = useState(getDailyWord);

  const shiftedGrid = useMemo(() => {
    const secretSet = new Set(secretWord.split(""));
    const remaining = ALPHABET.filter(entry =>
      !entry.split("").some(ch => secretSet.has(ch))
    );
    return remaining;
  }, [secretWord]);

  const [revealedPositions, setRevealedPositions] = useState(() => {
    const saved = loadDailyState();
    if (saved && saved.revealedPositions) return saved.revealedPositions;
    return {};
  });

  const [queriesUsed, setQueriesUsed] = useState(() => {
    const saved = loadDailyState();
    return saved ? saved.queriesUsed : 0;
  });

  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(() => {
    const saved = loadDailyState();
    return saved ? saved.gameOver : false;
  });
  const [won, setWon] = useState(() => {
    const saved = loadDailyState();
    return saved ? saved.won : false;
  });
  const [showGuessInput, setShowGuessInput] = useState(false);
  const [wrongGuess, setWrongGuess] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(() => {
    const saved = loadDailyState();
    return !saved;
  });
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(loadStats);
  const inputRef = useRef(null);
  const queriesLeft = MAX_QUERIES - queriesUsed;

  // Inject CRT styles on mount
  useEffect(() => {
    injectCRTStyles();
  }, []);

  // Save state on changes
  useEffect(() => {
    saveDailyState({ revealedPositions, queriesUsed, gameOver, won });
  }, [revealedPositions, queriesUsed, gameOver, won]);

  // Restore guess input visibility for mid-game reload
  useEffect(() => {
    if (!gameOver && queriesUsed >= MAX_QUERIES) {
      setShowGuessInput(true);
    }
  }, []);

  const handleReveal = useCallback((posIndex) => {
    if (gameOver || revealedPositions[posIndex] || queriesUsed >= MAX_QUERIES) return;

    const newRevealed = { ...revealedPositions, [posIndex]: true };
    const newQueries = queriesUsed + 1;

    setRevealedPositions(newRevealed);
    setQueriesUsed(newQueries);

    if (newQueries >= MAX_QUERIES) {
      setShowGuessInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [gameOver, revealedPositions, queriesUsed, shiftedGrid]);

  const handleGuess = useCallback(() => {
    const g = guess.toUpperCase().trim();
    if (g.length !== 5) return;

    if (g === secretWord) {
      setWon(true);
      setGameOver(true);
      const newStats = { ...stats };
      newStats.played += 1;
      newStats.won += 1;
      newStats.streak += 1;
      newStats.maxStreak = Math.max(newStats.streak, newStats.maxStreak);
      newStats.lastDate = new Date().toDateString();
      setStats(newStats);
      saveStats(newStats);
      setTimeout(() => setShowResult(true), 600);
    } else {
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 800);
      setGuess("");
    }
  }, [guess, secretWord, stats]);

  const handleGiveUp = useCallback(() => {
    setGameOver(true);
    setWon(false);
    const newStats = { ...stats };
    newStats.played += 1;
    newStats.streak = 0;
    newStats.lastDate = new Date().toDateString();
    setStats(newStats);
    saveStats(newStats);
    setTimeout(() => setShowResult(true), 300);
  }, [stats]);

  const generateShareText = () => {
    const dayNum = getDayNumber();
    const grid = Array.from({ length: 20 }, (_, i) => {
      if (!revealedPositions[i]) return "\u2B1C";
      return "\u2B1B";
    });
    const rows = [];
    for (let i = 0; i < 20; i += 5) {
      rows.push(grid.slice(i, i + 5).join(""));
    }
    return `Signal Intercept #${dayNum} ${won ? queriesUsed + "/" + MAX_QUERIES : "X/" + MAX_QUERIES}\n\n${rows.join("\n")}`;
  };

  const handleShare = () => {
    const text = generateShareText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard input
  useEffect(() => {
    const handler = (e) => {
      if (showHelp || showStats || showResult) return;
      if (!showGuessInput && !gameOver) {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= "A" && key <= "Z") {
          // Map letter keys to alphabet positions: A=0, B=1, ... X/Y=23, Z=24
          let alphaIndex;
          if (key === "Y") {
            alphaIndex = 23; // XY slot
          } else if (key >= "A" && key <= "W") {
            alphaIndex = key.charCodeAt(0) - 65; // A=0 through W=22
          } else if (key === "X") {
            alphaIndex = 23; // XY slot
          } else {
            // Z
            alphaIndex = 24;
          }
          handleReveal(alphaIndex);
        }
      }
      if (showGuessInput && !gameOver) {
        if (e.key === "Enter") {
          handleGuess();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showGuessInput, gameOver, handleReveal, handleGuess, showHelp, showStats, showResult]);

  const dayNum = getDayNumber();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f0a",
      color: "#33ff33",
      fontFamily: "'IBM Plex Mono', monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px",
      position: "relative",
      overflow: "hidden",
      animation: "crt-flicker 4s infinite",
    }}>
      {/* CRT scan line overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)",
        backgroundSize: "100% 2px",
      }} />

      {/* Noise/grain texture overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.04, zIndex: 49,
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* CRT screen curvature container */}
      <div style={{
        width: "100%", maxWidth: 460,
        display: "flex", flexDirection: "column", alignItems: "center",
        borderRadius: 12,
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.6), 0 0 40px rgba(51,255,51,0.05)",
        position: "relative",
      }}>

        {/* Header */}
        <div style={{
          width: "100%", maxWidth: 420,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0 16px",
          borderBottom: "1px solid rgba(51,255,51,0.1)",
        }}>
          <button onClick={() => setShowHelp(true)} style={{
            background: "none", border: "1px solid rgba(51,255,51,0.2)",
            color: "#33ff33", fontSize: 14, cursor: "pointer", padding: "2px 8px",
            fontFamily: "'IBM Plex Mono', monospace",
            textShadow: "0 0 6px rgba(51,255,51,0.4)",
            borderRadius: 2,
          }}>?</button>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 20, fontWeight: 700, letterSpacing: 8,
              textTransform: "uppercase", color: "#33ff33",
              textShadow: "0 0 12px rgba(51,255,51,0.6), 0 0 24px rgba(51,255,51,0.2)",
            }}>SIGNAL INTERCEPT</div>
            <div style={{
              fontSize: 10, color: "#1a5a1a", letterSpacing: 3, marginTop: 4,
              textShadow: "0 0 4px rgba(51,255,51,0.2)",
            }}>
              #{dayNum} // FREQ 7.042 MHz
            </div>
          </div>
          <button onClick={() => setShowStats(true)} style={{
            background: "none", border: "1px solid rgba(51,255,51,0.2)",
            color: "#33ff33", fontSize: 12, cursor: "pointer", padding: "2px 8px",
            fontFamily: "'IBM Plex Mono', monospace",
            textShadow: "0 0 6px rgba(51,255,51,0.4)",
            borderRadius: 2,
            letterSpacing: 1,
          }}>LOG</button>
        </div>

        {/* Query counter */}
        <div style={{
          width: "100%", maxWidth: 420,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0 8px",
        }}>
          <div style={{
            fontSize: 10, color: "#1a5a1a", letterSpacing: 3,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            SCAN
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: MAX_QUERIES }).map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: 1,
                background: i < queriesUsed
                  ? "rgba(51,255,51,0.3)"
                  : "rgba(51,255,51,0.06)",
                transition: "background 0.05s steps(1)",
              }} />
            ))}
          </div>
          <div style={{
            fontSize: 12, color: queriesLeft <= 3 ? "#ff3333" : "#1a5a1a",
            fontWeight: 700, minWidth: 24, textAlign: "right",
            fontFamily: "'IBM Plex Mono', monospace",
            textShadow: queriesLeft <= 3 ? "0 0 8px rgba(255,50,50,0.5)" : "0 0 4px rgba(51,255,51,0.2)",
          }}>
            {queriesLeft}
          </div>
        </div>

        {/* Letter grid */}
        <div style={{
          width: "100%", maxWidth: 320,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 4, padding: "8px 0",
        }}>
          {shiftedGrid.map((letter, i) => (
            <Tile
              key={i}
              letter={letter}
              isRevealed={!!revealedPositions[i]}
              onClick={() => handleReveal(i)}
              disabled={gameOver || !!revealedPositions[i] || queriesUsed >= MAX_QUERIES}
              index={i}
            />
          ))}
        </div>

        {/* Guess area */}
        {showGuessInput && !gameOver && (
          <div style={{
            width: "100%", maxWidth: 420,
            padding: "20px 0", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
          }}>
            <div style={{
              fontSize: 11, color: "#1a5a1a", letterSpacing: 2, textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
{"> SUBMIT DECRYPTION KEY_"}
            </div>
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <input
                ref={inputRef}
                type="text"
                maxLength={5}
                value={guess}
                onChange={e => setGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                placeholder="_ _ _ _ _"
                style={{
                  flex: 1, padding: "14px 16px",
                  background: wrongGuess ? "rgba(255,50,50,0.1)" : "rgba(51,255,51,0.03)",
                  border: wrongGuess ? "1px solid #ff3333" : "1px solid rgba(51,255,51,0.2)",
                  borderRadius: 2, color: "#33ff33",
                  fontSize: 20, fontWeight: 700,
                  letterSpacing: 10, textAlign: "center",
                  fontFamily: "'IBM Plex Mono', monospace",
                  outline: "none",
                  transition: "all 0.05s steps(1)",
                  textShadow: "0 0 8px rgba(51,255,51,0.5)",
                  boxShadow: wrongGuess
                    ? "0 0 15px rgba(255,50,50,0.2)"
                    : "inset 0 0 20px rgba(0,0,0,0.3)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <button onClick={handleGuess} style={{
                flex: 1, padding: "12px",
                background: guess.length === 5 ? "rgba(51,255,51,0.15)" : "rgba(51,255,51,0.03)",
                border: guess.length === 5 ? "1px solid rgba(51,255,51,0.5)" : "1px solid rgba(51,255,51,0.1)",
                borderRadius: 2,
                color: guess.length === 5 ? "#33ff33" : "#1a3a1a",
                fontSize: 12, fontWeight: 700, letterSpacing: 3,
                cursor: guess.length === 5 ? "pointer" : "default",
                transition: "all 0.05s steps(1)",
                fontFamily: "'IBM Plex Mono', monospace",
                textShadow: guess.length === 5 ? "0 0 8px rgba(51,255,51,0.5)" : "none",
              }}>DECRYPT</button>
              <button onClick={handleGiveUp} style={{
                padding: "12px 20px",
                background: "rgba(255,50,50,0.05)",
                border: "1px solid rgba(255,50,50,0.2)", borderRadius: 2,
                color: "#ff3333", fontSize: 12, letterSpacing: 2,
                cursor: "pointer",
                fontFamily: "'IBM Plex Mono', monospace",
                textShadow: "0 0 6px rgba(255,50,50,0.3)",
              }}>ABORT MISSION</button>
            </div>
          </div>
        )}

        {/* Pre-guess actions */}
        {!showGuessInput && !gameOver && queriesUsed > 0 && (
          <div style={{
            width: "100%", maxWidth: 420, padding: "16px 0",
            display: "flex", gap: 8,
          }}>
            <button
              onClick={() => {
                setShowGuessInput(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(51,255,51,0.02)",
                border: "1px solid rgba(51,255,51,0.1)",
                borderRadius: 2,
                color: "#1a5a1a",
                fontSize: 11, fontWeight: 600, letterSpacing: 3,
                cursor: "pointer", transition: "all 0.05s steps(1)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              DECRYPT NOW
            </button>
          </div>
        )}

        {/* Game over but result closed */}
        {gameOver && !showResult && (
          <div style={{
            width: "100%", maxWidth: 420, padding: "20px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <div style={{
              fontSize: 26, fontWeight: 700,
              color: won ? "#33ff33" : "#ff3333",
              letterSpacing: 8,
              fontFamily: "'IBM Plex Mono', monospace",
              textShadow: won ? "0 0 16px rgba(51,255,51,0.6)" : "0 0 16px rgba(255,50,50,0.6)",
            }}>{secretWord}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleShare} style={{
                padding: "10px 24px",
                background: "rgba(51,255,51,0.12)",
                border: "1px solid rgba(51,255,51,0.4)", borderRadius: 2,
                color: "#33ff33", fontSize: 11, fontWeight: 700,
                letterSpacing: 3, cursor: "pointer",
                fontFamily: "'IBM Plex Mono', monospace",
                textShadow: "0 0 6px rgba(51,255,51,0.4)",
              }}>{copied ? "TRANSMITTED" : "TRANSMIT"}</button>
              <button onClick={() => setShowResult(true)} style={{
                padding: "10px 24px",
                background: "rgba(51,255,51,0.03)",
                border: "1px solid rgba(51,255,51,0.12)", borderRadius: 2,
                color: "#1a5a1a", fontSize: 11, letterSpacing: 2, cursor: "pointer",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>DEBRIEF</button>
            </div>
          </div>
        )}

        {/* Tap / keyboard hint */}
        {queriesUsed === 0 && !showHelp && (
          <div style={{
            padding: "24px 0",
            fontSize: 11, color: "#1a3a1a", letterSpacing: 3,
            textAlign: "center",
            fontFamily: "'IBM Plex Mono', monospace",
            textShadow: "0 0 4px rgba(51,255,51,0.15)",
          }}>
            SCAN A NODE TO REVEAL
          </div>
        )}

      </div>

      {/* Modals */}
      {showHelp && <HowToModal onClose={() => setShowHelp(false)} />}
      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
      {showResult && (
        <ResultModal
          won={won}
          word={secretWord}
          queriesUsed={queriesUsed}
          onShare={handleShare}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
}
