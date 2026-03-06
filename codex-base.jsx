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

function getDailyWord() {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return WORD_LIST[seed % WORD_LIST.length];
}

function getDayNumber() {
  const start = new Date(2026, 2, 5);
  const now = new Date();
  return Math.floor((now - start) / 86400000) + 1;
}

// --- Stats helpers ---
function loadStats() {
  try {
    const raw = window._gameStats;
    if (raw) return raw;
  } catch {}
  return { played: 0, won: 0, streak: 0, maxStreak: 0, lastDate: null };
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

// --- Components ---

function Tile({ letter, isRevealed, onClick, disabled, index }) {
  let bg, border, color, content;

  if (!isRevealed) {
    bg = "rgba(255,255,255,0.06)";
    border = "rgba(255,255,255,0.12)";
    color = "#555";
    content = "";
  } else {
    bg = "rgba(255,255,255,0.03)";
    border = "rgba(255,255,255,0.15)";
    color = "#aaa";
    content = letter;
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", aspectRatio: "1 / 1.1",
        border: `1.5px solid ${border}`,
        borderRadius: 8,
        background: bg,
        color: color,
        fontSize: content && content.length > 1 ? 14 : 18,
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        opacity: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animationDelay: `${index * 15}ms`,
        padding: 0,
      }}
    >
      {content}
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
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(8px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: "32px 28px", maxWidth: 340, width: "90%",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 13, letterSpacing: 4,
          textTransform: "uppercase", color: "#888", margin: "0 0 24px",
        }}>Statistics</h3>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 28 }}>
          {statItems.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
          color: "#aaa", fontSize: 13, cursor: "pointer", letterSpacing: 1,
        }}>Close</button>
      </div>
    </div>
  );
}

function HowToModal({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(8px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: "32px 24px", maxWidth: 380, width: "90%",
      }}>
        <h3 style={{
          textAlign: "center", fontSize: 13, letterSpacing: 4,
          textTransform: "uppercase", color: "#888", margin: "0 0 20px",
        }}>How to Play</h3>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "#bbb" }}>
          <p style={{ margin: "0 0 16px" }}>
            A secret 5-letter word is hidden. Its letters have been <strong style={{ color: "#fff" }}>removed</strong> from the alphabet, and the remaining letters shift left to fill the gaps.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            The grid shows <strong style={{ color: "#fff" }}>20 blank tiles</strong>. Tap any tile to reveal which letter now occupies that position.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            <span style={{ color: "#e8c44a", fontWeight: 700 }}>Compare</span> the revealed letter to what you'd expect at that position in the normal alphabet. If a letter is skipped, it's in the secret word.
          </p>
          <p style={{ margin: "0 0 16px" }}>
            You have <strong style={{ color: "#fff" }}>14 reveals</strong> to deduce all 5 missing letters. Then unscramble them to guess the word.
          </p>
          <p style={{ margin: "0 0 4px", color: "#888", fontSize: 13 }}>
            Example: If position 1 shows "B" instead of "A", you know A is in the word.
          </p>
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", marginTop: 16,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
          color: "#aaa", fontSize: 13, cursor: "pointer", letterSpacing: 1,
        }}>Got it</button>
      </div>
    </div>
  );
}

