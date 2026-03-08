
// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════
const DEFAULT_BLOCK_START = '2026-03-09';
function parseLocalDate(v) {
  if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(v);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
(function migrateLegacyStartDate(){
  try {
    if (localStorage.getItem('bjj_start') === '2026-03-08') {
      localStorage.setItem('bjj_start', DEFAULT_BLOCK_START);
    }
  } catch(e) {}
})();
const BLOCK_START = parseLocalDate((() => { try { return localStorage.getItem('bjj_start') || DEFAULT_BLOCK_START; } catch(e){ return DEFAULT_BLOCK_START; } })());
const DAYS        = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_TYPES   = ['bjj','str','rec','bjj','bjj','str','str'];
const DAY_LABELS  = ['🥋 BJJ Evening','💪 Strength A','🌿 Recovery','🥋 BJJ Evening','🥋 BJJ Morning','💪 Strength B','💪 Strength C'];
const DAY_TIMES   = ['18:00','Flexible','Morning','18:00','07:00','Flexible','Flexible'];
const SESS_KEYS   = [null,'A',null,'D',null,'B','C']; // which session per dow

const PHASES = [
  {weeks:[1,2,3,4],   label:'Phase 1 — Movement Quality',    color:'var(--blue)',   detail:'Focus on patterns. Weights secondary to form. Hit every BJJ class.'},
  {weeks:[5,6,7,8],   label:'Phase 2 — Strength & Power',    color:'var(--accent)', detail:'Add weight every 1–2 weeks. BJJ cardio building. Track energy into sessions.'},
  {weeks:[9,10,11,12],label:'Phase 3 — Power & Specificity', color:'var(--purple)', detail:'Peak strength block. Heavy sets. Note which BJJ positions feel automatic.'},
  {weeks:[13],         label:'Week 13 — DELOAD',              color:'var(--gold)',   detail:'40% less weight, 2 sets, Tuesday only. BJJ: drill only, no hard rolls.'},
];

const DAY_TARGETS = {
  bjj:{kcal:3200,protein:220,carbs:340,fat:80},
  str:{kcal:2900,protein:210,carbs:300,fat:75},
  rec:{kcal:2500,protein:195,carbs:250,fat:70},
};

const BJJ_POSITIONS = [
  'Guard','Half Guard','Side Control','Mount','Back Control',
  'Turtle','Takedowns','Leg Locks','Escapes','Submissions','Drilling','Rolling',
];

const SORE_ZONES = [
  {id:'neck',  label:'Neck',        d:'M72,18 Q80,14 88,18 L86,32 Q80,36 74,32Z'},
  {id:'lsho',  label:'L Shoulder',  d:'M50,35 Q42,32 38,42 L44,50 Q50,46 54,42Z'},
  {id:'rsho',  label:'R Shoulder',  d:'M110,35 Q118,32 122,42 L116,50 Q110,46 106,42Z'},
  {id:'chest', label:'Chest',       d:'M60,38 Q80,34 100,38 L98,62 Q80,66 62,62Z'},
  {id:'luarm', label:'L Upper Arm', d:'M42,52 Q36,58 38,68 L46,68 Q48,58 50,52Z'},
  {id:'ruarm', label:'R Upper Arm', d:'M118,52 Q124,58 122,68 L114,68 Q112,58 110,52Z'},
  {id:'core',  label:'Core',        d:'M62,64 Q80,60 98,64 L96,88 Q80,92 64,88Z'},
  {id:'llarm', label:'L Forearm',   d:'M38,70 Q32,78 36,88 L44,86 Q44,76 46,70Z'},
  {id:'rlarm', label:'R Forearm',   d:'M122,70 Q128,78 124,88 L116,86 Q116,76 114,70Z'},
  {id:'lhip',  label:'L Hip',       d:'M56,90 Q48,96 50,110 L62,110 Q62,96 64,90Z'},
  {id:'rhip',  label:'R Hip',       d:'M104,90 Q112,96 110,110 L98,110 Q98,96 96,90Z'},
  {id:'lqd',   label:'L Quad',      d:'M56,112 Q52,126 54,142 L66,142 Q66,126 64,112Z'},
  {id:'rqd',   label:'R Quad',      d:'M104,112 Q108,126 106,142 L94,142 Q94,126 96,112Z'},
  {id:'lham',  label:'L Hamstring', d:'M54,144 Q52,158 56,172 L66,170 Q64,156 64,144Z'},
  {id:'rham',  label:'R Hamstring', d:'M106,144 Q108,158 104,172 L94,170 Q96,156 96,144Z'},
  {id:'lkn',   label:'L Knee',      d:'M56,174 Q54,182 58,190 L66,188 Q64,180 64,174Z'},
  {id:'rkn',   label:'R Knee',      d:'M104,174 Q106,182 102,190 L94,188 Q96,180 96,174Z'},
  {id:'lcalf', label:'L Calf',      d:'M58,192 Q56,206 60,218 L68,216 Q66,202 66,192Z'},
  {id:'rcalf', label:'R Calf',      d:'M102,192 Q104,206 100,218 L92,216 Q94,202 94,192Z'},
  {id:'lback', label:'L Back',      d:'M62,64 Q56,72 58,90 L70,90 Q68,72 66,64Z'},
  {id:'rback', label:'R Back',      d:'M98,64 Q104,72 102,90 L90,90 Q92,72 94,64Z'},
];

const MEALS = {
  bjj:{label:'BJJ Day',meals:[
    {id:'m1',name:'Breakfast',time:'07:00',rotate:true,
      wA:{ings:[{i:'🥛',n:'Greek Yoghurt 0%',q:'350g'},{i:'🌾',n:'Granola',q:'60g'},{i:'🫐',n:'Frozen Berries',q:'80g'},{i:'🍯',n:'Honey',q:'15g'}]},
      wB:{ings:[{i:'🍞',n:'Sourdough Toast',q:'2 slices'},{i:'🧈',n:'Butter',q:'15g'},{i:'🍯',n:'Honey',q:'15g'},{i:'🥛',n:'Greek Yoghurt 0%',q:'350g'},{i:'🫐',n:'Frozen Berries',q:'80g'}]}},
    {id:'m2',name:'Mid-Morning',time:'10:30',ings:[{i:'🌾',n:'Porridge Oats',q:'50g dry'},{i:'🥤',n:'Whey Protein',q:'1 scoop'},{i:'🥛',n:'Whole Milk',q:'200ml'},{i:'🫐',n:'Blueberries',q:'80g'}],note:'Stir whey in off the heat'},
    {id:'m3',name:'Lunch',time:'13:00',ings:[{i:'🍗',n:'Chicken Breast',q:'180g raw'},{i:'🍚',n:'White Rice',q:'75g dry'},{i:'🥗',n:'Salad Leaves',q:'50g'},{i:'🫒',n:'Olive Oil',q:'10ml'}]},
    {id:'m4',name:'Pre-Training',time:'16:30',ings:[{i:'🥤',n:'Whey Protein',q:'1 scoop'},{i:'🍘',n:'Rice Cakes',q:'2'},{i:'🍯',n:'Honey',q:'15g'}],note:'Mon/Thu 16:30 · Fri 16:00'},
    {id:'m5',name:'Dinner',time:'19:30',fridayOverride:true,rotate:true,
      fri:{ings:[{i:'🐟',n:'Frozen Salmon',q:'200g'},{i:'🍠',n:'Sweet Potato',q:'200g raw'},{i:'🥬',n:'Frozen Spinach',q:'100g'},{i:'🫒',n:'Olive Oil',q:'10ml'}],note:'Every Friday'},
      wA:{ings:[{i:'🍗',n:'Chicken Thighs',q:'200g raw'},{i:'🍚',n:'White Rice',q:'75g dry'},{i:'🥦',n:'Frozen Broccoli',q:'150g'},{i:'🫒',n:'Olive Oil',q:'10ml'}]},
      wB:{ings:[{i:'🍗',n:'Chicken Breast',q:'200g raw'},{i:'🍚',n:'White Rice',q:'75g dry'},{i:'🥦',n:'Frozen Broccoli',q:'150g'},{i:'🫒',n:'Olive Oil',q:'10ml'}]}},
  ]},
  str:{label:'Strength Day',meals:[
    {id:'m1',name:'Breakfast',time:'07:00',rotate:true,
      wA:{ings:[{i:'🥛',n:'Greek Yoghurt 0%',q:'350g'},{i:'🌾',n:'Granola',q:'50g'},{i:'🫐',n:'Frozen Berries',q:'80g'}]},
      wB:{ings:[{i:'🍞',n:'Sourdough Toast',q:'2 slices'},{i:'🧈',n:'Butter',q:'15g'},{i:'🍯',n:'Honey',q:'10g'},{i:'🥛',n:'Greek Yoghurt 0%',q:'350g'},{i:'🫐',n:'Frozen Berries',q:'80g'}]}},
    {id:'m2',name:'Mid-Morning',time:'10:30',ings:[{i:'🌾',n:'Porridge Oats',q:'50g dry'},{i:'🥤',n:'Whey Protein',q:'1 scoop'},{i:'🥛',n:'Whole Milk',q:'200ml'},{i:'🫐',n:'Blueberries',q:'80g'}]},
    {id:'m3',name:'Lunch',time:'13:00',ings:[{i:'🍗',n:'Chicken Breast',q:'180g raw'},{i:'🍝',n:'Pasta',q:'75g dry'},{i:'🍅',n:'Passata',q:'150g'},{i:'🧀',n:'Parmesan',q:'20g'}]},
    {id:'m4',name:'Pre-Training',time:'16:00',ings:[{i:'🥤',n:'Whey Protein',q:'1 scoop'},{i:'🍌',n:'Banana',q:'120g'},{i:'🍘',n:'Rice Cakes',q:'2'}],note:'Tue 16:00 · Sat/Sun 12:30'},
    {id:'m5',name:'Dinner',time:'19:30',rotate:true,
      wA:{ings:[{i:'🥩',n:'Beef Mince 5%',q:'200g raw'},{i:'🍠',n:'Sweet Potato',q:'120g raw'},{i:'🫘',n:'Green Beans',q:'150g'},{i:'🫒',n:'Olive Oil',q:'10ml'}]},
      wB:{ings:[{i:'🍗',n:'Chicken Thighs',q:'180g raw'},{i:'🍝',n:'Pasta',q:'80g dry'},{i:'🧄',n:'Pesto',q:'30g'},{i:'🍅',n:'Cherry Tomatoes',q:'100g'},{i:'🥒',n:'Courgette',q:'100g'}]}},
  ]},
  rec:{label:'Recovery Day',meals:[
    {id:'m1',name:'Breakfast',time:'07:30',rotate:true,
      wA:{ings:[{i:'🥛',n:'Greek Yoghurt 0%',q:'350g'},{i:'🌾',n:'Granola',q:'40g'},{i:'🫐',n:'Frozen Berries',q:'80g'}]},
      wB:{ings:[{i:'🍞',n:'Sourdough Toast',q:'2 slices'},{i:'🧈',n:'Butter',q:'10g'},{i:'🍯',n:'Honey',q:'10g'},{i:'🥛',n:'Greek Yoghurt 0%',q:'350g'},{i:'🫐',n:'Frozen Berries',q:'80g'}]}},
    {id:'m2',name:'Mid-Morning',time:'11:00',ings:[{i:'🌾',n:'Porridge Oats',q:'40g dry'},{i:'🥤',n:'Whey Protein',q:'1 scoop'},{i:'🥛',n:'Whole Milk',q:'200ml'},{i:'🫐',n:'Blueberries',q:'80g'}],note:'Recovery: 40g oats not 50g'},
    {id:'m3',name:'Lunch',time:'13:30',ings:[{i:'🍗',n:'Chicken Thighs',q:'180g raw'},{i:'🍚',n:'White Rice',q:'75g dry'},{i:'🥒',n:'Cucumber',q:'100g'},{i:'🫒',n:'Olives',q:'30g'},{i:'🫒',n:'Olive Oil',q:'10ml'}]},
    {id:'m4',name:'Afternoon Snack',time:'16:00',ings:[{i:'🥤',n:'Whey Protein',q:'1 scoop'},{i:'🥛',n:'Whole Milk',q:'200ml'},{i:'🌾',n:'Wholegrain Crackers',q:'30g'}],note:'No banana or honey on recovery days'},
    {id:'m5',name:'Dinner',time:'19:00',rotate:true,
      wA:{ings:[{i:'🍗',n:'Chicken Breast',q:'180g raw'},{i:'🍠',n:'Sweet Potato',q:'180g raw'},{i:'🥒',n:'Courgette',q:'120g raw'},{i:'🫒',n:'Olive Oil',q:'10ml'}]},
      wB:{ings:[{i:'🥩',n:'Beef Mince 5%',q:'200g raw'},{i:'🍚',n:'White Rice',q:'75g dry'},{i:'🥒',n:'Courgette',q:'120g raw'},{i:'🫒',n:'Olive Oil',q:'10ml'}]}},
  ]},
};

const SESSIONS = {
  A:{label:'Session A · Tuesday · Lower Body',color:'var(--blue)',exercises:[
    {id:'A1',name:'Trap Bar Deadlift',tag:'Primary',cue:'Hinge, neutral spine. Drive the floor away. Full lockout.',sets:4,guide:'Wks 1–4: 6–8 · Wks 5–8: 4–6 · Wks 9–12: 3–5 · Rest 3min'},
    {id:'A2',name:'Bulgarian Split Squat',tag:'Unilateral',cue:'Rear foot elevated, front shin vertical. Control descent.',sets:3,guide:'8–10 each leg · Rest 90sec'},
    {id:'A3',name:'Romanian Deadlift',tag:'Posterior Chain',cue:'Push hips back, feel hamstring stretch. Soft knee.',sets:3,guide:'10–12 · Rest 90sec'},
    {id:'A4',name:'Hip Thrust',tag:'Glutes',cue:'Bar on hip crease. Squeeze hard at top. Chin tucked.',sets:3,guide:'10–12 · Rest 90sec'},
    {id:'A5',name:'Pallof Press',tag:'Core',cue:'Cable at chest. Press out, hold 2sec. Both sides.',sets:3,guide:'10 each side · Rest 60sec'},
    {id:'A6',name:"Farmer's Carry",tag:'Loaded Carry',cue:'Heavy DBs, tall posture, short steps.',sets:3,guide:'3×40m · Rest 90sec'},
  ]},
  B:{label:'Session B · Saturday · Upper Body',color:'var(--purple)',exercises:[
    {id:'B1',name:'Weighted Pull-Ups',tag:'Primary',cue:'Full hang. Chest to bar. Control descent.',sets:4,guide:'Wks 1–4: BW 6–8 · Wks 5–8: +5kg 5–6 · Wks 9–12: +10kg 4–5 · Rest 3min'},
    {id:'B2',name:'Pendlay Row',tag:'Horizontal Pull',cue:'Bar from floor each rep. Horizontal torso. Explosive.',sets:4,guide:'5–6 · Rest 2min'},
    {id:'B3',name:'Single Arm DB Row',tag:'Unilateral',cue:'Elbow drives straight back. No torso rotation.',sets:3,guide:'10–12 each side · Rest 90sec'},
    {id:'B4',name:'Landmine Press',tag:'Shoulder',cue:'Half-kneeling. Shoulder-safe arc.',sets:3,guide:'8–10 · Rest 90sec'},
    {id:'B5',name:'Face Pulls',tag:'Shoulder Health',cue:'Cable at forehead. Pull to ears, elbows high. Never skip.',sets:3,guide:'15 light · Rest 60sec'},
    {id:'B6',name:'Crush Grip Dead Hangs',tag:'Grip/BJJ',cue:'Crush grip. Hang to failure. Track seconds.',sets:3,guide:'3×max hold'},
  ]},
  C:{label:'Session C · Sunday · Power & Conditioning',color:'var(--green)',exercises:[
    {id:'C1',name:'Power Clean',tag:'Primary Power',cue:'Explosive hip extension. High pull, drop under. Reset each rep.',sets:4,guide:'Wks 1–4: 3 light · Wks 5–8: 3 mod · Wks 9–12: 3 heavy · Rest 3min'},
    {id:'C2',name:'Goblet Squat',tag:'Squat',cue:'KB at chest, deep squat, elbows track inside knees.',sets:3,guide:'10–12 · Rest 90sec'},
    {id:'C3',name:'Half-Kneeling KB Press',tag:'Stability',cue:'Strict overhead. Glute squeeze on down knee.',sets:3,guide:'8–10 each arm · Rest 90sec'},
    {id:'C4',name:'Sandbag Carry',tag:'Loaded Carry',cue:'Bear hug. Awkward load = BJJ carryover.',sets:3,guide:'30–40m · Rest 90sec'},
    {id:'C5',name:'TRX Bodysaw',tag:'Core',cue:'Feet in TRX, plank. Push back slowly, return controlled.',sets:3,guide:'8–12 · Rest 60sec'},
    {id:'C6',name:'KB Swings / Battle Rope',tag:'Conditioning',cue:'KB: explosive hip drive. Battle rope: 30on/30off.',sets:4,guide:'Wks 1–4: 3 · Wks 5–8: 4 · Wks 9–12: 5 rounds'},
  ]},
};

// ═══════════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════════
const STORAGE_KEY = 'bjj_v3';
const STORAGE_BACKUP_KEY = 'bjj_v3_backup';
const SCHEMA_VERSION = 7;

function defaultState() {
  return {
    ci:{},
    wo:{},
    rev:{},
    prep:{},
    _meta:{schemaVersion:SCHEMA_VERSION,createdAt:new Date().toISOString(),updatedAt:null,lastAction:'init'}
  };
}
function normaliseState(raw) {
  const base = defaultState();
  const incoming = raw && typeof raw === 'object' ? raw : {};
  const state = {...base, ...incoming};
  if (!state.ci || typeof state.ci !== 'object') state.ci = {};
  if (!state.wo || typeof state.wo !== 'object') state.wo = {};
  if (!state.rev || typeof state.rev !== 'object') state.rev = {};
  if (!state.prep || typeof state.prep !== 'object') state.prep = {};
  if (!state._meta || typeof state._meta !== 'object') state._meta = {};
  state._meta = {...base._meta, ...state._meta, schemaVersion:SCHEMA_VERSION};
  return state;
}
function loadState() {
  const tryParse = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? normaliseState(JSON.parse(raw)) : null;
    } catch(e) { return null; }
  };
  return tryParse(STORAGE_KEY) || tryParse(STORAGE_BACKUP_KEY) || defaultState();
}
let S = loadState();
function touchState(reason='update') {
  S = normaliseState(S);
  S._meta.updatedAt = new Date().toISOString();
  S._meta.lastAction = reason;
}
function formatSavedAt(iso) {
  if (!iso) return 'Not saved yet';
  const dt = new Date(iso);
  return `Last saved ${dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})} ${dt.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}`;
}
function updateLastSavedUI() {
  const meta = S._meta || {};
  const summary = `${formatSavedAt(meta.updatedAt)} · schema v${meta.schemaVersion || SCHEMA_VERSION}`;
  const install = document.getElementById('install-status');
  const storageMeta = document.getElementById('storage-meta');
  const storageStatus = document.getElementById('storage-status');
  if (install && !isStandaloneMode()) install.innerHTML = `Saved on this device. ${summary}. Install the app to your phone home screen once it is hosted on HTTPS.`;
  if (install && isStandaloneMode()) install.innerHTML = `Installed ✓ Your tracker is on the home screen. ${summary}.`;
  if (storageMeta) storageMeta.textContent = summary + (meta.lastAction ? ` · ${meta.lastAction}` : '');
  if (storageStatus) storageStatus.style.borderColor = 'var(--border)';
}
function save(reason='update') {
  touchState(reason);
  const payload = JSON.stringify(S);
  try { localStorage.setItem(STORAGE_BACKUP_KEY, payload); } catch(e) {}
  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch(e) {
    toast('Save failed — storage unavailable');
  }
  updateLastSavedUI();
}
const getCI  = d         => (S.ci  || {})[d]       || {};
const getWO  = (d,s)     => ((S.wo || {})[d]       || {})[s] || {};
const getRev = wn        => (S.rev || {})[wn]      || {};
const getPrep= (k)       => (S.prep || {})[k]      || {};
const saveCI = (d,data)  => { if(!S.ci)S.ci={}; S.ci[d]={...(S.ci[d]||{}),...data}; save('check-in'); };
const saveWO = (d,s,data)=> { if(!S.wo)S.wo={}; if(!S.wo[d])S.wo[d]={}; S.wo[d][s]=data; save(`workout ${s}`); };
const saveRev= (wn,data) => { if(!S.rev)S.rev={}; S.rev[wn]={...(S.rev[wn]||{}),...data}; save(`review week ${wn}`); };
const savePrep=(k,data)  => { if(!S.prep)S.prep={}; S.prep[k]={...(S.prep[k]||{}),...data}; save(`meal prep ${k}`); };

const TIMER_PRESETS = [45,60,75,90];
const REST_PRESETS = [60,90,120,180];
let workoutTimerTick = null;
let restTimerTick = null;

