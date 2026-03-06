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

const T = {
  bg: "#eff6ff",
  text: "#1e3a5f",
  secondary: "#3b82f6",
  border: "#bfdbfe",
  tileUnrevealed: "#dbeafe",
  tileRevealedBg: "#fff",
  tileRevealedBorder: "#60a5fa",
  tileRevealedText: "#1e3a5f",
  accent: "#2563eb",
  warning: "#f59e0b",
  error: "#ef4444",
  errorBg: "#fef2f2",
  counterActive: "#2563eb",
  counterInactive: "#bfdbfe",
  disabledBtn: "#bfdbfe",
  disabledBtnText: "#3b82f6",
  modalOverlay: "rgba(30,58,95,0.35)",
  modalBg: "#fff",
  modalShadow: "0 4px 24px rgba(37,99,235,0.15)",
  tileHoverBg: "#bfdbfe",
};

// --- Daily word helpers ---
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
  return { played: 0, won: 0, streak: 0, maxStreak: 0, revealCounts: [], lastDate: null };
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

// --- NYT Theme constants ---
const FONT = "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif";

// --- Tile component ---
function Tile({ letter, isRevealed, onClick, disabled, index }) {
  let bg, border, color, content;
  if (!isRevealed) {
    bg = T.tileUnrevealed;
    border = T.tileUnrevealed;
    color = T.tileUnrevealed;
    content = "";
  } else {
    bg = T.tileRevealedBg;
    border = T.tileRevealedBorder;
    color = T.tileRevealedText;
    content = letter;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={!isRevealed && !disabled ? "codex-tile-hover" : ""}
      style={{
        width: "100%",
        aspectRatio: "1",
        border: `2px solid ${border}`,
        borderRadius: 8,
        background: bg,
        color: color,
        fontSize: 20,
        fontFamily: FONT,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        outline: "none",
        userSelect: "none",
      }}
    >
      {content}
    </button>
  );
}

// --- Stats Modal ---
function StatsModal({ stats, onClose }) {
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const rc = stats.revealCounts || [];
  const avgReveals = rc.length > 0 ? (rc.reduce((a, b) => a + b, 0) / rc.length).toFixed(1) : "—";
  const statItems = [
    { label: "Played", value: stats.played },
    { label: "Win %", value: winPct },
    { label: "Streak", value: stats.streak },
    { label: "Best", value: stats.maxStreak },
    { label: "Avg Reveals", value: avgReveals },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.modalOverlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="codex-modal-enter" style={{
        background: T.modalBg,
        borderRadius: 8,
        padding: "32px 28px",
        maxWidth: 340,
        width: "90%",
        boxShadow: T.modalShadow,
        position: "relative",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 18, fontWeight: 700,
          color: T.text, margin: "0 0 24px",
          fontFamily: FONT,
        }}>Statistics</h3>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 28 }}>
          {statItems.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 32, fontWeight: 700, color: T.text,
                fontFamily: FONT,
              }}>{s.value}</div>
              <div style={{
                fontSize: 12, color: T.secondary, marginTop: 4,
                fontFamily: FONT,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "14px",
          background: T.bg,
          border: `1px solid ${T.border}`,
          borderRadius: 4,
          color: T.text, fontSize: 14, fontWeight: 600,
          cursor: "pointer",
          fontFamily: FONT,
        }}>Close</button>
      </div>
    </div>
  );
}

// --- How To Modal ---
function HowToModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: T.modalOverlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="codex-modal-enter" style={{
        background: T.modalBg,
        borderRadius: 8,
        padding: "32px 24px",
        maxWidth: 400,
        width: "90%",
        boxShadow: T.modalShadow,
        position: "relative",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 18, fontWeight: 700,
          color: T.text, margin: "0 0 20px",
          fontFamily: FONT,
        }}>How to Play</h3>
        <div style={{
          fontSize: 15, lineHeight: 1.7, color: T.text,
          fontFamily: FONT,
        }}>
          <p style={{ margin: "0 0 14px" }}>
            A secret 5-letter word is hidden. Its letters have been removed from
            the alphabet, and the remaining letters shift left to fill the gaps.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            The grid shows 20 blank tiles. Tap any tile to reveal which letter
            now occupies that position.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            Compare the revealed letter to what you'd expect at that position.
            If a letter is skipped, it's in the secret word.
          </p>
          <p style={{ margin: "0 0 14px" }}>
            You have <strong>14 reveals</strong> to deduce all 5 missing letters.
            Then unscramble them to guess the word.
          </p>
          <p style={{ margin: "0 0 4px", color: T.secondary, fontSize: 13 }}>
            Tip: revealing tiles near the middle of the grid helps you eliminate
            ranges efficiently.
          </p>
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "14px", marginTop: 16,
          background: T.accent,
          border: "none",
          borderRadius: 4,
          color: "#fff", fontSize: 14, fontWeight: 600,
          cursor: "pointer",
          fontFamily: FONT,
        }}>Got it</button>
      </div>
    </div>
  );
}

