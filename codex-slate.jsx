import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// --- Word List (1270 words, no duplicate letters) ---
const WORD_LIST = [
  "CRANE","STALE","BRAVE","GHOST","PLUMB","SHRUG","DWELT","OCEAN",
  "JUDGE","KNELT","WOVEN","FRAME","SIGHT","CHASE","DRIFT","GLEAM",
  "HOIST","JOUST","LIVER","MOUNT","ORBIT","PRISM","QUILT","REIGN",
  "STOMP","TRUNK","VIGOR","WHISK","BLAZE","CHARM","DENIM","ELBOW",
  "FROST","GRIND","JUMBO","LEMON","MANGO","NOBLE","OLIVE","PEARL",
  "QUOTA","SWIRL","THORN","ULTRA","WHEAT","AMBER","BENCH","CEDAR",
  "DELTA","FLASK","GRASP","HAVEN","LUNAR","MEDAL","NICHE","OPTIC",
  "QUIRK","SWORN","TULIP","UMBRA","VAULT","WRIST","BRINE","CRUST",
  "FORGE","HUMID","INGOT","LUCID","MARSH","ONSET","PLAID","RAVEN",
  "SCALD","USHER","WINCH","ABODE","BLUNT","CIGAR","DRAPE","EPOCH",
  "FLINT","GOURD","HEIST","MOCHA","NOTCH","PRANK","SCALP","TOKEN",
  "ULCER","WRECK","ZEBRA","CLOTH","NUDGE","SPORE","BROIL","FLARE",
  "STONE","CAULK","SIREN","GLOBE","TRUCE","PERCH","HOUND","SMELT",
  "BUDGE","CLAMP","SHOVE","BRAID","FUDGE","PLUME","ROAST","FLUME",
  "GROUT","CLIMB","SMEAR","BLOKE","ABOUT","ABOVE","ABUSE","ACTOR",
  "ACUTE","ADMIT","ADOPT","ADULT","AFTER","AGENT","ALBUM","ALERT",
  "ALIEN","ALIGN","ALIVE","ALONE","ALONG","ALTER","AMONG","AMPLE",
  "ANGEL","ANGER","ANGLE","ANGRY","ANKLE","ARGUE","ARISE","ASIDE",
  "AUDIO","AUDIT","AVOID","BADGE","BADLY","BAKER","BASIC","BASIN",
  "BATCH","BEACH","BEARD","BEAST","BEGIN","BEING","BELOW","BIRTH",
  "BLACK","BLADE","BLAME","BLAND","BLANK","BLAST","BLEND","BLIND",
  "BLOCK","BLOND","BLOWN","BOARD","BOAST","BONUS","BOUND","BOXER",
  "BRAIN","BRAND","BREAD","BREAK","BRICK","BRIDE","BRIEF","BRING",
  "BROAD","BROKE","BROTH","BROWN","BRUSH","BUILD","BUILT","BUNCH",
  "BURST","BUYER","CABIN","CABLE","CAMEL","CANDY","CARGO","CATER",
  "CAUSE","CHAIN","CHAIR","CHALK","CHANT","CHAOS","CHEAP","CHEST",
  "CHIEF","CHILD","CHINA","CHOIR","CHOSE","CHUNK","CLAIM","CLASH",
  "CLEAN","CLEAR","CLERK","CLING","CLONE","CLOSE","CLOUD","CLOWN",
  "COAST","COMET","CORAL","COULD","COUNT","COUPE","COURT","COVER",
  "CRAFT","CRAMP","CRASH","CRAWL","CRAZY","CREAM","CREST","CRIME",
  "CRISP","CROWD","CROWN","CRUDE","CRUSH","CURVE","DAILY","DAIRY",
  "DANCE","DAISY","DEALT","DEATH","DEBUT","DECAL","DECAY","DECOY",
  "DECOR","DELAY","DEPTH","DERBY","DETOX","DEVIL","DIARY","DINER",
  "DIRTY","DISCO","DITCH","DOING","DOUBT","DOUGH","DRAFT","DRAIN",
  "DRANK","DRAWN","DREAM","DRINK","DRIVE","DRONE","DROVE","DRUNK",
  "DYING","EARLY","EARTH","EIGHT","EMPTY","ENJOY","ENTRY","EQUAL",
  "EQUIP","EXACT","EXALT","EXIST","EXTRA","EXULT","FABLE","FACET",
  "FAINT","FAIRY","FAITH","FALSE","FANCY","FAULT","FEAST","FEIGN",
  "FETCH","FIBER","FIELD","FIERY","FIGHT","FINAL","FLAME","FLASH",
  "FLESH","FLOAT","FLOCK","FLORA","FLOUR","FLOWN","FLUID","FLUSH",
  "FLUTE","FOCUS","FORCE","FORTH","FORUM","FOUND","FRESH","FRONT",
  "FROZE","FRUIT","GIVEN","GLAND","GLAZE","GLIDE","GLINT","GLORY",
  "GLOVE","GRACE","GRADE","GRAIN","GRAND","GRANT","GRAPE","GRAPH",
  "GRATE","GRAVE","GRAVY","GRAZE","GREAT","GRIEF","GRIME","GROAN",
  "GROUP","GROVE","GROWL","GROWN","GUARD","GUEST","GUIDE","GUILD",
  "GUILT","GUISE","HABIT","HASTE","HAUNT","HEART","HEAVY","HONEY",
  "HORSE","HOTEL","HOUSE","HUMAN","HUMOR","HYENA","IDEAL","IMAGE",
  "IMPLY","INDEX","INFER","INPUT","IRONY","IVORY","JOKER","JUICE",
  "JUICY","KNIFE","LABOR","LANCE","LARGE","LASER","LATCH","LATER",
  "LAUGH","LAYER","LEARN","LEAST","LIGHT","LIKEN","LINER","LODGE",
  "LOGIC","LOVER","LOWER","LUCKY","LUNCH","LUNGE","LYRIC","MACHO",
  "MAGIC","MAJOR","MAKER","MANOR","MAPLE","MARCH","MATCH","MAYOR",
  "MEDIA","MERCY","MERIT","METAL","MIGHT","MINOR","MINUS","MIRTH",
  "MIXED","MODEL","MONEY","MONTH","MORAL","MOUND","MOUSE","MOUTH",
  "MOVIE","MURAL","MUSIC","NAIVE","NIGHT","NOISE","NORTH","NOVEL",
  "NURSE","OFTEN","OPERA","OTHER","OUTER","OXIDE","PAINT","PANEL",
  "PANIC","PARTY","PASTE","PATCH","PAUSE","PEACH","PEDAL","PHASE",
  "PHONE","PIANO","PILOT","PINCH","PITCH","PIXEL","PLACE","PLAIN",
  "PLANE","PLANK","PLANT","PLATE","PLEAD","PLEAT","PLIER","PLUCK",
  "PLUGS","PLUSH","POINT","POISE","POKER","POLAR","PORCH","POSED",
  "POUCH","POUND","POWER","PRICE","PRIDE","PRIME","PRINT","PRIZE",
  "PROBE","PROSE","PROUD","PROVE","PROXY","PRUNE","PULSE","PUNCH",
  "PURGE","PURSE","PUSHY","QUAKE","QUERY","QUEST","QUICK","QUIET",
  "QUITE","QUOTE","RADIO","RAISE","RANCH","RANGE","RAPID","RATIO",
  "REACH","REACT","READY","REALM","REBUS","RECAP","RELAX","RELAY",
  "RENAL","REPAY","REPLY","RESIN","RIDGE","RIFLE","RIGHT","RINSE",
  "RISKY","RIVAL","ROBIN","ROCKY","ROGUE","ROUGE","ROUGH","ROUND",
  "ROUTE","ROYAL","RUGBY","SAINT","SALON","SALVE","SANDY","SAUCE",
  "SAVOR","SCALE","SCARE","SCARF","SCENT","SCOPE","SCORE","SCOUT",
  "SCRAP","SCREW","SETUP","SHADE","SHAME","SHAPE","SHARE","SHARK",
  "SHARP","SHAVE","SHAWL","SHEAR","SHELF","SHIFT","SHINE","SHIRE",
  "SHIRT","SHOCK","SHORE","SHORT","SHOUT","SHOWN","SINCE","SIXTH",
  "SIXTY","SIZED","SKATE","SLAIN","SLATE","SLAVE","SLICE","SLIDE",
  "SLOPE","SMART","SMILE","SMITH","SMOKE","SNACK","SNAKE","SOLAR",
  "SOLID","SOLVE","SOUND","SOUTH","SPACE","SPARE","SPARK","SPEAK",
  "SPEAR","SPEND","SPENT","SPICE","SPICY","SPINE","SPLIT","SPOKE",
  "SPORT","SPRAY","SQUAD","STACK","STAGE","STAIN","STAIR","STAKE",
  "STALK","STAMP","STAND","STARE","STAVE","STEAK","STEAL","STEAM",
  "STICK","STING","STINK","STOCK","STORE","STORM","STORY","STOVE",
  "STRAP","STRAW","STRAY","STRIP","STUCK","STUDY","STUMP","STUNG",
  "STUNK","STYLE","SUGAR","SUITE","SUPER","SURGE","SWAMP","SWEAR",
  "SWEAT","SWEPT","SWIFT","SWING","SWIPE","SWORD","SWORE","SWUNG",
  "SYRUP","TABLE","TEACH","TEMPO","THICK","THIEF","THING","THINK",
  "THIRD","THOSE","THREW","THROW","THUMB","TIGER","TIMER","TIRED",
  "TODAY","TOPIC","TOUCH","TOUGH","TOWEL","TOWER","TOXIC","TRACE",
  "TRACK","TRADE","TRAIL","TRAIN","TRASH","TREND","TRIAL","TRIBE",
  "TRICK","TRIED","TRUCK","TRULY","TUMOR","TUNER","TUNIC","TWICE",
  "TYING","ULNAR","UNDER","UNFIT","UNITE","UNITY","UNTIL","UPSET",
  "URBAN","USAGE","VAGUE","VALID","VALUE","VAPOR","VIDEO","VINYL",
  "VIOLA","VIRAL","VIRUS","VISOR","VISTA","VITAL","VOCAL","VODKA",
  "VOICE","VOTER","VOUCH","WAGER","WAGON","WATCH","WATER","WEARY",
  "WEIGH","WEIRD","WHALE","WHILE","WHITE","WHOLE","WHOSE","WIDER",
  "WIDTH","WITCH","WOMAN","WORLD","WORSE","WORST","WORTH","WOULD",
  "WOUND","WRATH","WRITE","WRONG","WROTE","YACHT","YIELD","YOUNG",
  "YOUTH","ADORE","AGILE","AISLE","ALOFT","AMEND","AMINO","ANTIC",
  "ANVIL","BACON","BAGEL","BARON","BASTE","BATHE","BAYOU","BEADY",
  "BIRCH","BISON","BLITZ","BLUES","BOGUS","BONES","BRACE","BRASH",
  "BRAWN","BRINK","BRISK","BRUNT","BULGE","BUMPY","CADET","CAPED",
  "CAROL","CLASP","CLOAK","CRIMP","CROAK","CURLY","DEPOT","DOWEL",
  "DOZEN","DROWN","DUMPY","DUSTY","ENDOW","EXPAT","FARCE","FEINT",
  "FEMUR","FERAL","FIBRE","FILTH","FIRST","FISHY","FORAY","FORTY",
  "FRANK","FRAUD","FUNGI","GAUZE","GRIPE","GUSTY","HARDY","HASTY",
  "HOMER","HUNKY","HUSKY","IRATE","JERKY","JUNCO","KNEAD","MINCE",
  "MISTY","MUSHY","MUSTY","RUSTY","AIMED","AWOKE","BALMY","BLINK",
  "ABORT","ACORN","ACRID","ADEPT","ADMIN","ADOBE","AEGIS","AMBLE",
  "AMUSE","ANGST","APTLY","ARGON","ATONE","AVERT","AXIOM","BALDY",
  "BANJO","BARGE","BARMY","BARNS","BATON","BEAMS","BEANS","BEARS",
  "BEFIT","BEGAN","BILGE","BINGE","BLARE","BLIMP","BLOAT","BOLTS",
  "BOTCH","BRINY","BULKY","BURLY","BURNS","BYLAW","CAMPS","CAPER",
  "CAPON","CARDS","CAVES","CHAFE","CHEAT","CHIPS","CHOKE","CHORE",
  "CHURN","CIDER","CLOUT","CLUBS","CLUED","CLUNG","COBRA","CODES",
  "COILS","COINS","CORGI","CRATE","CRAVE","CRUEL","CRYPT","CURLS",
  "CURSE","DARTS","DATUM","DEALS","DECKS","DECRY","DEITY","DINGY",
  "DOWNS","DRAKE","DROPS","DRUMS","DUALS","DUELS","DUNCE","DUNES",
  "DUTCH","DUVET","EBONY","EDICT","ELFIN","ENACT","ETHIC","EVICT",
  "EXTOL","FAILS","FANGS","FARMS","FEATS","FETUS","FIEND","FILCH",
  "FILMS","FINDS","FINED","FINCH","FIRED","FIRMS","FIXED","FLANK",
  "FLIES","FLING","FLOWS","FLUKE","FOAMY","FOCAL","FOILS","FOLDS",
  "FOLKS","FONTS","FORMS","FORTE","FOXES","FOYER","FRAIL","FRAYS",
  "FRIED","FUELS","FUMED","FUMES","FUNDS","FUNKY","GAILY","GAINS",
  "GATES","GAUDY","GAUNT","GAVEL","GEARS","GECKO","GENUS","GERMS",
  "GIANT","GIFTS","GIVER","GLARE","GLITZ","GLOAT","GLYPH","GOALS",
  "GOLEM","GRIMY","GRITS","GROIN","GROPE","GRUEL","GRUNT","GULCH",
  "HALVE","HANDS","HANDY","HANGS","HARMS","HARPS","HATED","HAVOC",
  "HAZEL","HEADS","HEALS","HEAPS","HEARD","HEFTY","HELPS","HERBS",
  "HERDS","HIRED","HOLDS","HOLES","HOMES","HOPED","HOPES","HORNS",
  "HOURS","HOVER","HOWLS","HUMPS","HUNTS","HYMNS","ACHED","ACIDS",
  "ACRES","ACTED","AROSE","AWFUL","BANDS","BANKS","BEADS","BEGUN",
  "BELTS","BIRDS","BOATS","BONDS","BUMPS","APRON","BIKES","BOXES",
  "DUSKY","INBOX","INEPT","INTER","INTRO","JAUNT","JEANS","JOIST",
  "KNOBS","KNOTS","LADEN","LAGER","LAKES","LAMBS","LAMPS","LANDS",
  "LANES","LANKY","LAPSE","LATEX","LATHE","LAWNS","LEADS","LEAKY",
  "LEAPT","LEASH","LEFTY","LEMUR","LIKED","LIMBO","LIMBS","LINED",
  "LINES","LINKS","LOADS","LOANS","LOFTY","LOGIN","LONER","LOTUS",
  "LOUSY","LUMPS","LUMPY","LURCH","MAIZE","MALES","MASON","MEALY",
  "MEANS","MEATS","MELON","MENUS","MICRO","MIDST","MINER","MINES",
  "MISER","MITES","MITRE","MIXER","MOANS","MOGUL","MOIST","MOLAR",
  "MOLDY","MONKS","MOTEL","MUCKY","MURKY","NACHO","NAILS","NERDY",
  "NEWLY","NEXUS","NOMAD","NORMS","NOTED","NOTES","OMEGA","OMITS",
  "OPIUM","ORGAN","OUGHT","OUNCE","OVALS","OVENS","OVERT","OWNED",
  "OWNER","PAGES","PAINS","PAIRS","PALMS","PANTS","PARKS","PASTY",
  "PATHS","PATIO","PEAKS","PENAL","PERKY","PESKY","PETAL","PICKS",
  "PICKY","PIETY","PINES","PLAIT","PLANS","PLODS","PLOTS","POEMS",
  "POETS","POLES","PONDS","PORES","PORTS","POURS","PRAYS","PRIVY",
  "PRODS","PRONE","PRONG","PROWL","PRUDE","PSALM","PUNKS","QUALM",
  "RAIDS","RAILS","RAMPS","RANKS","RATED","READS","REAMS","REAPS",
  "REINS","RELIC","REMIT","RENTS","RINGS","RIOTS","RISEN","RITES",
  "ROADS","ROCKS","ROPES","RUINS","RULED","RULES","RUMBA","RUNGS",
  "SABLE","SADLY","SAFER","SALTY","SCARY","SCORN","SCOWL","SHADY",
  "SHINY","SHONE","SKIRT","SLANG","SLANT","SLEPT","SLIME","SLIMY",
  "SLING","SLOTH","SLUMP","SLUNG","SNARE","SNARL","SNEAK","SNORE",
  "SNOUT","SNOWY","SOBER","SONIC","SPAWN","SPIED","SPIKE","SPITE",
  "SPOUT","SPRIG","SPUNK","SQUAT","STARK","STERN","STOKE","STONY",
  "STORK","SUAVE","SULKY","SURLY","SWARM","TACKY","TAILS","TAKEN",
  "TALES","TALKS","TANGY","TANKS","TAPER","TAPES","TARDY","TAXES",
  "TEARS","TENDS","TERMS","THEIR","THUGS","TIDAL","TIERS","TILES",
  "TIMES","TIPSY","TONAL","TONES","TONIC","TORCH","TOURS","TOWNS",
  "TRAMP","TRAPS","TRAWL","THUMP","SHRED","LEAFY","MEATY","RAINY",
  "OAKEN","BUSHY","NERVY","ZONAL","DITSY","ROWDY",
];