function formatTimerClock(totalSec=0) {
  const secs = Math.max(0, Math.floor(totalSec || 0));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const rem = secs % 60;
  return hrs > 0
    ? `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(rem).padStart(2,'0')}`
    : `${String(mins).padStart(2,'0')}:${String(rem).padStart(2,'0')}`;
}
function formatDurationShort(totalSec=0) {
  const secs = Math.max(0, Math.floor(totalSec || 0));
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins || 0}m`;
}
function getTimerElapsedFromWorkoutRecord(wo={}) {
  let elapsed = Math.max(0, parseInt(wo._elapsedSec) || 0);
  if (wo._timerRunning && wo._timerStartedAt) {
    const since = Math.floor((Date.now() - new Date(wo._timerStartedAt).getTime()) / 1000);
    if (Number.isFinite(since) && since > 0) elapsed += since;
  }
  return elapsed;
}
function getWorkoutTimerState(d=today(), s=wkSess) {
  const wo = getWO(d, s);
  return {
    elapsedSec: Math.max(0, parseInt(wo._elapsedSec) || 0),
    running: !!wo._timerRunning,
    startedAt: wo._timerStartedAt || null,
    targetMin: parseInt(wo._targetMin) || 60,
    durationSec: Math.max(0, parseInt(wo._durationSec) || 0)
  };
}
function getLiveWorkoutTimerState(d=today(), s=wkSess) {
  const timer = getWorkoutTimerState(d, s);
  return {
    ...timer,
    elapsedSec: getTimerElapsedFromWorkoutRecord({
      _elapsedSec: timer.elapsedSec,
      _timerRunning: timer.running,
      _timerStartedAt: timer.startedAt
    })
  };
}
function stopWorkoutTimerTick() {
  if (workoutTimerTick) {
    clearInterval(workoutTimerTick);
    workoutTimerTick = null;
  }
}
function startWorkoutTimerTick() {
  stopWorkoutTimerTick();
  if (!document.getElementById('screen-workout')?.classList.contains('active')) return;
  const timer = getWorkoutTimerState(today(), wkSess);
  updateWorkoutTimerUI();
  if (!timer.running) return;
  workoutTimerTick = setInterval(updateWorkoutTimerUI, 1000);
}
function pauseOtherWorkoutTimers(activeDate, activeSession) {
  const paused = [];
  Object.entries(S.wo || {}).forEach(([dateKey, sessions]) => {
    Object.entries(sessions || {}).forEach(([sessionKey, wo]) => {
      if (!wo || !wo._timerRunning || (dateKey === activeDate && sessionKey === activeSession)) return;
      const elapsed = getTimerElapsedFromWorkoutRecord(wo);
      wo._elapsedSec = elapsed;
      wo._durationSec = elapsed;
      wo._timerRunning = false;
      wo._timerStartedAt = null;
      paused.push(`Session ${sessionKey}`);
    });
  });
  if (paused.length) {
    save('workout timer swap');
    toast(`${paused[0]} timer paused`);
  }
}
function patchWorkoutTimer(d, s, patch, reason=`workout ${s} timer`) {
  if (!S.wo) S.wo = {};
  if (!S.wo[d]) S.wo[d] = {};
  S.wo[d][s] = {...(S.wo[d][s] || {}), ...patch};
  save(reason);
}
function setWorkoutTarget(mins) {
  patchWorkoutTimer(today(), wkSess, {_targetMin: mins}, `workout ${wkSess} target`);
  renderWorkoutTimer();
}
function toggleWorkoutTimer() {
  const d = today();
  const s = wkSess;
  const timer = getWorkoutTimerState(d, s);
  if (timer.running) {
    pauseWorkoutTimer();
    return;
  }
  pauseOtherWorkoutTimers(d, s);
  patchWorkoutTimer(d, s, {
    _timerRunning: true,
    _timerStartedAt: new Date().toISOString(),
    _targetMin: timer.targetMin || 60,
    _elapsedSec: timer.elapsedSec || 0,
    _durationSec: Math.max(timer.durationSec || 0, timer.elapsedSec || 0)
  }, `workout ${s} timer start`);
  renderWorkoutTimer();
  toast('Workout timer running');
}
function pauseWorkoutTimer() {
  const d = today();
  const s = wkSess;
  const live = getLiveWorkoutTimerState(d, s);
  patchWorkoutTimer(d, s, {
    _elapsedSec: live.elapsedSec,
    _durationSec: live.elapsedSec,
    _timerRunning: false,
    _timerStartedAt: null
  }, `workout ${s} timer pause`);
  renderWorkoutTimer();
}
function resetWorkoutTimer() {
  const d = today();
  const s = wkSess;
  patchWorkoutTimer(d, s, {
    _elapsedSec: 0,
    _durationSec: 0,
    _timerRunning: false,
    _timerStartedAt: null
  }, `workout ${s} timer reset`);
  renderWorkoutTimer();
  toast('Workout timer reset');
}
function getTimerStatusMeta(elapsedSec, targetMin, running) {
  const targetSec = Math.max(1, (targetMin || 60) * 60);
  const diff = targetSec - elapsedSec;
  if (!running && elapsedSec === 0) return {text:`Target ${targetMin} min · Start when your first warm-up begins`, color:'var(--blue)', pct:0};
  if (diff > 300) return {text:`${Math.ceil(diff/60)} min left to your ${targetMin} min target`, color:'var(--green)', pct:Math.min(100, elapsedSec/targetSec*100)};
  if (diff >= 0) return {text:`Final ${Math.max(1, Math.ceil(diff/60))} min — finish accessories with intent`, color:'var(--gold)', pct:Math.min(100, elapsedSec/targetSec*100)};
  return {text:`${Math.ceil(Math.abs(diff)/60)} min over target — wrap up and log your session`, color:'var(--accent)', pct:100};
}
function updateWorkoutTimerUI() {
  const elapsedEl = document.getElementById('wk-timer-elapsed');
  if (!elapsedEl) return;
  const pill = document.getElementById('wk-timer-pill');
  const sub = document.getElementById('wk-timer-status');
  const fill = document.getElementById('wk-timer-fill');
  const btn = document.getElementById('wk-timer-toggle');
  const live = getLiveWorkoutTimerState(today(), wkSess);
  const meta = getTimerStatusMeta(live.elapsedSec, live.targetMin, live.running);
  elapsedEl.textContent = formatTimerClock(live.elapsedSec);
  if (sub) sub.textContent = meta.text;
  if (fill) {
    fill.style.width = `${Math.max(0, Math.min(100, meta.pct))}%`;
    fill.style.background = meta.color;
  }
  if (pill) {
    pill.textContent = live.running ? 'Running' : (live.elapsedSec ? 'Paused' : 'Ready');
    pill.style.color = live.running ? 'var(--green)' : (live.elapsedSec ? 'var(--gold)' : 'var(--blue)');
  }
  if (btn) {
    btn.textContent = live.running ? 'Pause Timer' : (live.elapsedSec ? 'Resume Timer' : 'Start Timer');
    btn.className = `ha ${live.running ? 's' : 'p'}`;
  }
}
function renderWorkoutTimer(prev={}) {
  const mount = document.getElementById('wk-timer');
  if (!mount) return;
  const live = getLiveWorkoutTimerState(today(), wkSess);
  const prevDuration = Math.max(parseInt(prev._durationSec) || 0, parseInt(prev._elapsedSec) || 0);
  const meta = getTimerStatusMeta(live.elapsedSec, live.targetMin, live.running);
  mount.innerHTML = `
    <div class="card timer-card">
      <div class="card-title" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span>Workout Timer</span>
        <span class="band-pill" id="wk-timer-pill" style="color:${live.running ? 'var(--green)' : (live.elapsedSec ? 'var(--gold)' : 'var(--blue)')}">${live.running ? 'Running' : (live.elapsedSec ? 'Paused' : 'Ready')}</span>
      </div>
      <div class="timer-hero">
        <div>
          <div class="timer-label">Elapsed</div>
          <div class="timer-display" id="wk-timer-elapsed">${formatTimerClock(live.elapsedSec)}</div>
          <div class="timer-sub" id="wk-timer-status">${meta.text}</div>
        </div>
        <div class="timer-side">
          <div class="timer-mini">${prevDuration ? formatDurationShort(prevDuration) : '—'}</div>
          <div class="timer-mini-label">Last session</div>
        </div>
      </div>
      <div class="timer-bar"><div class="timer-bar-fill" id="wk-timer-fill" style="width:${Math.max(0, Math.min(100, meta.pct))}%;background:${meta.color}"></div></div>
      <div class="timer-presets">
        ${TIMER_PRESETS.map(min => `<button class="timer-preset ${live.targetMin===min?'on':''}" onclick="setWorkoutTarget(${min})">${min}m</button>`).join('')}
      </div>
      <div class="timer-actions">
        <button class="ha ${live.running ? 's' : 'p'}" id="wk-timer-toggle" onclick="toggleWorkoutTimer()">${live.running ? 'Pause Timer' : (live.elapsedSec ? 'Resume Timer' : 'Start Timer')}</button>
        <button class="ha s" onclick="resetWorkoutTimer()">Reset</button>
      </div>
      <div class="timer-tip">Tip: start the timer on your first warm-up set. It stays saved on this device even if you close the app mid-session.</div>
    </div>`;

  startWorkoutTimerTick();
}

function htmlEscape(str='') {
  return String(str).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch] || ch));
}
function formatRestPreset(sec=90) {
  if (sec % 60 === 0) return `${sec/60}m`;
  return `${sec}s`;
}
function getExerciseById(id='') {
  return (SESSIONS[wkSess]?.exercises || []).find(ex => ex.id === id) || null;
}
function getExerciseRestTarget(ex={}) {
  const guide = `${ex.guide || ''}`;
  const match = guide.match(/Rest\s*(\d+)\s*(min|sec)/i);
  if (match) {
    const amount = parseInt(match[1]) || 0;
    return match[2].toLowerCase().startsWith('min') ? amount * 60 : amount;
  }
  const ref = `${ex.tag || ''} ${ex.name || ''}`.toLowerCase();
  if (/primary|power/.test(ref)) return 180;
  if (/carry|core|grip|conditioning|health/.test(ref)) return 60;
  return 90;
}
function buildExerciseRestControls(ex) {
  const suggested = getExerciseRestTarget(ex);
  const opts = Array.from(new Set([
    Math.max(30, suggested - 30),
    suggested,
    Math.min(240, suggested + 30)
  ])).sort((a,b)=>a-b);
  return `<div class="rest-helper"><span class="rest-chip">Set Rest</span>${opts.map(sec => `<button class="rest-quick ${sec===suggested?'primary':''}" onclick="event.stopPropagation();startExerciseRest(${sec}, '${ex.id}')">${formatRestPreset(sec)}</button>`).join('')}</div>`;
}
function getRestTimerState(d=today(), s=wkSess) {
  const wo = getWO(d, s);
  const targetSec = Math.max(15, parseInt(wo._restTargetSec) || 90);
  const savedRemaining = parseInt(wo._restRemainingSec);
  return {
    targetSec,
    remainingSec: Number.isFinite(savedRemaining) ? Math.max(0, savedRemaining) : targetSec,
    running: !!wo._restRunning,
    startedAt: wo._restStartedAt || null,
    label: wo._restLabel || '',
    lastCompletedSec: Math.max(0, parseInt(wo._restLastCompletedSec) || 0)
  };
}
function getLiveRestTimerState(d=today(), s=wkSess) {
  const timer = getRestTimerState(d, s);
  let remaining = timer.remainingSec;
  if (timer.running && timer.startedAt) {
    const since = Math.floor((Date.now() - new Date(timer.startedAt).getTime()) / 1000);
    if (Number.isFinite(since) && since > 0) remaining = Math.max(0, timer.remainingSec - since);
  }
  return {
    ...timer,
    remainingSec: remaining,
    elapsedSec: Math.max(0, timer.targetSec - remaining),
    complete: remaining === 0
  };
}
function patchRestTimer(d, s, patch, reason=`workout ${s} rest timer`) {
  if (!S.wo) S.wo = {};
  if (!S.wo[d]) S.wo[d] = {};
  S.wo[d][s] = {...(S.wo[d][s] || {}), ...patch};
  save(reason);
}
function stopRestTimerTick() {
  if (restTimerTick) {
    clearInterval(restTimerTick);
    restTimerTick = null;
  }
}
function finishRestTimer() {
  const d = today();
  const s = wkSess;
  const live = getLiveRestTimerState(d, s);
  patchRestTimer(d, s, {
    _restRunning: false,
    _restStartedAt: null,
    _restRemainingSec: 0,
    _restTargetSec: live.targetSec,
    _restLabel: live.label || '',
    _restLastCompletedSec: live.targetSec
  }, `workout ${s} rest complete`);
  if (navigator.vibrate) navigator.vibrate([120,80,120]);
  renderRestTimer();
  toast(`${live.label || 'Rest'} complete`);
}
function updateRestTimerUI() {
  const displayEl = document.getElementById('wk-rest-remaining');
  if (!displayEl) return;
  const live = getLiveRestTimerState(today(), wkSess);
  if (live.running && live.remainingSec <= 0) {
    finishRestTimer();
    return;
  }
  const pill = document.getElementById('wk-rest-pill');
  const sub = document.getElementById('wk-rest-status');
  const fill = document.getElementById('wk-rest-fill');
  const btn = document.getElementById('wk-rest-toggle');
  const targetEl = document.getElementById('wk-rest-target');
  const labelEl = document.getElementById('wk-rest-label');
  const pct = live.targetSec ? (live.elapsedSec / live.targetSec) * 100 : 0;
  const label = live.label || 'General set rest';
  displayEl.textContent = formatTimerClock(live.remainingSec);
  if (targetEl) targetEl.textContent = formatRestPreset(live.targetSec);
  if (labelEl) labelEl.textContent = label;
  if (fill) {
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    fill.style.background = live.complete ? 'var(--green)' : 'var(--accent)';
  }
  if (pill) {
    pill.textContent = live.running ? 'Counting Down' : (live.complete && live.elapsedSec ? 'Complete' : (live.elapsedSec ? 'Paused' : 'Ready'));
    pill.style.color = live.running ? 'var(--accent)' : (live.complete && live.elapsedSec ? 'var(--green)' : (live.elapsedSec ? 'var(--gold)' : 'var(--blue)'));
  }
  if (sub) {
    if (live.running) sub.textContent = `${Math.max(1, Math.ceil(live.remainingSec/60))} min left · breathe, log the set, then go again`;
    else if (live.complete && live.elapsedSec) sub.textContent = 'Rest complete — start your next set when ready';
    else if (live.elapsedSec) sub.textContent = `Paused with ${formatTimerClock(live.remainingSec)} left on ${label.toLowerCase()}`;
    else sub.textContent = 'Tap a preset after each set, or use the quick buttons under each exercise';
  }
  if (btn) {
    btn.textContent = live.running ? 'Pause Rest' : (live.elapsedSec ? 'Resume Rest' : 'Start Rest');
    btn.className = `ha ${live.running ? 's' : 'p'}`;
  }
}
function startRestTimerTick() {
  stopRestTimerTick();
  if (!document.getElementById('screen-workout')?.classList.contains('active')) return;
  updateRestTimerUI();
  const live = getLiveRestTimerState(today(), wkSess);
  if (!live.running) return;
  restTimerTick = setInterval(updateRestTimerUI, 250);
}
function setRestTarget(sec) {
  const d = today();
  const s = wkSess;
  const live = getLiveRestTimerState(d, s);
  patchRestTimer(d, s, {
    _restTargetSec: sec,
    _restRemainingSec: sec,
    _restRunning: false,
    _restStartedAt: null,
    _restLabel: live.label || ''
  }, `workout ${s} rest target`);
  renderRestTimer();
}
function beginRestCountdown(targetSec, label='General set rest') {
  const d = today();
  const s = wkSess;
  patchRestTimer(d, s, {
    _restTargetSec: targetSec,
    _restRemainingSec: targetSec,
    _restRunning: true,
    _restStartedAt: new Date().toISOString(),
    _restLabel: label,
    _restLastCompletedSec: Math.max(0, parseInt(getWO(d, s)._restLastCompletedSec) || 0)
  }, `workout ${s} rest start`);
  renderRestTimer();
}
function startExerciseRest(sec, exId='') {
  const ex = getExerciseById(exId);
  beginRestCountdown(sec, ex ? ex.name : 'General set rest');
  toast(`Rest started · ${formatRestPreset(sec)}`);
}
function toggleRestTimer() {
  const d = today();
  const s = wkSess;
  const live = getLiveRestTimerState(d, s);
  if (live.running) {
    patchRestTimer(d, s, {
      _restRunning: false,
      _restStartedAt: null,
      _restRemainingSec: live.remainingSec,
      _restTargetSec: live.targetSec,
      _restLabel: live.label || ''
    }, `workout ${s} rest pause`);
    renderRestTimer();
    return;
  }
  const startFrom = live.complete ? live.targetSec : (live.remainingSec || live.targetSec || 90);
  patchRestTimer(d, s, {
    _restRunning: true,
    _restStartedAt: new Date().toISOString(),
    _restRemainingSec: startFrom,
    _restTargetSec: live.targetSec || 90,
    _restLabel: live.label || 'General set rest'
  }, `workout ${s} rest resume`);
  renderRestTimer();
}
function resetRestTimer() {
  const d = today();
  const s = wkSess;
  const state = getRestTimerState(d, s);
  patchRestTimer(d, s, {
    _restRunning: false,
    _restStartedAt: null,
    _restRemainingSec: state.targetSec,
    _restTargetSec: state.targetSec,
    _restLabel: ''
  }, `workout ${s} rest reset`);
  renderRestTimer();
  toast('Rest timer reset');
}
function renderRestTimer() {
  const mount = document.getElementById('wk-rest-timer');
  if (!mount) return;
  const live = getLiveRestTimerState(today(), wkSess);
  const label = live.label || 'General set rest';
  const pct = live.targetSec ? (live.elapsedSec / live.targetSec) * 100 : 0;
  mount.innerHTML = `
    <div class="card rest-card">
      <div class="card-title" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span>Rest Timer</span>
        <span class="band-pill" id="wk-rest-pill" style="color:${live.running ? 'var(--accent)' : (live.complete && live.elapsedSec ? 'var(--green)' : (live.elapsedSec ? 'var(--gold)' : 'var(--blue)'))}">${live.running ? 'Counting Down' : (live.complete && live.elapsedSec ? 'Complete' : (live.elapsedSec ? 'Paused' : 'Ready'))}</span>
      </div>
      <div class="timer-hero">
        <div>
          <div class="timer-label">Remaining</div>
          <div class="timer-display" id="wk-rest-remaining">${formatTimerClock(live.remainingSec)}</div>
          <div class="timer-sub" id="wk-rest-status">${live.running ? `${Math.max(1, Math.ceil(live.remainingSec/60))} min left · breathe, log the set, then go again` : (live.complete && live.elapsedSec ? 'Rest complete — start your next set when ready' : (live.elapsedSec ? `Paused with ${formatTimerClock(live.remainingSec)} left on ${label.toLowerCase()}` : 'Tap a preset after each set, or use the quick buttons under each exercise'))}</div>
        </div>
        <div class="timer-side">
          <div class="timer-mini" id="wk-rest-target" style="color:var(--accent)">${formatRestPreset(live.targetSec)}</div>
          <div class="timer-mini-label">Target</div>
        </div>
      </div>
      <div class="timer-bar"><div class="timer-bar-fill" id="wk-rest-fill" style="width:${Math.max(0, Math.min(100, pct))}%;background:${live.complete ? 'var(--green)' : 'var(--accent)'}"></div></div>
      <div class="rest-presets">
        ${REST_PRESETS.map(sec => `<button class="rest-preset ${live.targetSec===sec?'on':''}" onclick="setRestTarget(${sec})">${formatRestPreset(sec)}</button>`).join('')}
      </div>
      <div class="timer-actions">
        <button class="ha ${live.running ? 's' : 'p'}" id="wk-rest-toggle" onclick="toggleRestTimer()">${live.running ? 'Pause Rest' : (live.elapsedSec ? 'Resume Rest' : 'Start Rest')}</button>
        <button class="ha s" onclick="resetRestTimer()">Reset</button>
      </div>
      <div class="rest-helper" style="margin-top:10px"><span class="rest-chip" id="wk-rest-label">${htmlEscape(label)}</span>${live.lastCompletedSec ? `<span class="rest-chip">Last complete · ${formatRestPreset(live.lastCompletedSec)}</span>` : ''}</div>
      <div class="timer-tip">Tip: tap a quick rest button under each exercise as soon as you finish a set.</div>
    </div>`;
  startRestTimerTick();
}


// ═══════════════════════════════════════════════════════
//  DATE HELPERS
// ═══════════════════════════════════════════════════════
const today   = () => dStr(new Date());
const dStr    = d  => formatLocalDate(parseLocalDate(d));
const getDow  = d  => { const day=parseLocalDate(d).getDay(); return day===0?6:day-1; };
const getWkNum= d  => { const diff=parseLocalDate(d)-BLOCK_START; const days=Math.floor(diff/86400000); if(days<0||days>=91)return null; return Math.floor(days/7)+1; };
const getWkDates=wn=> Array.from({length:7},(_,i)=>{ const d=new Date(BLOCK_START); d.setDate(BLOCK_START.getDate()+(wn-1)*7+i); return dStr(d); });
const getRot  = wn => wn%2===1?'A':'B';
const getPhase= wn => PHASES.find(p=>p.weeks.includes(wn))||PHASES[0];
const isDeload= wn => wn===13;
const curWk   = ()  => { const wn=getWkNum(today()); return wn===null?1:Math.min(wn,13); };
const fmtDate = d  => parseLocalDate(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
const fmtShort= d  => parseLocalDate(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'});

// ═══════════════════════════════════════════════════════
//  READINESS
// ═══════════════════════════════════════════════════════
function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
function shiftDateStr(dateStr, days) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return dStr(d);
}
function getRecentDates(endDate, count) {
  return Array.from({length:count}, (_,i) => shiftDateStr(endDate, -(count-1-i)));
}
function getAllDatesThrough(endDate=today()) {
  const limit = parseLocalDate(endDate);
  const out = [];
  const d = new Date(BLOCK_START);
  while (d <= limit) {
    out.push(dStr(d));
    d.setDate(d.getDate()+1);
  }
  return out;
}
function getWorkoutRPEs(dates) {
  const out=[];
  dates.forEach(d => {
    ['A','B','C'].forEach(sk => {
      const wo = getWO(d, sk);
      if (wo && wo._rpe) out.push({date:d, session:sk, val:wo._rpe});
    });
  });
  return out;
}
function mealCompletionStats(d) {
  const dow = getDow(d);
  const meals = getMeals(DAY_TYPES[dow], getRot(getWkNum(d) || curWk()), dow===4);
  const eaten = meals.filter(m => (getCI(d).meal_states||{})[m.id]).length;
  return {eaten,total:meals.length,pct:meals.length?Math.round((eaten/meals.length)*100):0};
}
function getReadinessProfile(d) {
  const ci = getCI(d);
  const hasData = ['sleep','energy','stress','sleepq','mood','water'].some(k => ci[k] !== null && ci[k] !== undefined) || (ci.sore_zones||[]).length;
  if (!hasData) return {score:null, band:'none', label:'—', color:'var(--text3)', summary:'Complete a check-in to unlock today’s readiness score.', reasons:[]};
  let score = 50;
  const reasons = [];
  if (ci.sleep != null) {
    const delta = ci.sleep >= 8 ? 18 : ci.sleep >= 7 ? 10 : ci.sleep >= 6 ? 0 : -14;
    score += delta;
    reasons.push(delta >= 0 ? `Sleep supporting training (${ci.sleep}h)` : `Sleep is dragging readiness down (${ci.sleep}h)`);
  }
  if (ci.energy != null) score += (ci.energy - 3) * 9;
  if (ci.sleepq != null) score += (ci.sleepq - 3) * 4;
  if (ci.mood != null) score += (ci.mood - 3) * 3;
  if (ci.stress != null) {
    const delta = (ci.stress - 3) * -5;
    score += delta;
    if (ci.stress >= 4) reasons.push('Stress is elevated — keep today tighter technically');
  }
  if (ci.water != null && ci.water < 3) {
    score -= 5;
    reasons.push('Hydration is below target');
  }
  if ((ci.sore_zones||[]).length) {
    const sorenessPenalty = Math.min(12, (ci.sore_zones||[]).length * 3);
    score -= sorenessPenalty;
    reasons.push(`${(ci.sore_zones||[]).length} soreness area${(ci.sore_zones||[]).length>1?'s':''} logged`);
  }
  const yesterday = getCI(shiftDateStr(d, -1));
  if (yesterday.trained && ci.sleep != null && ci.sleep < 7) {
    score -= 4;
    reasons.push('Back-to-back fatigue risk from yesterday’s training');
  }
  score = clamp(Math.round(score), 0, 100);
  const band = score >= 75 ? 'green' : score >= 55 ? 'amber' : 'red';
  const config = {
    green:{label:'GREEN',color:'var(--green)',summary:'Push the plan. Add weight only if warm‑ups feel sharp.'},
    amber:{label:'AMBER',color:'var(--gold)',summary:'Train, but keep a rep in reserve and prioritise execution.'},
    red:{label:'RED',color:'var(--accent)',summary:'Reduce load, shorten the hard stuff, and leave feeling better than you started.'},
  }[band];
  return {score, band, ...config, reasons: reasons.slice(0,3)};
}
function getReadiness(d) { return getReadinessProfile(d).score; }
function readLabel(sc) {
  if (sc===null || sc===undefined) return {l:'—',c:'var(--text3)',a:''};
  if (sc>=75) return {l:'GREEN',c:'var(--green)',a:'Push the plan if warm‑ups feel good.'};
  if (sc>=55) return {l:'AMBER',c:'var(--gold)',a:'Train but hold back 1 rep in reserve.'};
  return {l:'RED',c:'var(--accent)',a:'Reduce load and prioritise recovery today.'};
}

// 7-day rolling weight average
function rollingWeight(d) {
  const dates = Array.from({length:7},(_,i)=>{ const dt=parseLocalDate(d); dt.setDate(dt.getDate()-i); return dStr(dt); });
  const weights = dates.map(dd=>getCI(dd).weight).filter(Boolean);
  return weights.length >= 3 ? (weights.reduce((a,b)=>a+b,0)/weights.length).toFixed(1) : null;
}

// 1RM estimate (Epley)
function est1RM(weight, reps) {
  if (!weight||!reps||reps<1) return null;
  if (reps===1) return weight;
  return Math.round(weight*(1+reps/30));
}

function roundLoad(val, step=2.5) {
  if (!val || !isFinite(val)) return null;
  return Math.round(val / step) * step;
}
function guessIncrement(ex) {
  const name = (ex.name || '').toLowerCase();
  if (/deadlift|squat|hip thrust|power clean/.test(name)) return 5;
  if (/carry|hang|rope|swings|bodysaw|lunge|split squat/.test(name)) return 2.5;
  if (/pull-up|chin-up|dips/.test(name)) return 2.5;
  return 2.5;
}
function getExerciseHistory(exId, upToDate=today()) {
  const limit = parseLocalDate(upToDate);
  const sessKey = exId[0];
  const out = [];
  getAllDatesThrough(upToDate).forEach(d => {
    if (parseLocalDate(d) > limit) return;
    const wo = getWO(d, sessKey);
    const exData = wo[exId];
    if (!exData || !Array.isArray(exData.sets) || !exData.sets.length) return;
    const parsedSets = exData.sets.map(s => ({
      weight: parseFloat(s.weight),
      reps: parseInt(s.reps)
    })).filter(s => Number.isFinite(s.weight) || Number.isFinite(s.reps));
    if (!parsedSets.length) return;
    const bestRM = parsedSets.reduce((best,s) => {
      const rm = est1RM(s.weight, s.reps);
      return rm && rm > best ? rm : best;
    }, 0);
    const bestWeight = parsedSets.reduce((best,s) => Number.isFinite(s.weight) && s.weight > best ? s.weight : best, 0);
    const totalReps = parsedSets.reduce((sum,s) => sum + (Number.isFinite(s.reps) ? s.reps : 0), 0);
    const totalLoad = parsedSets.reduce((sum,s) => sum + ((Number.isFinite(s.weight)?s.weight:0) * (Number.isFinite(s.reps)?s.reps:0)), 0);
    const avgWeight = parsedSets.filter(s=>Number.isFinite(s.weight)).length ? parsedSets.filter(s=>Number.isFinite(s.weight)).reduce((a,s)=>a+s.weight,0) / parsedSets.filter(s=>Number.isFinite(s.weight)).length : null;
    out.push({
      date:d,
      bestRM,
      bestWeight,
      totalReps,
      totalLoad,
      avgWeight,
      summary: parsedSets.map(s => `${Number.isFinite(s.weight)?s.weight:'?'}×${Number.isFinite(s.reps)?s.reps:'?'}`).join(' · '),
      sessionRPE: wo._rpe || null,
    });
  });
  return out.sort((a,b) => parseLocalDate(a.date) - parseLocalDate(b.date));
}
function getExerciseInsight(ex, currentDate=today()) {
  const history = getExerciseHistory(ex.id, currentDate).filter(h => h.date !== currentDate);
  if (!history.length) {
    return {headline:'Set your baseline', detail:'No previous log yet. Use today to set a clean starting point and note what felt honest.', color:'var(--text3)', badge:''};
  }
  const prev = history[history.length-1];
  const bestRM = Math.max(...history.map(h => h.bestRM || 0));
  const recent3 = history.slice(-3);
  const plateau = recent3.length >= 3 && (Math.max(...recent3.map(h=>h.bestRM||0)) - Math.min(...recent3.map(h=>h.bestRM||0)) <= 2);
  const nextLoad = prev.avgWeight ? roundLoad(prev.avgWeight + guessIncrement(ex), guessIncrement(ex)) : null;
  if (plateau) {
    return {headline:'Plateau watch', detail:`Last 3 exposures have hovered around ${prev.bestRM||prev.bestWeight||0}kg estimated strength. Hold the load and add a rep before chasing more weight.`, color:'var(--gold)', badge:'PLATEAU'};
  }
  if (prev.sessionRPE && prev.sessionRPE <= 7 && nextLoad) {
    return {headline:'Beat last session', detail:`Last time: ${prev.summary}. If warm-ups feel crisp, start around ${nextLoad}kg; otherwise match last time and win with cleaner reps.`, color:'var(--green)', badge: prev.bestRM === bestRM ? 'LAST PR' : ''};
  }
  return {headline:'Match then improve', detail:`Last time: ${prev.summary}. Match your opener, then improve one set by a rep or tighter technique.`, color:'var(--blue)', badge: prev.bestRM === bestRM ? 'BENCHMARK' : ''};
}
function getSessionCoachSummary(sk, currentDate=today()) {
  const sess = SESSIONS[sk];
  const insights = sess.exercises.map(ex => ({ex, insight:getExerciseInsight(ex, currentDate)}));
  const plateaus = insights.filter(i => i.insight.badge === 'PLATEAU').length;
  const push = insights.filter(i => i.insight.headline === 'Beat last session').length;
  const profile = getReadinessProfile(currentDate);
  const headline = profile.band === 'red'
    ? 'Adjust and leave something in the tank'
    : profile.band === 'amber'
    ? 'Train, but make quality the goal'
    : 'Good day to progress something';
  const sub = profile.band === 'red'
    ? 'Keep the main lifts technical, cut a set if bar speed is slow, and avoid chasing grinders.'
    : profile.band === 'amber'
    ? 'Choose one lift to progress and keep the rest repeatable.'
    : 'Pick one or two lifts to beat, not every lift.';
  return {headline, sub, plateaus, push, readiness:profile, highlights: insights.slice(0,3)};
}
function buildAutoRecommendations(d) {
  const ci = getCI(d);
  const dow = getDow(d);
  const dt = DAY_TYPES[dow];
  const readiness = getReadinessProfile(d);
  const mealStats = mealCompletionStats(d);
  const recs = [];
  if (readiness.band === 'red') recs.push({type:'warn', label:'Load', text:'Treat today as a quality day. Cap intensity around 80–90% of normal and avoid all-out grinders.'});
  else if (readiness.band === 'amber') recs.push({type:'info', label:'Pacing', text:'Train as planned, but leave one rep in reserve on the main lifts and shorten extra work if form slips.'});
  else recs.push({type:'good', label:'Opportunity', text:'Readiness is strong. Push one main lift or one hard round, then stop once quality drops.'});

  if ((ci.water || 0) < 3) recs.push({type:'info', label:'Hydration', text:'Get another 1–1.5L in before the end of the day. Low hydration is dragging readiness down.'});
  if (mealStats.total && mealStats.eaten < Math.max(3, mealStats.total - 1)) recs.push({type:'warn', label:'Fuel', text:`You only have ${mealStats.eaten}/${mealStats.total} meals logged. Prioritise the next protein + carb meal before training.`});
  if ((ci.sore_zones||[]).length >= 3) recs.push({type:'warn', label:'Recovery', text:`${(ci.sore_zones||[]).length} sore areas logged. Extend the warm-up and cut accessory volume if pain sharpens.`});
  const recentSleep = getRecentDates(d, 3).map(dd => getCI(dd).sleep).filter(Boolean);
  if (recentSleep.length >= 2 && avg(recentSleep) < 7) recs.push({type:'warn', label:'Sleep trend', text:'Average sleep over the last few days is under 7 hours. Tonight’s bedtime is the highest-value recovery lever.'});
  if (dt === 'rec' && (ci.steps || 0) < 7000) recs.push({type:'info', label:'Recovery day', text:'Use today to hit an easy walk target and come into tomorrow fresher.'});
  if (dt === 'str' && SESS_KEYS[dow]) {
    const sessionCoach = getSessionCoachSummary(SESS_KEYS[dow], d);
    recs.push({type: sessionCoach.readiness.band === 'green' ? 'good' : 'info', label:`Session ${SESS_KEYS[dow]}`, text: sessionCoach.sub});
  }
  return recs.slice(0,4);
}
function formatAgo(iso) {
  if (!iso) return 'No save yet';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime())/60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins/60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs/24)}d ago`;
}
function buildHistoryHtml(d) {
  const ci = getCI(d);
  const readiness = getReadinessProfile(d);
  const meals = mealCompletionStats(d);
  const supps = Object.values(ci.supps_taken||{}).filter(Boolean).length;
  const sessions = ['A','B','C'].map(sk => ({sk, data:getWO(d,sk)})).filter(x => Object.keys(x.data).length);
  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px">
      <div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:0.06em">${fmtDate(d)}</div>
        <div style="font-size:12px;color:var(--text2)">${DAY_LABELS[getDow(d)]}</div>
      </div>
      <button class="btn sec" style="width:auto;padding:10px 14px;font-size:12px" onclick="jumpToCheckin('${d}')">Open Day</button>
    </div>
    <div class="save-strip" style="margin-bottom:12px">
      <div>
        <div class="save-main">Readiness</div>
        <div class="save-meta">${readiness.summary}</div>
      </div>
      <div class="band-pill" style="color:${readiness.color}">${readiness.score ?? '—'} · ${readiness.label}</div>
    </div>
    <div class="metric-pills">
      <div class="metric-pill">Sleep ${ci.sleep ?? '—'}h</div>
      <div class="metric-pill">Weight ${ci.weight ?? '—'}kg</div>
      <div class="metric-pill">Energy ${ci.energy ?? '—'}/5</div>
      <div class="metric-pill">Meals ${meals.eaten}/${meals.total}</div>
      <div class="metric-pill">Supps ${supps}/${SUPPLEMENTS.length}</div>
      <div class="metric-pill">Steps ${ci.steps ? ci.steps.toLocaleString() : '—'}</div>
    </div>
    ${(ci.notes || ci.bjj_notes || ci.rec_notes) ? `<div class="card" style="margin-top:12px"><div class="card-title">Notes</div><div style="font-size:12px;color:var(--text2);line-height:1.6">${ci.bjj_notes || ci.rec_notes || ci.notes}</div></div>` : ''}
    <div class="card" style="margin-top:12px">
      <div class="card-title">Workouts Logged</div>
      ${sessions.length ? sessions.map(x => {
        const moves = Object.entries(x.data).filter(([k,v]) => !k.startsWith('_') && v && v.sets).slice(0,3).map(([k,v]) => `${k}: ${v.sets.map(s => `${s.weight||'?'}×${s.reps||'?'}`).join(' · ')}`).join('<br>');
        const dur = Math.max(parseInt(x.data._durationSec) || 0, parseInt(x.data._elapsedSec) || 0);
        return `<div style="padding:8px 0;border-bottom:1px solid var(--border)"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><strong style="font-size:12px">Session ${x.sk}</strong><span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)">RPE ${x.data._rpe || '—'}${dur ? ` · ${formatDurationShort(dur)}` : ''}</span></div><div style="font-size:11px;color:var(--text2);line-height:1.5;margin-top:5px">${moves || 'Logged without set detail'}</div></div>`;
      }).join('') : `<div style="font-size:12px;color:var(--text3)">No strength workout logged on this day.</div>`}
    </div>
    <button class="btn sec" style="margin-top:10px" onclick="closeHistory()">Close</button>
  `;
}
function openHistory(d) {
  const modal = document.getElementById('history-modal');
  const content = document.getElementById('history-modal-content');
  if (!modal || !content) return;
  content.innerHTML = buildHistoryHtml(d);
  modal.classList.add('open');
}
function closeHistory() {
  const modal = document.getElementById('history-modal');
  if (modal) modal.classList.remove('open');
}
function jumpToCheckin(d) {
  ciDate = d;
  closeHistory();
  showScreen('checkin', document.querySelectorAll('.nav-btn')[1]);
}
function renderHistorySection(allDates) {
  const el = document.getElementById('prog-history');
  if (!el) return;
  const recent = allDates.slice().reverse().filter(d => Object.keys(getCI(d)).length || ['A','B','C'].some(sk => Object.keys(getWO(d,sk)).length)).slice(0,14);
  if (!recent.length) {
    el.innerHTML = '<div class="card"><div class="card-title">History</div><div style="font-size:12px;color:var(--text3)">Your logged days will appear here once you start saving check-ins or workouts.</div></div>';
    return;
  }
  el.innerHTML = `<div class="card"><div class="card-title">History</div><div class="history-list">${recent.map(d => {
    const readiness = getReadinessProfile(d);
    const ci = getCI(d);
    const workouts = ['A','B','C'].filter(sk => Object.keys(getWO(d,sk)).length);
    const meals = mealCompletionStats(d);
    return `<div class="hist-row" onclick="openHistory('${d}')">
      <div class="hist-left">
        <div class="hist-date">${fmtDate(d)}</div>
        <div class="hist-meta">${DAY_LABELS[getDow(d)]} · Meals ${meals.eaten}/${meals.total}${workouts.length ? ` · Workout ${workouts.join(', ')}` : ''}</div>
      </div>
      <div class="hist-right">
        <div class="band-pill" style="color:${readiness.color}">${readiness.score ?? '—'}</div>
        <div class="hist-tag">${ci.trained ? 'trained' : 'logged'}</div>
      </div>
    </div>`;
  }).join('')}</div></div>`;
}

// ═══════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════
let _toastT;
function toast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(_toastT); _toastT=setTimeout(()=>t.classList.remove('show'),2500);
}
function toggleColl(id,chevId) {
  const el=document.getElementById(id), ch=document.getElementById(chevId);
  if(!el)return; el.classList.toggle('open'); if(ch)ch.classList.toggle('open');
}
function buildRating(id,val,color='var(--accent)') {
  const el=document.getElementById(id); if(!el)return;
  el.innerHTML='';
  for(let i=1;i<=5;i++){
    const b=document.createElement('div');
    b.className='rb'+(val===i?' on':'');
    if(val===i)b.style.background=color,b.style.borderColor=color;
    b.textContent=i;
    b.onclick=()=>{el.querySelectorAll('.rb').forEach(x=>{x.classList.remove('on');x.style.background='';x.style.borderColor='';}); b.classList.add('on');b.style.background=color;b.style.borderColor=color;};
    el.appendChild(b);
  }
}
function getRating(id) { const s=document.querySelector('#'+id+' .rb.on'); return s?parseInt(s.textContent):null; }
function buildRPE(id,val) {
  const el=document.getElementById(id); if(!el)return;
  el.innerHTML='';
  const colors=['var(--green)','var(--green)','var(--green)','var(--blue)','var(--blue)','var(--blue)','var(--gold)','var(--gold)','var(--accent)','var(--accent)'];
  for(let i=1;i<=10;i++){
    const b=document.createElement('div');
    b.className='rpe-btn'+(val===i?' on':'');
    if(val===i){b.style.background=colors[i-1];b.style.borderColor=colors[i-1];}
    b.textContent=i;
    b.onclick=()=>{el.querySelectorAll('.rpe-btn').forEach((x,xi)=>{x.classList.remove('on');x.style.background='';x.style.borderColor='';}); b.classList.add('on');b.style.background=colors[i-1];b.style.borderColor=colors[i-1];};
    el.appendChild(b);
  }
}
function getRPE(id) { const s=document.querySelector('#'+id+' .rpe-btn.on'); return s?parseInt(s.textContent):null; }

// ═══════════════════════════════════════════════════════
//  BODY MAP
// ═══════════════════════════════════════════════════════
function buildBodyMap(containerId, soreZones) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const svgPaths = SORE_ZONES.map(z => {
    const isSore = (soreZones||[]).includes(z.id);
    return `<path class="bm-zone${isSore?' sore':''}" data-zone="${z.id}" data-label="${z.label}" 
      d="${z.d}" fill="${isSore?'rgba(200,57,26,0.7)':'rgba(100,110,140,0.3)'}" stroke="var(--border)" stroke-width="1"
      onclick="toggleZone('${containerId}','${z.id}','${z.label}')"/>`;
  }).join('');
  // Simple stick figure outline
  el.innerHTML = `<svg viewBox="0 0 160 230" xmlns="http://www.w3.org/2000/svg">
    <!-- Head --><circle cx="80" cy="12" r="11" fill="rgba(100,110,140,0.2)" stroke="var(--border)" stroke-width="1"/>
    <!-- Body --><rect x="58" y="34" width="44" height="58" rx="6" fill="rgba(100,110,140,0.15)" stroke="var(--border)" stroke-width="1"/>
    <!-- L Arm --><rect x="35" y="34" width="20" height="58" rx="6" fill="rgba(100,110,140,0.15)" stroke="var(--border)" stroke-width="1"/>
    <!-- R Arm --><rect x="105" y="34" width="20" height="58" rx="6" fill="rgba(100,110,140,0.15)" stroke="var(--border)" stroke-width="1"/>
    <!-- L Leg --><rect x="50" y="94" width="24" height="90" rx="6" fill="rgba(100,110,140,0.15)" stroke="var(--border)" stroke-width="1"/>
    <!-- R Leg --><rect x="86" y="94" width="24" height="90" rx="6" fill="rgba(100,110,140,0.15)" stroke="var(--border)" stroke-width="1"/>
    ${svgPaths}
    <!-- Labels overlay --></svg>`;
}

let _curBodyMap = '';
let _soreZones  = [];
function toggleZone(mapId, zoneId, label) {
  _curBodyMap = mapId;
  const idx = _soreZones.indexOf(zoneId);
  if (idx >= 0) _soreZones.splice(idx,1);
  else _soreZones.push(zoneId);
  buildBodyMap(mapId, _soreZones);
  renderSoreLabels();
}
function renderSoreLabels() {
  const el = document.getElementById('sore-labels');
  if (!el) return;
  el.innerHTML = _soreZones.map(id => {
    const z = SORE_ZONES.find(z=>z.id===id);
    return z ? `<span style="background:rgba(200,57,26,0.15);border:1px solid rgba(200,57,26,0.3);border-radius:10px;padding:2px 8px;font-size:11px;color:var(--accent)">${z.label} ✕</span>` : '';
  }).join('');
}
function initBodyMap(ciDate) {
  const ci = getCI(ciDate);
  _soreZones = ci.sore_zones || [];
  buildBodyMap('body-map-ci', _soreZones);
  renderSoreLabels();
}

// ═══════════════════════════════════════════════════════
//  BJJ POSITION TRACKER
// ═══════════════════════════════════════════════════════
let _selectedPositions = [];
function buildPositions(selected) {
  _selectedPositions = selected || [];
  const el = document.getElementById('ci-positions');
  if (!el) return;
  el.innerHTML = BJJ_POSITIONS.map(p => {
    const on = _selectedPositions.includes(p);
    return `<div class="pos-btn${on?' on':''}" onclick="togglePos('${p}')">${p}</div>`;
  }).join('');
}
function togglePos(p) {
  const idx = _selectedPositions.indexOf(p);
  if (idx>=0) _selectedPositions.splice(idx,1);
  else _selectedPositions.push(p);
  buildPositions(_selectedPositions);
}

// ═══════════════════════════════════════════════════════
//  CAL STRIP
// ═══════════════════════════════════════════════════════
function toggleCal() {
  const strip=document.getElementById('cal-strip'), chev=document.getElementById('cal-chev');
  const open=strip.style.display==='block';
  strip.style.display=open?'none':'block';
  chev.style.transform=open?'':'rotate(180deg)';
  if(!open) renderCalStrip();
}
function updateCalLbl() {
  const wn=curWk(), ph=getPhase(wn);
  document.getElementById('cal-lbl').textContent=`BJJ TRACKER · WEEK ${wn} · ${isDeload(wn)?'DELOAD':'PH'+(PHASES.indexOf(ph)+1)}`;
}
function renderCalStrip() {
  const el=document.getElementById('cal-weeks'); if(!el)return;
  el.innerHTML=''; const cwn=curWk();
  for(let wn=1;wn<=13;wn++){
    const dates=getWkDates(wn);
    const p=document.createElement('div');
    p.className='wpill'+(wn===cwn?' cur':'')+(dates.every(d=>Object.keys(getCI(d)).length>0)&&wn<cwn?' done':'');
    const dots=dates.map(d=>{const dow=getDow(d);const dt=DAY_TYPES[dow];const done=Object.keys(getCI(d)).length>0;return`<div class="wdot ${done?dt:new Date(d)<new Date()?'missed':''}"></div>`;}).join('');
    p.innerHTML=`<div class="wn">${wn}</div><div class="wlb">${isDeload(wn)?'DL':'P'+(PHASES.indexOf(getPhase(wn))+1)}</div><div class="wdots">${dots}</div>`;
    p.onclick=()=>{ ciDate=dates[0]; showScreen('checkin',document.querySelectorAll('.nav-btn')[1]); toggleCal(); };
    el.appendChild(p);
  }
  setTimeout(()=>{const c=el.querySelector('.wpill.cur');if(c)c.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});},50);
}

// ═══════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════
let ciDate  = today();
let wkSess  = 'A';
let revWk   = curWk();

function showScreen(id, btn) {
  if (id !== 'workout') { stopWorkoutTimerTick(); stopRestTimerTick(); }
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
  ({today:renderToday,checkin:renderCheckin,workout:renderWorkout,progress:renderProgress,review:renderReview,plan:renderPlan}[id]||(() => {}))();
}

// ═══════════════════════════════════════════════════════
//  TODAY SCREEN
// ═══════════════════════════════════════════════════════
function renderToday() {
  const td  = today();
  const wn  = curWk();
  const dow = getDow(td);
  const dt  = DAY_TYPES[dow];
  const ci  = getCI(td);
  const rot = getRot(wn);
  const ph  = getPhase(wn);
  const readiness = getReadinessProfile(td);
  const hasCi = Object.keys(ci).length > 0;
  const rw  = rollingWeight(td);
  const meals = getMeals(dt, rot, dow===4);
  const eaten = meals.filter(m=>(ci.meal_states||{})[m.id]).length;
  const mealPct = Math.round((eaten/Math.max(1,meals.length))*100);
  const recs = buildAutoRecommendations(td);
  const lastSaved = (S._meta||{}).updatedAt;

  let cdHtml = '';
  if (dt==='bjj' || (dt==='str' && SESS_KEYS[dow])) {
    const now = new Date();
    const trainTime = DAY_TIMES[dow];
    if (trainTime !== 'Flexible' && trainTime !== 'Morning') {
      const [h,m] = trainTime.split(':').map(Number);
      const trainDt = new Date(); trainDt.setHours(h,m,0,0);
      const diffMs = trainDt - now;
      if (diffMs > 0 && diffMs < 4*3600*1000) {
        const hrs = Math.floor(diffMs/3600000);
        const mins = Math.floor((diffMs%3600000)/60000);
        const meal4 = (ci.meal_states||{})['m4'];
        cdHtml = `<div class="countdown">
          <div><div class="cd-label">${meal4?'✅ Pre-training meal done':'⚠️ Have you eaten meal 4?'}</div><div style="font-size:11px;color:var(--text2);margin-top:2px">Training starts at ${trainTime}</div></div>
          <div class="cd-time">${hrs}h ${mins}m</div>
        </div>`;
      }
    }
  }

  let html = '';
  if (isDeload(wn)) html += `<div class="deload-banner"><div class="db-t">⚡ Week 13 — Deload</div><div class="db-d">40% less weight · 2 sets · Tue only · BJJ: drill only</div></div>`;
  else html += `<div class="phase-banner" style="border-left-color:${ph.color}"><div class="pb-wk">Week ${wn} of 13 · Week ${rot} rotation</div><div class="pb-ph">${ph.label}</div><div class="pb-det">${ph.detail}</div></div>`;

  html += `<div class="hero ${dt}">
    <div class="hero-type ${dt}">${DAY_LABELS[dow]}</div>
    <div class="hero-title">${DAYS[dow]}, ${fmtDate(td)}</div>
    <div class="hero-sub">${DAY_TIMES[dow]}${dt==='bjj'?' · BJJ Session':''}</div>
    <div class="hero-actions">
      <button class="ha p" onclick="showScreen('checkin',document.querySelectorAll('.nav-btn')[1])">${hasCi?'✓ Check-In Done':'Log Today'}</button>
      <button class="ha s" onclick="showScreen('workout',document.querySelectorAll('.nav-btn')[2])">${dt==='bjj'?'View Plan':'Log Workout'}</button>
    </div>
  </div>`;

  html += cdHtml;
  html += `<div class="save-strip"><div><div class="save-main">Data safety</div><div class="save-meta">${formatSavedAt(lastSaved)} · ${formatAgo(lastSaved)}</div></div><div class="band-pill" style="color:var(--blue)">LOCAL SAVE</div></div>`;

  const prepDow = getDow(td);
  if (prepDow === 2 || prepDow === 6) {
    const prepSlot = prepDow === 2 ? 'wednesday' : 'sunday';
    const prep = getPrepChecklist(prepSlot, wn);
    const prepState = getPrep(getPrepStorageKey(wn, prepSlot));
    const doneCount = prep.meals.filter(meal => prepState[meal.id]).length;
    html += `<div class="card" style="background:rgba(42,106,181,0.07);border-color:rgba(42,106,181,0.28)">
      <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>Meal Prep Day</span>
        <span class="band-pill" style="color:var(--blue)">${prep.short.toUpperCase()}</span>
      </div>
      <div style="font-size:13px;color:var(--text);margin-bottom:6px">${prep.subtitle}</div>
      <div style="font-size:11px;color:var(--text3);line-height:1.45;margin-bottom:10px">${doneCount}/${prep.meals.length} meal-prep cards done. Open Plan to see the exact portions and batch totals.</div>
      <button class="btn sec" style="font-size:12px;padding:9px" onclick="openMealPrep()">Open Meal Prep →</button>
    </div>`;
  }

  if (hasCi) {
    html += `<div class="card">
      <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>Readiness Score</span>
        <span class="band-pill" style="color:${readiness.color}">${readiness.label}</span>
      </div>
      <div class="row3" style="margin-bottom:8px">
        <div class="rbox"><div class="rv" style="color:${readiness.color}">${readiness.score??'—'}</div><div class="rl2">Score</div></div>
        <div class="rbox"><div class="rv" style="color:var(--blue);font-size:18px">${ci.sleep??'—'}h</div><div class="rl2">Sleep</div></div>
        <div class="rbox"><div class="rv" style="color:var(--gold);font-size:18px">${ci.energy??'—'}/5</div><div class="rl2">Energy</div></div>
      </div>
      <div style="font-size:12px;color:var(--text2);line-height:1.5">${readiness.summary}</div>
      ${readiness.reasons.length ? `<div class="metric-pills">${readiness.reasons.map(r => `<div class="metric-pill">${r}</div>`).join('')}</div>` : ''}
    </div>`;
  } else {
    html += `<div class="card" style="border-style:dashed"><div style="font-size:13px;color:var(--text3);text-align:center;padding:6px">Fill in today’s check-in to unlock readiness and recommendations.</div></div>`;
  }

  if (recs.length) {
    html += `<div class="rec-card">
      <div class="rec-head">
        <div>
          <div class="rec-title">Coach Notes</div>
          <div style="font-size:13px;color:var(--text)">What to focus on today</div>
        </div>
        <div class="band-pill" style="color:${readiness.color}">${readiness.label}</div>
      </div>
      <div class="note-list">${recs.map(r => `<div class="note-item ${r.type}"><div class="note-k">${r.label}</div><div class="note-v">${r.text}</div></div>`).join('')}</div>
    </div>`;
  }

  if (hasCi && ci.weight) {
    html += `<div class="card">
      <div class="card-title">Body Weight</div>
      <div class="row3">
        <div class="rbox"><div class="rv" style="color:var(--blue)">${ci.weight}kg</div><div class="rl2">Today</div></div>
        <div class="rbox"><div class="rv" style="color:var(--text2);font-size:18px">${rw??'—'}kg</div><div class="rl2">7-Day Avg</div></div>
        <div class="rbox"><div class="rv" style="color:var(--text3);font-size:14px">${rw&&ci.weight?(ci.weight-rw>0?'+':'')+(ci.weight-rw).toFixed(1)+'kg':'—'}</div><div class="rl2">vs Avg</div></div>
      </div>
    </div>`;
  }

  html += `<div class="card">
    <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
      <span>Today's Meals</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${mealPct>=80?'var(--green)':mealPct>=60?'var(--gold)':'var(--accent)'}">${eaten}/${meals.length}</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:8px">
      ${meals.map(m=>`<div style="flex:1;text-align:center"><div style="font-size:15px;margin-bottom:2px">${(ci.meal_states||{})[m.id]?'✅':'⬜'}</div><div style="font-family:'DM Mono',monospace;font-size:8px;color:var(--text3)">${m.time}</div></div>`).join('')}
    </div>
    <div class="adbar"><div class="adfill" style="width:${mealPct}%;background:${mealPct>=80?'var(--green)':mealPct>=60?'var(--gold)':'var(--accent)'}"></div></div>
    <button class="btn sec" style="margin-top:10px;font-size:12px;padding:9px" onclick="showScreen('checkin',document.querySelectorAll('.nav-btn')[1])">Log Meals →</button>
  </div>`;

  const sessKey = SESS_KEYS[dow];
  if (sessKey && SESSIONS[sessKey]) {
    const sess = SESSIONS[sessKey];
    const coach = getSessionCoachSummary(sessKey, td);
    html += `<div class="coach-card">
      <div class="coach-main">
        <div>
          <div class="rec-title">Session Coach</div>
          <div class="coach-head">${coach.headline}</div>
          <div class="coach-sub">${coach.sub}</div>
        </div>
        <div class="band-pill" style="color:${coach.readiness.color}">${sess.label.split('·')[0].trim()}</div>
      </div>
      <div class="micro-grid">
        <div class="micro-card"><div class="micro-v" style="color:var(--green)">${coach.push}</div><div class="micro-l">push lifts</div></div>
        <div class="micro-card"><div class="micro-v" style="color:var(--gold)">${coach.plateaus}</div><div class="micro-l">plateaus</div></div>
        <div class="micro-card"><div class="micro-v" style="color:${coach.readiness.color}">${coach.readiness.score ?? '—'}</div><div class="micro-l">readiness</div></div>
      </div>
      <div class="note-list" style="margin-top:10px">${coach.highlights.map(h => `<div class="note-item ${h.insight.badge==='PLATEAU'?'warn':'good'}"><div class="note-k">${h.ex.name}</div><div class="note-v"><strong>${h.insight.headline}</strong><br>${h.insight.detail}</div></div>`).join('')}</div>
      <button class="btn sec" style="margin-top:10px;font-size:12px;padding:9px" onclick="showScreen('workout',document.querySelectorAll('.nav-btn')[2])">Open Workout →</button>
    </div>`;
  }

  html += suppTodayCard();

  const wkDates = getWkDates(wn);
  const trained = wkDates.filter(d=>getCI(d).trained).length;
  html += `<div class="card">
    <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
      <span>This Week</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:13px;color:${trained>=4?'var(--green)':'var(--text3)'}">${trained>=4?'✓ ON TRACK':trained+'/6 SESSIONS'}</span>
    </div>
    <div style="display:flex;gap:4px">
      ${wkDates.map((d,i)=>{
        const c=getCI(d),dt2=DAY_TYPES[i],done=Object.keys(c).length>0,isTd=d===td;
        return `<div style="flex:1;text-align:center;padding:6px 2px;border-radius:6px;background:${isTd?'rgba(200,57,26,0.12)':'var(--bg3)'};border:1px solid ${isTd?'var(--accent)':'var(--border)'}">
          <div style="font-family:'DM Mono',monospace;font-size:7px;color:var(--text3);text-transform:uppercase">${DAYS[i]}</div>
          <div style="font-size:13px;margin:2px 0">${done?(dt2==='bjj'?'🥋':dt2==='str'?'💪':'🌿'):'·'}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  document.getElementById('today-content').innerHTML = html;
  updateLastSavedUI();
}

// ═══════════════════════════════════════════════════════
//  CHECK-IN
// ═══════════════════════════════════════════════════════
function renderCheckin() {
  const wn  = getWkNum(ciDate)||curWk();
  const dow = getDow(ciDate);
  const dt  = DAY_TYPES[dow];
  const ci  = getCI(ciDate);

  document.getElementById('ci-sub').textContent = fmtDate(ciDate)+' · '+DAY_LABELS[dow];
  document.getElementById('ci-tag').innerHTML = `<span class="tag ${isDeload(wn)?'deload':dt}">${isDeload(wn)?'⚡ Deload Week':DAY_LABELS[dow]}</span>`;

  buildDayPills('ci-pills', wn, ciDate);

  // Pre-fill
  const set = (id,val) => { const el=document.getElementById(id); if(el)el.value=val||''; };
  set('ci-sleep',   ci.sleep);
  set('ci-weight',  ci.weight);
  set('ci-steps',   ci.steps);
  set('ci-water',   ci.water);
  set('ci-bjj-notes', ci.bjj_notes);
  set('ci-rounds',  ci.rounds);
  set('ci-duration',ci.duration);
  set('ci-rec-notes',ci.rec_notes);
  set('ci-notes',   ci.notes);
  const tog = document.getElementById('ci-trained');
  if(tog) tog.classList.toggle('on',!!ci.trained);

  buildRating('ci-energy',  ci.energy);
  buildRating('ci-sleepq',  ci.sleepq);
  buildRating('ci-mood',    ci.mood);
  buildRating('ci-stress',  ci.stress, 'var(--accent)');
  buildRating('ci-hunger',  ci.hunger);

  document.getElementById('ci-bjj-sec').style.display = dt==='bjj'?'block':'none';
  document.getElementById('ci-rec-sec').style.display = dt==='rec'?'block':'none';

  buildPositions(ci.bjj_positions||[]);
  initBodyMap(ciDate);

  // Flex
  const ft=document.getElementById('flex-tog'), fp=document.getElementById('flex-panel');
  if(ft) ft.classList.toggle('on',!!ci.flex);
  if(fp) fp.style.display = ci.flex?'block':'none';

  renderMeals(ciDate);
  renderLoggedFoods(ciDate);
  updateMacros(ciDate);
  document.getElementById('ci-rot-lbl').textContent = `${MEALS[dt]?.label} · Week ${getRot(wn)} rotation`;
}

function buildDayPills(id, wn, sel) {
  const el=document.getElementById(id); if(!el)return;
  el.innerHTML='';
  getWkDates(wn).forEach((d,i)=>{
    const ci=getCI(d), done=Object.keys(ci).length>0, isTd=d===today(), isSel=d===sel;
    const dt=DAY_TYPES[i];
    const p=document.createElement('div');
    p.className=`dp ${dt}-d${done?' done':''}${isTd?' today':''}${isSel?' sel':''}`;
    p.innerHTML=`<div class="dpd">${DAYS[i]}</div><div class="dpn">${new Date(d).getDate()}</div><div class="dpdot"></div>`;
    p.onclick=()=>{ ciDate=d; renderCheckin(); };
    el.appendChild(p);
  });
}

function saveCheckin() {
  const dow = getDow(ciDate);
  const dt  = DAY_TYPES[dow];
  const data = {
    sleep:    parseFloat(document.getElementById('ci-sleep')?.value)||null,
    weight:   parseFloat(document.getElementById('ci-weight')?.value)||null,
    steps:    parseInt(document.getElementById('ci-steps')?.value)||null,
    water:    parseFloat(document.getElementById('ci-water')?.value)||null,
    energy:   getRating('ci-energy'),
    sleepq:   getRating('ci-sleepq'),
    mood:     getRating('ci-mood'),
    stress:   getRating('ci-stress'),
    hunger:   getRating('ci-hunger'),
    trained:  document.getElementById('ci-trained')?.classList.contains('on')||false,
    notes:    document.getElementById('ci-notes')?.value||'',
    sore_zones: _soreZones,
  };
  if(dt==='bjj'){
    data.bjj_notes     = document.getElementById('ci-bjj-notes')?.value||'';
    data.bjj_positions = _selectedPositions;
    data.rounds        = parseInt(document.getElementById('ci-rounds')?.value)||null;
    data.duration      = parseInt(document.getElementById('ci-duration')?.value)||null;
  }
  if(dt==='rec') data.rec_notes = document.getElementById('ci-rec-notes')?.value||'';
  saveCI(ciDate, data);
  toast('Check-in saved ✓');
  updateCalLbl();
  if (document.getElementById('screen-today')?.classList.contains('active')) renderToday();
}

// ═══════════════════════════════════════════════════════
//  WORKOUT
// ═══════════════════════════════════════════════════════
function selSess(s) {
  wkSess=s;
  ['a','b','c'].forEach(k=>{ const btn=document.getElementById('wt-'+k); if(btn)btn.className='ha '+(k.toUpperCase()===s?'p':'s'); });
  renderWorkout();
}

function getPrevSess(sk, currentWn) {
  for(let wn=currentWn-1;wn>=1;wn--){
    for(const d of getWkDates(wn)){
      const wo=getWO(d,sk);
      if(Object.keys(wo).length>0) return wo;
    }
  }
  return {};
}


function markSetDoneUI(exId, setNum, isDone) {
  const row = document.getElementById(`ex-${exId}-s${setNum}-row`);
  const btn = document.getElementById(`ex-${exId}-s${setNum}-done`);
  if (row) row.classList.toggle('done', !!isDone);
  if (btn) {
    btn.classList.toggle('done', !!isDone);
    btn.dataset.done = isDone ? '1' : '0';
    btn.textContent = isDone ? 'DONE' : 'MARK';
  }
}
function focusNextSetInput(exId, setNum) {
  const nextWeight = document.getElementById(`ex-${exId}-s${setNum+1}-w`);
  const nextReps = document.getElementById(`ex-${exId}-s${setNum+1}-r`);
  const nextField = nextWeight || nextReps;
  if (nextField) {
    nextField.focus();
    return;
  }
  const sess = SESSIONS[wkSess];
  const idx = sess.exercises.findIndex(ex => ex.id === exId);
  const nextEx = sess.exercises[idx+1];
  const nextExField = nextEx ? (document.getElementById(`ex-${nextEx.id}-s1-w`) || document.getElementById(`ex-${nextEx.id}-s1-r`)) : null;
  if (nextExField) nextExField.focus();
}
function collectWorkoutData() {
  const td   = today();
  const sess = SESSIONS[wkSess];
  const liveTimer = getLiveWorkoutTimerState(td, wkSess);
  const liveRest = getLiveRestTimerState(td, wkSess);
  const data = {
    _rpe: getRPE('sess-rpe'),
    _targetMin: liveTimer.targetMin || 60,
    _elapsedSec: liveTimer.elapsedSec || 0,
    _durationSec: Math.max(liveTimer.durationSec || 0, liveTimer.elapsedSec || 0),
    _timerRunning: !!liveTimer.running,
    _timerStartedAt: liveTimer.running ? liveTimer.startedAt : null,
    _restTargetSec: liveRest.targetSec || 90,
    _restRemainingSec: Math.max(0, liveRest.remainingSec),
    _restRunning: !!liveRest.running,
    _restStartedAt: liveRest.running ? liveRest.startedAt : null,
    _restLabel: liveRest.label || '',
    _restLastCompletedSec: liveRest.lastCompletedSec || 0
  };
  sess.exercises.forEach(ex => {
    const sets = [];
    const completed = [];
    for (let s=1; s<=ex.sets; s++) {
      const w = document.getElementById(`ex-${ex.id}-s${s}-w`)?.value;
      const r = document.getElementById(`ex-${ex.id}-s${s}-r`)?.value;
      const doneBtn = document.getElementById(`ex-${ex.id}-s${s}-done`);
      if (w || r) sets.push({weight:w||null,reps:r||null});
      if (doneBtn?.dataset.done === '1') completed.push(s);
    }
    if (sets.length || completed.length) {
      data[ex.id] = {};
      if (sets.length) data[ex.id].sets = sets;
      if (completed.length) data[ex.id].completed = completed;
    }
  });
  return data;
}
function completeSet(exId, setNum) {
  const w = document.getElementById(`ex-${exId}-s${setNum}-w`)?.value?.trim();
  const r = document.getElementById(`ex-${exId}-s${setNum}-r`)?.value?.trim();
  const btn = document.getElementById(`ex-${exId}-s${setNum}-done`);
  if (!btn) return;
  const wasDone = btn.dataset.done === '1';
  if (!wasDone && !w && !r) {
    toast('Enter weight or reps first');
    return;
  }
  const isDone = !wasDone;
  markSetDoneUI(exId, setNum, isDone);
  const data = collectWorkoutData();
  saveWO(today(), wkSess, data);
  if (isDone) {
    const ex = getExerciseById(exId);
    const sec = getExerciseRestTarget(ex || {});
    beginRestCountdown(sec, ex ? `${ex.name} · set ${setNum}` : 'General set rest');
    focusNextSetInput(exId, setNum);
    toast(`Set ${setNum} saved · rest ${formatRestPreset(sec)}`);
  } else {
    toast(`Set ${setNum} unmarked`);
  }
  if (document.getElementById('screen-progress')?.classList.contains('active')) renderProgress();
  if (document.getElementById('screen-today')?.classList.contains('active')) renderToday();
}

function renderWorkout() {
  const td   = today();
  const wn   = curWk();
  const sess = SESSIONS[wkSess];
  const deload = isDeload(wn);
  const saved  = getWO(td, wkSess);
  const prev   = getPrevSess(wkSess, wn);
  const ph     = getPhase(wn);
  const coach  = getSessionCoachSummary(wkSess, td);

  document.getElementById('wk-sub').textContent = fmtDate(td)+' · '+sess.label;
  document.getElementById('wk-deload').style.display = deload?'block':'none';
  document.getElementById('wk-phase').innerHTML = `<div class="phase-banner" style="border-left-color:${sess.color}">
    <div class="pb-wk">Week ${wn} · ${ph.label}</div>
    <div class="pb-ph" style="color:${sess.color}">${sess.label}</div>
    <div class="pb-det">${ph.detail}</div>
  </div>
  <div class="coach-card">
    <div class="coach-main">
      <div>
        <div class="rec-title">Session Strategy</div>
        <div class="coach-head">${coach.headline}</div>
        <div class="coach-sub">${coach.sub}</div>
      </div>
      <div class="band-pill" style="color:${coach.readiness.color}">${coach.readiness.label}</div>
    </div>
    <div class="micro-grid">
      <div class="micro-card"><div class="micro-v" style="color:${coach.readiness.color}">${coach.readiness.score ?? '—'}</div><div class="micro-l">readiness</div></div>
      <div class="micro-card"><div class="micro-v" style="color:var(--green)">${coach.push}</div><div class="micro-l">push lifts</div></div>
      <div class="micro-card"><div class="micro-v" style="color:var(--gold)">${coach.plateaus}</div><div class="micro-l">plateaus</div></div>
    </div>
  </div>`;

  renderWorkoutTimer(prev);
  renderRestTimer();

  const container = document.getElementById('wk-exs');
  container.innerHTML = '';
  const numSets = deload ? 2 : null;

  sess.exercises.forEach((ex, idx)=>{
    const exSaved = saved[ex.id]||{};
    const exPrev  = prev[ex.id]||{};
    const prevSets = exPrev.sets||[];
    const ns = numSets||ex.sets;
    const prev1RM = prevSets.reduce((best,s)=>{ const rm=est1RM(parseFloat(s.weight),parseInt(s.reps)); return rm>best?rm:best; },0);
    const prevSummary = prevSets.length ? prevSets.map(s=>`${s.weight||'?'}×${s.reps||'?'}`).join(' ') : null;
    const insight = getExerciseInsight(ex, td);

    const card = document.createElement('div');
    card.className='exc';
    let setsHtml = `<table class="stbl"><thead><tr><th>#</th><th>kg</th><th>Reps</th><th>Done</th></tr></thead><tbody>`;
    for(let s=1;s<=ns;s++){
      const sv   = (exSaved.sets||[])[s-1]||{};
      const pv   = prevSets[s-1]||{};
      const dlWeight = deload && pv.weight ? (parseFloat(pv.weight)*0.6).toFixed(1) : '';
      const wVal = sv.weight||(deload?dlWeight:'');
      const rVal = sv.reps||'';
      const cls  = deload?'si dl':pv.weight?'si pre':'si';
      const isDone = (exSaved.completed||[]).includes(s);
      setsHtml += `<tr id="ex-${ex.id}-s${s}-row" class="set-row ${isDone?'done':''}">
        <td class="sn">${s}</td>
        <td><input type="number" class="${cls}" id="ex-${ex.id}-s${s}-w" value="${wVal}" placeholder="${deload?dlWeight:pv.weight||'kg'}" step="2.5"></td>
        <td><input type="number" class="${cls}" id="ex-${ex.id}-s${s}-r" value="${rVal}" placeholder="${pv.reps||'reps'}"></td>
        <td class="set-done-cell"><button class="set-done-btn ${isDone?'done':''}" id="ex-${ex.id}-s${s}-done" data-done="${isDone?1:0}" onclick="event.stopPropagation();completeSet('${ex.id}', ${s})">${isDone?'DONE':'MARK'}</button></td>
      </tr>`;
    }
    setsHtml += '</tbody></table>';
    if(deload) setsHtml += `<div style="font-size:11px;color:var(--gold);margin-top:6px">⚡ Weights auto-set to 60% of last session</div>`;

    card.innerHTML = `
      <div class="exh" onclick="toggleExBody('exb-${idx}',this)">
        <div class="exn">${ex.id}</div>
        <div class="exi">
          <div class="exname">${ex.name} <span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);font-weight:400">${ex.tag}</span></div>
          <div class="exguide">${ex.guide}</div>
          ${prevSummary?`<div class="exlast">↑ Last: ${prevSummary}</div>`:''}
          ${prev1RM?`<div class="exrm">Est. 1RM: ${prev1RM}kg</div>`:''}
          ${insight.badge?`<div style="margin-top:6px"><span class="pr-badge">${insight.badge}</span></div>`:''}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2" style="flex-shrink:0;transition:transform 0.2s" id="exch-${idx}"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="exb" id="exb-${idx}">
        <div class="excue">"${ex.cue}"</div>
        <div class="excoach"><strong style="color:${insight.color}">${insight.headline}</strong><span>${insight.detail}</span></div>
        ${setsHtml}
        <div class="set-flow-tip">Tap <strong>MARK</strong> when a set is finished. It autosaves that set and starts the right rest timer.</div>
        ${buildExerciseRestControls(ex)}
      </div>`;
    container.appendChild(card);
  });

  buildRPE('sess-rpe', saved._rpe);
}

function toggleExBody(id, header) {
  const body=document.getElementById(id); if(!body)return;
  body.classList.toggle('open');
  const idx=id.split('-')[1];
  const chev=document.getElementById('exch-'+idx);
  if(chev) chev.style.transform=body.classList.contains('open')?'rotate(180deg)':'';
}

function saveWorkout() {
  const td   = today();
  const data = collectWorkoutData();
  data._timerRunning = false;
  data._timerStartedAt = null;
  data._restRunning = false;
  data._restStartedAt = null;
  saveWO(td, wkSess, data);
  stopWorkoutTimerTick();
  stopRestTimerTick();
  renderWorkout();
  toast(`Session saved ✓${data._durationSec ? ` · ${formatDurationShort(data._durationSec)}` : ''}`);
  if (document.getElementById('screen-progress')?.classList.contains('active')) renderProgress();
  if (document.getElementById('screen-today')?.classList.contains('active')) renderToday();
}

// ═══════════════════════════════════════════════════════
//  PROGRESS
// ═══════════════════════════════════════════════════════
function renderProgress() {
  const wn = curWk();
  const allDates = getAllDatesThrough(today());
  const allCI = allDates.map(d=>({date:d,...getCI(d)})).filter(d=>Object.keys(d).length>1);

  const bjjHit  = allCI.filter(c=>DAY_TYPES[getDow(c.date)]==='bjj'&&c.trained).length;
  const strHit  = allCI.filter(c=>DAY_TYPES[getDow(c.date)]==='str'&&c.trained).length;
  const logRate = allCI.length ? Math.round(allCI.length/allDates.length*100) : 0;
  const avgSlp  = avg(allCI.filter(c=>c.sleep).map(c=>c.sleep));
  const avgStps = avg(allCI.filter(c=>c.steps).map(c=>c.steps));
  const avgEng  = avg(allCI.filter(c=>c.energy).map(c=>c.energy));
  const readinessAvg = avg(allDates.map(d => getReadinessProfile(d).score).filter(v => v !== null));
  const allRPEs = getWorkoutRPEs(allDates);
  const avgRPE  = avg(allRPEs.map(r => r.val));

  const soreCounts = {};
  allCI.forEach(c=>{ (c.sore_zones||[]).forEach(z=>{ soreCounts[z]=(soreCounts[z]||0)+1; }); });
  const topSore = Object.entries(soreCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>{ const z=SORE_ZONES.find(z=>z.id===id); return z?`${z.label}(${n}×)`:id; });

  document.getElementById('prog-stats').innerHTML = [
    {v:bjjHit,l:'BJJ Sessions',c:'var(--bjj)'},
    {v:strHit,l:'Strength',c:'var(--blue)'},
    {v:logRate+'%',l:'Log Rate',c:logRate>=80?'var(--green)':'var(--gold)'},
    {v:avgSlp?avgSlp.toFixed(1)+'h':'—',l:'Avg Sleep',c:'var(--blue)'},
    {v:avgStps?Math.round(avgStps).toLocaleString():'—',l:'Avg Steps',c:'var(--green)'},
    {v:readinessAvg?Math.round(readinessAvg):'—',l:'Readiness',c:readinessAvg>=75?'var(--green)':readinessAvg>=55?'var(--gold)':'var(--accent)'},
  ].map(s=>`<div class="pring"><div class="pv" style="color:${s.c};font-size:${s.v.toString().length>4?'16px':'28px'}">${s.v}</div><div class="pl">${s.l}</div></div>`).join('');

  const chartContainer = document.getElementById('prog-charts');
  chartContainer.innerHTML = '';

  const weights = allCI.filter(c=>c.weight).map(c=>({date:c.date,val:c.weight,avg:rollingWeight(c.date)})).slice(-21);
  if(weights.length>=2) {
    const maxW=Math.max(...weights.map(v=>v.val)), minW=Math.min(...weights.map(v=>v.val));
    const rng=maxW-minW||1;
    const bars=weights.map(v=>{
      const h=Math.max(8,Math.round(((v.val-minW)/rng)*70));
      const avgH=v.avg?Math.max(8,Math.round(((parseFloat(v.avg)-minW)/rng)*70)):null;
      return `<div class="cbar-w"><div class="cbar" style="height:${h}px;background:var(--blue);opacity:0.8;position:relative">${avgH?`<div style="position:absolute;bottom:${avgH-h}px;left:0;right:0;border-top:2px dashed var(--gold)"></div>`:''}</div><div class="clbl">${parseLocalDate(v.date).getDate()}</div></div>`;
    }).join('');
    chartContainer.innerHTML += `<div class="chart-wrap"><div class="chart-title">Body Weight</div><div class="chart-sub">Bars = daily · Dashed = 7-day avg</div><div class="chart-area">${bars}</div></div>`;
  }

  [
    {title:'Sleep — hours',key:'sleep',color:'var(--purple)',target:8},
    {title:'Energy — 1 to 5',key:'energy',color:'var(--gold)',target:4},
    {title:'Steps',key:'steps',color:'var(--green)',target:8000},
    {title:'Session RPE',getData:()=>allRPEs,color:'var(--accent)',target:7},
    {title:'Readiness',getData:()=>allDates.map(d=>({date:d,val:getReadinessProfile(d).score})).filter(v=>v.val!==null),color:'var(--blue)',target:75},
  ].forEach(ch=>{
    const vals = ch.getData ? ch.getData() : allCI.filter(c=>c[ch.key]).map(c=>({date:c.date,val:c[ch.key]}));
    if(vals.length<2) return;
    const recent = vals.slice(-14);
    const max=Math.max(...recent.map(v=>v.val)), min=Math.min(...recent.map(v=>v.val)), rng=max-min||1;
    const bars=recent.map(v=>{
      const h=Math.max(8,Math.round(((v.val-min)/rng)*70));
      const over=ch.target&&v.val>ch.target;
      return `<div class="cbar-w"><div class="cbar" style="height:${h}px;background:${ch.color};opacity:${over?'1':'0.65'}"></div><div class="clbl">${parseLocalDate(v.date).getDate()}</div></div>`;
    }).join('');
    const latest=vals[vals.length-1].val;
    chartContainer.innerHTML += `<div class="chart-wrap"><div class="chart-title">${ch.title} <span style="float:right;color:var(--text2);font-family:'DM Sans',sans-serif;text-transform:none;letter-spacing:0">Latest: ${latest}</span></div><div class="chart-area">${bars}</div></div>`;
  });

  const rmData = {};
  ['A','B','C'].forEach(sk => {
    SESSIONS[sk].exercises.forEach(ex => {
      const hist = getExerciseHistory(ex.id, today());
      if (hist.length) rmData[ex.id] = hist;
    });
  });
  if(Object.keys(rmData).length>0) {
    let rmHtml = '<div class="chart-wrap"><div class="chart-title">Estimated 1RM Progress & PR Board</div>';
    Object.entries(rmData).sort((a,b)=>(b[1][b[1].length-1].bestRM - a[1][a[1].length-1].bestRM)).slice(0,8).forEach(([exId,data])=>{
      const sessKey=exId[0]; const sess=SESSIONS[sessKey];
      const ex=sess?.exercises.find(e=>e.id===exId);
      const first=data[0].bestRM, last=data[data.length-1].bestRM, gain=last-first;
      const plateau = data.length >= 3 && (Math.max(...data.slice(-3).map(x=>x.bestRM)) - Math.min(...data.slice(-3).map(x=>x.bestRM)) <= 2);
      rmHtml += `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:12px;color:var(--text)">${ex?.name||exId}${plateau?` <span class="pr-badge" style="margin-left:6px">PLATEAU</span>`:''}</div>
        <div style="font-family:'DM Mono',monospace;font-size:11px;text-align:right"><span style="color:var(--text)">${last}kg</span>${gain>0?`<span style="color:var(--green);margin-left:6px">+${gain}kg</span>`:''}</div>
      </div>`;
    });
    rmHtml += '</div>';
    chartContainer.innerHTML += rmHtml;
  }

  if(topSore.length>0) {
    chartContainer.innerHTML += `<div class="chart-wrap"><div class="chart-title">Recurring Soreness</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">${Object.entries(soreCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([id,n])=>{ const z=SORE_ZONES.find(z=>z.id===id); const intensity=Math.min(1,n/5); return `<div style="background:rgba(200,57,26,${0.1+intensity*0.4});border:1px solid rgba(200,57,26,${0.2+intensity*0.4});border-radius:8px;padding:6px 10px;text-align:center"><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--accent)">${n}×</div><div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text2)">${z?.label||id}</div></div>`; }).join('')}</div></div>`;
  }

  const posCounts = {};
  allCI.filter(c=>c.bjj_positions).forEach(c=>{ c.bjj_positions.forEach(p=>{ posCounts[p]=(posCounts[p]||0)+1; }); });
  if(Object.keys(posCounts).length>0) {
    const topPos=Object.entries(posCounts).sort((a,b)=>b[1]-a[1]);
    const maxCount=topPos[0][1];
    chartContainer.innerHTML += `<div class="chart-wrap"><div class="chart-title">BJJ — Time by Position</div>${topPos.map(([p,n])=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0"><div style="font-size:12px;color:var(--text);width:90px;flex-shrink:0">${p}</div><div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="width:${Math.round(n/maxCount*100)}%;height:100%;background:var(--bjj);border-radius:4px"></div></div><div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);width:24px;text-align:right">${n}×</div></div>`).join('')}</div>`;
  }

  renderFlags(allCI);
  renderHistorySection(allDates);
  renderEndReport(allCI, wn);
}

function avg(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null; }

function renderFlags(allCI) {
  const flags=[];
  // Skipped meals + low energy
  const skipLow=allCI.filter(c=>{ const sk=5-Object.values(c.meal_states||{}).filter(Boolean).length; return sk>=2&&c.energy&&c.energy<=2; }).length;
  if(skipLow>=2) flags.push({type:'warn',icon:'⚡',title:'Pattern: Skipped Meals → Low Energy',text:`${skipLow} days of 2+ skipped meals correlating with low energy scores. Mid-morning snack (Meal 2) is typically the missing link.`});

  // Poor sleep before BJJ
  const sleepBJJ=allCI.filter(c=>DAY_TYPES[getDow(c.date)]==='bjj'&&c.sleep&&c.sleep<7).length;
  if(sleepBJJ>=2) flags.push({type:'warn',icon:'😴',title:'Poor Sleep Before BJJ',text:`${sleepBJJ} BJJ sessions started with under 7hrs sleep. Earlier bedtime on Sun, Wed, Thu nights will compound over 13 weeks.`});

  // Good streak
  const wns=[]; for(let wn=1;wn<=curWk();wn++){ const d=getWkDates(wn); const t=d.filter(dd=>getCI(dd).trained).length; wns.push(t>=4); }
  const streak=wns.reduceRight((a,v)=>v?a+1:0,0);
  if(streak>=2) flags.push({type:'good',icon:'🔥',title:`${streak}-Week Streak`,text:`${streak} consecutive weeks hitting your session targets. This is the compounding effect the plan is built on.`});

  // High RPE trend
  const recentRPEs = getWorkoutRPEs(getAllDatesThrough(today()).slice(-21)).map(r => r.val);
  const rpeAvg=avg(recentRPEs);
  if(rpeAvg&&rpeAvg>=8.5) flags.push({type:'warn',icon:'📈',title:'RPE Trending High',text:`Average session RPE of ${rpeAvg.toFixed(1)} over the last 3 weeks. This level of fatigue needs monitoring — deload week will address it.`});
  if(rpeAvg&&rpeAvg<=5&&recentRPEs.length>=3) flags.push({type:'info',icon:'💪',title:'Room to Push Harder',text:`Average RPE of ${rpeAvg.toFixed(1)} — you have more in the tank. Consider adding weight to your primary lifts next session.`});

  // Weight trend
  const ws=allCI.filter(c=>c.weight).slice(-14);
  if(ws.length>=7){
    const diff=ws[ws.length-1].weight-ws[0].weight;
    if(Math.abs(diff)>0.5) flags.push({type:Math.abs(diff)<1.5?'good':'warn',icon:'⚖️',title:'Weight Trend',text:`${diff>0?'+':''}${diff.toFixed(1)}kg over ${ws.length} days. ${diff>2?'Gaining faster than planned — check portions on recovery days.':diff<-1.5?'Losing quickly — ensure meals 2 and 4 are not being skipped.':'Trending well for recomp.'}`});
  }

  document.getElementById('prog-flags').innerHTML = flags.map(f=>`<div class="flag ${f.type}"><strong>${f.icon} ${f.title}</strong>${f.text}</div>`).join('');
}

function renderEndReport(allCI, wn) {
  const container = document.getElementById('end-report');
  if(wn < 12) { container.innerHTML=''; return; }

  const bjjHit=allCI.filter(c=>DAY_TYPES[getDow(c.date)]==='bjj'&&c.trained).length;
  const strHit=allCI.filter(c=>DAY_TYPES[getDow(c.date)]==='str'&&c.trained).length;
  const totalSess=bjjHit+strHit;
  const ws=allCI.filter(c=>c.weight);
  const wtChange=ws.length>=2?(ws[ws.length-1].weight-ws[0].weight).toFixed(1):null;
  const avgSlp=avg(allCI.filter(c=>c.sleep).map(c=>c.sleep));
  const topPos=Object.entries(allCI.reduce((acc,c)=>{ (c.bjj_positions||[]).forEach(p=>{acc[p]=(acc[p]||0)+1;}); return acc; },{})).sort((a,b)=>b[1]-a[1])[0];

  container.innerHTML = `
    <div class="card" style="border-color:var(--gold)">
      <div class="card-title" style="color:var(--gold)">⚡ 13-Week Block Report</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px">
        <div class="report-stat"><div class="rs-val">${totalSess}</div><div class="rs-label">Total Sessions</div></div>
        <div class="report-stat"><div class="rs-val">${bjjHit}</div><div class="rs-label">BJJ Classes</div></div>
        <div class="report-stat"><div class="rs-val">${strHit}</div><div class="rs-label">Strength Sessions</div></div>
        <div class="report-stat" style="background:rgba(212,160,23,0.1)"><div class="rs-val" style="color:var(--gold)">${wtChange!==null?(wtChange>0?'+':'')+wtChange+'kg':'—'}</div><div class="rs-label">Weight Change</div></div>
        <div class="report-stat"><div class="rs-val" style="color:var(--blue)">${avgSlp?avgSlp.toFixed(1)+'h':'—'}</div><div class="rs-label">Avg Sleep</div></div>
        <div class="report-stat"><div class="rs-val" style="color:var(--bjj)">${allCI.length}</div><div class="rs-label">Days Logged</div></div>
      </div>
      ${topPos?`<div style="background:rgba(232,129,42,0.08);border:1px solid rgba(232,129,42,0.2);border-radius:8px;padding:10px;font-size:12px;color:var(--text2)"><strong style="color:var(--bjj)">Most trained position:</strong> ${topPos[0]} (${topPos[1]} sessions)</div>`:''}
      <div style="font-size:12px;color:var(--text2);line-height:1.7;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
        <strong style="color:var(--text);display:block;margin-bottom:4px">What happens next?</strong>
        Take 1 week fully off. Then return with adjusted targets based on what you achieved. Your strength base and BJJ attendance will carry directly into Block 2.
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════
//  SUPPLEMENT DATA
// ═══════════════════════════════════════════════════════
const SUPPLEMENTS = [
  {id:'creatine', name:'Creatine Monohydrate', dose:'5g',    when:'Any time with a meal',   why:'Power output, recovery speed, muscle retention in deficit', icon:'💪', timing:'anytime'},
  {id:'omega3',   name:'Omega-3 (EPA/DHA)',    dose:'2–3g',  when:'With a meal',             why:'Joint inflammation, brain health, recovery', icon:'🐟', timing:'anytime'},
  {id:'vitd',     name:'Vitamin D3 + K2',      dose:'3,000–5,000 IU D3 + 100mcg K2', when:'Morning with fatty meal', why:'Bone density, testosterone support, immune function', icon:'☀️', timing:'morning'},
  {id:'mag',      name:'Magnesium Glycinate',   dose:'300–400mg', when:'Evening',            why:'Muscle recovery, sleep quality, cramp prevention', icon:'🌙', timing:'evening'},
  {id:'zinc',     name:'Zinc',                  dose:'15–25mg',   when:'Evening',            why:'Testosterone support, immune defence, sleep quality', icon:'⚡', timing:'evening'},
  {id:'whey',     name:'Whey Protein',          dose:'1–2 scoops as needed', when:'Post-training or between meals', why:'Bridge gaps to hit daily protein target', icon:'🥤', timing:'training'},
];

