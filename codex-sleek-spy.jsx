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

function formatDate() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
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

// --- Inject global styles (fonts, keyframes, background grid) ---
const STYLE_ID = "codex-sleek-spy-styles";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;600;700&display=swap');

    @keyframes codex-grid-scroll {
      0% { transform: translate(0, 0); }
      100% { transform: translate(40px, 40px); }
    }

    @keyframes codex-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }

    @keyframes codex-pulse-border {
      0%, 100% { border-color: rgba(79, 195, 247, 0.15); }
      50% { border-color: rgba(79, 195, 247, 0.4); }
    }

    @keyframes codex-fade-scale-in {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes codex-slide-up-fade {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes codex-win-reveal {
      0% { opacity: 0; transform: scale(0.7); letter-spacing: 2px; }
      60% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); letter-spacing: 8px; }
    }

    @keyframes codex-loss-flash {
      0% { box-shadow: inset 0 0 0 0 rgba(224, 82, 82, 0); }
      30% { box-shadow: inset 0 0 120px 40px rgba(224, 82, 82, 0.25); }
      100% { box-shadow: inset 0 0 0 0 rgba(224, 82, 82, 0); }
    }

    @keyframes codex-modal-in {
      0% { opacity: 0; transform: scale(0.95) translateY(8px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes codex-backdrop-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// --- Theme constants ---
const T = {
  bg: "#0b0e17",
  bgGrad: "radial-gradient(ellipse at 50% 40%, #131a2e 0%, #0b0e17 70%)",
  accent: "#4fc3f7",
  amber: "#ffab40",
  red: "#e05252",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
  glassHover: "rgba(255,255,255,0.07)",
  text: "#c8d6e5",
  textMuted: "rgba(255,255,255,0.35)",
  textDim: "rgba(255,255,255,0.2)",
  headingFont: "'Space Grotesk', 'DM Sans', sans-serif",
  bodyFont: "'DM Sans', 'Inter', sans-serif",
  radius: 14,
  radiusSm: 10,
};

// --- Components ---

function Tile({ posIndex, revealed, letter, onClick, disabled }) {
  return (
    <button
      onClick={() => !disabled && !revealed && onClick(posIndex)}
      disabled={disabled || revealed}
      style={{
        width: "100%",
        aspectRatio: "1 / 1.1",
        border: `1px solid ${
          revealed
            ? "rgba(255,255,255,0.04)"
            : T.glassBorder
        }`,
        borderRadius: T.radiusSm,
        background: revealed
          ? "rgba(255,255,255,0.015)"
          : T.glass,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: revealed
          ? "rgba(255,255,255,0.4)"
          : "transparent",
        fontSize: letter && letter.length > 1 ? 13 : 17,
        fontFamily: T.headingFont,
        fontWeight: 600,
        cursor: disabled || revealed ? "default" : "pointer",
        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: "scale(1)",
        opacity: revealed ? 0.6 : 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "none",
        padding: 0,
        outline: "none",
        letterSpacing: letter && letter.length > 1 ? 1 : 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !revealed) {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.borderColor = "rgba(79,195,247,0.35)";
          e.currentTarget.style.background = "rgba(79,195,247,0.08)";
          e.currentTarget.style.color = T.accent;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !revealed) {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.borderColor = T.glassBorder;
          e.currentTarget.style.background = T.glass;
          e.currentTarget.style.color = "transparent";
        }
      }}
    >
      {revealed ? letter : ""}
    </button>
  );
}

function StatsModal({ stats, onClose }) {
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const statItems = [
    { label: "Missions", value: stats.played },
    { label: "Success %", value: winPct },
    { label: "Streak", value: stats.streak },
    { label: "Best", value: stats.maxStreak },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(5,7,14,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      animation: "codex-backdrop-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "rgba(15,20,35,0.85)",
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.radius + 2,
        padding: "36px 32px",
        maxWidth: 360, width: "90%",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        animation: "codex-modal-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 12, letterSpacing: 5,
          textTransform: "uppercase", color: T.accent, margin: "0 0 28px",
          fontFamily: T.headingFont, fontWeight: 500,
        }}>Dossier</h3>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 32 }}>
          {statItems.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 32, fontWeight: 700, color: "#fff",
                fontFamily: T.headingFont,
              }}>{s.value}</div>
              <div style={{
                fontSize: 10, color: T.textMuted, marginTop: 6,
                letterSpacing: 1.5, textTransform: "uppercase",
                fontFamily: T.bodyFont,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "13px", background: T.glass,
          border: `1px solid ${T.glassBorder}`, borderRadius: T.radiusSm,
          color: T.textMuted, fontSize: 12, cursor: "pointer",
          letterSpacing: 2, fontFamily: T.bodyFont, fontWeight: 500,
          transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          textTransform: "uppercase",
        }}>Dismiss</button>
      </div>
    </div>
  );
}

function HowToModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(5,7,14,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      animation: "codex-backdrop-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "rgba(15,20,35,0.85)",
        border: `1px solid ${T.glassBorder}`,
        borderRadius: T.radius + 2, padding: "36px 28px",
        maxWidth: 400, width: "90%",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        animation: "codex-modal-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 12, letterSpacing: 5,
          textTransform: "uppercase", color: T.accent, margin: "0 0 24px",
          fontFamily: T.headingFont, fontWeight: 500,
        }}>Briefing</h3>
        <div style={{
          fontSize: 14, lineHeight: 1.8, color: T.text,
          fontFamily: T.bodyFont,
        }}>
          <p style={{ margin: "0 0 16px" }}>
            A 5-letter cipher key is concealed. Its letters have been <strong style={{ color: "#fff" }}>removed</strong> from the signal grid, and remaining letters shift to fill the gaps.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            The grid shows <span style={{ color: T.accent, fontWeight: 600 }}>20 blank tiles</span>. Select any tile to reveal which letter now occupies that position.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            <strong style={{ color: "#fff" }}>Compare</strong> revealed letters to expected positions. Skipped letters are part of the cipher key. When found, they appear in <span style={{ color: T.amber, fontWeight: 700 }}>amber</span> above.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            You have <strong style={{ color: "#fff" }}>14 intel queries</strong> to identify all 5 letters.
            Once identified, unscramble and submit the cipher key.
          </p>
          <p style={{ margin: "0 0 4px", color: T.textMuted, fontSize: 13 }}>
            Field note: reveal consecutive positions to detect shifts and pinpoint removed letters.
          </p>
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "13px", marginTop: 20,
          background: "rgba(79,195,247,0.1)",
          border: `1px solid rgba(79,195,247,0.25)`, borderRadius: T.radiusSm,
          color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer",
          letterSpacing: 2, fontFamily: T.bodyFont,
          transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          textTransform: "uppercase",
        }}>Understood</button>
      </div>
    </div>
  );
}