function ResultModal({ won, word, queriesUsed, onShare, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, backdropFilter: "blur(8px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: "32px 28px", maxWidth: 340, width: "90%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{won ? "🎯" : "💀"}</div>
        <h3 style={{
          fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {won ? "Solved" : "Not this time"}
        </h3>
        <p style={{ color: "#888", fontSize: 14, margin: "0 0 4px" }}>
          The word was
        </p>
        <p style={{
          fontSize: 28, fontWeight: 700, color: won ? "#e8c44a" : "#e05252",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 6, margin: "0 0 20px",
        }}>{word}</p>
        {won && (
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 20px" }}>
            {queriesUsed} / {MAX_QUERIES} reveals used
          </p>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onShare} style={{
            flex: 1, padding: "12px", background: "#e8c44a",
            border: "none", borderRadius: 8,
            color: "#1a1a1a", fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: 1,
          }}>Share</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
            color: "#aaa", fontSize: 13, cursor: "pointer", letterSpacing: 1,
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [secretWord] = useState(getDailyWord);

  // Compute shifted grid: remove secret letters, shift remaining left, pad with null
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

  // Save state on changes
  useEffect(() => {
    saveDailyState({ revealedPositions, queriesUsed, gameOver, won });
  }, [revealedPositions, queriesUsed, gameOver, won]);

  // Restore guess input visibility if game was mid-play
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
      if (!revealedPositions[i]) return "⬜";
      return "⬛";
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

  // Keyboard handler: map letter keys to grid positions
  useEffect(() => {
    const handler = (e) => {
      if (showHelp || showStats || showResult) return;
      if (!showGuessInput && !gameOver) {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          // Find which grid position this key maps to
          // A=0, B=1, C=2, ... but we need to map to our ALPHABET index
          const keyIndex = key.charCodeAt(0) - 65; // 0-25
          // Map to ALPHABET position: X(23) and Y(24) both map to XY which is at index 23
          let alphaIndex;
          if (keyIndex <= 22) alphaIndex = keyIndex; // A-W → 0-22
          else if (keyIndex === 23 || keyIndex === 24) alphaIndex = 23; // X,Y → XY at 23
          else alphaIndex = 24; // Z → 24

          // Now find which grid position holds this alphabet entry
          // But we want to reveal the position where the expected letter would be
          // Actually: keyboard should map letter to its alphabet position
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
      background: "#111",
      color: "#fff",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle grain overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03,
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* Header */}
      <div style={{
        width: "100%", maxWidth: 420,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 0 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button onClick={() => setShowHelp(true)} style={{
          background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: 4,
        }}>?</button>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 22, fontWeight: 800, letterSpacing: 6,
            textTransform: "uppercase", color: "#fff",
          }}>Codex</div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 3, marginTop: 2 }}>
            #{dayNum}
          </div>
        </div>
        <button onClick={() => setShowStats(true)} style={{
          background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer", padding: 4,
        }}>📊</button>
      </div>

      {/* Reveal counter */}
      <div style={{
        width: "100%", maxWidth: 420,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0 8px",
      }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>
          REVEALS
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: MAX_QUERIES }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 2,
              background: i < queriesUsed
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.06)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{
          fontSize: 12, color: queriesLeft <= 3 ? "#e05252" : "#555",
          fontWeight: 700, minWidth: 24, textAlign: "right",
        }}>
          {queriesLeft}
        </div>
      </div>

      {/* Tile grid - 5x4 */}
      <div style={{
        width: "100%", maxWidth: 320,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 5, padding: "8px 0",
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
          <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase" }}>
            Enter your guess
          </div>
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
                background: wrongGuess ? "rgba(224,82,82,0.15)" : "rgba(255,255,255,0.06)",
                border: wrongGuess ? "1.5px solid #e05252" : "1.5px solid rgba(255,255,255,0.12)",
                borderRadius: 8, color: "#fff",
                fontSize: 20, fontWeight: 700,
                letterSpacing: 8, textAlign: "center",
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
                transition: "all 0.3s",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button onClick={handleGuess} style={{
              flex: 1, padding: "12px",
              background: guess.length === 5 ? "#e8c44a" : "rgba(255,255,255,0.04)",
              border: "none", borderRadius: 8,
              color: guess.length === 5 ? "#1a1a1a" : "#444",
              fontSize: 13, fontWeight: 700, letterSpacing: 2,
              cursor: guess.length === 5 ? "pointer" : "default",
              transition: "all 0.2s",
            }}>SUBMIT</button>
            <button onClick={handleGiveUp} style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
              color: "#555", fontSize: 13, letterSpacing: 1,
              cursor: "pointer",
            }}>Give up</button>
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
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#555",
              fontSize: 12, fontWeight: 600, letterSpacing: 2,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            GUESS
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
            fontSize: 28, fontWeight: 700,
            color: won ? "#e8c44a" : "#e05252",
            letterSpacing: 6,
          }}>{secretWord}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleShare} style={{
              padding: "10px 24px", background: "#e8c44a",
              border: "none", borderRadius: 8,
              color: "#1a1a1a", fontSize: 12, fontWeight: 700,
              letterSpacing: 2, cursor: "pointer",
            }}>{copied ? "COPIED!" : "SHARE"}</button>
            <button onClick={() => setShowResult(true)} style={{
              padding: "10px 24px", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              color: "#888", fontSize: 12, letterSpacing: 1, cursor: "pointer",
            }}>Details</button>
          </div>
        </div>
      )}

      {/* Tap hint */}
      {queriesUsed === 0 && !showHelp && (
        <div style={{
          padding: "24px 0",
          fontSize: 12, color: "#333", letterSpacing: 2,
          textAlign: "center",
        }}>
          TAP A TILE TO REVEAL
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