const SHOPPING = {
  protein: {
    label:'🥩 Protein', color:'var(--bjj)',
    items:[
      {name:'Greek yoghurt 0%',     qty:'2,450g',   guide:'3×750g tubs (~£5.85) — Sainsbury\'s own brand'},
      {name:'Whey protein powder',  qty:'~420g',    guide:'1kg (~£20) lasts 2.5 wks — buy 2.5kg online'},
      {name:'Chicken breast (raw)', qty:'~1,100g',  guide:'1×1kg pack (~£6.50) — bulk buy & freeze'},
      {name:'Chicken thighs (raw)', qty:'~780g',    guide:'2×400g packs (~£5.98)'},
      {name:'Beef mince 5%',        qty:'~600g',    guide:'1×500g + small top-up (~£8.25)'},
      {name:'Salmon fillet (frozen)',qty:'200g',    guide:'1×300g bag (~£3.50) — defrost Fri morning'},
      {name:'Parmesan',             qty:'~20g',     guide:'Pre-grated tub (~£0.80) — strength lunch only'},
    ]
  },
  carbs: {
    label:'🌾 Carbohydrates', color:'var(--gold)',
    items:[
      {name:'Porridge oats',        qty:'~350g',    guide:'1kg bag (~£1.25) lasts ~3 weeks'},
      {name:'Granola',              qty:'~315g',    guide:'500g bag (~£1.50) — Week A breakfast'},
      {name:'Sourdough bread',      qty:'2 loaves', guide:'~£1/loaf — Week B breakfast, 2 slices/day'},
      {name:'White rice (dry)',     qty:'~600g',    guide:'1kg bag (~£1.00)'},
      {name:'Pasta (dry)',          qty:'~315g',    guide:'500g bag (~£0.70) — strength days'},
      {name:'Sweet potato',         qty:'~900g',    guide:'1kg bag (~£1.25)'},
      {name:'Rice cakes',           qty:'~140g',    guide:'1 pack (~£1.00) — pre-training snack'},
      {name:'Honey',                qty:'~90g',     guide:'1 jar (~£1.50) lasts several weeks'},
      {name:'Passata',              qty:'~450g',    guide:'1×500g carton (~£0.75) — strength lunch'},
      {name:'Pesto',                qty:'~90g',     guide:'1 jar (~£1.50) lasts ~3 weeks — Wk B str dinner'},
      {name:'Wholegrain crackers',  qty:'~30g',     guide:'1 pack (~£0.80) lasts 2 weeks — Wed only'},
    ]
  },
  fruit: {
    label:'🍓 Fruit & Frozen', color:'var(--purple)',
    items:[
      {name:'Fresh blueberries',    qty:'~560g',    guide:'2×150g punnets (~£2.50) — mid-morning daily'},
      {name:'Frozen mixed berries', qty:'~560g',    guide:'1kg bag (~£2.00) lasts ~12 days — breakfast'},
      {name:'Bananas',              qty:'~4 bananas',guide:'1 bunch (~£1.00) — strength pre-training'},
      {name:'Frozen broccoli',      qty:'~600g',    guide:'900g bag (~£1.20) lasts ~10 days — BJJ dinners'},
      {name:'Frozen green beans',   qty:'~450g',    guide:'900g bag (~£1.00) lasts ~2 wks — Wk A str dinner'},
      {name:'Frozen spinach',       qty:'200g',     guide:'450g bag (~£1.00) lasts ~3 wks — Fri dinner'},
    ]
  },
  veg: {
    label:'🥦 Vegetables', color:'var(--green)',
    items:[
      {name:'Courgette',            qty:'~480g',    guide:'2–3 medium (~£0.90) — rec + Wk B str dinners'},
      {name:'Cherry tomatoes',      qty:'~200g',    guide:'1 punnet (~£0.80) — Week B strength dinner'},
      {name:'Cucumber',             qty:'1 whole',  guide:'~£0.55 — Wednesday lunch'},
      {name:'Salad leaves',         qty:'1 bag',    guide:'~£1.00 — BJJ day lunches'},
      {name:'Olives (jar)',         qty:'~30g',     guide:'Small jar (~£0.80) lasts several weeks — Wed lunch'},
    ]
  },
  dairy: {
    label:'🥛 Dairy & Fats', color:'var(--blue)',
    items:[
      {name:'Whole milk',           qty:'~2.8L',    guide:'2×2-pint cartons (~£3.40) — oats every morning'},
      {name:'Salted organic butter',qty:'~75g',     guide:'250g block (~£2.50) lasts ~3 wks — Wk B breakfast'},
      {name:'Olive oil',            qty:'~150ml',   guide:'1 bottle (~£2.50) lasts 4–5 weeks (~£0.60/wk)'},
    ]
  },
};