function ResultModal({ won, word, queriesUsed, onShare, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(5,7,14,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      animation: "codex-backdrop-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "rgba(15,20,35,0.85)",
        border: `1px solid ${won ? "rgba(79,195,247,0.2)" : "rgba(224,82,82,0.2)"}`,
        borderRadius: T.radius + 2, padding: "36px 32px", maxWidth: 360, width: "90%",
        textAlign: "center",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        boxShadow: won
          ? "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(79,195,247,0.1)"
          : "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(224,82,82,0.1)",
        animation: won
          ? "codex-modal-in 0.4s cubic-bezier(0.25,0.46,0.45,0.94)"
          : "codex-modal-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94), codex-loss-flash 0.8s ease-out",
      }}>
        <div style={{
          fontSize: 13, letterSpacing: 5, textTransform: "uppercase",
          marginBottom: 8, fontFamily: T.headingFont, fontWeight: 500,
          color: won ? T.accent : T.red,
          opacity: 0.7,
        }}>
          STATUS
        </div>
        <h3 style={{
          fontSize: 24, fontWeight: 700,
          color: won ? "#fff" : T.red,
          margin: "0 0 16px",
          fontFamily: T.headingFont,
          animation: won ? "codex-win-reveal 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards" : "none",
          letterSpacing: won ? 8 : 4,
        }}>
          {won ? "DECRYPTED" : "COMPROMISED"}
        </h3>
        <p style={{
          color: T.textMuted, fontSize: 13, margin: "0 0 4px",
          fontFamily: T.bodyFont,
        }}>
          The cipher key was
        </p>
        <p style={{
          fontSize: 28, fontWeight: 700,
          color: won ? T.amber : T.red,
          fontFamily: T.headingFont,
          letterSpacing: 8, margin: "0 0 24px",
        }}>{word}</p>
        {won && (
          <p style={{
            color: T.textMuted, fontSize: 12, margin: "0 0 24px",
            fontFamily: T.bodyFont, letterSpacing: 1,
          }}>
            {queriesUsed} / {MAX_QUERIES} intel queries expended
          </p>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onShare} style={{
            flex: 1, padding: "13px",
            background: "rgba(79,195,247,0.15)",
            border: `1px solid rgba(79,195,247,0.3)`,
            borderRadius: T.radiusSm,
            color: T.accent, fontSize: 12, fontWeight: 700,
            cursor: "pointer", letterSpacing: 2,
            fontFamily: T.bodyFont,
            transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
            textTransform: "uppercase",
          }}>Debrief</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px", background: T.glass,
            border: `1px solid ${T.glassBorder}`, borderRadius: T.radiusSm,
            color: T.textMuted, fontSize: 12, cursor: "pointer",
            letterSpacing: 2, fontFamily: T.bodyFont, fontWeight: 500,
            transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
            textTransform: "uppercase",
          }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [secretWord] = useState(getDailyWord);

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

  const shiftedGrid = useMemo(() => {
    const secretSet = new Set(secretWord.split(""));
    const remaining = ALPHABET.filter(entry =>
      !entry.split("").some(ch => secretSet.has(ch))
    );
    return remaining;
  }, [secretWord]);

  const queriesLeft = MAX_QUERIES - queriesUsed;

  // Inject styles on mount
  useEffect(() => {
    injectStyles();
    return () => {
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, []);

  // Save state on changes
  useEffect(() => {
    saveDailyState({ revealedPositions, queriesUsed, gameOver, won });
  }, [revealedPositions, queriesUsed, gameOver, won]);

  // Restore mid-game guess input state
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
      if (!revealedPositions[i]) return "\u25A1";
      return "\u25A0";
    });
    const rows = [];
    for (let i = 0; i < 20; i += 5) {
      rows.push(grid.slice(i, i + 5).join(""));
    }
    return `CODEX // OP #${dayNum} ${won ? queriesUsed + "/" + MAX_QUERIES : "X/" + MAX_QUERIES}\n\n${rows.join("\n")}`;
  };

  const handleShare = () => {
    const text = generateShareText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard input: letter keys reveal alphabet-indexed positions; Enter submits guess
  useEffect(() => {
    const handler = (e) => {
      if (showHelp || showStats || showResult) return;
      if (!showGuessInput && !gameOver) {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= "A" && key <= "Z") {
          // Map A=0, B=1, ..., W=22, X=23, Y=23, Z=24
          let alphaIndex;
          if (key === "X" || key === "Y") {
            alphaIndex = 23; // XY slot
          } else if (key >= "A" && key <= "W") {
            alphaIndex = key.charCodeAt(0) - 65; // A=0 ... W=22
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
      background: T.bgGrad,
      color: "#fff",
      fontFamily: T.bodyFont,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated grid background */}
      <div style={{
        position: "fixed", inset: -40, pointerEvents: "none", opacity: 0.04,
        backgroundImage:
          "linear-gradient(rgba(79,195,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.4) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        animation: "codex-grid-scroll 8s linear infinite",
      }} />

      {/* Subtle radial glow */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,195,247,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 440,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 0 20px",
        borderBottom: `1px solid ${T.glassBorder}`,
      }}>
        <button onClick={() => setShowHelp(true)} style={{
          background: T.glass, border: `1px solid ${T.glassBorder}`,
          color: T.textMuted, fontSize: 14, cursor: "pointer",
          padding: "6px 10px", borderRadius: 8,
          fontFamily: T.bodyFont, fontWeight: 500,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          letterSpacing: 1,
        }}>?</button>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 24, fontWeight: 700, letterSpacing: 10,
            textTransform: "uppercase", color: "#fff",
            fontFamily: T.headingFont,
          }}>Codex</div>
          <div style={{
            fontSize: 10, color: T.textMuted, letterSpacing: 3, marginTop: 4,
            fontFamily: T.bodyFont, fontWeight: 400,
          }}>
            OPERATION #{dayNum} // {formatDate()}
          </div>
        </div>
        <button onClick={() => setShowStats(true)} style={{
          background: T.glass, border: `1px solid ${T.glassBorder}`,
          color: T.textMuted, fontSize: 13, cursor: "pointer",
          padding: "6px 10px", borderRadius: 8,
          fontFamily: T.bodyFont,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          letterSpacing: 0,
        }}>{"\u25A8"}</button>
      </div>

      {/* Floating game container */}
      <div style={{
        width: "100%", maxWidth: 440,
        animation: "codex-float 6s ease-in-out infinite",
      }}>
        {/* Query counter */}
        <div style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0 10px",
        }}>
          <div style={{
            fontSize: 10, color: T.textMuted, letterSpacing: 3,
            fontFamily: T.bodyFont, fontWeight: 500, textTransform: "uppercase",
          }}>
            Intel Remaining
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: MAX_QUERIES }).map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: 2,
                  background: i < queriesUsed
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(255,255,255,0.06)",
                  transition: "background 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                }} />
              ))}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: queriesLeft <= 3 ? T.red : T.textMuted,
              fontFamily: T.headingFont,
              minWidth: 20, textAlign: "right",
              transition: "color 0.3s",
            }}>
              {queriesLeft}
            </div>
          </div>
        </div>

        {/* Tile grid */}
        <div style={{
          width: "100%", maxWidth: 340, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 6, padding: "8px 0",
        }}>
          {shiftedGrid.map((letter, i) => (
            <Tile
              key={i}
              posIndex={i}
              revealed={!!revealedPositions[i]}
              letter={letter}
              onClick={handleReveal}
              disabled={gameOver || queriesUsed >= MAX_QUERIES}
            />
          ))}
        </div>

        {/* Guess area */}
        {showGuessInput && !gameOver && (
          <div style={{
            width: "100%",
            padding: "24px 0", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14,
            animation: "codex-fade-scale-in 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}>
            <div style={{
              fontSize: 10, color: T.textMuted, letterSpacing: 3,
              textTransform: "uppercase", fontFamily: T.bodyFont, fontWeight: 500,
            }}>
              Enter Cipher Key
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <input
                ref={inputRef}
                type="text"
                maxLength={5}
                value={guess}
                onChange={e => setGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
                placeholder="_ _ _ _ _"
                style={{
                  flex: 1, padding: "16px 18px",
                  background: wrongGuess ? "rgba(224,82,82,0.1)" : T.glass,
                  border: wrongGuess ? `1px solid rgba(224,82,82,0.5)` : `1px solid ${T.glassBorder}`,
                  borderRadius: T.radiusSm, color: "#fff",
                  fontSize: 22, fontWeight: 600,
                  letterSpacing: 10, textAlign: "center",
                  fontFamily: T.headingFont,
                  outline: "none",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                  boxShadow: wrongGuess ? "0 0 20px rgba(224,82,82,0.15)" : "none",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button onClick={handleGuess} style={{
                flex: 1, padding: "13px",
                background: guess.length === 5 ? "rgba(79,195,247,0.15)" : T.glass,
                border: guess.length === 5 ? `1px solid rgba(79,195,247,0.35)` : `1px solid ${T.glassBorder}`,
                borderRadius: T.radiusSm,
                color: guess.length === 5 ? T.accent : T.textDim,
                fontSize: 12, fontWeight: 700, letterSpacing: 3,
                cursor: guess.length === 5 ? "pointer" : "default",
                fontFamily: T.bodyFont,
                transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                textTransform: "uppercase",
                boxShadow: guess.length === 5 ? "0 0 20px rgba(79,195,247,0.1)" : "none",
              }}>Submit</button>
              <button onClick={handleGiveUp} style={{
                padding: "13px 22px",
                background: T.glass,
                border: `1px solid ${T.glassBorder}`, borderRadius: T.radiusSm,
                color: T.textMuted, fontSize: 12, letterSpacing: 2,
                cursor: "pointer", fontFamily: T.bodyFont, fontWeight: 500,
                transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                textTransform: "uppercase",
              }}>Abort</button>
            </div>
          </div>
        )}

        {/* Pre-guess actions */}
        {!showGuessInput && !gameOver && queriesUsed > 0 && (
          <div style={{
            width: "100%", padding: "18px 0",
            display: "flex", gap: 10,
          }}>
            <button
              onClick={() => {
                setShowGuessInput(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              style={{
                flex: 1, padding: "13px",
                background: T.glass,
                border: `1px solid ${T.glassBorder}`,
                borderRadius: T.radiusSm,
                color: T.textMuted,
                fontSize: 11, fontWeight: 600, letterSpacing: 3,
                cursor: "pointer",
                fontFamily: T.bodyFont,
                transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                textTransform: "uppercase",
              }}
            >
              Decode Now
            </button>
          </div>
        )}

        {/* Game over but result closed */}
        {gameOver && !showResult && (
          <div style={{
            width: "100%", padding: "24px 0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          }}>
            <div style={{
              fontSize: 28, fontWeight: 700,
              color: won ? T.accent : T.red,
              letterSpacing: 8,
              fontFamily: T.headingFont,
              textShadow: won ? "0 0 30px rgba(79,195,247,0.3)" : "0 0 30px rgba(224,82,82,0.3)",
            }}>{secretWord}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleShare} style={{
                padding: "11px 28px",
                background: "rgba(79,195,247,0.15)",
                border: `1px solid rgba(79,195,247,0.3)`,
                borderRadius: T.radiusSm,
                color: T.accent, fontSize: 11, fontWeight: 700,
                letterSpacing: 3, cursor: "pointer",
                fontFamily: T.bodyFont,
                transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                textTransform: "uppercase",
              }}>{copied ? "COPIED" : "DEBRIEF"}</button>
              <button onClick={() => setShowResult(true)} style={{
                padding: "11px 28px", background: T.glass,
                border: `1px solid ${T.glassBorder}`, borderRadius: T.radiusSm,
                color: T.textMuted, fontSize: 11, letterSpacing: 2, cursor: "pointer",
                fontFamily: T.bodyFont, fontWeight: 500,
                transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                textTransform: "uppercase",
              }}>Details</button>
            </div>
          </div>
        )}

        {/* Tap / keyboard hint */}
        {queriesUsed === 0 && !showHelp && (
          <div style={{
            padding: "28px 0",
            fontSize: 10, color: T.textDim, letterSpacing: 3,
            textAlign: "center", fontFamily: T.bodyFont, fontWeight: 500,
            textTransform: "uppercase",
          }}>
            Select a tile to begin analysis
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
