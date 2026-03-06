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

// --- Neon color constants ---
const NEON_PINK = "#ff2d7b";
const NEON_CYAN = "#00f0ff";
const NEON_GREEN = "#39ff14";
const NEON_RED = "#ff0040";
const BG_BLACK = "#000000";
const BG_PURPLE = "#0a0010";

const glowPink = (intensity = 1) => `0 0 ${5 * intensity}px ${NEON_PINK}, 0 0 ${20 * intensity}px ${NEON_PINK}, 0 0 ${40 * intensity}px ${NEON_PINK}80`;
const glowCyan = (intensity = 1) => `0 0 ${5 * intensity}px ${NEON_CYAN}, 0 0 ${20 * intensity}px ${NEON_CYAN}, 0 0 ${40 * intensity}px ${NEON_CYAN}80`;
const glowGreen = (intensity = 1) => `0 0 ${5 * intensity}px ${NEON_GREEN}, 0 0 ${20 * intensity}px ${NEON_GREEN}, 0 0 ${40 * intensity}px ${NEON_GREEN}80`;
const textGlowPink = `0 0 7px ${NEON_PINK}, 0 0 20px ${NEON_PINK}, 0 0 40px ${NEON_PINK}80`;
const textGlowCyan = `0 0 7px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}, 0 0 40px ${NEON_CYAN}80`;
const textGlowGreen = `0 0 7px ${NEON_GREEN}, 0 0 20px ${NEON_GREEN}, 0 0 40px ${NEON_GREEN}80`;

// --- Inject global CSS for fonts, keyframes, and effects ---
function useInjectStyles() {
  useEffect(() => {
    const id = "codex-cyberpunk-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500;600;700&display=swap');

      @keyframes cyberpunk-glitch-title {
        0%, 92%, 100% {
          transform: translate(0, 0);
          text-shadow: 0 0 7px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}, 0 0 40px ${NEON_CYAN}80;
          clip-path: none;
        }
        93% {
          transform: translate(-3px, 0);
          text-shadow: -2px 0 ${NEON_PINK}, 2px 0 ${NEON_CYAN}, 0 0 20px ${NEON_CYAN};
          clip-path: inset(20% 0 40% 0);
        }
        94% {
          transform: translate(3px, 0);
          text-shadow: 2px 0 ${NEON_PINK}, -2px 0 ${NEON_CYAN}, 0 0 20px ${NEON_PINK};
          clip-path: inset(60% 0 10% 0);
        }
        95% {
          transform: translate(-2px, 1px);
          text-shadow: -2px 0 ${NEON_PINK}, 2px 0 ${NEON_GREEN}, 0 0 20px ${NEON_CYAN};
          clip-path: inset(10% 0 70% 0);
        }
        96% {
          transform: translate(0, 0);
          text-shadow: 0 0 7px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}, 0 0 40px ${NEON_CYAN}80;
          clip-path: none;
        }
      }

      @keyframes cyberpunk-scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }

      @keyframes cyberpunk-pulse-glow {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }

      @keyframes cyberpunk-tile-glitch {
        0% { transform: translate(0, 0); filter: none; }
        20% { transform: translate(-4px, 0); filter: hue-rotate(90deg); }
        40% { transform: translate(4px, 0); filter: hue-rotate(-90deg); }
        60% { transform: translate(-2px, 1px); filter: hue-rotate(45deg); }
        80% { transform: translate(2px, -1px); filter: hue-rotate(-45deg); }
        100% { transform: translate(0, 0); filter: none; }
      }

      @keyframes cyberpunk-decode-flash {
        0%, 100% { opacity: 1; }
        25% { opacity: 0.3; color: ${NEON_CYAN}; }
        50% { opacity: 0.8; color: ${NEON_GREEN}; }
        75% { opacity: 0.5; color: ${NEON_PINK}; }
      }

      @keyframes cyberpunk-win-flash {
        0% { opacity: 0; background: ${NEON_GREEN}; }
        30% { opacity: 0.4; background: ${NEON_GREEN}; }
        100% { opacity: 0; background: ${NEON_GREEN}; }
      }

      @keyframes cyberpunk-loss-distort {
        0% { transform: skew(0deg, 0deg); filter: none; }
        20% { transform: skew(-3deg, 1deg); filter: hue-rotate(90deg) brightness(1.5); }
        40% { transform: skew(2deg, -1deg); filter: hue-rotate(-60deg) contrast(1.5); }
        60% { transform: skew(-1deg, 2deg); filter: hue-rotate(180deg) brightness(0.8); }
        80% { transform: skew(1deg, -1deg); filter: hue-rotate(-120deg); }
        100% { transform: skew(0deg, 0deg); filter: none; }
      }

      @keyframes cyberpunk-data-stream {
        0% { background-position: 0% 0%; }
        100% { background-position: 0% 100%; }
      }

      @keyframes cyberpunk-border-pulse {
        0%, 100% { box-shadow: 0 0 5px ${NEON_CYAN}40, 0 0 15px ${NEON_CYAN}20; }
        50% { box-shadow: 0 0 8px ${NEON_CYAN}60, 0 0 25px ${NEON_CYAN}30, 0 0 40px ${NEON_CYAN}10; }
      }

      @keyframes cyberpunk-hover-jitter {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-1px); }
        75% { transform: translateX(1px); }
      }

      @keyframes cyberpunk-wrong-shake {
        0%, 100% { transform: translateX(0); }
        10% { transform: translateX(-6px); }
        20% { transform: translateX(6px); }
        30% { transform: translateX(-4px); }
        40% { transform: translateX(4px); }
        50% { transform: translateX(-2px); }
        60% { transform: translateX(2px); }
      }

      .cyberpunk-tile:hover:not(:disabled) {
        animation: cyberpunk-hover-jitter 0.15s linear infinite;
      }

      .cyberpunk-tile-glitch-active {
        animation: cyberpunk-tile-glitch 0.15s linear 1 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);
}