const MAX_QUERIES = 14;
const ALPHABET = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","O","P","Q","R","S","T","U","V","W","XY","Z",
];

const T = {
  bg: "#ffffff",
  text: "#1a1a1b",
  secondary: "#787c7e",
  border: "#d3d6da",
  tileUnrevealed: "#ffffff",
  tileRevealedBg: "#2563eb",
  tileRevealedBorder: "#2563eb",
  tileRevealedText: "#ffffff",
  accent: "#2563eb",
  warning: "#c9b458",
  error: "#c94a4a",
  errorBg: "#fff3f3",
  counterActive: "#2563eb",
  counterInactive: "#d3d6da",
  disabledBtn: "#d3d6da",
  disabledBtnText: "#787c7e",
  modalOverlay: "rgba(0,0,0,0.5)",
  modalBg: "#ffffff",
  modalShadow: "0 4px 23px 0 rgba(0,0,0,0.2)",
  tileHoverBg: "#ededed",
};

// --- Daily word helpers (Eastern Time — resets at midnight ET for everyone) ---
function getEasternDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(new Date());
  const y = +parts.find(p => p.type === "year").value;
  const m = +parts.find(p => p.type === "month").value;
  const d = +parts.find(p => p.type === "day").value;
  return { year: y, month: m, day: d };
}