// ═══════════════════════════════════════════════════════
//  PLAN SCREEN
// ═══════════════════════════════════════════════════════
let _planTab = 'supp';

function showPlanTab(tab) {
  _planTab = tab;
  document.getElementById('plan-supp').style.display = tab==='supp' ? 'block' : 'none';
  document.getElementById('plan-shop').style.display = tab==='shop' ? 'block' : 'none';
  document.getElementById('plan-prep').style.display = tab==='prep' ? 'block' : 'none';
  document.getElementById('plan-rev').style.display  = tab==='rev'  ? 'block' : 'none';
  document.getElementById('plan-tab-supp').className = 'ha ' + (tab==='supp'?'p':'s');
  document.getElementById('plan-tab-shop').className = 'ha ' + (tab==='shop'?'p':'s');
  document.getElementById('plan-tab-prep').className = 'ha ' + (tab==='prep'?'p':'s');
  document.getElementById('plan-tab-rev').className  = 'ha ' + (tab==='rev'?'p':'s');
  if (tab==='prep') renderMealPrep();
  if (tab==='rev') renderRevContent();
}

function openMealPrep() {
  showScreen('plan', document.querySelectorAll('.nav-btn')[4]);
  showPlanTab('prep');
}

function renderPlan() {
  const wn  = curWk();
  const rot = getRot(wn);
  document.getElementById('plan-sub').textContent = `Week ${wn} · Week ${rot} rotation`;
  const shopRot = document.getElementById('shop-rot-lbl');
  if (shopRot) shopRot.textContent = `Week ${rot}`;
  renderSupplements();
  renderShoppingList();
  renderMealPrep();
  showPlanTab(_planTab);
}


