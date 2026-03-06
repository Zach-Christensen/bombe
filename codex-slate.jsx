import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// --- Word List (1826 curated common 5-letter words — 5 years of daily play) ---
const WORD_LIST = [
  "CRANE","STALE","BRAVE","GHOST","PLUMB","SHRUG","DWELT","OCEAN",
  "JUDGE","KNELT","WOVEN","FRAME","SIGHT","BLOOM","CHASE","DRIFT",
  "GLEAM","HOIST","JOUST","LIVER","MOUNT","ORBIT","PRISM","QUILT",
  "REIGN","STOMP","TRUNK","VIGOR","WHISK","BLAZE","CHARM","DENIM",
  "ELBOW","FROST","GRIND","JUMBO","LEMON","MANGO","NOBLE","OLIVE",
  "PEARL","QUOTA","REBEL","SWIRL","THORN","ULTRA","VIVID","WHEAT",
  "AMBER","BENCH","CEDAR","DELTA","EMBER","FLASK","GRASP","HAVEN",
  "ICING","JEWEL","KARMA","LUNAR","MEDAL","NICHE","OPTIC","PLAZA",
  "QUIRK","ROVER","SWORN","TULIP","UMBRA","VAULT","WRIST","BRINE",
  "CRUST","DODGE","FORGE","HUMID","INGOT","KNACK","LUCID","MARSH",
  "ONSET","PLAID","RAVEN","SCALD","USHER","VALVE","WINCH","ABODE",
  "BLUNT","CIGAR","DRAPE","EPOCH","FLINT","GOURD","HEIST","MOCHA",
  "NOTCH","PRANK","SCALP","TOKEN","ULCER","WRECK","ZEBRA","CLOTH",
  "NUDGE","SPORE","BROIL","FLARE","STONE","CAULK","SIREN","GLOBE",
  "TRUCE","PERCH","HOUND","SMELT","BUDGE","CLAMP","SHOVE","BRAID",
  "FUDGE","PLUME","ROAST","DWELL","FLUME","GROUT","CLIMB","SMEAR",
  "BLOKE","TROUT","ABOUT","ABOVE","ABUSE","ACTOR","ACUTE","ADMIT",
  "ADOPT","ADULT","AFTER","AGAIN","AGENT","AGREE","AHEAD","ALARM",
  "ALBUM","ALERT","ALIEN","ALIGN","ALIVE","ALLEY","ALLOW","ALONE",
  "ALONG","ALTER","AMONG","AMPLE","ANGEL","ANGER","ANGLE","ANGRY",
  "ANKLE","ANNEX","APART","APPLE","APPLY","ARENA","ARGUE","ARISE",
  "ARMOR","AROMA","ARROW","ASIDE","ASSET","ATLAS","ATTIC","AUDIO",
  "AUDIT","AVOID","AWAKE","AWARD","AWARE","BADGE","BADLY","BAKER",
  "BASIC","BASIN","BASIS","BATCH","BEACH","BEARD","BEAST","BEGIN",
  "BEING","BELOW","BERRY","BIBLE","BIRTH","BLACK","BLADE","BLAME",
  "BLAND","BLANK","BLAST","BLEED","BLEND","BLESS","BLIND","BLOCK",
  "BLOND","BLOOD","BLOWN","BOARD","BOAST","BONUS","BOOTH","BOUND",
  "BOXER","BRAIN","BRAND","BRASS","BREAD","BREAK","BREED","BRICK",
  "BRIDE","BRIEF","BRING","BROAD","BROKE","BROOK","BROTH","BROWN",
  "BRUSH","BUILD","BUILT","BUNCH","BURST","BUYER","CABIN","CABLE",
  "CAMEL","CANDY","CARGO","CARRY","CATCH","CATER","CAUSE","CEASE",
  "CHAIN","CHAIR","CHALK","CHANT","CHAOS","CHEAP","CHECK","CHEEK",
  "CHEER","CHESS","CHEST","CHICK","CHIEF","CHILD","CHILL","CHINA",
  "CHOIR","CHOSE","CHUNK","CLAIM","CLASH","CLASS","CLEAN","CLEAR",
  "CLERK","CLICK","CLIFF","CLING","CLOCK","CLONE","CLOSE","CLOUD",
  "CLOWN","CLUCK","COACH","COAST","COLOR","COMET","COMIC","CORAL",
  "COUCH","COULD","COUNT","COUPE","COURT","COVER","CRACK","CRAFT",
  "CRAMP","CRASH","CRAWL","CRAZY","CREAM","CREEK","CREEP","CREST",
  "CRIME","CRISP","CROSS","CROWD","CROWN","CRUDE","CRUSH","CURVE",
  "CYCLE","DAILY","DAIRY","DANCE","DAISY","DEALT","DEATH","DEBUT",
  "DECAL","DECAY","DECOY","DECOR","DELAY","DEPTH","DERBY","DETOX",
  "DEVIL","DIARY","DINER","DIRTY","DISCO","DITCH","DOING","DONOR",
  "DOUBT","DOUGH","DRAFT","DRAIN","DRAMA","DRANK","DRAWN","DREAD",
  "DREAM","DRESS","DRIED","DRINK","DRIVE","DRONE","DROVE","DRUNK",
  "DRYER","DYING","EAGLE","EARLY","EARTH","EATEN","EIGHT","ELDER",
  "ELECT","ELITE","EMPTY","ENEMY","ENJOY","ENTER","ENTRY","EQUAL",
  "EQUIP","ERROR","EVENT","EVERY","EXACT","EXALT","EXILE","EXIST",
  "EXTRA","EXULT","FABLE","FACET","FAINT","FAIRY","FAITH","FALSE",
  "FANCY","FATAL","FAULT","FEAST","FEIGN","FENCE","FERRY","FETCH",
  "FEVER","FIBER","FIELD","FIERY","FIFTH","FIFTY","FIGHT","FINAL",
  "FLAME","FLASH","FLESH","FLOAT","FLOCK","FLOOD","FLOOR","FLORA",
  "FLOUR","FLOWN","FLUID","FLUSH","FLUTE","FOCUS","FOGGY","FORCE",
  "FORTH","FORUM","FOUND","FRESH","FRONT","FROZE","FRUIT","FULLY",
  "FUNNY","FUZZY","GAUGE","GENRE","GIVEN","GLAND","GLASS","GLAZE",
  "GLIDE","GLINT","GLOOM","GLORY","GLOSS","GLOVE","GOING","GRACE",
  "GRADE","GRAIN","GRAND","GRANT","GRAPE","GRAPH","GRASS","GRATE",
  "GRAVE","GRAVY","GRAZE","GREAT","GREEN","GREET","GRIEF","GRILL",
  "GRIME","GROAN","GROOM","GROSS","GROUP","GROVE","GROWL","GROWN",
  "GUARD","GUESS","GUEST","GUIDE","GUILD","GUILT","GUISE","GULLY",
  "HABIT","HAPPY","HARSH","HASTE","HATCH","HAUNT","HEART","HEAVY",
  "HEDGE","HELLO","HENCE","HOBBY","HONEY","HONOR","HORSE","HOTEL",
  "HOUSE","HUMAN","HUMOR","HURRY","HYENA","IDEAL","IMAGE","IMPLY",
  "INDEX","INDIE","INFER","INNER","INPUT","IRONY","ISSUE","IVORY",
  "JELLY","JOKER","JUICE","JUICY","KEBAB","KNIFE","KNOCK","KNOWN",
  "LABEL","LABOR","LANCE","LARGE","LASER","LATCH","LATER","LAUGH",
  "LAYER","LEARN","LEASE","LEAST","LEAVE","LEDGE","LEGAL","LEVEL",
  "LEVER","LIGHT","LIKEN","LILAC","LIMIT","LINEN","LINER","LLAMA",
  "LOCAL","LODGE","LOGIC","LOOSE","LORRY","LOVER","LOWER","LOYAL",
  "LUCKY","LUNCH","LUNGE","LYRIC","MACHO","MAGIC","MAJOR","MAKER",
  "MANOR","MAPLE","MARCH","MATCH","MAYOR","MEDIA","MERCY","MERGE",
  "MERIT","MERRY","MESSY","METAL","METER","MIGHT","MIMIC","MINOR",
  "MINUS","MIRTH","MIXED","MODEL","MONEY","MONTH","MORAL","MOTOR",
  "MOUND","MOUSE","MOUTH","MOVIE","MURAL","MUSIC","NAIVE","NERVE",
  "NEVER","NIGHT","NOISE","NORTH","NOVEL","NURSE","NYLON","OCCUR",
  "OFFER","OFTEN","ONION","OPERA","ORDER","OTHER","OUTER","OXIDE",
  "OZONE","PAINT","PANEL","PANIC","PAPER","PARTY","PASTA","PASTE",
  "PATCH","PAUSE","PEACE","PEACH","PEDAL","PENNY","PHASE","PHONE",
  "PHOTO","PIANO","PIECE","PILOT","PINCH","PITCH","PIXEL","PLACE",
  "PLAIN","PLANE","PLANK","PLANT","PLATE","PLEAD","PLEAT","PLIER",
  "PLUCK","PLUGS","PLUSH","POINT","POISE","POKER","POLAR","POLYP",
  "POOCH","POPPY","PORCH","POSED","POSSE","POUCH","POUND","POWER",
  "PRESS","PRICE","PRIDE","PRIME","PRINT","PRIOR","PRIZE","PROBE",
  "PROOF","PROSE","PROUD","PROVE","PROXY","PRUNE","PULSE","PUNCH",
  "PUPIL","PURGE","PURSE","PUSHY","QUAKE","QUEEN","QUERY","QUEST",
  "QUEUE","QUICK","QUIET","QUITE","QUOTE","RADAR","RADIO","RAISE",
  "RALLY","RANCH","RANGE","RAPID","RATIO","REACH","REACT","READY",
  "REALM","REBUS","RECAP","REFER","RELAX","RELAY","RENAL","RENEW",
  "REPAY","REPEL","REPLY","RESIN","RETRO","RIDER","RIDGE","RIFLE",
  "RIGHT","RIGID","RINSE","RISKY","RIVAL","RIVER","ROBIN","ROBOT",
  "ROCKY","ROGUE","ROUGE","ROUGH","ROUND","ROUTE","ROYAL","RUGBY",
  "RULER","RURAL","SAINT","SALAD","SALON","SALSA","SALVE","SANDY",
  "SAUCE","SAVOR","SCALE","SCARE","SCARF","SCENE","SCENT","SCOPE",
  "SCORE","SCOUT","SCRAP","SCREW","SERVE","SETUP","SEVEN","SHADE",
  "SHALL","SHAME","SHAPE","SHARE","SHARK","SHARP","SHAVE","SHAWL",
  "SHEAR","SHEEN","SHEEP","SHEER","SHEET","SHELF","SHELL","SHIFT",
  "SHINE","SHIRE","SHIRT","SHOCK","SHORE","SHORT","SHOUT","SHOWN",
  "SIEGE","SILLY","SINCE","SIXTH","SIXTY","SIZED","SKATE","SKILL",
  "SKULL","SLAIN","SLATE","SLAVE","SLEEP","SLICE","SLIDE","SLOPE",
  "SMALL","SMART","SMELL","SMILE","SMITH","SMOKE","SNACK","SNAKE",
  "SOLAR","SOLID","SOLVE","SORRY","SOUND","SOUTH","SPACE","SPARE",
  "SPARK","SPEAK","SPEAR","SPEED","SPELL","SPEND","SPENT","SPICE",
  "SPICY","SPINE","SPLIT","SPOKE","SPOON","SPORT","SPRAY","SQUAD",
  "STACK","STAFF","STAGE","STAIN","STAIR","STAKE","STALK","STALL",
  "STAMP","STAND","STARE","START","STATE","STAVE","STAYS","STEAK",
  "STEAL","STEAM","STEEL","STEEP","STEER","STICK","STIFF","STILL",
  "STING","STINK","STOCK","STOOL","STORE","STORM","STORY","STOVE",
  "STRAP","STRAW","STRAY","STRIP","STUCK","STUDY","STUFF","STUMP",
  "STUNG","STUNK","STYLE","SUGAR","SUITE","SUNNY","SUPER","SURGE",
  "SWAMP","SWEAR","SWEAT","SWEEP","SWEET","SWEPT","SWIFT","SWING",
  "SWIPE","SWORD","SWORE","SWUNG","SYRUP","TABLE","TASTE","TEACH",
  "TEETH","TEMPO","TENSE","TENTH","THEME","THERE","THICK","THIEF",
  "THING","THINK","THIRD","THOSE","THREE","THREW","THROW","THUMB",
  "TIGER","TIGHT","TIMER","TIRED","TITLE","TOAST","TODAY","TOPIC",
  "TOTAL","TOUCH","TOUGH","TOWEL","TOWER","TOXIC","TRACE","TRACK",
  "TRADE","TRAIL","TRAIN","TRAIT","TRASH","TREAT","TREND","TRIAL",
  "TRIBE","TRICK","TRIED","TROOP","TRUCK","TRULY","TRUST","TRUTH",
  "TUMOR","TUNER","TUNIC","TWICE","TWIST","TYING","ULNAR","UNCUT",
  "UNDER","UNDID","UNDUE","UNFIT","UNION","UNITE","UNITY","UNTIL",
  "UPPER","UPSET","URBAN","USAGE","USUAL","UTTER","VAGUE","VALID",
  "VALUE","VAPOR","VERSE","VIDEO","VINYL","VIOLA","VIRAL","VIRUS",
  "VISIT","VISOR","VISTA","VITAL","VOCAL","VODKA","VOICE","VOTER",
  "VOUCH","VULVA","WAGER","WAGON","WATCH","WATER","WEARY","WEAVE",
  "WEDGE","WEIGH","WEIRD","WHALE","WHERE","WHICH","WHILE","WHITE",
  "WHOLE","WHOSE","WIDER","WIDTH","WITCH","WOMAN","WORLD","WORRY",
  "WORSE","WORST","WORTH","WOULD","WOUND","WRATH","WRITE","WRONG",
  "WROTE","YACHT","YIELD","YOUNG","YOUTH","ADAPT","ADORE","AGILE",
  "AISLE","ALLOT","ALOFT","AMAZE","AMEND","AMINO","ANTIC","ANVIL",
  "BACON","BAGEL","BARON","BASTE","BATHE","BAYOU","BEADY","BELLY",
  "BIRCH","BISON","BLISS","BLITZ","BLUES","BOGUS","BONES","BOSSY",
  "BRACE","BRASH","BRAWN","BRINK","BRISK","BROOD","BROOM","BRUNT",
  "BUDDY","BUGGY","BULGE","BULLY","BUMPY","BUNNY","CADET","CAPED",
  "CARAT","CAROL","CHILI","CINCH","CIRCA","CIVIC","CLASP","CLOAK",
  "CREPE","CRIMP","CROAK","CUBBY","CURLY","CURRY","CYNIC","DADDY",
  "DANDY","DEPOT","DETER","DIGIT","DITTY","DIZZY","DOWDY","DOWEL",
  "DOZEN","DROWN","DUMMY","DUMPY","DUSTY","EAGER","EATER","EDEMA",
  "ENDOW","ERASE","ERODE","ESSAY","EVADE","EVOKE","EXERT","EXPAT",
  "FARCE","FEINT","FEMUR","FERAL","FIBRE","FILTH","FIRST","FISHY",
  "FLEET","FORAY","FORTY","FRANK","FRAUD","FREED","FUNGI","GAUZE",
  "GIDDY","GRIPE","GUMMY","GUSTY","GYPSY","HARDY","HASTY","HIPPO",
  "HOLLY","HOMER","HUNKY","HUSKY","IRATE","JERKY","JIFFY","JOLLY",
  "JUNCO","KIDDO","KINKY","KNEAD","KNEEL","MELEE","MINCE","MISTY",
  "MOSSY","MUDDY","MUSHY","MUSTY","PETTY","RUSTY","ADDED","AFFIX",
  "AIMED","AMASS","ANNOY","AWOKE","AXIAL","BALMY","BLINK","BOOST",
  "ABATE","ABBEY","ABORT","ACORN","ACRID","ADEPT","ADMIN","ADOBE",
  "AEGIS","AFOOT","AGAPE","AGATE","AGING","ALGAE","ALIBI","ALLOY",
  "ALOOF","ALTAR","AMBLE","AMUSE","ANGST","ANNUL","APTLY","ARGON",
  "ATONE","AVAIL","AVERT","AVIAN","AXIOM","BAGGY","BALDY","BALLS",
  "BALSA","BANAL","BANJO","BARGE","BARMY","BARNS","BATON","BATTY",
  "BEAMS","BEANS","BEARS","BEFIT","BEGAN","BELLE","BILLS","BILGE",
  "BINGE","BITTY","BLARE","BLIMP","BLOAT","BLUFF","BOGGY","BOLTS",
  "BOOZE","BOTCH","BRIAR","BRINY","BULKY","BURLY","BURNS","BYLAW",
  "CABAL","CALLS","CAMPS","CANAL","CANON","CAPER","CAPON","CARDS",
  "CAVES","CELLS","CHAFE","CHEAT","CHIPS","CHOKE","CHORE","CHURN",
  "CIDER","CIVIL","CLOUT","CLUBS","CLUED","CLUNG","COBRA","COCOA",
  "CODES","COILS","COINS","COLON","COMMA","CONCH","CONDO","CORGI",
  "COSTS","CRATE","CRAVE","CROCK","CROOK","CRUEL","CRYPT","CUBIC",
  "CURLS","CURSE","DARTS","DATUM","DEALS","DECKS","DECRY","DEFER",
  "DEITY","DENSE","DINGY","DOLLY","DOWNS","DRAKE","DROOL","DROOP",
  "DROPS","DROSS","DRUMS","DRYLY","DUALS","DUELS","DUNCE","DUNES",
  "DUTCH","DUVET","EAVES","EBONY","EDGES","EDICT","ELFIN","ELOPE",
  "ELUDE","EMBED","EMERY","EMOTE","ENACT","ENSUE","ERRED","ETHIC",
  "EVICT","EXPEL","EXTOL","EXUDE","FAILS","FALLS","FANGS","FARMS",
  "FAUNA","FEATS","FETUS","FEWER","FIEND","FILCH","FILMS","FINDS",
  "FINED","FINCH","FIRED","FIRMS","FIXED","FIZZY","FLANK","FLIES",
  "FLING","FLOSS","FLOWS","FLUKE","FOAMY","FOCAL","FOILS","FOLDS",
  "FOLKS","FOLLY","FONTS","FORMS","FORTE","FOXES","FOYER","FRAIL",
  "FRAYS","FRIED","FUELS","FUMED","FUMES","FUNDS","FUNKY","FURRY",
  "FUSSY","GAILY","GAINS","GAMMA","GANGS","GASES","GATES","GAUDY",
  "GAUNT","GAVEL","GEARS","GECKO","GEESE","GENIE","GENUS","GERMS",
  "GIANT","GIFTS","GIVER","GLARE","GLITZ","GLOAT","GLYPH","GOALS",
  "GOLEM","GOLLY","GOODS","GOOEY","GOOFY","GOOSE","GORGE","GREED",
  "GRIMY","GRITS","GROIN","GROPE","GRUEL","GRUFF","GRUNT","GUAVA",
  "GULCH","GUSTS","HALLS","HALVE","HANDS","HANDY","HANGS","HARMS",
  "HARPS","HATED","HAVOC","HAZEL","HEADS","HEALS","HEAPS","HEARD",
  "HEAVE","HEEDS","HEELS","HEFTY","HELPS","HERBS","HERDS","HIRED",
  "HITCH","HOLDS","HOLES","HOMES","HOOKS","HOPED","HOPES","HORNS",
  "HOSTS","HOURS","HOVER","HOWLS","HUMPS","HUMUS","HUNTS","HYMNS",
  "ACHED","ACIDS","ACRES","ACTED","AIDED","ALLAY","AROSE","ARRAY",
  "AUGUR","AWAIT","AWFUL","BANDS","BANKS","BEADS","BEGUN","BELLS",
  "BELTS","BIRDS","BOATS","BOMBS","BONDS","BOOKS","BOOTS","BUMPS",
  "APRON","BIKES","BOXES","DULLS","DUSKY","ABBOT","ABYSS","ADAGE",
  "IGLOO","INBOX","INEPT","INTER","INTRO","IONIC","JAUNT","JEANS",
  "JENNY","JOIST","KAYAK","KNOBS","KNOLL","KNOTS","LADEN","LADLE",
  "LAGER","LAKES","LAMBS","LAMPS","LANDS","LANES","LANKY","LAPEL",
  "LAPSE","LATEX","LATHE","LAWNS","LEADS","LEAKY","LEAPT","LEASH",
  "LEECH","LEFTY","LEMUR","LEPER","LIKED","LIMBO","LIMBS","LINED",
  "LINES","LINKS","LISTS","LOADS","LOANS","LOBBY","LOFTY","LOGIN",
  "LONER","LOOKS","LOOPS","LOTUS","LOUSY","LUMPS","LUMPY","LURCH",
  "MAFIA","MAIZE","MALES","MASON","MAXIM","MEALY","MEANS","MEATS",
  "MELON","MEMOS","MENUS","MICRO","MIDST","MILLS","MINER","MINES",
  "MISER","MITES","MITRE","MIXER","MOANS","MODEM","MOGUL","MOIST",
  "MOLAR","MOLDY","MONKS","MOODS","MOODY","MOTEL","MOTTO","MUCKY",
  "MUMMY","MURKY","NACHO","NAILS","NANNY","NAVAL","NERDY","NEWLY",
  "NEXUS","NINJA","NITTY","NOMAD","NORMS","NOTED","NOTES","NUTTY",
  "OASIS","ODDLY","ODORS","OMEGA","OMITS","OPIUM","ORGAN","OUGHT",
  "OUNCE","OVALS","OVENS","OVERT","OWNED","OWNER","PADDY","PAGES",
  "PAINS","PAIRS","PALMS","PANDA","PANTS","PARKS","PASTY","PATHS",
  "PATIO","PATTY","PEAKS","PEELS","PENAL","PENCE","PERKY","PESKY",
  "PETAL","PICKS","PICKY","PIETY","PINES","PIPES","PIZZA","PLAIT",
  "PLANS","PLODS","PLOTS","POEMS","POETS","POLES","POLLS","PONDS",
  "POOLS","PORES","PORTS","POSES","POSTS","POTTY","POURS","PRAYS",
  "PRIMP","PRIVY","PRODS","PRONE","PRONG","PROPS","PROWL","PRUDE",
  "PSALM","PULLS","PUMPS","PUNKS","PUPPY","PUTTY","PYGMY","QUALM",
  "RABBI","RADII","RAIDS","RAILS","RAMPS","RANKS","RATED","RAZOR",
  "READS","REAMS","REAPS","REEDS","REEFS","REINS","RELIC","REMIT",
  "RENTS","RIGOR","RINGS","RIOTS","RISEN","RISKS","RITES","ROADS",
  "ROCKS","RODEO","ROLLS","ROOFS","ROOMS","ROOTS","ROPES","ROSES",
  "RUINS","RULED","RULES","RUMBA","RUMOR","RUNGS","SABLE","SADLY",
  "SAFER","SAFES","SALTS","SALTY","SANDS","SAUNA","SCAMS","SCANS",
  "SCARY","SCOOP","SCORN","SCOWL","SEALS","SEAMS","SEATS","SEEDS",
  "SEIZE","SENSE","SEWER","SHADY","SHEDS","SHIMS","SHINY","SHIPS",
  "SHOES","SHONE","SHOOK","SHOTS","SHOWS","SIGNS","SITES","SIZES",
  "SKIDS","SKINS","SKIRT","SLABS","SLANG","SLANT","SLAPS","SLASH",
  "SLATS","SLEDS","SLEEK","SLEET","SLEPT","SLIME","SLIMY","SLING",
  "SLIPS","SLOTS","SLOTH","SLOWS","SLUGS","SLUMP","SLUNG","SNAGS",
  "SNARE","SNARL","SNEAK","SNIFF","SNORE","SNOUT","SNOWY","SOBER",
  "SOCKS","SONGS","SONIC","SORTS","SOULS","SPANS","SPAWN","SPECS",
  "SPIED","SPIKE","SPILL","SPITE","SPOTS","SPOUT","SPREE","SPRIG",
  "SPUNK","SQUAT","STAGS","STARK","STARS","STASH","STEMS","STEPS",
  "STERN","STEWS","STINT","STOKE","STONY","STOOD","STORK","STOUT",
  "STRUT","STUDS","STUNT","SUAVE","SUITS","SULKY","SURLY","SWANS",
  "SWAPS","SWARM","SWELL","TACKY","TAILS","TAKEN","TALES","TALKS",
  "TALLY","TANGY","TANKS","TAPER","TAPES","TARDY","TASKS","TAXES",
  "TEARS","TEASE","TEDDY","TEENS","TENDS","TERMS","TESTS","THEIR",
  "THESE","THIGH","THUGS","TIDAL","TIERS","TILES","TILTS","TIMES",
  "TIMID","TIPSY","TONAL","TONES","TONIC","TOOLS","TOOTH","TORCH",
  "TOURS","TOWNS","TRAMP","TRAPS","TRAWL","THUMP","SHRED","SPOOL",
  "SWOOP","LEAFY","MEATY","RAINY","OAKEN","BUSHY","NERVY","ZONAL",
  "DITSY","ROWDY",
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