function getEasternDateString() {
  const { year, month, day } = getEasternDate();
  return `${year}-${month}-${day}`;
}

function getDailyWord() {
  const { year, month, day } = getEasternDate();
  const seed = year * 10000 + month * 100 + day;
  return WORD_LIST[(seed * 13 + 7) % WORD_LIST.length];
}

function getDayNumber() {
  const { year, month, day } = getEasternDate();
  const start = Date.UTC(2026, 2, 6); // March 6 2026
  const today = Date.UTC(year, month - 1, day);
  return Math.floor((today - start) / 86400000) + 1;
}

function getMsUntilEasternMidnight() {
  const now = new Date();
  const etNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const midnight = new Date(etNow);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  return midnight - etNow;
}

// --- Stats helpers (localStorage for persistence across refreshes) ---
function loadStats() {
  try {
    const raw = localStorage.getItem("bombe_stats");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { played: 0, won: 0, streak: 0, maxStreak: 0, revealCounts: [], lastDate: null };
}

function saveStats(stats) {
  try {
    localStorage.setItem("bombe_stats", JSON.stringify(stats));
  } catch {}
}

function loadDailyState() {
  try {
    const raw = localStorage.getItem("bombe_daily");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === getEasternDateString()) return parsed;
    }
  } catch {}
  return null;
}