// --- Result Modal ---
function ResultModal({ won, word, queriesUsed, onShare, onClose, copied, stats }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: T.modalOverlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="codex-modal-enter" style={{
        background: T.modalBg,
        borderRadius: 8,
        padding: "32px 28px",
        maxWidth: 340,
        width: "90%",
        textAlign: "center",
        boxShadow: T.modalShadow,
        position: "relative",
      }}>
        {won ? (
          <h3 style={{
            fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 8px",
            fontFamily: FONT,
          }}>Nice work!</h3>
        ) : (
          <h3 style={{
            fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 8px",
            fontFamily: FONT,
          }}>Better luck next time</h3>
        )}
        <p style={{ color: T.secondary, fontSize: 14, margin: "8px 0 4px", fontFamily: FONT }}>
          The word was
        </p>
        <p style={{
          fontSize: 32, fontWeight: 700,
          color: won ? T.accent : T.text,
          fontFamily: FONT,
          letterSpacing: 4, margin: "0 0 20px",
        }}>{word}</p>
        {won && (
          <p style={{ color: T.secondary, fontSize: 13, margin: "0 0 8px", fontFamily: FONT }}>
            {queriesUsed} / {MAX_QUERIES} reveals used
          </p>
        )}
        {stats && (
          <div style={{ display: "flex", justifyContent: "center", gap: 24, margin: "0 0 20px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: FONT }}>{stats.streak}</div>
              <div style={{ fontSize: 11, color: T.secondary, fontFamily: FONT }}>Streak</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: FONT }}>
                {(stats.revealCounts || []).length > 0
                  ? ((stats.revealCounts || []).reduce((a, b) => a + b, 0) / (stats.revealCounts || []).length).toFixed(1)
                  : "—"}
              </div>
              <div style={{ fontSize: 11, color: T.secondary, fontFamily: FONT }}>Avg Reveals</div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onShare} style={{
            flex: 1, padding: "14px",
            background: T.accent,
            border: "none", borderRadius: 4,
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT,
          }}>{copied === "success" ? "Success!" : copied === "failed" ? "Failed" : "Share"}</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "14px",
            background: T.bg,
            border: `1px solid ${T.border}`, borderRadius: 4,
            color: T.text, fontSize: 14, fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT,
          }}>Close</button>
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

  // Inject CSS for animations
  useEffect(() => {
    const styleId = "codex-slate-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      @keyframes codex-modal-slide {
        0% { transform: translateY(-20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }

      .codex-modal-enter {
        animation: codex-modal-slide 0.25s ease-out forwards;
      }

      .codex-tile-hover:hover {
        background: ${T.tileHoverBg} !important;
        border-color: ${T.tileHoverBg} !important;
      }

      .codex-tile-hover:active {
        transform: scale(0.95);
      }

    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  // Save state on changes
  useEffect(() => {
    saveDailyState({ revealedPositions, queriesUsed, gameOver, won });
  }, [revealedPositions, queriesUsed, gameOver, won]);

  // Restore showGuessInput from saved state if game was in guess phase
  useEffect(() => {
    if (gameOver) return;
    if (queriesUsed >= MAX_QUERIES) {
      setShowGuessInput(true);
    }
  }, []);

  const handleReveal = useCallback((position) => {
    if (gameOver || revealedPositions[position] !== undefined || queriesUsed >= MAX_QUERIES) return;

    const newRevealed = { ...revealedPositions, [position]: true };
    const newQueries = queriesUsed + 1;

    setRevealedPositions(newRevealed);
    setQueriesUsed(newQueries);

    if (newQueries >= MAX_QUERIES) {
      setShowGuessInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [gameOver, revealedPositions, queriesUsed]);

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
      newStats.revealCounts = [...(newStats.revealCounts || []), queriesUsed];
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
    const grid = [];
    for (let i = 0; i < 20; i++) {
      if (revealedPositions[i] !== undefined) {
        grid.push("\uD83D\uDFE6"); // blue for revealed
      } else {
        grid.push("\u2B1C"); // white for unrevealed
      }
    }
    const rows = [];
    for (let i = 0; i < 20; i += 5) {
      rows.push(grid.slice(i, i + 5).join(""));
    }
    return `Bombe #${dayNum} ${won ? queriesUsed + "/" + MAX_QUERIES : "X/" + MAX_QUERIES}\n\n${rows.join("\n")}\nplaybombe.com`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        setCopied("success");
      } catch {
        setCopied("failed");
      }
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    setCopied(ok ? "success" : "failed");
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (showHelp || showStats || showResult) return;
      if (!showGuessInput && !gameOver) {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= "A" && key <= "Z") {
          let alphaIndex;
          if (key === "X" || key === "Y") alphaIndex = 23;
          else if (key >= "A" && key <= "W") alphaIndex = key.charCodeAt(0) - 65;
          else alphaIndex = 24; // Z
          handleReveal(alphaIndex);
        }
      }
      if (showGuessInput && !gameOver) {
        if (e.key === "Enter") handleGuess();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showGuessInput, gameOver, handleReveal, handleGuess, showHelp, showStats, showResult]);

  const dayNum = getDayNumber();

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: FONT,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px",
    }}>
      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 800,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 20px 16px",
      }}>
        <div style={{
          fontSize: 28, fontWeight: 600, letterSpacing: -0.5,
          color: T.text,
          fontFamily: FONT,
        }}>Bombe</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowHelp(true)} style={{
            background: "none", border: "none",
            color: T.secondary, fontSize: 20, cursor: "pointer", padding: 4,
            fontFamily: FONT, fontWeight: 400,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>?</button>
          <button onClick={() => setShowStats(true)} style={{
            background: "none", border: "none",
            color: T.secondary, cursor: "pointer", padding: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="9" width="3" height="6" rx="0.5" fill={T.secondary}/>
              <rect x="6" y="5" width="3" height="10" rx="0.5" fill={T.secondary}/>
              <rect x="11" y="1" width="3" height="14" rx="0.5" fill={T.secondary}/>
            </svg>
          </button>
        </div>
      </div>

      {/* Reveals counter */}
      <div style={{
        width: "100%", maxWidth: 800, padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, paddingBottom: 12,
      }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {Array.from({ length: MAX_QUERIES }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: 3,
              background: i < queriesUsed ? T.counterActive : T.counterInactive,
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{
          fontSize: 14, color: queriesLeft <= 3 ? T.warning : T.secondary,
          fontWeight: 700,
          fontFamily: FONT,
        }}>
          {queriesLeft}
        </div>
      </div>

      {/* Tile grid - 5x4 grid */}
      <div style={{
        width: "100%", maxWidth: 800, padding: "12px 16px",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
      }}>
        {shiftedGrid.map((letter, i) => {
          const isRevealed = revealedPositions[i] !== undefined;
          return (
            <Tile
              key={i}
              letter={letter}
              isRevealed={isRevealed}
              onClick={() => handleReveal(i)}
              disabled={gameOver || isRevealed || queriesUsed >= MAX_QUERIES}
              index={i}
            />
          );
        })}
      </div>

      {/* Guess area */}
      {showGuessInput && !gameOver && (
        <div style={{
          width: "100%", maxWidth: 800, padding: "20px 16px 0",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <input
              ref={inputRef}
              type="text"
              maxLength={5}
              value={guess}
              onChange={e => setGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
              placeholder="GUESS"
              style={{
                flex: 1, padding: "14px 16px",
                background: wrongGuess ? T.errorBg : "#fff",
                border: wrongGuess ? `2px solid ${T.error}` : `2px solid ${T.border}`,
                borderRadius: 8, color: T.text,
                fontSize: 22, fontWeight: 700,
                letterSpacing: 8, textAlign: "center",
                fontFamily: FONT,
                outline: "none",
                transition: "all 0.3s",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button onClick={handleGuess} style={{
              flex: 1, padding: "14px",
              background: guess.length === 5 ? T.accent : T.disabledBtn,
              border: "none",
              borderRadius: 8,
              color: guess.length === 5 ? "#fff" : T.disabledBtnText,
              fontSize: 15, fontWeight: 600,
              cursor: guess.length === 5 ? "pointer" : "default",
              transition: "all 0.2s",
              fontFamily: FONT,
            }}>Submit</button>
            <button onClick={handleGiveUp} style={{
              padding: "14px 20px",
              background: "none",
              border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.secondary, fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: FONT,
            }}>Give up</button>
          </div>
        </div>
      )}

      {/* Pre-guess actions */}
      {!showGuessInput && !gameOver && queriesUsed > 0 && (
        <div style={{
          width: "100%", maxWidth: 800, padding: "8px 16px 0",
          display: "flex", gap: 8,
        }}>
          <button
            onClick={() => {
              setShowGuessInput(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            style={{
              flex: 1, padding: "14px",
              background: "none",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              color: T.secondary,
              fontSize: 15, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: FONT,
            }}
          >
            Guess
          </button>
        </div>
      )}

      {/* Game over but result closed */}
      {gameOver && !showResult && (
        <div style={{
          width: "100%", maxWidth: 800, padding: "24px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <div style={{
            fontSize: 36, fontWeight: 800,
            color: won ? T.accent : T.text,
            letterSpacing: 4,
            fontFamily: FONT,
          }}>
            {secretWord}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleShare} style={{
              padding: "12px 28px", background: T.accent,
              border: "none", borderRadius: 8,
              color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}>{copied === "success" ? "Success!" : copied === "failed" ? "Failed" : "Share"}</button>
            <button onClick={() => setShowResult(true)} style={{
              padding: "12px 28px", background: "none",
              border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.secondary, fontSize: 15, fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}>Details</button>
          </div>
        </div>
      )}

      {/* Initial hint */}
      {queriesUsed === 0 && !showHelp && (
        <div style={{
          padding: "16px 0",
          fontSize: 14, color: T.secondary,
          textAlign: "center",
          fontFamily: FONT,
        }}>
          Tap a tile to reveal it
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
          copied={copied}
          stats={stats}
        />
      )}
    </div>
  );
}