function getPrepSlotConfig(slot) {
  return slot === 'sunday'
    ? {slot:'sunday', title:'Sunday Prep', short:'Sunday', subtitle:'Prep for Mon–Wed', dows:[0,1,2], accent:'var(--blue)'}
    : {slot:'wednesday', title:'Wednesday Top-Up', short:'Wednesday', subtitle:'Prep for Thu–Sun', dows:[3,4,5,6], accent:'var(--green)'};
}
function getPrepStorageKey(wn, slot) {
  return `wk${wn}_${slot}`;
}
function parsePrepQty(q) {
  const match = String(q || '').trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return null;
  return {value: parseFloat(match[1]), unit: (match[2] || '').trim()};
}
function formatPrepNumber(num) {
  if (Math.abs(num - Math.round(num)) < 0.01) return String(Math.round(num));
  return num.toFixed(1).replace(/\.0$/, '');
}
function formatPrepQty(value, unit) {
  const cleanUnit = (unit || '').trim();
  if (!cleanUnit) return formatPrepNumber(value);
  const singularMap = {scoops:'scoop', slices:'slice'};
  const pluralMap = {scoop:'scoops', slice:'slices'};
  let outUnit = cleanUnit;
  if (Math.abs(value - 1) < 0.01 && singularMap[cleanUnit]) outUnit = singularMap[cleanUnit];
  if (Math.abs(value - 1) >= 0.01 && pluralMap[cleanUnit]) outUnit = pluralMap[cleanUnit];
  return `${formatPrepNumber(value)} ${outUnit}`;
}
function scalePrepIngredients(ings, servings) {
  const bucket = {};
  (ings || []).forEach(ing => {
    const parsed = parsePrepQty(ing.q);
    const key = `${ing.n}__${parsed ? parsed.unit : ing.q}`;
    if (!bucket[key]) bucket[key] = {...ing, total:0, unit: parsed ? parsed.unit : ''};
    bucket[key].total += parsed ? parsed.value * servings : servings;
  });
  return Object.values(bucket).map(item => ({
    ...item,
    totalLabel: formatPrepQty(item.total, item.unit)
  }));
}
function getPrepMealKind(meal) {
  if (meal.id === 'm1') return 'Breakfast';
  if (meal.id === 'm3' || meal.id === 'm5') return 'Main Meals';
  return 'Snack Packs';
}
function prepHas(ings, name) {
  return (ings || []).some(ing => ing.n === name);
}
function getPrepMealTitle(meal, dayType) {
  const ings = meal.ings || [];
  if (meal.id === 'm1') return prepHas(ings, 'Sourdough Toast') ? 'Toast + Yoghurt Breakfast' : 'Yoghurt Breakfast Pot';
  if (meal.id === 'm2') return prepHas(ings, 'Banana') ? 'Pre-Lift Oats + Shake Pack' : 'Oats + Whey Pot';
  if (meal.id === 'm3') {
    if (prepHas(ings, 'Pasta')) return 'Chicken Pasta Lunch Box';
    if (prepHas(ings, 'Chicken Thighs')) return 'Recovery Rice Lunch Box';
    return 'Chicken Rice Lunch Box';
  }
  if (meal.id === 'm4') {
    if (prepHas(ings, 'Honey') && prepHas(ings, 'Rice Cakes')) return 'BJJ Pre-Training Pack';
    if (prepHas(ings, 'Banana')) return 'Strength Pre-Training Pack';
    return 'Recovery Snack Pack';
  }
  if (meal.id === 'm5') {
    if (prepHas(ings, 'Frozen Salmon')) return 'Salmon + Sweet Potato Dinner';
    if (prepHas(ings, 'Chicken Thighs') && prepHas(ings, 'White Rice')) return 'Chicken Rice Dinner';
    if (prepHas(ings, 'Chicken Breast') && prepHas(ings, 'White Rice')) return 'Chicken Rice Dinner';
    if (prepHas(ings, 'Beef Mince 5%') && prepHas(ings, 'Sweet Potato')) return 'Beef + Sweet Potato Dinner';
    if (prepHas(ings, 'Chicken Thighs') && prepHas(ings, 'Pasta')) return 'Chicken Pesto Pasta Dinner';
    if (prepHas(ings, 'Chicken Breast') && prepHas(ings, 'Sweet Potato')) return 'Chicken + Sweet Potato Dinner';
    if (prepHas(ings, 'Beef Mince 5%') && prepHas(ings, 'White Rice')) return 'Beef Rice Dinner';
  }
  return meal.name;
}
function prepSlug(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
function getPrepChecklist(slot, wn=curWk()) {
  const cfg = getPrepSlotConfig(slot);
  const rot = getRot(wn);
  const dayPlans = cfg.dows.map(dow => ({
    dow,
    day: DAYS[dow],
    type: DAY_LABELS[dow],
    meals: getMeals(DAY_TYPES[dow], rot, dow===4)
  }));
  const ingredientCounts = {};
  const mealMap = {};
  dayPlans.forEach(day => {
    day.meals.forEach(meal => {
      meal.ings.forEach(ing => {
        ingredientCounts[ing.n] = (ingredientCounts[ing.n] || 0) + 1;
      });
      const title = getPrepMealTitle(meal, DAY_TYPES[day.dow]);
      const signature = meal.ings.map(ing => `${ing.n}:${ing.q}`).join('|');
      const key = `${meal.id}__${title}__${signature}`;
      if (!mealMap[key]) {
        mealMap[key] = {
          id: prepSlug(`${slot}-${title}-${signature}`),
          mealId: meal.id,
          title,
          slotName: meal.name,
          kind: getPrepMealKind(meal),
          ings: meal.ings,
          servings: 0,
          days: [],
          notes: [],
          sortOrder: {m1:1,m2:2,m3:3,m4:4,m5:5}[meal.id] || 99,
          firstDow: day.dow
        };
      }
      mealMap[key].servings += 1;
      mealMap[key].days.push(`${day.day} ${meal.name}`);
      if (meal.note && !mealMap[key].notes.includes(meal.note)) mealMap[key].notes.push(meal.note);
    });
  });
  const meals = Object.values(mealMap)
    .map(item => ({
      ...item,
      batch: scalePrepIngredients(item.ings, item.servings)
    }))
    .sort((a,b) => a.sortOrder - b.sortOrder || a.firstDow - b.firstDow || a.title.localeCompare(b.title));
  const focusIngredients = Object.entries(ingredientCounts)
    .sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))
    .slice(0,6)
    .map(([name]) => name);
  return {
    ...cfg,
    dayPlans,
    focusIngredients,
    meals,
    totalPortions: meals.reduce((sum, meal) => sum + meal.servings, 0)
  };
}
function renderPrepSlot(slot, mountId) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const wn = curWk();
  const prep = getPrepChecklist(slot, wn);
  const state = getPrep(getPrepStorageKey(wn, slot));
  const doneCount = prep.meals.filter(meal => state[meal.id]).length;
  const pct = prep.meals.length ? Math.round((doneCount / prep.meals.length) * 100) : 0;
  const groups = ['Breakfast', 'Main Meals', 'Snack Packs'];
  mount.innerHTML = `
    <div class="prep-progress">
      <div>
        <div style="font-size:12px;color:var(--text2)">${prep.subtitle}</div>
        <strong style="color:${pct>=80?'var(--green)':pct>=40?'var(--gold)':prep.accent}">${doneCount}/${prep.meals.length}</strong>
      </div>
      <div class="band-pill" style="color:${prep.accent}">${prep.short}</div>
    </div>
    <div class="adbar" style="margin-bottom:10px"><div class="adfill" style="width:${pct}%;background:${pct>=80?'var(--green)':pct>=40?'var(--gold)':prep.accent}"></div></div>
    <div class="prep-days">${prep.dayPlans.map(day => `<span class="prep-day">${day.day} · ${day.type}</span>`).join('')}</div>
    <div class="prep-summary">
      <span class="band-pill">${prep.totalPortions} portions</span>
      <span class="band-pill">${prep.meals.length} prep cards</span>
    </div>
    ${groups.map(group => {
      const meals = prep.meals.filter(meal => meal.kind === group);
      if (!meals.length) return '';
      return `
        <div class="prep-group">
          <div class="prep-group-title">${group}</div>
          ${meals.map(meal => `
            <div class="prep-meal">
              <div class="prep-main">
                <div class="prep-head">
                  <div class="prep-name">${meal.title}</div>
                  <div class="prep-serv">${meal.servings} portion${meal.servings===1?'':'s'}</div>
                </div>
                <div class="prep-note">Covers: ${meal.days.join(' · ')}</div>
                <div class="prep-kicker">Per portion</div>
                <div class="prep-lines">${meal.ings.map(ing => `<div class="prep-line"><strong>${ing.q}</strong> ${ing.n}</div>`).join('')}</div>
                <div class="prep-kicker">Batch total</div>
                <div class="prep-lines">${meal.batch.map(ing => `<div class="prep-line"><strong>${ing.totalLabel}</strong> ${ing.n}</div>`).join('')}</div>
                ${meal.notes.length ? `<div class="prep-kicker">Prep note</div><div class="prep-line">${meal.notes.join(' · ')}</div>` : ''}
                <div class="prep-actions">
                  <button class="prep-action-btn" onclick="openPrepCookModal('${slot}','${meal.id}')">Generate cooking instructions</button>
                </div>
              </div>
              <div class="prep-toggle ${state[meal.id]?'on':''}" onclick="togglePrepItem('${slot}','${meal.id}')"></div>
            </div>`).join('')}
        </div>`;
    }).join('')}
    ${prep.focusIngredients.length ? `<div class="prep-chip-row">${prep.focusIngredients.map(name => `<span class="prep-chip">${name}</span>`).join('')}</div>` : ''}
  `;
}
function getNextPrepSlot() {
  const dow = getDow(today());
  return dow <= 2 ? 'wednesday' : 'sunday';
}
function renderMealPrep() {
  renderPrepSlot('sunday', 'prep-sunday');
  renderPrepSlot('wednesday', 'prep-wednesday');
  const nextMount = document.getElementById('prep-next');
  if (!nextMount) return;
  const slot = getNextPrepSlot();
  const prep = getPrepChecklist(slot, curWk());
  nextMount.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div>
        <div style="font-size:12px;color:var(--text2)">Next prep window</div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:0.06em">${prep.title}</div>
        <div style="font-size:12px;color:var(--text3)">${prep.subtitle} · ${prep.totalPortions} portions to prep</div>
      </div>
      <button class="ha s" style="font-size:12px;white-space:nowrap" onclick="showPlanTab('prep')">View List</button>
    </div>`;
}
function togglePrepItem(slot, itemId) {
  const key = getPrepStorageKey(curWk(), slot);
  const state = {...getPrep(key)};
  state[itemId] = !state[itemId];
  savePrep(key, state);
  renderMealPrep();
  if (document.getElementById('screen-today')?.classList.contains('active')) renderToday();
}

function getPrepMealById(slot, mealId, wn=curWk()) {
  return getPrepChecklist(slot, wn).meals.find(meal => meal.id === mealId) || null;
}
function escHtml(v) {
  return String(v ?? '').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}
function prepHasAny(ings, names) {
  return names.some(name => prepHas(ings, name));
}
function getProteinLabel(meal) {
  const ings = meal.ings || [];
  if (prepHasAny(ings, ['Chicken Breast','Chicken Thighs'])) return 'chicken';
  if (prepHas(ings, 'Beef Mince 5%')) return 'beef';
  if (prepHas(ings, 'Frozen Salmon')) return 'salmon';
  return 'protein';
}
function getCarbLabel(meal) {
  const ings = meal.ings || [];
  if (prepHas(ings, 'White Rice')) return 'rice';
  if (prepHas(ings, 'Pasta')) return 'pasta';
  if (prepHas(ings, 'Sweet Potato')) return 'sweet potato';
  if (prepHas(ings, 'Porridge Oats')) return 'oats';
  if (prepHas(ings, 'Granola')) return 'granola';
  return 'carb';
}
function getZeroCalFlavourIdeas(meal) {
  const ings = meal.ings || [];
  if (prepHasAny(ings, ['Chicken Breast','Chicken Thighs'])) {
    return [
      {title:'Lemon pepper herb', mix:'Lemon juice, black pepper, garlic granules, dried oregano, salt.', use:'Toss through the batch 15–20 min before cooking.'},
      {title:'Smoky paprika garlic', mix:'Smoked paprika, garlic granules, onion powder, black pepper, salt.', use:'Rub straight onto the chicken before oven roasting or pan cooking.'},
      {title:'Chilli lime', mix:'Lime juice, chilli flakes, cumin, garlic granules, salt.', use:'Best for rice bowls and wraps when you want more bite.'}
    ];
  }
  if (prepHas(ings, 'Beef Mince 5%')) {
    return [
      {title:'Smoky steakhouse', mix:'Smoked paprika, black pepper, garlic granules, onion powder, salt.', use:'Mix into the mince before browning for a richer savoury taste.'},
      {title:'Chilli cumin', mix:'Ground cumin, chilli flakes, black pepper, garlic granules, salt.', use:'Great for beef + rice or beef + sweet potato meals.'},
      {title:'Rosemary vinegar', mix:'Dried rosemary, cracked black pepper, garlic granules, a splash of red wine vinegar, salt.', use:'Stir through at the end of cooking for a sharper finish.'}
    ];
  }
  if (prepHas(ings, 'Frozen Salmon')) {
    return [
      {title:'Lemon dill', mix:'Lemon juice, dried dill, garlic granules, black pepper, salt.', use:'Coat the salmon just before baking.'},
      {title:'Chilli citrus', mix:'Lime juice, chilli flakes, paprika, black pepper, salt.', use:'Good when you want a brighter, sharper salmon traybake.'},
      {title:'Garlic parsley', mix:'Dried parsley, garlic granules, black pepper, salt, squeeze of lemon.', use:'Use after reheating as a fresh-tasting finishing seasoning.'}
    ];
  }
  return [
    {title:'Garlic herb', mix:'Garlic granules, dried herbs, black pepper, salt.', use:'Works on most savoury mains.'},
    {title:'Chilli citrus', mix:'Citrus juice, chilli flakes, black pepper, salt.', use:'Use when you want more bite without adding calories.'}
  ];
}
function getPrepStorageNotes(meal) {
  const notes = [];
  const ings = meal.ings || [];
  if (meal.kind === 'Breakfast') {
    notes.push('Keep chilled. Yoghurt pots hold well for 2–3 days.');
    if (prepHas(ings, 'Granola')) notes.push('Keep granola separate until eating so it stays crunchy.');
    if (prepHas(ings, 'Sourdough Toast')) notes.push('Toast the bread fresh on the day instead of storing it pre-toasted.');
    return notes;
  }
  if (meal.kind === 'Snack Packs') {
    notes.push('Dry items can be packed in bags or tubs. Keep bananas fresh and add them on the day.');
    if (prepHas(ings, 'Whole Milk')) notes.push('Store any milk separately and combine just before eating or drinking.');
    return notes;
  }
  notes.push('Cool the cooked food before sealing the containers and refrigerate promptly.');
  if (prepHasAny(ings, ['Salad Leaves','Cucumber'])) notes.push('Keep fresh salad items separate so the meal does not go soggy.');
  if (prepHas(ings, 'Olive Oil')) notes.push('Keep olive oil in a mini pot if you want tighter calorie control and better texture after reheating.');
  if (prepHas(ings, 'Frozen Salmon')) notes.push('Best eaten within 2–3 days. Freeze later portions if needed.');
  else notes.push('Main meal boxes are best inside 3 days refrigerated; freeze later portions if you are prepping further ahead.');
  return notes;
}
function getPrepCookSteps(meal) {
  const ings = meal.ings || [];
  const servings = meal.servings || 1;
  const steps = [];
  if (meal.kind === 'Breakfast') {
    if (prepHas(ings, 'Greek Yoghurt 0%')) {
      steps.push(`Set out ${servings} breakfast pot${servings===1?'':'s'} and weigh the ingredients for each portion.`);
      steps.push('Add yoghurt and berries to each pot. Keep granola separate if you want the texture to stay crisp.');
      if (prepHas(ings, 'Honey')) steps.push('Add the honey on the day, or portion it into tiny sauce pots so the breakfast keeps its texture.');
      if (prepHas(ings, 'Sourdough Toast')) steps.push('Prep the yoghurt side now and toast the bread fresh on the day you eat it.');
    } else {
      steps.push(`Portion the breakfast into ${servings} container${servings===1?'':'s'} and label them by day.`);
    }
    return steps;
  }
  if (meal.kind === 'Snack Packs') {
    steps.push(`Set out ${servings} snack pack${servings===1?'':'s'} and portion the dry items first.`);
    if (prepHas(ings, 'Whey Protein')) steps.push('Bag the whey in advance or keep a scoop ready so the shake can be made fast.');
    if (prepHasAny(ings, ['Honey','Banana'])) steps.push('Add honey and banana on the day for the best texture and easiest packing.');
    steps.push('Store the packs where you can grab them quickly before training.');
    return steps;
  }
  const protein = getProteinLabel(meal);
  const carb = getCarbLabel(meal);
  steps.push(`Line up ${servings} meal-prep container${servings===1?'':'s'} so you can portion the batch evenly once everything is cooked.`);
  steps.push(`Season or marinate the ${protein} using one of the zero-cal flavour ideas below, then cook the full batch until done.`);
  if (carb === 'rice') steps.push('Rinse the rice, cook the full batch, then fluff it and let the steam escape for a minute before boxing it up.');
  else if (carb === 'pasta') steps.push('Cook the pasta in salted water until just tender, drain it well, then toss with the sauce ingredients so it reheats cleanly.');
  else if (carb === 'sweet potato') steps.push('Roast or air-fry the sweet potato until soft and lightly coloured at the edges.');
  const hasCookedVeg = prepHasAny(ings, ['Frozen Broccoli','Frozen Spinach','Green Beans','Courgette','Cherry Tomatoes']);
  const hasFreshVeg = prepHasAny(ings, ['Salad Leaves','Cucumber','Olives']);
  if (hasCookedVeg) steps.push('Cook the veg while the main carb finishes so everything is ready to portion together.');
  if (hasFreshVeg) steps.push('Keep the fresh veg separate or add it cold after reheating so it stays crisp.');
  steps.push(`Split the finished batch across ${servings} portion${servings===1?'':'s'} and label the lids with the day${servings===1?'':'s'} it covers.`);
  return steps;
}
function openPrepCookModal(slot, mealId) {
  const meal = getPrepMealById(slot, mealId);
  const modal = document.getElementById('prep-cook-modal');
  const content = document.getElementById('prep-cook-modal-content');
  if (!meal || !modal || !content) return;
  const ideas = getZeroCalFlavourIdeas(meal);
  const steps = getPrepCookSteps(meal);
  const storage = getPrepStorageNotes(meal);
  const batchLines = meal.batch.map(ing => `<div class="prep-modal-row"><strong>${escHtml(ing.totalLabel)}</strong> ${escHtml(ing.n)}</div>`).join('');
  const stepsHtml = steps.map((step, idx) => `<div class="prep-modal-step"><div class="prep-step-num">${idx + 1}</div><div class="prep-step-copy">${escHtml(step)}</div></div>`).join('');
  const ideasHtml = ideas.map(idea => `
    <div class="prep-idea">
      <div class="prep-idea-title">${escHtml(idea.title)}</div>
      <div class="prep-idea-mix">${escHtml(idea.mix)}</div>
      <div class="prep-idea-use">${escHtml(idea.use)}</div>
    </div>`).join('');
  const storageHtml = storage.map(line => `<div class="prep-modal-row">${escHtml(line)}</div>`).join('');
  content.innerHTML = `
    <div class="prep-modal-top">
      <div>
        <div class="prep-modal-title">${escHtml(meal.title)}</div>
        <div class="prep-modal-sub">${escHtml(meal.servings)} portion${meal.servings===1?'':'s'} · ${escHtml(meal.days.join(' · '))}</div>
      </div>
      <button class="prep-modal-close" onclick="closePrepCookModal()">×</button>
    </div>
    <div class="prep-modal-section">
      <div class="prep-modal-kicker">Batch totals</div>
      <div class="prep-modal-list">${batchLines}</div>
    </div>
    <div class="prep-modal-section">
      <div class="prep-modal-kicker">Cooking flow</div>
      <div class="prep-modal-steps">${stepsHtml}</div>
    </div>
    <div class="prep-modal-section">
      <div class="prep-modal-kicker">0 kcal flavour ideas</div>
      <div class="prep-idea-grid">${ideasHtml}</div>
      <div class="prep-zero-note">These flavour ideas are built from dry spices, herbs, vinegar and citrus so they stay effectively zero-cal in normal seasoning amounts.</div>
    </div>
    <div class="prep-modal-section">
      <div class="prep-modal-kicker">Storage notes</div>
      <div class="prep-modal-list">${storageHtml}</div>
    </div>
  `;
  modal.classList.add('open');
}
function closePrepCookModal() {
  const modal = document.getElementById('prep-cook-modal');
  if (modal) modal.classList.remove('open');
}

function renderSupplements() {
  const td    = today();
  const ci    = getCI(td);
  const taken = ci.supps_taken || {};
  const el    = document.getElementById('supp-list');
  if (!el) return;

  // Group by timing
  const groups = {morning:[], anytime:[], evening:[], training:[]};
  SUPPLEMENTS.forEach(s => groups[s.timing].push(s));

  let html = '';
  [
    {key:'morning',  label:'Morning'},
    {key:'anytime',  label:'Anytime with a Meal'},
    {key:'training', label:'Training / Post-Training'},
    {key:'evening',  label:'Evening'},
  ].forEach(g => {
    const supps = groups[g.key];
    if (!supps.length) return;
    html += `<div class="secdiv" style="margin-top:8px">${g.label}</div>`;
    supps.forEach(s => {
      const on = !!taken[s.id];
      html += `<div class="chkrow" onclick="toggleSupp('${s.id}')" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <span style="font-size:18px">${s.icon}</span>
          <div>
            <div style="font-size:13px;color:${on?'var(--text2)':'var(--text)'};${on?'text-decoration:line-through':''}">${s.name}</div>
            <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);margin-top:1px">${s.dose} · ${s.when}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:1px;line-height:1.3">${s.why}</div>
          </div>
        </div>
        <div class="mtog ${on?'on':''}" style="flex-shrink:0;margin-left:10px"></div>
      </div>`;
    });
  });

  const doneCount = Object.values(taken).filter(Boolean).length;
  html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
    <div style="font-size:12px;color:var(--text2)">Today's stack</div>
    <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${doneCount>=5?'var(--green)':doneCount>=3?'var(--gold)':'var(--text3)'}">${doneCount}/${SUPPLEMENTS.length}</div>
  </div>
  <div class="adbar" style="margin-bottom:12px"><div class="adfill" style="width:${Math.round(doneCount/SUPPLEMENTS.length*100)}%;background:${doneCount>=5?'var(--green)':doneCount>=3?'var(--gold)':'var(--accent)'}"></div></div>` + html;

  el.innerHTML = html;

  // Weekly log
  renderSuppWeekLog();
}