// --- Components ---

function Tile({ posIndex, shiftedGrid, revealed, onClick, disabled, justRevealed }) {
  const entry = shiftedGrid[posIndex];
  const isRevealed = !!revealed;

  if (isRevealed) {
    return (
      <button
        className={`cyberpunk-tile ${justRevealed ? "cyberpunk-tile-glitch-active" : ""}`}
        disabled
        style={{
          width: "100%",
          aspectRatio: "1 / 1.1",
          border: `1px solid ${NEON_CYAN}20`,
          borderRadius: 2,
          background: "rgba(0,240,255,0.02)",
          color: `${NEON_CYAN}40`,
          fontSize: entry && entry.length > 1 ? 13 : 16,
          fontFamily: "'Fira Code', monospace",
          fontWeight: 700,
          cursor: "default",
          transition: "all 0.2s ease",
          opacity: 0.5,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          boxShadow: "none",
          textShadow: "none",
        }}
      >
        {entry}
      </button>
    );
  }

  return (
    <button
      className={`cyberpunk-tile ${justRevealed ? "cyberpunk-tile-glitch-active" : ""}`}
      onClick={() => !disabled && onClick(posIndex)}
      disabled={disabled}
      style={{
        width: "100%",
        aspectRatio: "1 / 1.1",
        border: `1px solid ${NEON_CYAN}30`,
        borderRadius: 2,
        background: "rgba(0,240,255,0.03)",
        color: NEON_CYAN,
        fontSize: 16,
        fontFamily: "'Fira Code', monospace",
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        boxShadow: `0 0 5px ${NEON_CYAN}20, inset 0 0 10px ${NEON_CYAN}05`,
        textShadow: `0 0 5px ${NEON_CYAN}40`,
        animation: !disabled ? "cyberpunk-border-pulse 3s infinite" : "none",
      }}
    >
      {" "}
    </button>
  );
}