function saveDailyState(state) {
  try {
    localStorage.setItem("bombe_daily", JSON.stringify({ ...state, date: getEasternDateString() }));
  } catch {}
}

// --- Theme constants ---
const FONT = "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif";

// --- Tile component ---
function Tile({ letter, isRevealed, onClick, disabled }) {
  let bg, border, color, content;
  if (!isRevealed) {
    bg = T.tileUnrevealed;
    border = T.border;
    color = "transparent";
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
        borderRadius: 4,
        background: bg,
        color: color,
        fontSize: 22,
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
  const avgReveals = rc.length > 0 ? (rc.reduce((a, b) => a + b, 0) / rc.length).toFixed(1) : "\u2014";
  const statItems = [
    { label: "Played", value: stats.played },
    { label: "Win %", value: winPct },
    { label: "Current\nStreak", value: stats.streak },
    { label: "Max\nStreak", value: stats.maxStreak },
    { label: "Avg\nReveals", value: avgReveals },
  ];

  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = getMsUntilEasternMidnight();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.modalOverlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="codex-modal-enter" style={{
        background: T.modalBg,
        borderRadius: 8,
        padding: "20px 24px 24px",
        maxWidth: 360,
        width: "90%",
        boxShadow: T.modalShadow,
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none",
          fontSize: 18, color: T.secondary, cursor: "pointer",
          padding: 4, lineHeight: 1, fontFamily: FONT,
        }}>{"\u2715"}</button>

        <h3 style={{
          textAlign: "center", fontSize: 16, fontWeight: 700,
          color: T.text, margin: "0 0 20px",
          fontFamily: FONT, textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>Statistics</h3>

        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
          {statItems.map(s => (
            <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
              <div style={{
                fontSize: 36, fontWeight: 400, color: T.text,
                fontFamily: FONT,
              }}>{s.value}</div>
              <div style={{
                fontSize: 11, color: T.text, marginTop: 2,
                fontFamily: FONT, whiteSpace: "pre-line",
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "16px 0" }} />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            Next Bombe
          </div>
          <div style={{ fontSize: 36, fontWeight: 400, color: T.text, fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}>
            {countdown}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- How To Modal (interactive walkthrough + cheat sheet) ---
function HowToModal({ onClose, crossedLetters, setCrossedLetters }) {
  const [tab, setTab] = useState("tutorial");
  const [step, setStep] = useState(0);
  const TOTAL_STEPS = 6;

  // Demo grid for CRIMP (missing C, I, M, P, R)
  // Grid positions (1-indexed): 1=A 2=B 3=D 4=E 5=F | 6=G 7=H 8=J 9=K 10=L | 11=N 12=O 13=Q 14=S 15=T | 16=U 17=V 18=W 19=XY 20=Z
  const DEMO_GRID = ["A","B","D","E","F","G","H","J","K","L","N","O","Q","S","T","U","V","W","XY","Z"];

  // Revealed positions (0-indexed) per step, which are newly revealed, and letters found
  const revealedByStep = [
    [],                       // step 0: all blank
    [2],                      // step 1: tile 3 → D
    [2, 7],                   // step 2: + tile 8 → J
    [2, 7, 10],               // step 3: + tile 11 → N
    [2, 7, 10, 12, 13],       // step 4: + tiles 13 → Q, 14 → S
    [2, 7, 10, 12, 13],       // step 5: guess
  ];
  const newByStep = [[], [2], [7], [10], [12, 13], []];
  const foundByStep = [
    [],
    ["C"],
    ["C", "I"],
    ["C", "I", "M"],
    ["C", "I", "M", "P", "R"],
    ["C", "I", "M", "P", "R"],
  ];

  const revealed = revealedByStep[step] || [];
  const newTiles = newByStep[step] || [];
  const found = foundByStep[step] || [];

  const DemoTile = ({ letter, isRevealed, isNew }) => (
    <div style={{
      width: 36, height: 36,
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 3,
      fontSize: 13, fontWeight: 700, fontFamily: FONT,
      background: isNew ? T.accent : isRevealed ? "#9fb3c8" : "#fff",
      color: isRevealed ? "#fff" : "transparent",
      border: `2px solid ${isNew ? T.accent : isRevealed ? "#8a9db5" : T.border}`,
      transition: "all 0.4s ease",
    }}>
      {letter || "\u00A0"}
    </div>
  );

  const GuessTile = ({ letter }) => (
    <div style={{
      width: 44, height: 44,
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: 4,
      fontSize: 18, fontWeight: 700, fontFamily: FONT,
      color: letter ? T.text : T.secondary,
      background: letter ? "#fff" : "#f7f8fa",
      border: letter ? `2px solid ${T.border}` : `2px dashed #c0c4ca`,
    }}>{letter || ""}</div>
  );

  const Dots = () => (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 4,
          background: i === step ? T.accent : i < step ? "#9fb3c8" : T.counterInactive,
          transition: "background 0.2s",
        }} />
      ))}
    </div>
  );

  const MiniGrid = () => (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
      gap: 3, maxWidth: 210, margin: "0 auto 10px",
    }}>
      {DEMO_GRID.map((letter, i) => (
        <DemoTile key={i} letter={letter} isRevealed={revealed.includes(i)} isNew={newTiles.includes(i)} />
      ))}
    </div>
  );

  const FoundRow = () => found.length > 0 ? (
    <div style={{ display: "flex", gap: 4, justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
      <span style={{ fontSize: 11, color: T.secondary, fontFamily: FONT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Found:</span>
      {found.map(l => (
        <span key={l} style={{
          background: "#e8f5e9", color: "#2e7d32", padding: "2px 8px",
          borderRadius: 3, fontSize: 13, fontWeight: 700, fontFamily: FONT,
        }}>{l}</span>
      ))}
    </div>
  ) : null;

  const Pill = ({ children }) => (
    <div style={{
      display: "inline-block",
      background: "#f0f4f8", borderRadius: 4, padding: "5px 10px",
      fontFamily: FONT, fontSize: 13, color: T.text, lineHeight: 1.4,
      marginBottom: 8,
    }}>{children}</div>
  );

  const P = ({ children, secondary }) => (
    <p style={{ fontSize: 14, color: secondary ? T.secondary : T.text, margin: "0 0 4px", fontFamily: FONT, lineHeight: 1.5 }}>{children}</p>
  );

  const stepTitles = ["The Grid", "Reveal #1", "Reveal #2", "Reveal #3", "Reveals #4\u20135", "Solve It!"];

  const stepContent = [
    // Step 0: The Grid
    <>
      <MiniGrid />
      <P>The alphabet fills a 4{"\u00D7"}5 grid, but <strong>5 letters have been removed</strong>. The remaining 20 shift left to close the gaps.</P>
      <P secondary>Those 5 missing letters form the secret word. Tap tiles to figure out which ones are gone.</P>
    </>,
    // Step 1: Tile 3 → D (found C)
    <>
      <MiniGrid />
      <FoundRow />
      <Pill>Tile <strong>3</strong> {"\u2192"} <strong style={{ color: T.accent }}>D</strong></Pill>
      <P><strong>D</strong> is the 4th letter, but it{"\u2019"}s at position 3. That means 1 letter before it was removed. A and B fill positions 1{"\u2013"}2, so <strong style={{ color: "#2e7d32" }}>C</strong> must be missing!</P>
    </>,
    // Step 2: Tile 8 → J (found I)
    <>
      <MiniGrid />
      <FoundRow />
      <Pill>Tile <strong>8</strong> {"\u2192"} <strong style={{ color: T.accent }}>J</strong></Pill>
      <P><strong>J</strong> is the 10th letter at position 8 {"\u2014"} 2 letters removed so far. We found C, so 1 more is missing between D and J.</P>
      <P>D through H fill positions 3{"\u2013"}7, then it jumps to J {"\u2014"} <strong style={{ color: "#2e7d32" }}>I</strong> was skipped!</P>
    </>,
    // Step 3: Tile 11 → N (found M)
    <>
      <MiniGrid />
      <FoundRow />
      <Pill>Tile <strong>11</strong> {"\u2192"} <strong style={{ color: T.accent }}>N</strong></Pill>
      <P><strong>N</strong> is the 14th letter at position 11 {"\u2014"} 3 removed total. K and L are at positions 9{"\u2013"}10, then it jumps to N.</P>
      <P><strong style={{ color: "#2e7d32" }}>M</strong> was skipped!</P>
    </>,
    // Step 4: Tiles 13 → Q, 14 → S (found P, R)
    <>
      <MiniGrid />
      <FoundRow />
      <Pill>Tile <strong>13</strong> {"\u2192"} <strong style={{ color: T.accent }}>Q</strong> &nbsp;&nbsp; Tile <strong>14</strong> {"\u2192"} <strong style={{ color: T.accent }}>S</strong></Pill>
      <P>Position 13 shows <strong>Q</strong> (17th letter) {"\u2014"} jumped over <strong style={{ color: "#2e7d32" }}>P</strong>! Position 14 shows <strong>S</strong> (19th letter) {"\u2014"} jumped over <strong style={{ color: "#2e7d32" }}>R</strong>!</P>
      <P>All 5 missing letters found in just 5 reveals!</P>
    </>,
    // Step 5: Solve
    <>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "0 auto 14px" }}>
        {["C", "R", "I", "M", "P"].map((l, i) => <GuessTile key={i} letter={l} />)}
      </div>
      <P>Type the missing letters into the guess tiles, then drag to rearrange them into the word:</P>
      <p style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: T.accent, margin: "8px 0 0", fontFamily: FONT, letterSpacing: 4 }}>CRIMP</p>
    </>,
  ];

  // Cheat Sheet
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const toggleCrossed = (letter) => {
    setCrossedLetters(prev => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  };

  const CheatSheet = () => (
    <div>
      <p style={{ fontSize: 13, color: T.secondary, margin: "0 0 12px", fontFamily: FONT, lineHeight: 1.5, textAlign: "center" }}>
        Tap to cross out letters you{"\u2019"}ve confirmed are in the grid. The remaining ones are candidates for the secret word.
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        gap: 4, maxWidth: 340, margin: "0 auto 16px",
      }}>
        {ALPHABET.map((letter, i) => {
          const crossed = crossedLetters.has(letter);
          return (
            <button
              key={letter}
              onClick={() => toggleCrossed(letter)}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "6px 0",
                borderRadius: 4,
                border: `1.5px solid ${crossed ? "#d0d4da" : T.border}`,
                background: crossed ? "#f0f0f0" : "#fff",
                cursor: "pointer",
                opacity: crossed ? 0.35 : 1,
                transition: "all 0.15s ease",
                position: "relative",
              }}
            >
              <span style={{
                fontSize: 15, fontWeight: 700, fontFamily: FONT,
                color: crossed ? T.secondary : T.text,
                textDecoration: crossed ? "line-through" : "none",
              }}>{letter}</span>
              <span style={{
                fontSize: 9, fontWeight: 600, fontFamily: FONT,
                color: crossed ? "#c0c4ca" : T.secondary,
              }}>{i + 1}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={() => setCrossedLetters(new Set())} style={{
          background: "none", border: "none",
          color: T.secondary, fontSize: 12, cursor: "pointer",
          fontFamily: FONT, textDecoration: "underline",
          padding: 4,
        }}>Reset all</button>
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.modalOverlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="codex-modal-enter" style={{
        background: T.modalBg,
        borderRadius: 8,
        padding: "20px 24px 24px",
        maxWidth: 400,
        width: "90%",
        boxShadow: T.modalShadow,
        position: "relative",
        maxHeight: "85vh",
        overflowY: "auto",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none",
          fontSize: 18, color: T.secondary, cursor: "pointer",
          padding: 4, lineHeight: 1, fontFamily: FONT,
        }}>{"\u2715"}</button>

        <h3 style={{
          textAlign: "center", fontSize: 16, fontWeight: 700,
          color: T.text, margin: "0 0 12px",
          fontFamily: FONT, textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>How to Play</h3>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `2px solid ${T.border}` }}>
          {[["tutorial", "Tutorial"], ["cheatsheet", "Cheat Sheet"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "8px 0",
              background: "none", border: "none",
              borderBottom: tab === key ? `2px solid ${T.accent}` : "2px solid transparent",
              marginBottom: -2,
              color: tab === key ? T.accent : T.secondary,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: FONT, textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>{label}</button>
          ))}
        </div>

        {tab === "tutorial" ? (
          <>
            <Dots />
            <p style={{
              textAlign: "center", fontSize: 13, fontWeight: 700,
              color: T.accent, margin: "0 0 14px",
              fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5,
            }}>{stepTitles[step]}</p>

            <div key={step} style={{ minHeight: 160 }}>
              {stepContent[step]}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{
                  padding: "12px 16px",
                  background: "none",
                  border: `1px solid ${T.border}`, borderRadius: 4,
                  color: T.secondary, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: FONT,
                }}>Back</button>
              )}
              <button
                onClick={() => step < TOTAL_STEPS - 1 ? setStep(step + 1) : onClose()}
                style={{
                  flex: 1, padding: "12px",
                  background: T.accent,
                  border: "none", borderRadius: 4,
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", fontFamily: FONT,
                  letterSpacing: 0.5,
                }}
              >
                {step < TOTAL_STEPS - 1 ? "Next" : "Got it"}
              </button>
            </div>

            {step === TOTAL_STEPS - 1 && (
              <>
                <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "16px 0 12px" }} />
                <p style={{ fontSize: 12, color: T.secondary, margin: 0, fontFamily: FONT, lineHeight: 1.5, textAlign: "center" }}>
                  You have <strong>14 reveals</strong> to find all 5 letters. A new puzzle drops daily!
                </p>
              </>
            )}
          </>
        ) : (
          <CheatSheet />
        )}
      </div>
    </div>
  );
}