function toggleSupp(id) {
  const td = today();
  const ci = getCI(td);
  const taken = {...(ci.supps_taken||{})};
  taken[id] = !taken[id];
  saveCI(td, {supps_taken: taken});
  renderSupplements();
  // Also refresh today screen if visible
  if (document.getElementById('screen-today').classList.contains('active')) renderToday();
}

function renderSuppWeekLog() {
  const el = document.getElementById('supp-week-log');
  if (!el) return;
  const wn = curWk();
  const dates = getWkDates(wn);
  let html = '<div style="display:flex;gap:4px;margin-bottom:8px">';
  dates.forEach((d,i) => {
    const taken = getCI(d).supps_taken || {};
    const count = Object.values(taken).filter(Boolean).length;
    const isTd  = d === today();
    html += `<div style="flex:1;text-align:center;padding:6px 2px;border-radius:6px;background:${isTd?'rgba(200,57,26,0.12)':'var(--bg3)'};border:1px solid ${isTd?'var(--accent)':'var(--border)'}">
      <div style="font-family:'DM Mono',monospace;font-size:7px;color:var(--text3);text-transform:uppercase">${DAYS[i]}</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;color:${count>=5?'var(--green)':count>=3?'var(--gold)':count>0?'var(--text2)':'var(--text3)'};margin:2px 0">${count>0?count:'·'}</div>
    </div>`;
  });
  html += '</div><div style="font-size:11px;color:var(--text3)">Numbers = supplements taken that day</div>';
  el.innerHTML = html;
}