function StatsModal({ stats, onClose }) {
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const statItems = [
    { label: "Played", value: stats.played },
    { label: "Win %", value: winPct },
    { label: "Streak", value: stats.streak },
    { label: "Best", value: stats.maxStreak },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(12px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(135deg, #05000a 0%, ${BG_BLACK} 100%)`,
        border: `1px solid ${NEON_CYAN}40`,
        borderRadius: 2, padding: "32px 28px", maxWidth: 340, width: "90%",
        boxShadow: `0 0 30px ${NEON_CYAN}15, inset 0 0 30px ${BG_PURPLE}`,
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 14, letterSpacing: 6,
          textTransform: "uppercase", color: NEON_CYAN, margin: "0 0 24px",
          fontFamily: "'Orbitron', sans-serif",
          textShadow: textGlowCyan,
        }}>METRICS</h3>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 28 }}>
          {statItems.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 32, fontWeight: 700, color: NEON_PINK,
                fontFamily: "'Orbitron', sans-serif",
                textShadow: textGlowPink,
              }}>{s.value}</div>
              <div style={{
                fontSize: 10, color: `${NEON_CYAN}80`, marginTop: 6, letterSpacing: 2,
                fontFamily: "'Fira Code', monospace",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px",
          background: "transparent",
          border: `1px solid ${NEON_CYAN}40`, borderRadius: 2,
          color: NEON_CYAN, fontSize: 12, cursor: "pointer", letterSpacing: 3,
          fontFamily: "'Orbitron', sans-serif",
          textShadow: `0 0 5px ${NEON_CYAN}60`,
          transition: "all 0.2s",
        }}>CLOSE</button>
      </div>
    </div>
  );
}

function HowToModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(12px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(135deg, #05000a 0%, ${BG_BLACK} 100%)`,
        border: `1px solid ${NEON_CYAN}40`,
        borderRadius: 2, padding: "32px 24px", maxWidth: 380, width: "90%",
        boxShadow: `0 0 30px ${NEON_CYAN}15, inset 0 0 30px ${BG_PURPLE}`,
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 14, letterSpacing: 6,
          textTransform: "uppercase", color: NEON_CYAN, margin: "0 0 20px",
          fontFamily: "'Orbitron', sans-serif",
          textShadow: textGlowCyan,
        }}>README.md</h3>
        <div style={{
          fontSize: 13, lineHeight: 1.8, color: `${NEON_CYAN}aa`,
          fontFamily: "'Fira Code', monospace",
        }}>
          <p style={{ margin: "0 0 16px" }}>
            A 5-character encryption key protects the target system. The key fragments have been <strong style={{ color: NEON_PINK, textShadow: `0 0 5px ${NEON_PINK}60` }}>removed</strong> from the data matrix, and remaining nodes shift to fill the gaps.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            The matrix shows <span style={{ color: NEON_CYAN, fontWeight: 700, textShadow: `0 0 5px ${NEON_CYAN}60` }}>20 blank nodes</span>. Scan any node to reveal which character now occupies that position.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            <span style={{ color: NEON_PINK, fontWeight: 700, textShadow: `0 0 5px ${NEON_PINK}60` }}>Compare</span> revealed characters to expected positions. Skipped characters are part of the encryption key.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            You have <strong style={{ color: NEON_PINK, textShadow: `0 0 5px ${NEON_PINK}60` }}>14 cycles</strong> to crack all 5 fragments.
            Once identified, reconstruct the key and inject your payload.
          </p>
          <p style={{ margin: "0 0 4px", color: `${NEON_CYAN}50`, fontSize: 12 }}>
            // TIP: scan nodes at strategic intervals to detect shifts in the matrix
          </p>
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", marginTop: 16,
          background: `${NEON_PINK}15`,
          border: `1px solid ${NEON_PINK}60`, borderRadius: 2,
          color: NEON_PINK, fontSize: 12, fontWeight: 700,
          cursor: "pointer", letterSpacing: 3,
          fontFamily: "'Orbitron', sans-serif",
          textShadow: `0 0 5px ${NEON_PINK}60`,
          boxShadow: `0 0 15px ${NEON_PINK}15`,
          transition: "all 0.2s",
        }}>EXECUTE</button>
      </div>
    </div>
  );
}