// --- Result Modal ---
function ResultModal({ won, word, queriesUsed, onShare, onClose, copied, stats }) {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = getMsUntilEasternMidnight();
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: T.modalOverlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="codex-modal-enter" style={{
        background: T.modalBg,
        borderRadius: 8,
        padding: "20px 24px 24px",
        maxWidth: 380,
        width: "90%",
        textAlign: "center",
        boxShadow: T.modalShadow,
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none",
          fontSize: 18, color: T.secondary, cursor: "pointer",
          padding: 4, lineHeight: 1, fontFamily: FONT,
        }}>{"\u2715"}</button>

        <h3 style={{
          fontSize: 16, fontWeight: 700, color: T.text, margin: "0 0 16px",
          fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5,
        }}>{won ? "You got it!" : "Better luck next time"}</h3>

        <p style={{ color: T.secondary, fontSize: 14, margin: "0 0 4px", fontFamily: FONT }}>
          The word was
        </p>
        <p style={{
          fontSize: 32, fontWeight: 700,
          color: T.text,
          fontFamily: FONT,
          letterSpacing: 4, margin: "0 0 16px",
        }}>{word}</p>

        {won && (
          <p style={{ color: T.secondary, fontSize: 14, margin: "0 0 8px", fontFamily: FONT }}>
            {queriesUsed} / {MAX_QUERIES} reveals used
          </p>
        )}

        {stats && (
          <div style={{ display: "flex", justifyContent: "center", gap: 32, margin: "0 0 16px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 400, color: T.text, fontFamily: FONT }}>{stats.streak}</div>
              <div style={{ fontSize: 11, color: T.text, fontFamily: FONT, whiteSpace: "pre-line" }}>{"Current\nStreak"}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 400, color: T.text, fontFamily: FONT }}>
                {(stats.revealCounts || []).length > 0
                  ? ((stats.revealCounts || []).reduce((a, b) => a + b, 0) / (stats.revealCounts || []).length).toFixed(1)
                  : "\u2014"}
              </div>
              <div style={{ fontSize: 11, color: T.text, fontFamily: FONT, whiteSpace: "pre-line" }}>{"Avg\nReveals"}</div>
            </div>
          </div>
        )}

        <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, margin: "16px 0" }} />

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: FONT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              Next Bombe
            </div>
            <div style={{ fontSize: 32, fontWeight: 400, color: T.text, fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}>
              {countdown}
            </div>
          </div>
          <div style={{ width: 1, height: 52, background: T.border, margin: "0 16px" }} />
          <div style={{ flex: 1 }}>
            <button onClick={onShare} style={{
              width: "100%", padding: "16px",
              background: T.accent,
              border: "none", borderRadius: 4,
              color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {copied === "success" ? "Copied!" : copied === "failed" ? "Failed" : "Share"}
              {!copied && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>}
            </button>
          </div>
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

  const [guessTiles, setGuessTiles] = useState(["", "", "", "", ""]);
  const [focusedTile, setFocusedTile] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const pendingDragRef = useRef(null); // { idx, startX, startY, pointerId }
  const tileRefs = useRef([]);
  const guessRowRef = useRef(null);
  const guess = guessTiles.join("");
  const setGuess = (val) => {
    const arr = val.split("").concat(["","","","",""]).slice(0, 5);
    setGuessTiles(arr);
  };
  const [gameOver, setGameOver] = useState(() => {
    const saved = loadDailyState();
    return saved ? saved.gameOver : false;
  });
  const [won, setWon] = useState(() => {
    const saved = loadDailyState();
    return saved ? saved.won : false;
  });
  const [wrongGuess, setWrongGuess] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(() => {
    const saved = loadDailyState();
    return !saved;
  });
  const [crossedLetters, setCrossedLetters] = useState(new Set());
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(loadStats);

  const queriesLeft = MAX_QUERIES - queriesUsed;

  // Inject CSS for animations
  useEffect(() => {
    const styleId = "codex-slate-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      *, *::before, *::after { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      html { height: 100%; background: ${T.bg}; }
      body { height: 100%; background: ${T.bg}; margin: 0; overflow: hidden; }
      #root { height: 100%; }

      @keyframes codex-modal-slide {
        0% { transform: translateY(-20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }

      .codex-modal-enter {
        animation: codex-modal-slide 0.25s ease-out forwards;
      }

      .codex-tile-hover:hover {
        background: ${T.tileHoverBg} !important;
        border-color: ${T.border} !important;
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


  const handleReveal = useCallback((position) => {
    if (gameOver || revealedPositions[position] !== undefined || queriesUsed >= MAX_QUERIES) return;

    const newRevealed = { ...revealedPositions, [position]: true };
    const newQueries = queriesUsed + 1;

    setRevealedPositions(newRevealed);
    setQueriesUsed(newQueries);

    if (newQueries >= MAX_QUERIES) {
      setFocusedTile(0);
      setTimeout(() => tileRefs.current[0]?.focus(), 100);
    }
  }, [gameOver, revealedPositions, queriesUsed]);

  const handleGuess = useCallback(() => {
    if (guessTiles.includes("")) return;
    const g = guessTiles.join("").toUpperCase();
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
      newStats.lastDate = getEasternDateString();
      setStats(newStats);
      saveStats(newStats);
      setTimeout(() => setShowResult(true), 600);
    } else {
      setWrongGuess(true);
      setTimeout(() => {
        setWrongGuess(false);
        setGameOver(true);
        setWon(false);
        const newStats = { ...stats };
        newStats.played += 1;
        newStats.streak = 0;
        newStats.lastDate = getEasternDateString();
        setStats(newStats);
        saveStats(newStats);
        setTimeout(() => setShowResult(true), 300);
      }, 800);
    }
  }, [guessTiles, secretWord, stats]);

  const handleGiveUp = useCallback(() => {
    setGameOver(true);
    setWon(false);
    const newStats = { ...stats };
    newStats.played += 1;
    newStats.streak = 0;
    newStats.lastDate = getEasternDateString();
    setStats(newStats);
    saveStats(newStats);
    setTimeout(() => setShowResult(true), 300);
  }, [stats]);

  const generateShareText = () => {
    const dayNum = getDayNumber();
    const revealsLeft = MAX_QUERIES - queriesUsed;
    if (won) {
      return `I just guessed the Bombe #${dayNum} with ${revealsLeft} reveal${revealsLeft === 1 ? "" : "s"} left!\nplaybombe.com`;
    }
    return `Bombe #${dayNum} — I couldn't crack it!\nplaybombe.com`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        setCopied("success");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // User cancelled share sheet — do nothing
      }
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

  // Track whether a guess tile is focused
  const [guessFocused, setGuessFocused] = useState(false);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (showHelp || showStats || showResult) return;
      if (gameOver) return;

      // If a guess tile is focused, route keys there
      if (guessFocused) {
        if (e.key === "Enter") { handleGuess(); return; }
        const key = e.key.toUpperCase();
        if (key === "BACKSPACE") {
          e.preventDefault();
          setGuessTiles(prev => {
            const next = [...prev];
            let idx = focusedTile;
            if (next[idx] === "" && idx > 0) idx = idx - 1;
            next[idx] = "";
            setFocusedTile(idx);
            setTimeout(() => tileRefs.current[idx]?.focus(), 0);
            return next;
          });
          return;
        }
        if (key.length === 1 && key >= "A" && key <= "Z") {
          e.preventDefault();
          setGuessTiles(prev => {
            const next = [...prev];
            next[focusedTile] = key;
            const nextIdx = Math.min(focusedTile + 1, 4);
            setFocusedTile(nextIdx);
            setTimeout(() => tileRefs.current[nextIdx]?.focus(), 0);
            return next;
          });
          return;
        }
        if (key === "ARROWLEFT") {
          e.preventDefault();
          const idx = Math.max(focusedTile - 1, 0);
          setFocusedTile(idx);
          tileRefs.current[idx]?.focus();
          return;
        }
        if (key === "ARROWRIGHT") {
          e.preventDefault();
          const idx = Math.min(focusedTile + 1, 4);
          setFocusedTile(idx);
          tileRefs.current[idx]?.focus();
          return;
        }
      }

      // Otherwise, route letter keys to grid reveals
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= "A" && key <= "Z") {
        let alphaIndex;
        if (key === "X" || key === "Y") alphaIndex = 23;
        else if (key >= "A" && key <= "W") alphaIndex = key.charCodeAt(0) - 65;
        else alphaIndex = 24;
        handleReveal(alphaIndex);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [guessFocused, gameOver, handleReveal, handleGuess, showHelp, showStats, showResult, focusedTile]);

  const dayNum = getDayNumber();

  return (
    <div style={{
      minHeight: "100%",
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
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "14px 20px",
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
      }}>
        <div style={{ position: "absolute", left: 16, display: "flex", alignItems: "center" }}>
          <button onClick={() => setShowHelp(true)} style={{
            background: "none", border: "none",
            color: T.text, cursor: "pointer", padding: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
        </div>

        <div style={{
          fontSize: 32, fontWeight: 700, letterSpacing: 1,
          color: T.text,
          fontFamily: FONT,
        }}>Bombe</div>

        <div style={{ position: "absolute", right: 16, display: "flex", alignItems: "center" }}>
          <button onClick={() => setShowStats(true)} style={{
            background: "none", border: "none",
            color: T.text, cursor: "pointer", padding: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Reveals counter */}
      <div style={{
        width: "100%", maxWidth: 800, padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12,
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
        width: "100%", maxWidth: 420, padding: "0 16px",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 6,
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
            />
          );
        })}
      </div>

      {/* Guess area — 5 tile inputs with drag support */}
      {!gameOver && (
        <div style={{
          width: "100%", maxWidth: 420, padding: "20px 16px 0",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12,
        }}>
          <div ref={guessRowRef} style={{ display: "flex", gap: 6, justifyContent: "center", position: "relative" }}>
            {guessTiles.map((letter, i) => {
              const isDragging = dragIdx === i && dragPos;
              const isDropTarget = dropTarget === i && dragIdx !== null && dragIdx !== i;
              const isFocused = guessFocused && focusedTile === i && !isDragging;
              return (
                <div
                  key={i}
                  ref={el => tileRefs.current[i] = el}
                  data-guess-idx={i}
                  onPointerDown={(e) => {
                    if (!letter) return; // let the input handle tap natively
                    // Record pending drag for filled tiles
                    pendingDragRef.current = {
                      idx: i,
                      startX: e.clientX,
                      startY: e.clientY,
                      pointerId: e.pointerId,
                    };
                    tileRefs.current[i].setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    const pending = pendingDragRef.current;
                    if (pending && dragIdx === null) {
                      const dx = e.clientX - pending.startX;
                      const dy = e.clientY - pending.startY;
                      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                        setDragIdx(pending.idx);
                        setDragPos({ x: e.clientX, y: e.clientY });
                        setDropTarget(null);
                        pendingDragRef.current = null;
                        // Blur the input so keyboard hides during drag
                        document.activeElement?.blur();
                      }
                      return;
                    }
                    if (dragIdx === null) return;
                    setDragPos({ x: e.clientX, y: e.clientY });
                    let found = null;
                    for (let j = 0; j < 5; j++) {
                      const el = tileRefs.current[j];
                      if (!el) continue;
                      const r = el.getBoundingClientRect();
                      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                        found = j;
                        break;
                      }
                    }
                    setDropTarget(found);
                  }}
                  onPointerUp={() => {
                    const wasPending = pendingDragRef.current;
                    pendingDragRef.current = null;
                    if (dragIdx !== null) {
                      if (dropTarget !== null && dropTarget !== dragIdx) {
                        setGuessTiles(prev => {
                          const next = [...prev];
                          const tmp = next[dragIdx];
                          next[dragIdx] = next[dropTarget];
                          next[dropTarget] = tmp;
                          return next;
                        });
                      }
                      setDragIdx(null);
                      setDragPos(null);
                      setDropTarget(null);
                    }
                    // If it was just a tap on a filled tile, the native input click will handle focus
                  }}
                  onPointerCancel={() => {
                    pendingDragRef.current = null;
                    setDragIdx(null);
                    setDragPos(null);
                    setDropTarget(null);
                  }}
                  style={{
                    width: 56, height: 56,
                    position: "relative",
                    borderRadius: 4,
                    background: wrongGuess ? T.errorBg
                      : isDropTarget ? "#dbeafe"
                      : isDragging ? "#f0f0f0"
                      : letter ? T.bg
                      : "#f7f8fa",
                    border: isDropTarget ? `2px dashed ${T.accent}`
                      : isFocused
                        ? `2px solid ${wrongGuess ? T.error : T.accent}`
                        : letter ? `2px solid ${wrongGuess ? T.error : T.border}`
                        : `2px dashed ${wrongGuess ? T.error : "#c0c4ca"}`,
                    transition: isDragging ? "none" : "border-color 0.15s, background 0.15s",
                    touchAction: "none",
                  }}
                >
                  <input
                    type="text"
                    readOnly={isDragging}
                    value={isDragging ? "" : letter}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    inputMode="text"
                    onFocus={() => {
                      setFocusedTile(i);
                      setGuessFocused(true);
                    }}
                    onBlur={() => setGuessFocused(false)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      const key = e.key.toUpperCase();
                      if (key === "UNIDENTIFIED" || key === "PROCESS") return;
                      if (key === "BACKSPACE") {
                        e.preventDefault();
                        setGuessTiles(prev => {
                          const next = [...prev];
                          let idx = i;
                          if (next[idx] === "" && idx > 0) idx = idx - 1;
                          next[idx] = "";
                          setFocusedTile(idx);
                          setTimeout(() => tileRefs.current[idx]?.querySelector("input")?.focus(), 0);
                          return next;
                        });
                      } else if (key === "ENTER") {
                        handleGuess();
                      } else if (key === "ARROWLEFT") {
                        e.preventDefault();
                        const idx = Math.max(i - 1, 0);
                        setFocusedTile(idx);
                        tileRefs.current[idx]?.querySelector("input")?.focus();
                      } else if (key === "ARROWRIGHT") {
                        e.preventDefault();
                        const idx = Math.min(i + 1, 4);
                        setFocusedTile(idx);
                        tileRefs.current[idx]?.querySelector("input")?.focus();
                      } else if (key.length === 1 && key >= "A" && key <= "Z") {
                        e.preventDefault();
                        setGuessTiles(prev => {
                          const next = [...prev];
                          next[i] = key;
                          const nextIdx = Math.min(i + 1, 4);
                          setFocusedTile(nextIdx);
                          setTimeout(() => tileRefs.current[nextIdx]?.querySelector("input")?.focus(), 0);
                          return next;
                        });
                      }
                    }}
                    onBeforeInput={(e) => {
                      const char = (e.data || "").toUpperCase();
                      if (char.length >= 1 && char[0] >= "A" && char[0] <= "Z") {
                        e.preventDefault();
                        const key = char[0];
                        setGuessTiles(prev => {
                          const next = [...prev];
                          next[i] = key;
                          const nextIdx = Math.min(i + 1, 4);
                          setFocusedTile(nextIdx);
                          setTimeout(() => tileRefs.current[nextIdx]?.querySelector("input")?.focus(), 0);
                          return next;
                        });
                      }
                    }}
                    style={{
                      width: "100%", height: "100%",
                      position: "absolute", top: 0, left: 0,
                      border: "none", outline: "none",
                      background: "transparent",
                      color: isDragging ? "transparent" : (letter ? T.text : T.secondary),
                      fontSize: 24, fontWeight: 700, fontFamily: FONT,
                      textAlign: "center",
                      caretColor: "transparent",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      cursor: letter ? "grab" : "text",
                      padding: 0,
                      borderRadius: 4,
                    }}
                  />
                </div>
              );
            })}

            {/* Floating drag tile */}
            {dragIdx !== null && dragPos && guessTiles[dragIdx] && (
              <div style={{
                position: "fixed",
                left: dragPos.x - 28,
                top: dragPos.y - 40,
                width: 56, height: 56,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 700, fontFamily: FONT,
                color: T.text,
                background: T.bg,
                border: `2px solid ${T.accent}`,
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                pointerEvents: "none",
                zIndex: 9999,
                transform: "scale(1.1)",
              }}>
                {guessTiles[dragIdx]}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 310 }}>
            <button onClick={handleGuess} style={{
              flex: 1, padding: "14px",
              background: guess.length === 5 && !guessTiles.includes("") ? T.accent : T.disabledBtn,
              border: "none",
              borderRadius: 4,
              color: guess.length === 5 && !guessTiles.includes("") ? "#fff" : T.disabledBtnText,
              fontSize: 15, fontWeight: 600,
              cursor: guess.length === 5 && !guessTiles.includes("") ? "pointer" : "default",
              transition: "all 0.2s",
              fontFamily: FONT,
            }}>Submit</button>
            <button onClick={handleGiveUp} style={{
              padding: "14px 20px",
              background: "none",
              border: `1px solid ${T.border}`, borderRadius: 4,
              color: T.secondary, fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: FONT,
            }}>Give up</button>
          </div>
        </div>
      )}


      {/* Game over but result closed */}
      {gameOver && !showResult && (
        <div style={{
          width: "100%", maxWidth: 800, padding: "24px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <div style={{
            fontSize: 36, fontWeight: 700,
            color: T.text,
            letterSpacing: 4,
            fontFamily: FONT,
          }}>
            {secretWord}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleShare} style={{
              padding: "12px 28px", background: T.accent,
              border: "none", borderRadius: 4,
              color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}>{copied === "success" ? "Copied!" : copied === "failed" ? "Failed" : "Share"}</button>
            <button onClick={() => setShowResult(true)} style={{
              padding: "12px 28px", background: "none",
              border: `1px solid ${T.border}`, borderRadius: 4,
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
      {showHelp && <HowToModal onClose={() => setShowHelp(false)} crossedLetters={crossedLetters} setCrossedLetters={setCrossedLetters} />}
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