function renderShoppingList() {
  const el = document.getElementById('shop-list');
  if (!el) return;
  const wn  = curWk();
  const key = `shop_checked_wk${wn}`;
  const checked = S[key] || {};

  let html = '';
  Object.entries(SHOPPING).forEach(([catKey, cat]) => {
    const catChecked = cat.items.filter((item,i) => checked[catKey+'_'+i]).length;
    html += `<div class="card" style="margin-bottom:8px;padding:0;overflow:hidden">
      <div class="mh" onclick="toggleShopCat('shop-cat-${catKey}')" style="cursor:pointer">
        <div class="mi">
          <div class="mname" style="font-size:14px">${cat.label}</div>
          <div class="mtime">${catChecked}/${cat.items.length} picked up</div>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2" style="flex-shrink:0;transition:transform 0.2s" id="shopch-${catKey}"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="mb" id="shop-cat-${catKey}">
        ${cat.items.map((item,i) => {
          const isChk = !!checked[catKey+'_'+i];
          return `<div class="chkrow" onclick="toggleShopItem('${catKey}',${i},${wn})" style="cursor:pointer">
            <div style="flex:1">
              <div style="font-size:13px;color:${isChk?'var(--text3)':'var(--text)'};${isChk?'text-decoration:line-through':''}">${item.name}</div>
              <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);margin-top:1px">${item.qty} · ${item.guide}</div>
            </div>
            <div style="width:20px;height:20px;border-radius:50%;border:1.5px solid ${isChk?'var(--green)':'var(--border)'};background:${isChk?'var(--green)':'transparent'};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:white">${isChk?'✓':''}</div>
          </div>`;
        }).join('')}
        <div style="padding:8px 0 4px;display:flex;gap:8px">
          <button onclick="checkAllCat('${catKey}',${wn},${cat.items.length})" style="flex:1;padding:7px;background:var(--bg2);border:1px solid var(--border);border-radius:7px;color:var(--text3);font-size:11px;cursor:pointer">Check All</button>
          <button onclick="uncheckAllCat('${catKey}',${wn},${cat.items.length})" style="flex:1;padding:7px;background:var(--bg2);border:1px solid var(--border);border-radius:7px;color:var(--text3);font-size:11px;cursor:pointer">Clear</button>
        </div>
      </div>
    </div>`;
  });

  // Total picked up
  const totalItems = Object.values(SHOPPING).reduce((a,c)=>a+c.items.length,0);
  const totalChk   = Object.values(checked).filter(Boolean).length;
  el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 13px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;margin-bottom:10px">
    <div style="font-size:13px;color:var(--text2)">Week ${wn} shopping</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:${totalChk>=totalItems?'var(--green)':'var(--text)'}">${totalChk}/${totalItems}</div>
      <button onclick="clearShop(${wn})" style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;color:var(--text3);font-size:10px;padding:4px 8px;cursor:pointer">Reset</button>
    </div>
  </div>` + html;
}

function toggleShopCat(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const open = el.classList.toggle('open');
  const key  = id.replace('shop-cat-','');
  const chev = document.getElementById('shopch-'+key);
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
}

function toggleShopItem(catKey, idx, wn) {
  const key = `shop_checked_wk${wn}`;
  if (!S[key]) S[key] = {};
  S[key][catKey+'_'+idx] = !S[key][catKey+'_'+idx];
  save();
  renderShoppingList();
}

function checkAllCat(catKey, wn, len) {
  const key = `shop_checked_wk${wn}`;
  if (!S[key]) S[key] = {};
  for (let i=0; i<len; i++) S[key][catKey+'_'+i] = true;
  save(); renderShoppingList();
}

function uncheckAllCat(catKey, wn, len) {
  const key = `shop_checked_wk${wn}`;
  if (!S[key]) S[key] = {};
  for (let i=0; i<len; i++) delete S[key][catKey+'_'+i];
  save(); renderShoppingList();
}

function clearShop(wn) {
  delete S[`shop_checked_wk${wn}`];
  save(); renderShoppingList();
}

// ═══════════════════════════════════════════════════════
//  SUPPLEMENT CARD ON TODAY SCREEN (inject into renderToday)
// ═══════════════════════════════════════════════════════
function suppTodayCard() {
  const td    = today();
  const taken = getCI(td).supps_taken || {};
  const count = Object.values(taken).filter(Boolean).length;
  const total = SUPPLEMENTS.length;
  const pct   = Math.round(count/total*100);

  // Show morning ones if before noon, evening ones if after 6pm, all otherwise
  const hr = new Date().getHours();
  const highlight = hr < 12
    ? SUPPLEMENTS.filter(s => s.timing === 'morning')
    : hr >= 18
    ? SUPPLEMENTS.filter(s => s.timing === 'evening')
    : SUPPLEMENTS.filter(s => s.timing === 'anytime' || s.timing === 'training');

  return `<div class="card">
    <div class="card-title" style="display:flex;align-items:center;justify-content:space-between">
      <span>💊 Supplements</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:${count>=5?'var(--green)':count>=3?'var(--gold)':'var(--accent)'}">${count}/${total}</span>
    </div>
    <div class="adbar" style="margin-bottom:10px"><div class="adfill" style="width:${pct}%;background:${count>=5?'var(--green)':count>=3?'var(--gold)':'var(--accent)'}"></div></div>
    ${highlight.map(s => {
      const on = !!taken[s.id];
      return `<div class="chkrow" onclick="toggleSuppToday('${s.id}')" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px;flex:1">
          <span style="font-size:15px">${s.icon}</span>
          <div style="font-size:13px;color:${on?'var(--text3)':'var(--text)'};${on?'text-decoration:line-through':''}">${s.name} <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)">${s.dose}</span></div>
        </div>
        <div class="mtog ${on?'on':''}" style="flex-shrink:0"></div>
      </div>`;
    }).join('')}
    <button class="btn sec" style="margin-top:10px;font-size:12px;padding:9px" onclick="showScreen('plan',document.querySelectorAll('.nav-btn')[4])">View Full Stack →</button>
  </div>`;
}

function toggleSuppToday(id) {
  toggleSupp(id);
  renderToday();
}

// ═══════════════════════════════════════════════════════
//  REVIEW (kept, accessible via Plan screen link)
// ═══════════════════════════════════════════════════════
function renderReview() { revWk=revWk||curWk(); renderRevContent(); }
function chRevWk(dir) { revWk=Math.max(1,Math.min(13,revWk+dir)); renderRevContent(); }

function renderRevContent() {
  const wn    = revWk;
  const dates = getWkDates(wn);
  const rot   = getRot(wn);
  const ph    = getPhase(wn);
  const rev   = getRev(wn);

  // Write to whichever containers exist (plan-embedded or standalone)
  const setEl = (id, val) => {
    const el = document.getElementById(id) || document.getElementById(id+'2');
    if (el) { if (typeof val === 'string') el.innerHTML = val; else el.textContent = val; }
  };
  const setTxt = (id, val) => {
    [id, id+'2'].forEach(i => { const el=document.getElementById(i); if(el) el.textContent=val; });
  };
  const setHTML = (id, val) => {
    [id, id+'2'].forEach(i => { const el=document.getElementById(i); if(el) el.innerHTML=val; });
  };

  setTxt('rev-sub',    `Week ${wn} · ${fmtShort(dates[0])} – ${fmtShort(dates[6])}`);
  setTxt('rev-wk-lbl', `Week ${wn}`);

  const weekCI = dates.map(d=>({date:d,...getCI(d)}));
  const trained= weekCI.filter(c=>c.trained).length;
  const aSlp   = avg(weekCI.filter(c=>c.sleep).map(c=>c.sleep));
  const aEng   = avg(weekCI.filter(c=>c.energy).map(c=>c.energy));
  const aStps  = avg(weekCI.filter(c=>c.steps).map(c=>c.steps));
  const meals  = weekCI.reduce((a,c)=>a+Object.values(c.meal_states||{}).filter(Boolean).length,0);
  const rpes   = []; ['A','B','C'].forEach(sk=>dates.forEach(d=>{ const wo=getWO(d,sk); if(wo._rpe)rpes.push(wo._rpe); }));
  const aRpe   = avg(rpes);

  const statsHtml = `
    <div class="card-title">Week ${wn} at a Glance</div>
    <div class="row3">
      <div class="rbox"><div class="rv" style="color:${trained>=4?'var(--green)':'var(--gold)'}">${trained}</div><div class="rl2">Sessions</div></div>
      <div class="rbox"><div class="rv" style="color:var(--blue);font-size:18px">${aSlp?aSlp.toFixed(1)+'h':'—'}</div><div class="rl2">Avg Sleep</div></div>
      <div class="rbox"><div class="rv" style="color:var(--gold);font-size:18px">${aEng?aEng.toFixed(1):' —'}</div><div class="rl2">Avg Energy</div></div>
      <div class="rbox"><div class="rv" style="color:var(--green);font-size:16px">${aStps?Math.round(aStps).toLocaleString():'—'}</div><div class="rl2">Avg Steps</div></div>
      <div class="rbox"><div class="rv" style="color:var(--bjj)">${meals}</div><div class="rl2">Meals Eaten</div></div>
      <div class="rbox"><div class="rv" style="color:${aRpe?aRpe>=8?'var(--accent)':aRpe>=6?'var(--gold)':'var(--green)':'var(--text3)'};font-size:18px">${aRpe?aRpe.toFixed(1):' —'}</div><div class="rl2">Avg RPE</div></div>
    </div>
    <div style="font-size:12px;color:var(--text2);padding:10px;background:var(--bg3);border-radius:8px;line-height:1.5;margin-top:4px">
      <strong style="color:var(--text)">${ph.label}</strong><br>${ph.detail}
    </div>`;
  setHTML('rev-stats', statsHtml);

  const daysHtml = dates.map((d,i)=>{
    const c=getCI(d), dt=DAY_TYPES[i], has=Object.keys(c).length>0;
    const ml=Object.values(c.meal_states||{}).filter(Boolean).length;
    const pos=c.bjj_positions?.length ? c.bjj_positions.slice(0,2).join(', ') : '';
    return `<div class="drow">
      <div class="drd">${DAYS[i]}</div>
      <div class="drdot" style="background:${dt==='bjj'?'var(--bjj)':dt==='str'?'var(--blue)':'var(--rec)'}"></div>
      <div class="dri">${has?`E:${c.energy||'—'} · Sleep:${c.sleep||'—'}h ${c.trained?'· ✓':''}${pos?' · '+pos:''}`:'<span style="color:var(--text3)">Not logged</span>'}</div>
      <div class="drv">${has?ml+'/5':''}</div>
    </div>`;
  }).join('');
  setHTML('rev-days', daysHtml);

  // Photo prompt
  const isSunday = new Date().getDay()===0;
  const isCurrentWk = wn===curWk();
  const photoHtml = (isSunday||isCurrentWk) ? `
    <div class="photo-prompt">
      <div class="pp-title">📸 Progress Photo</div>
      <div class="pp-text">Take a front, side and back photo. Same time, same lighting each week. Store in your camera roll or Google Photos with today’s date.<br><br>Week ${wn} · ${fmtShort(dates[6])}</div>
      <button class="btn" style="background:var(--purple);font-size:14px;padding:11px" onclick="logPhoto(${wn})">Mark as Done — Week ${wn}</button>
      ${rev.photo_taken?`<div style="margin-top:8px;font-size:12px;color:var(--green)">✓ Photo logged for Week ${wn}</div>`:''}
    </div>` : (rev.photo_taken ? `<div class="card" style="border-color:var(--purple)"><div class="card-title" style="color:var(--purple)">📸 Week ${wn} Photo</div><div style="font-size:13px;color:var(--green)">✓ Taken on ${rev.photo_date||'—'}</div></div>` : '');
  setHTML('photo-section', photoHtml);

  // Review form
  const formHtml = rev.saved ? `<div class="card" style="border-color:var(--green)">
    <div class="card-title" style="color:var(--green)">Week ${wn} Review — Saved</div>
    <div style="font-size:13px;color:var(--text2);line-height:1.9">
      <div>${rev.good?'✅ Good week':'⚠️ Tough week'}</div>
      ${rev.worked?`<div><strong style="color:var(--text)">Worked:</strong> ${rev.worked}</div>`:''}
      ${rev.didnt?`<div><strong style="color:var(--text)">Didn't:</strong> ${rev.didnt}</div>`:''}
      ${rev.focus?`<div><strong style="color:var(--text)">Next focus:</strong> ${rev.focus}</div>`:''}
    </div>
    <button class="btn sec" style="margin-top:10px;font-size:12px;padding:8px" onclick="editRev(${wn})">Edit</button>
  </div>` : `<div class="card">
    <div class="card-title">Weekly Review — 2 Minutes</div>
    <div class="chkrow"><span style="font-size:13px;color:var(--text)">Was this a good week?</span><div class="tog ${rev.good?'on':''}" id="rev-good" onclick="this.classList.toggle('on')"></div></div>
    <label class="form-label" style="margin-top:12px">What worked?</label>
    <textarea class="inp" id="rev-worked" rows="2" placeholder="Training, nutrition, sleep, mindset...">${rev.worked||''}</textarea>
    <label class="form-label">What didn't?</label>
    <textarea class="inp" id="rev-didnt" rows="2" placeholder="Where did you fall short?">${rev.didnt||''}</textarea>
    <label class="form-label">One focus for next week</label>
    <input type="text" class="inp" id="rev-focus" value="${rev.focus||''}" placeholder="e.g. Hit all three strength sessions">
    <button class="btn" onclick="saveRevForm()">Save Review</button>
  </div>`;
  setHTML('rev-form', formHtml);
}

function logPhoto(wn) {
  saveRev(wn,{photo_taken:true, photo_date:fmtDate(today())});
  toast('Photo logged ✓');
  renderRevContent();
}
function saveRevForm() {
  saveRev(revWk,{
    good:    document.getElementById('rev-good')?.classList.contains('on')||false,
    worked:  document.getElementById('rev-worked')?.value||'',
    didnt:   document.getElementById('rev-didnt')?.value||'',
    focus:   document.getElementById('rev-focus')?.value||'',
    saved:   true,
  });
  toast('Review saved ✓');
  renderRevContent();
}
function editRev(wn) { saveRev(wn,{saved:false}); renderRevContent(); }

// ═══════════════════════════════════════════════════════
//  NUTRITION
// ═══════════════════════════════════════════════════════
function getMeals(dt, rot, isFri) {
  return (MEALS[dt]?.meals||[]).map(m=>{
    let ings, note;
    if(m.fridayOverride&&isFri){ ings=m.fri.ings; note=m.fri.note; }
    else if(m.rotate){ const wk=rot==='A'?m.wA:m.wB; ings=wk.ings; note=wk.note; }
    else { ings=m.ings; note=m.note; }
    return {...m, ings, note};
  });
}

function renderMeals(d) {
  const wn   = getWkNum(d)||curWk();
  const dow  = getDow(d);
  const dt   = DAY_TYPES[dow];
  const rot  = getRot(wn);
  const ci   = getCI(d);
  const ms   = ci.meal_states||{};
  const meals= getMeals(dt, rot, dow===4);

  let eaten=0;
  const container=document.getElementById('meal-list'); if(!container)return;
  container.innerHTML='';

  meals.forEach((m,idx)=>{
    const isOn=!!ms[m.id];
    if(isOn) eaten++;
    const card=document.createElement('div');
    card.className='mc';
    const ings=m.ings.map(ing=>`<div class="ing"><div class="ing-n">${ing.i} ${ing.n}</div><div class="ing-q">${ing.q}</div></div>`).join('');
    const note=m.note?`<div class="mnote">${m.note}</div>`:'';
    card.innerHTML=`
      <div class="mh" onclick="toggleMB('mb-${idx}',this)">
        <div class="mn">${idx+1}</div>
        <div class="mi"><div class="mname">${m.name}</div><div class="mtime">${m.time}</div></div>
        <div class="mtog ${isOn?'on':''}" onclick="event.stopPropagation();toggleMealEaten('${d}','${m.id}',this)"></div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2" style="transition:transform 0.2s;flex-shrink:0;margin-left:4px" id="mch-${idx}"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="mb" id="mb-${idx}">${ings}${note}</div>`;
    container.appendChild(card);
  });

  const total=meals.length, pct=total?Math.round(eaten/total*100):0;
  const sc=document.getElementById('meal-score'),ea=document.getElementById('ns-eat'),sk=document.getElementById('ns-skip'),pt=document.getElementById('ns-pct');
  const col=pct>=80?'var(--green)':pct>=60?'var(--gold)':'var(--accent)';
  if(sc){sc.textContent=`${eaten}/${total}`;sc.style.color=col;}
  if(ea)ea.textContent=eaten;
  if(sk){sk.textContent=total-eaten;sk.style.color=total-eaten>0?'var(--accent)':'var(--green)';}
  if(pt){pt.textContent=pct+'%';pt.style.color=col;}

  const flag=document.getElementById('ci-flag');
  if(flag){
    const e=ci.energy||0; let msg='';
    if(total-eaten>=2&&e<=2) msg=`<strong>⚡ Coach Flag</strong>Skipped ${total-eaten} meals + low energy — directly connected. Prep meal 2 the night before.`;
    else if(total-eaten>=2) msg=`<strong>📋 Coach Note</strong>${total-eaten} meals missed. Prep the night before if it's a time issue.`;
    else if(eaten===total&&e>=4) msg=`<strong>✅ Solid Day</strong>Full adherence and high energy. This is the standard.`;
    else if(eaten===total) msg=`<strong>✅ Full Adherence</strong>All meals hit. Stay consistent.`;
    flag.innerHTML=msg?`<div class="flag warn" style="${eaten===total?'background:rgba(42,154,90,0.08);border-color:rgba(42,154,90,0.25);color:var(--green)':''}">${msg}</div>`:'';
  }
}