function ResultModal({ won, word, queriesUsed, onShare, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(12px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: `linear-gradient(135deg, #05000a 0%, ${BG_BLACK} 100%)`,
        border: `1px solid ${won ? `${NEON_GREEN}60` : `${NEON_RED}60`}`,
        borderRadius: 2, padding: "32px 28px", maxWidth: 340, width: "90%",
        textAlign: "center",
        boxShadow: won
          ? `0 0 40px ${NEON_GREEN}20, inset 0 0 30px ${NEON_GREEN}05`
          : `0 0 40px ${NEON_RED}20, inset 0 0 30px ${NEON_RED}05`,
      }}>
        <div style={{
          fontSize: 14, marginBottom: 12, letterSpacing: 4,
          fontFamily: "'Fira Code', monospace",
          color: won ? NEON_GREEN : NEON_RED,
        }}>{won ? "[OK]" : "[ERR]"}</div>
        <h3 style={{
          fontSize: 18, fontWeight: 800, margin: "0 0 12px",
          fontFamily: "'Orbitron', sans-serif",
          color: won ? NEON_GREEN : NEON_RED,
          textShadow: won ? textGlowGreen : `0 0 7px ${NEON_RED}, 0 0 20px ${NEON_RED}, 0 0 40px ${NEON_RED}80`,
          letterSpacing: 4,
        }}>
          {won ? "ACCESS GRANTED" : "CONNECTION TERMINATED"}
        </h3>
        <p style={{ color: `${NEON_CYAN}60`, fontSize: 12, margin: "0 0 4px", fontFamily: "'Fira Code', monospace" }}>
          Decryption key:
        </p>
        <p style={{
          fontSize: won ? 36 : 28, fontWeight: 800,
          color: won ? NEON_GREEN : NEON_RED,
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: 8, margin: "0 0 20px",
          textShadow: won ? textGlowGreen : `0 0 7px ${NEON_RED}, 0 0 20px ${NEON_RED}`,
        }}>{word}</p>
        {won && (
          <p style={{
            color: `${NEON_CYAN}50`, fontSize: 12, margin: "0 0 20px",
            fontFamily: "'Fira Code', monospace",
          }}>
            {queriesUsed} / {MAX_QUERIES} cycles expended
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onShare} style={{
            flex: 1, padding: "12px",
            background: `${NEON_PINK}20`,
            border: `1px solid ${NEON_PINK}80`, borderRadius: 2,
            color: NEON_PINK, fontSize: 12, fontWeight: 700,
            cursor: "pointer", letterSpacing: 3,
            fontFamily: "'Orbitron', sans-serif",
            textShadow: `0 0 5px ${NEON_PINK}60`,
            boxShadow: `0 0 15px ${NEON_PINK}15`,
          }}>EXFILTRATE</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px",
            background: "transparent",
            border: `1px solid ${NEON_CYAN}30`, borderRadius: 2,
            color: `${NEON_CYAN}80`, fontSize: 12, cursor: "pointer", letterSpacing: 2,
            fontFamily: "'Fira Code', monospace",
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  useInjectStyles();

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
  const [lastRevealed, setLastRevealed] = useState(null);
  const [winFlash, setWinFlash] = useState(false);
  const [lossGlitch, setLossGlitch] = useState(false);
  const inputRef = useRef(null);

  const queriesLeft = MAX_QUERIES - queriesUsed;

  // Restore mid-game guess input state
  useEffect(() => {
    if (!gameOver && queriesUsed >= MAX_QUERIES) {
      setShowGuessInput(true);
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    saveDailyState({ revealedPositions, queriesUsed, gameOver, won });
  }, [revealedPositions, queriesUsed, gameOver, won]);

  const handleReveal = useCallback((posIndex) => {
    if (gameOver || revealedPositions[posIndex] || queriesUsed >= MAX_QUERIES) return;

    const newRevealed = { ...revealedPositions, [posIndex]: true };
    const newQueries = queriesUsed + 1;

    setRevealedPositions(newRevealed);
    setQueriesUsed(newQueries);
    setLastRevealed(posIndex);
    setTimeout(() => setLastRevealed(null), 200);

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
      setWinFlash(true);
      setTimeout(() => setWinFlash(false), 600);
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
    setLossGlitch(true);
    setTimeout(() => setLossGlitch(false), 500);
    const newStats = { ...stats };
    newStats.played += 1;
    newStats.streak = 0;
    newStats.lastDate = new Date().toDateString();
    setStats(newStats);
    saveStats(newStats);
    setTimeout(() => setShowResult(true), 600);
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
    return `Codex #${dayNum} ${won ? queriesUsed + "/" + MAX_QUERIES : "X/" + MAX_QUERIES}\n\n${rows.join("\n")}`;
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
          // Map letter keys to alphabet positions: A=0, B=1, ..., Z=24
          // X and Y both map to 23 (since XY shares a node), Z=24
          let alphaIndex;
          if (key === "Y") {
            alphaIndex = 23; // XY position
          } else if (key === "Z") {
            alphaIndex = 24;
          } else {
            alphaIndex = key.charCodeAt(0) - 65; // A=0 through X=23
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
      background: `radial-gradient(ellipse at 50% 30%, ${BG_PURPLE} 0%, ${BG_BLACK} 70%)`,
      color: "#fff",
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px",
      position: "relative",
      overflow: "hidden",
      animation: lossGlitch ? "cyberpunk-loss-distort 0.5s ease-out 1" : "none",
    }}>
      {/* Win flash overlay */}
      {winFlash && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200,
          animation: "cyberpunk-win-flash 0.6s ease-out 1 forwards",
        }} />
      )}

      {/* Scan lines overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 3px,
          ${NEON_PINK}04 3px,
          ${NEON_PINK}04 4px
        )`,
        opacity: 0.5,
      }} />

      {/* Data stream background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='400'%3E%3Ctext x='2' y='20' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='40' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3Ctext x='2' y='60' fill='%23ff2d7b' font-family='monospace' font-size='12'%3EA%3C/text%3E%3Ctext x='2' y='80' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='100' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3Ctext x='2' y='120' fill='%23ff2d7b' font-family='monospace' font-size='12'%3EF%3C/text%3E%3Ctext x='2' y='140' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='160' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3Ctext x='2' y='180' fill='%23ff2d7b' font-family='monospace' font-size='12'%3EC%3C/text%3E%3Ctext x='2' y='200' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='220' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3Ctext x='2' y='240' fill='%23ff2d7b' font-family='monospace' font-size='12'%3E7%3C/text%3E%3Ctext x='2' y='260' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='280' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3Ctext x='2' y='300' fill='%23ff2d7b' font-family='monospace' font-size='12'%3E9%3C/text%3E%3Ctext x='2' y='320' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='340' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3Ctext x='2' y='360' fill='%23ff2d7b' font-family='monospace' font-size='12'%3EB%3C/text%3E%3Ctext x='2' y='380' fill='%2300f0ff' font-family='monospace' font-size='12'%3E0%3C/text%3E%3Ctext x='2' y='400' fill='%2300f0ff' font-family='monospace' font-size='12'%3E1%3C/text%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "20px 400px",
        animation: "cyberpunk-data-stream 8s linear infinite",
      }} />

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 420,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 0 16px",
        borderBottom: `1px solid ${NEON_CYAN}15`,
      }}>
        <button onClick={() => setShowHelp(true)} style={{
          background: "none", border: `1px solid ${NEON_CYAN}30`, borderRadius: 2,
          color: NEON_CYAN, fontSize: 14, cursor: "pointer", padding: "4px 8px",
          fontFamily: "'Fira Code', monospace", fontWeight: 700,
          textShadow: `0 0 5px ${NEON_CYAN}60`,
        }}>?</button>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: 12,
            textTransform: "uppercase", color: NEON_CYAN,
            fontFamily: "'Orbitron', sans-serif",
            animation: "cyberpunk-glitch-title 4s infinite",
            textShadow: textGlowCyan,
          }}>CODEX</div>
          <div style={{
            fontSize: 9, color: `${NEON_PINK}80`, letterSpacing: 3, marginTop: 4,
            fontFamily: "'Fira Code', monospace",
            textShadow: `0 0 5px ${NEON_PINK}30`,
          }}>
            BREACH PROTOCOL v{dayNum}.0
          </div>
        </div>
        <button onClick={() => setShowStats(true)} style={{
          background: "none", border: `1px solid ${NEON_CYAN}30`, borderRadius: 2,
          color: NEON_CYAN, fontSize: 11, cursor: "pointer", padding: "4px 8px",
          fontFamily: "'Fira Code', monospace", fontWeight: 700,
          textShadow: `0 0 5px ${NEON_CYAN}60`,
          letterSpacing: 1,
        }}>[S]</button>
      </div>

      {/* Query counter */}
      <div style={{
        width: "100%", maxWidth: 420,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0 8px",
      }}>
        <div style={{
          fontSize: 10, color: `${NEON_CYAN}60`, letterSpacing: 3,
          fontFamily: "'Orbitron', sans-serif",
          textShadow: `0 0 3px ${NEON_CYAN}30`,
        }}>
          CYCLES
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: MAX_QUERIES }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 1,
              background: i < queriesUsed
                ? `${NEON_CYAN}40`
                : `${NEON_CYAN}12`,
              boxShadow: "none",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 700, minWidth: 24, textAlign: "right",
          fontFamily: "'Orbitron', sans-serif",
          color: queriesLeft <= 3 ? NEON_RED : `${NEON_CYAN}60`,
          textShadow: queriesLeft <= 3 ? `0 0 8px ${NEON_RED}80` : `0 0 3px ${NEON_CYAN}30`,
        }}>
          {queriesLeft}
        </div>
      </div>

      {/* Letter grid */}
      <div style={{
        width: "100%", maxWidth: 320,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 5, padding: "8px 0",
      }}>
        {shiftedGrid.map((letter, i) => (
          <Tile
            key={i}
            posIndex={i}
            shiftedGrid={shiftedGrid}
            revealed={revealedPositions[i]}
            onClick={handleReveal}
            disabled={gameOver || !!revealedPositions[i] || queriesUsed >= MAX_QUERIES}
            justRevealed={lastRevealed === i}
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
            fontSize: 10, color: `${NEON_CYAN}60`, letterSpacing: 3,
            textTransform: "uppercase",
            fontFamily: "'Orbitron', sans-serif",
            textShadow: `0 0 3px ${NEON_CYAN}30`,
          }}>
            INJECT PAYLOAD &gt;_
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
                background: wrongGuess ? `${NEON_RED}15` : `${NEON_CYAN}05`,
                border: wrongGuess ? `1px solid ${NEON_RED}` : `1px solid ${NEON_CYAN}30`,
                borderRadius: 2, color: NEON_PINK,
                fontSize: 20, fontWeight: 700,
                letterSpacing: 8, textAlign: "center",
                fontFamily: "'Orbitron', sans-serif",
                outline: "none",
                textShadow: textGlowPink,
                boxShadow: wrongGuess
                  ? `0 0 15px ${NEON_RED}30, inset 0 0 15px ${NEON_RED}10`
                  : `0 0 10px ${NEON_CYAN}10, inset 0 0 15px ${NEON_CYAN}05`,
                transition: "all 0.3s",
                animation: wrongGuess ? "cyberpunk-wrong-shake 0.5s ease-out" : "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button onClick={handleGuess} style={{
              flex: 1, padding: "12px",
              background: guess.length === 5 ? `${NEON_PINK}20` : "transparent",
              border: guess.length === 5 ? `1px solid ${NEON_PINK}80` : `1px solid ${NEON_CYAN}15`,
              borderRadius: 2,
              color: guess.length === 5 ? NEON_PINK : `${NEON_CYAN}30`,
              fontSize: 12, fontWeight: 700, letterSpacing: 3,
              cursor: guess.length === 5 ? "pointer" : "default",
              fontFamily: "'Orbitron', sans-serif",
              textShadow: guess.length === 5 ? `0 0 5px ${NEON_PINK}60` : "none",
              boxShadow: guess.length === 5 ? `0 0 15px ${NEON_PINK}15` : "none",
              transition: "all 0.2s",
            }}>INJECT</button>
            <button onClick={handleGiveUp} style={{
              padding: "12px 20px",
              background: "transparent",
              border: `1px solid ${NEON_RED}30`, borderRadius: 2,
              color: `${NEON_RED}80`, fontSize: 11, letterSpacing: 2,
              cursor: "pointer",
              fontFamily: "'Fira Code', monospace",
              transition: "all 0.2s",
            }}>DISCONNECT</button>
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
              background: "transparent",
              border: `1px solid ${NEON_CYAN}15`,
              borderRadius: 2,
              color: `${NEON_CYAN}40`,
              fontSize: 11, fontWeight: 700, letterSpacing: 3,
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'Orbitron', sans-serif",
              textShadow: "none",
              boxShadow: "none",
            }}
          >
            INJECT NOW
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
            fontSize: 32, fontWeight: 800,
            color: won ? NEON_GREEN : NEON_RED,
            letterSpacing: 8,
            fontFamily: "'Orbitron', sans-serif",
            textShadow: won ? textGlowGreen : `0 0 7px ${NEON_RED}, 0 0 20px ${NEON_RED}, 0 0 40px ${NEON_RED}80`,
          }}>{secretWord}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleShare} style={{
              padding: "10px 24px",
              background: `${NEON_PINK}20`,
              border: `1px solid ${NEON_PINK}80`, borderRadius: 2,
              color: NEON_PINK, fontSize: 11, fontWeight: 700,
              letterSpacing: 3, cursor: "pointer",
              fontFamily: "'Orbitron', sans-serif",
              textShadow: `0 0 5px ${NEON_PINK}60`,
              boxShadow: `0 0 15px ${NEON_PINK}15`,
            }}>{copied ? "COPIED!" : "EXFILTRATE"}</button>
            <button onClick={() => setShowResult(true)} style={{
              padding: "10px 24px",
              background: "transparent",
              border: `1px solid ${NEON_CYAN}30`, borderRadius: 2,
              color: `${NEON_CYAN}60`, fontSize: 11, letterSpacing: 2, cursor: "pointer",
              fontFamily: "'Fira Code', monospace",
            }}>DETAILS</button>
          </div>
        </div>
      )}

      {/* Tap / keyboard hint */}
      {queriesUsed === 0 && !showHelp && (
        <div style={{
          padding: "24px 0",
          fontSize: 11, letterSpacing: 3,
          textAlign: "center",
          fontFamily: "'Fira Code', monospace",
          color: `${NEON_CYAN}30`,
          textShadow: `0 0 5px ${NEON_CYAN}15`,
          animation: "cyberpunk-pulse-glow 2s ease-in-out infinite",
        }}>
          SCAN A NODE TO REVEAL &gt;_
        </div>
      )}

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