function toggleMB(id, header) {
  const b=document.getElementById(id); if(!b)return;
  const open=b.classList.toggle('open');
  const idx=id.split('-')[1];
  const c=document.getElementById('mch-'+idx);
  if(c) c.style.transform=open?'rotate(180deg)':'';
}

function toggleMealEaten(d, mealId, tog) {
  const ci=getCI(d), ms={...(ci.meal_states||{})};
  ms[mealId]=!ms[mealId];
  saveCI(d,{meal_states:ms});
  tog.classList.toggle('on',ms[mealId]);
  renderMeals(d);
}

function toggleFlex() {
  const ci=getCI(ciDate), nw=!ci.flex;
  saveCI(ciDate,{flex:nw});
  const fp=document.getElementById('flex-panel');
  const ft=document.getElementById('flex-tog');
  if(fp)fp.style.display=nw?'block':'none';
  if(ft)ft.classList.toggle('on',nw);
}

// FOOD SEARCH
let _pendingFood=null;
async function searchFood() {
  const q=document.getElementById('fsearch')?.value?.trim();
  if(!q||q.length<2)return;
  const re=document.getElementById('fresults'); if(!re)return;
  re.innerHTML='<div style="text-align:center;padding:12px;font-family:DM Mono,monospace;font-size:11px;color:var(--text3)">Searching...</div>';
  try{
    const res=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`);
    const data=await res.json();
    const prods=(data.products||[]).filter(p=>p.product_name&&p.nutriments?.['energy-kcal_100g']!==undefined&&p.nutriments?.['proteins_100g']!==undefined).slice(0,5);
    if(!prods.length){re.innerHTML=`<div style="text-align:center;padding:12px;font-size:12px;color:var(--text3)">No results — try manual entry</div>`;return;}
    window._sr=prods;
    re.innerHTML=prods.map((p,i)=>{
      const n=p.nutriments;
      return `<div class="fresult">
        <div class="fri"><div class="frn">${p.product_name}</div><div class="frm">per 100g · ${Math.round(n['energy-kcal_100g']||0)}kcal · P:${(n['proteins_100g']||0).toFixed(1)}g · C:${(n['carbohydrates_100g']||0).toFixed(1)}g · F:${(n['fat_100g']||0).toFixed(1)}g</div></div>
        <button class="fradd" onclick="openQty(${i})">+ Add</button>
      </div>`;
    }).join('');
  }catch(e){re.innerHTML=`<div style="text-align:center;padding:12px;font-size:12px;color:var(--text3)">Search failed — use manual entry</div>`;}
}
function openQty(idx){
  _pendingFood=window._sr?.[idx]; if(!_pendingFood)return;
  const n=_pendingFood.nutriments;
  document.getElementById('qmn').textContent=_pendingFood.product_name;
  document.getElementById('qmp').textContent=`per 100g: ${Math.round(n['energy-kcal_100g']||0)}kcal · P:${(n['proteins_100g']||0).toFixed(1)}g · C:${(n['carbohydrates_100g']||0).toFixed(1)}g · F:${(n['fat_100g']||0).toFixed(1)}g`;
  document.getElementById('qmi').value='100';
  document.getElementById('qty-modal').classList.add('open');
  previewQty();
  setTimeout(()=>document.getElementById('qmi').focus(),100);
}
function previewQty(){
  if(!_pendingFood)return;
  const qty=parseFloat(document.getElementById('qmi')?.value)||0, n=_pendingFood.nutriments, f=qty/100;
  const el=document.getElementById('qmprev');
  if(el&&qty>0)el.textContent=`${qty}g → ${Math.round((n['energy-kcal_100g']||0)*f)}kcal · P:${((n['proteins_100g']||0)*f).toFixed(1)}g · C:${((n['carbohydrates_100g']||0)*f).toFixed(1)}g · F:${((n['fat_100g']||0)*f).toFixed(1)}g`;
}
function closeQty(){document.getElementById('qty-modal').classList.remove('open');_pendingFood=null;}
function confirmFood(){
  if(!_pendingFood)return;
  const qty=parseFloat(document.getElementById('qmi')?.value)||100, n=_pendingFood.nutriments, f=qty/100;
  addFood({id:Date.now(),name:_pendingFood.product_name,qty,kcal:Math.round((n['energy-kcal_100g']||0)*f),protein:+((n['proteins_100g']||0)*f).toFixed(1),carbs:+((n['carbohydrates_100g']||0)*f).toFixed(1),fat:+((n['fat_100g']||0)*f).toFixed(1)});
  closeQty();
  document.getElementById('fresults').innerHTML='';
  document.getElementById('fsearch').value='';
  toast('Added ✓');
}
function addManual(){
  const name=document.getElementById('man-name')?.value?.trim();
  if(!name){toast('Enter a name');return;}
  addFood({id:Date.now(),name,qty:parseFloat(document.getElementById('man-qty')?.value)||0,kcal:parseFloat(document.getElementById('man-k')?.value)||0,protein:parseFloat(document.getElementById('man-p')?.value)||0,carbs:parseFloat(document.getElementById('man-c')?.value)||0,fat:parseFloat(document.getElementById('man-f')?.value)||0});
  ['man-name','man-qty','man-k','man-p','man-c','man-f'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  toast('Added ✓');
}
function addFood(item){
  const ci=getCI(ciDate), foods=[...(ci.logged_foods||[]),item];
  saveCI(ciDate,{logged_foods:foods});
  renderLoggedFoods(ciDate); updateMacros(ciDate);
}
function removeFood(id){
  const ci=getCI(ciDate), foods=(ci.logged_foods||[]).filter(f=>f.id!==id);
  saveCI(ciDate,{logged_foods:foods});
  renderLoggedFoods(ciDate); updateMacros(ciDate);
}
function renderLoggedFoods(d){
  const foods=getCI(d).logged_foods||[];
  const wrap=document.getElementById('lf-wrap'), list=document.getElementById('lf-list');
  if(!wrap||!list)return;
  wrap.style.display=foods.length?'block':'none';
  list.innerHTML=foods.map(f=>`<div class="lf"><div class="lfi"><div class="lfn">${f.name} <span style="color:var(--text3);font-size:11px">${f.qty}g</span></div><div class="lfm">${f.kcal}kcal · P:${f.protein}g · C:${f.carbs}g · F:${f.fat}g</div></div><button class="lfdel" onclick="removeFood(${f.id})">✕</button></div>`).join('');
}
function updateMacros(d){
  const foods=getCI(d).logged_foods||[];
  const tel=document.getElementById('ci-macros'); if(tel)tel.style.display=foods.length?'block':'none';
  if(!foods.length)return;
  const dt=DAY_TYPES[getDow(d)], tgt=DAY_TARGETS[dt]||DAY_TARGETS.str;
  const tot=foods.reduce((a,f)=>({kcal:a.kcal+f.kcal,protein:a.protein+f.protein,carbs:a.carbs+f.carbs,fat:a.fat+f.fat}),{kcal:0,protein:0,carbs:0,fat:0});
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('mt-k',Math.round(tot.kcal)); set('mt-p',tot.protein.toFixed(0)+'g'); set('mt-c',tot.carbs.toFixed(0)+'g'); set('mt-f',tot.fat.toFixed(0)+'g');
  const bars=document.getElementById('macro-bars');
  if(bars) bars.innerHTML=[
    {l:'Protein',v:tot.protein,t:tgt.protein,c:'var(--bjj)'},
    {l:'Carbs',v:tot.carbs,t:tgt.carbs,c:'var(--blue)'},
    {l:'Fat',v:tot.fat,t:tgt.fat,c:'var(--green)'},
    {l:'kcal',v:tot.kcal,t:tgt.kcal,c:'var(--gold)'},
  ].map(b=>{
    const pct=Math.min(100,Math.round(b.v/b.t*100)), over=b.v>b.t;
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
      <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);width:44px;text-align:right">${b.l}</div>
      <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${over?'var(--accent)':b.c};transition:width 0.4s;border-radius:3px"></div></div>
      <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--text2);width:36px">${Math.round(b.v)}${b.l==='kcal'?'':' g'}</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════
//  OFFLINE COMMON FOODS
// ═══════════════════════════════════════════════════════
const COMMON_FOODS = [
  {name:'Chicken Breast',per100:{kcal:165,protein:31,carbs:0,fat:3.6}},
  {name:'Chicken Thighs',per100:{kcal:209,protein:26,carbs:0,fat:11}},
  {name:'Beef Mince 5%',per100:{kcal:137,protein:21,carbs:0,fat:5.5}},
  {name:'Salmon Fillet',per100:{kcal:208,protein:20,carbs:0,fat:13}},
  {name:'White Rice (cooked)',per100:{kcal:130,protein:2.7,carbs:28,fat:0.3}},
  {name:'Porridge Oats',per100:{kcal:374,protein:13,carbs:60,fat:7}},
  {name:'Sweet Potato',per100:{kcal:86,protein:1.6,carbs:20,fat:0.1}},
  {name:'Greek Yoghurt 0%',per100:{kcal:57,protein:10,carbs:3.8,fat:0.2}},
  {name:'Whole Milk',per100:{kcal:63,protein:3.2,carbs:4.7,fat:3.6}},
  {name:'Whey Protein (scoop ~30g)',per100:{kcal:380,protein:75,carbs:6,fat:5}},
  {name:'Banana',per100:{kcal:89,protein:1.1,carbs:23,fat:0.3}},
  {name:'Frozen Broccoli',per100:{kcal:35,protein:3,carbs:4,fat:0.4}},
  {name:'Olive Oil',per100:{kcal:884,protein:0,carbs:0,fat:100}},
  {name:'Sourdough Bread',per100:{kcal:274,protein:9,carbs:51,fat:3}},
  {name:'Pasta (dry)',per100:{kcal:352,protein:13,carbs:69,fat:1.5}},
  {name:'Granola',per100:{kcal:450,protein:8,carbs:63,fat:18}},
  {name:'Eggs',per100:{kcal:143,protein:13,carbs:0.7,fat:10}},
  {name:'Butter',per100:{kcal:717,protein:0.9,carbs:0.1,fat:81}},
  {name:'Honey',per100:{kcal:304,protein:0.3,carbs:82,fat:0}},
  {name:'Pesto',per100:{kcal:430,protein:6,carbs:4,fat:43}},
];

function searchOfflineFoods(query) {
  const q = query.toLowerCase();
  return COMMON_FOODS.filter(f => f.name.toLowerCase().includes(q));
}

// Override searchFood to try offline first if fetch fails
const _origSearchFood = searchFood;
async function searchFood() {
  const q = document.getElementById('fsearch')?.value?.trim();
  if (!q || q.length < 2) return;
  const re = document.getElementById('fresults'); if (!re) return;

  // Show offline results immediately
  const offline = searchOfflineFoods(q);
  if (offline.length) {
    window._sr = offline.map(f => ({product_name: f.name, nutriments: {'energy-kcal_100g': f.per100.kcal, 'proteins_100g': f.per100.protein, 'carbohydrates_100g': f.per100.carbs, 'fat_100g': f.per100.fat}}));
    re.innerHTML = '<div style="font-family:DM Mono,monospace;font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;padding:0 2px">Common Foods (offline)</div>' +
      offline.map((f,i) => `<div class="fresult">
        <div class="fri"><div class="frn">${f.name}</div><div class="frm">per 100g · ${f.per100.kcal}kcal · P:${f.per100.protein}g · C:${f.per100.carbs}g · F:${f.per100.fat}g</div></div>
        <button class="fradd" onclick="openQty(${i})">+ Add</button>
      </div>`).join('');
  }

  // Also try live search
  re.innerHTML += '<div id="live-search-status" style="text-align:center;padding:8px;font-family:DM Mono,monospace;font-size:10px;color:var(--text3)">Searching online...</div>';
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`);
    const data = await res.json();
    const prods = (data.products||[]).filter(p=>p.product_name&&p.nutriments?.['energy-kcal_100g']!==undefined&&p.nutriments?.['proteins_100g']!==undefined).slice(0,5);
    const statusEl = document.getElementById('live-search-status');
    if (statusEl) statusEl.remove();
    if (prods.length) {
      const startIdx = offline.length;
      window._sr = [...(window._sr||[]), ...prods];
      re.innerHTML += '<div style="font-family:DM Mono,monospace;font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin:8px 0 6px;padding:0 2px">Online Results</div>' +
        prods.map((p,i) => {
          const n = p.nutriments;
          return `<div class="fresult">
            <div class="fri"><div class="frn">${p.product_name}</div><div class="frm">per 100g · ${Math.round(n['energy-kcal_100g']||0)}kcal · P:${(n['proteins_100g']||0).toFixed(1)}g · C:${(n['carbohydrates_100g']||0).toFixed(1)}g · F:${(n['fat_100g']||0).toFixed(1)}g</div></div>
            <button class="fradd" onclick="openQty(${startIdx+i})">+ Add</button>
          </div>`;
        }).join('');
    } else if (!offline.length) {
      re.innerHTML = `<div style="text-align:center;padding:12px;font-size:12px;color:var(--text3)">No results — try manual entry below</div>`;
    }
  } catch(e) {
    const statusEl = document.getElementById('live-search-status');
    if (statusEl) statusEl.textContent = offline.length ? '' : 'Offline — showing common foods only';
  }
}

// ═══════════════════════════════════════════════════════
//  SETUP / SETTINGS / EXPORT
// ═══════════════════════════════════════════════════════
function checkFirstRun() {
  try {
    const hasStart = localStorage.getItem('bjj_start');
    const hasData  = localStorage.getItem('bjj_v3');
    if (!hasStart && !hasData) {
      document.getElementById('setup-modal').style.display = 'flex';
    }
  } catch(e) {}
}

function confirmSetup() {
  const d = document.getElementById('setup-date')?.value;
  if (!d) { toast('Pick a start date'); return; }
  try { localStorage.setItem('bjj_start', d); } catch(e) {}
  document.getElementById('setup-modal').style.display = 'none';
  // Reload BLOCK_START
  location.reload();
}

function showSettings() {
  const modal = document.getElementById('settings-modal');
  const dateEl = document.getElementById('settings-date');
  try {
    if (dateEl) dateEl.value = localStorage.getItem('bjj_start') || DEFAULT_BLOCK_START;
  } catch(e) {}
  updateLastSavedUI();
  modal.style.display = 'flex';
}

function saveSettings() {
  const d = document.getElementById('settings-date')?.value;
  if (!d) { toast('Pick a date'); return; }
  try { localStorage.setItem('bjj_start', d); } catch(e) {}
  toast('Saved — reloading...');
  setTimeout(() => location.reload(), 800);
}

function exportData() {
  touchState('export');
  const data = {
    exported: new Date().toISOString(),
    schema_version: SCHEMA_VERSION,
    block_start: (() => { try { return localStorage.getItem('bjj_start') || DEFAULT_BLOCK_START; } catch(e){ return DEFAULT_BLOCK_START; } })(),
    data: normaliseState(S),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `bjj-tracker-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Exported ✓');
  updateLastSavedUI();
}

function importDataPrompt() {
  document.getElementById('import-file')?.click();
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.data) {
        S = normaliseState(parsed.data);
        save('import');
        if (parsed.block_start) {
          try { localStorage.setItem('bjj_start', parsed.block_start); } catch(err) {}
        }
        toast('Imported ✓ — reloading...');
        setTimeout(() => location.reload(), 800);
      } else {
        toast('Invalid file format');
      }
    } catch(err) {
      toast('Import failed — invalid JSON');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_BACKUP_KEY);
    localStorage.removeItem('bjj_start');
  } catch(e) {}
  toast('Data cleared');
  setTimeout(() => location.reload(), 800);
}

// ═══════════════════════════════════════════════════════
//  PWA / INSTALL
// ═══════════════════════════════════════════════════════
let deferredInstallPrompt = null;

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function toggleInstallHelp() {
  const el = document.getElementById('install-help');
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function updateInstallUI() {
  const btn = document.getElementById('install-btn');
  const status = document.getElementById('install-status');
  if (!status) return;

  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const standalone = isStandaloneMode();

  if (btn) btn.style.display = deferredInstallPrompt && !standalone ? 'block' : 'block';
  if (btn && !deferredInstallPrompt && !secure) btn.style.display = 'none';

  if (standalone) {
    status.innerHTML = 'Installed ✓ Your tracker is on the home screen. Entries continue to save on this device.';
    if (btn) btn.style.display = 'none';
    return;
  }

  if (!secure) {
    status.innerHTML = 'Saved on this device. To install this as an app, host these files on HTTPS first.';
    return;
  }

  if (deferredInstallPrompt) {
    status.innerHTML = 'This build is ready to install. Tap the install button below to add it to your home screen.';
    if (btn) btn.textContent = '📲 Install App';
    return;
  }

  if (isIosDevice()) {
    status.innerHTML = 'Saved on this device. On iPhone, use Safari → Share → Add to Home Screen.';
    if (btn) btn.textContent = '📲 Show Install Help';
    return;
  }

  status.innerHTML = 'Saved on this device. If your browser does not show an install prompt, use the browser menu and choose Add to Home screen.';
  if (btn) btn.textContent = '📲 Show Install Help';
}

async function installApp() {
  if (!deferredInstallPrompt) {
    toggleInstallHelp();
    updateInstallUI();
    return;
  }
  deferredInstallPrompt.prompt();
  try {
    await deferredInstallPrompt.userChoice;
  } catch (e) {}
  deferredInstallPrompt = null;
  updateInstallUI();
}

async function registerPWA() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallUI();
    toast('App installed ✓');
  });

  window.addEventListener('online', () => toast('Back online'));
  window.addEventListener('offline', () => toast('Offline mode'));

  const secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && secure) {
    try {
      await navigator.serviceWorker.register('./service-worker.js');
    } catch (err) {
      console.warn('Service worker registration failed', err);
    }
  }

  updateInstallUI();
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
checkFirstRun();
updateCalLbl();
renderToday();
registerPWA();
