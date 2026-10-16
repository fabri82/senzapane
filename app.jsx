import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  Dumbbell, 
  Flame, 
  Play, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  Award, 
  RotateCcw, 
  Search, 
  Edit3, 
  X, 
  Zap, 
  Volume2, 
  VolumeX, 
  Info,
  CheckCircle2,
  Timer,
  BarChart3,
  ListChecks,
  BookOpen,
  Sparkles,
  ArrowUpRight,
  Minus,
  Camera,
  Download,
  Upload,
  Database
} from 'lucide-react';

// ==========================================
// 0. COMPONENTE AVATAR POP-ART PREDEFINITO (FALLBACK VETTORIALE)
// ==========================================
const DefaultComicAvatar = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="popBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#18181b" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#popBg)" />
    {/* Giacca e Camicia Pop-Art */}
    <path d="M15 120 C20 92, 100 92, 105 120 Z" fill="#831843" stroke="#000" strokeWidth="3" />
    <path d="M42 94 L60 118 L78 94 Z" fill="#22d3ee" stroke="#000" strokeWidth="2.5" />
    <path d="M56 102 L64 102 L62 120 L58 120 Z" fill="#09090b" />
    {/* Testa Calva Stile Fumetto B/N + Rim Light Ciano */}
    <path d="M35 52 C35 24, 85 24, 85 52 C85 78, 75 94, 60 94 C45 94, 35 78, 35 52 Z" fill="#f4f4f5" stroke="#09090b" strokeWidth="3.5" />
    <path d="M37 52 C37 30, 52 26, 52 26 C42 34, 41 55, 43 72 C38 65, 37 58, 37 52 Z" fill="#22d3ee" opacity="0.85" />
    {/* Sopracciglia e Occhi decisi */}
    <path d="M43 48 L56 50" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
    <path d="M64 50 L77 48" stroke="#09090b" strokeWidth="4" strokeLinecap="round" />
    <circle cx="49" cy="54" r="2.5" fill="#09090b" />
    <circle cx="71" cy="54" r="2.5" fill="#09090b" />
    {/* Barba Folta B/N */}
    <path d="M35 58 C34 78, 44 96, 60 96 C76 96, 86 78, 85 58 C81 66, 75 68, 60 68 C45 68, 39 66, 35 58 Z" fill="#09090b" />
    {/* Baffi e Bocca */}
    <path d="M47 68 Q60 63 73 68" stroke="#e4e4e7" strokeWidth="2" fill="none" />
    <path d="M53 73 Q60 71 67 73" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round" />
    {/* Tratti grigi barba */}
    <path d="M46 84 L49 91 M54 86 L55 93 M66 86 L65 93 M74 84 L71 91" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ==========================================
// 1. DATABASE ESERCIZI PREIMPOSTATI (Dimagrimento + Massa)
// ==========================================
const EXERCISE_LIBRARY = [
  // PETTO
  {
    id: 'ex_panca_piana',
    name: 'Panca Piana con Bilanciere',
    category: 'Petto',
    type: 'Massa / Fondamentale',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRest: 90,
    caloriesPerSet: 18,
    tips: 'Scapole addotte e depresse, piedi ben saldi a terra. Controlla la discesa (2 sec) e spingi esplosivo.'
  },
  {
    id: 'ex_spinte_manubri_30',
    name: 'Spinte Manubri Panca 30°',
    category: 'Petto',
    type: 'Massa / Ipertrofia',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRest: 75,
    caloriesPerSet: 15,
    tips: 'Massimo allungamento in basso senza perdere l’assetto scapolare. Non far scontrare i manubri in alto.'
  },
  {
    id: 'ex_croci_cavi',
    name: 'Croci ai Cavi Alti',
    category: 'Petto',
    type: 'Definizione / Pompaggio',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRest: 60,
    caloriesPerSet: 12,
    tips: 'Gomiti leggermente flessi e bloccati. Concentrati sulla contrazione di picco per 1 secondo a fine movimento.'
  },
  {
    id: 'ex_dip_parallele',
    name: 'Dip alle Parallele',
    category: 'Petto',
    type: 'Massa / Metabolico',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRest: 75,
    caloriesPerSet: 16,
    tips: 'Inclinati leggermente in avanti per enfatizzare il gran pettorale. Scendi fino a portare le spalle al livello dei gomiti.'
  },

  // DORSO
  {
    id: 'ex_lat_machine',
    name: 'Lat Machine Avanti',
    category: 'Dorso',
    type: 'Massa / Larghezza',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRest: 75,
    caloriesPerSet: 15,
    tips: 'Petto in fuori, tira portando i gomiti verso i fianchi. Evita di dondolare con la schiena.'
  },
  {
    id: 'ex_rematore_bilanciere',
    name: 'Rematore con Bilanciere',
    category: 'Dorso',
    type: 'Massa / Spessore',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRest: 90,
    caloriesPerSet: 19,
    tips: 'Schiena piatta inclinata a 45°, core contratto. Tira il bilanciere verso il basso ventre/ombelico.'
  },
  {
    id: 'ex_pulley_basso',
    name: 'Pulley Basso con Triangolo',
    category: 'Dorso',
    type: 'Ipertrofia / Densità',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRest: 60,
    caloriesPerSet: 14,
    tips: 'Mantieni il busto eretto, apri bene il petto quando il triangolo tocca l’addome.'
  },
  {
    id: 'ex_rematore_manubrio',
    name: 'Rematore con Manubrio Singolo',
    category: 'Dorso',
    type: 'Massa / Unilaterale',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRest: 60,
    caloriesPerSet: 14,
    tips: 'Tira il manubrio disegnando una curva verso l’anca, concentrandoti sul movimento del gomito.'
  },

  // GAMBE
  {
    id: 'ex_squat',
    name: 'Squat con Bilanciere',
    category: 'Gambe',
    type: 'Massa + Alto Consumo Calorico',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRest: 120,
    caloriesPerSet: 25,
    tips: 'Ginocchia in linea con le punte dei piedi, core fortissimo, scendi almeno fino al parallelo.'
  },
  {
    id: 'ex_leg_press',
    name: 'Leg Press 45°',
    category: 'Gambe',
    type: 'Massa / Quadricipiti',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRest: 90,
    caloriesPerSet: 20,
    tips: 'Non bloccare mai completamente le ginocchia in estensione. Tieni la zona lombare sempre incollata allo schienale.'
  },
  {
    id: 'ex_stacco_rumeno',
    name: 'Stacco Rumeno (Bilanciere o Manubri)',
    category: 'Gambe',
    type: 'Massa / Femorali & Glutei',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRest: 90,
    caloriesPerSet: 22,
    tips: 'Spingi il bacino indietro mantenendo i pesi attaccati alle tibie. Senti l’allungamento dei femorali.'
  },
  {
    id: 'ex_affondi_camminati',
    name: 'Affondi Camminati con Manubri',
    category: 'Gambe',
    type: 'Metabolico / Tonificazione',
    defaultSets: 3,
    defaultReps: '12 per gamba',
    defaultRest: 75,
    caloriesPerSet: 24,
    tips: 'Ottimo esercizio ibrido per massa e battito cardiaco alto. Busto dritto e passo ampio.'
  },
  {
    id: 'ex_leg_curl',
    name: 'Leg Curl Sdraiato / Seduto',
    category: 'Gambe',
    type: 'Isolamento / Femorali',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRest: 60,
    caloriesPerSet: 12,
    tips: 'Fase eccentrica lenta (3 secondi in discesa) per massimizzare lo stimolo muscolare.'
  },

  // SPALLE
  {
    id: 'ex_military_press',
    name: 'Military Press / Lento Avanti',
    category: 'Spalle',
    type: 'Massa / Spalle & Core',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRest: 90,
    caloriesPerSet: 16,
    tips: 'Glutei e addome contratti per non inarcare la schiena. Spingi sopra la testa in linea retta.'
  },
  {
    id: 'ex_alzate_laterali',
    name: 'Alzate Laterali con Manubri',
    category: 'Spalle',
    type: 'Definizione / Ampiezza V-Shape',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRest: 60,
    caloriesPerSet: 11,
    tips: 'Solleva guidando con i gomiti fino all’altezza delle spalle, senza usare slancio di schiena.'
  },
  {
    id: 'ex_face_pull',
    name: 'Face Pull al Cavo Alto',
    category: 'Spalle',
    type: 'Postura / Deltoide Posteriore',
    defaultSets: 3,
    defaultReps: '15',
    defaultRest: 60,
    caloriesPerSet: 10,
    tips: 'Tira la corda verso la fronte aprendo i gomiti all’esterno e ruotando esternamente le spalle.'
  },

  // BRACCIA
  {
    id: 'ex_curl_bilanciere',
    name: 'Curl con Bilanciere EZ',
    category: 'Braccia',
    type: 'Massa / Bicipiti',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRest: 60,
    caloriesPerSet: 11,
    tips: 'Gomiti incollati ai fianchi. Non oscillare col busto per sollevare il carico.'
  },
  {
    id: 'ex_curl_martello',
    name: 'Hammer Curl (Curl a Martello)',
    category: 'Braccia',
    type: 'Massa / Bicipiti & Avambracci',
    defaultSets: 3,
    defaultReps: '12',
    defaultRest: 60,
    caloriesPerSet: 11,
    tips: 'Impugnatura neutra (palmi che si guardano). Ottimo per lo spessore del braccio.'
  },
  {
    id: 'ex_pushdown_corda',
    name: 'Pushdown Tricipiti con Corda',
    category: 'Braccia',
    type: 'Definizione / Tricipiti',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRest: 60,
    caloriesPerSet: 11,
    tips: 'A fine estensione apri le estremità della corda verso l’esterno e contrai forte i tricipiti.'
  },
  {
    id: 'ex_french_press',
    name: 'French Press Manubri / Bilanciere EZ',
    category: 'Braccia',
    type: 'Massa / Tricipiti',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRest: 75,
    caloriesPerSet: 13,
    tips: 'Tieni i gomiti chiusi e puntati leggermente indietro per mantenere tensione continua.'
  },

  // CORE / ADDOME
  {
    id: 'ex_plank',
    name: 'Plank Isometrico Attivo',
    category: 'Core & Addome',
    type: 'Stabilità / Definizione Core',
    defaultSets: 3,
    defaultReps: '45-60 sec',
    defaultRest: 45,
    caloriesPerSet: 12,
    tips: 'Contrai forte glutei e addome come se dovessi ricevere un pugno. Non far cedere il bacino.'
  },
  {
    id: 'ex_crunch_cavo',
    name: 'Crunch al Cavo Alto (Rope Crunch)',
    category: 'Core & Addome',
    type: 'Ipertrofia Addominale',
    defaultSets: 3,
    defaultReps: '15',
    defaultRest: 45,
    caloriesPerSet: 13,
    tips: 'Arrotola la colonna vertebrale portando lo sterno verso il bacino, non piegarti solo dalle anche.'
  },
  {
    id: 'ex_mountain_climber',
    name: 'Mountain Climbers Veloci',
    category: 'Core & Addome',
    type: 'Bruciagrassi / Addome Dinamico',
    defaultSets: 3,
    defaultReps: '40 sec',
    defaultRest: 30,
    caloriesPerSet: 22,
    tips: 'Spalle sopra i polsi, porta le ginocchia al petto a ritmo sostenuto per bruciare calorie.'
  },

  // CARDIO / HIIT (DIMAGRIMENTO)
  {
    id: 'ex_hiit_tapis',
    name: 'HIIT Tapis Roulant (Sprint 30s / Camminata 60s)',
    category: 'Cardio & HIIT',
    type: 'Bruciagrassi Estremo (EPOC)',
    defaultSets: 6,
    defaultReps: '90 sec (Ciclo)',
    defaultRest: 0,
    caloriesPerSet: 28,
    tips: 'Alterna 30 secondi ad alta velocità/pendenza con 60 secondi di recupero attivo camminando.'
  },
  {
    id: 'ex_kettlebell_swing',
    name: 'Kettlebell Swing Russo',
    category: 'Cardio & HIIT',
    type: 'Metabolico + Catena Posteriore',
    defaultSets: 4,
    defaultReps: '20',
    defaultRest: 45,
    caloriesPerSet: 25,
    tips: 'Il movimento nasce dall’estensione esplosiva delle anche (colpo di bacino), non dalle braccia!'
  },
  {
    id: 'ex_camminata_inclinata',
    name: 'Camminata Inclinata (Pendenza 10-12%, 5 km/h)',
    category: 'Cardio & HIIT',
    type: 'Dimagrimento Lipolitico (LISS)',
    defaultSets: 1,
    defaultReps: '15 min',
    defaultRest: 0,
    caloriesPerSet: 135,
    tips: 'Non aggrapparti alle maniglie del tapis roulant! Cammina a passo svelto per massimizzare il consumo di grassi.'
  },
  {
    id: 'ex_burpees',
    name: 'Burpees / Sprawl Metabolici',
    category: 'Cardio & HIIT',
    type: 'Condizionamento & Bruciagrassi',
    defaultSets: 3,
    defaultReps: '12',
    defaultRest: 45,
    caloriesPerSet: 26,
    tips: 'Mantieni un ritmo costante ed esplosivo per innalzare il metabolismo post-allenamento.'
  }
];

// ==========================================
// 2. SCHEDE PREIMPOSTATE: DIMAGRIMENTO + MASSA
// ==========================================
const DEFAULT_ROUTINES = [
  {
    id: 'routine_giorno_a',
    name: 'Giorno A: Spinta + HIIT Bruciagrassi',
    subtitle: 'Focus Petto, Quadricipiti, Spalle, Tricipiti + Finisher Metabolico',
    tag: 'Massa + Definizione',
    estimatedTime: '55 min',
    targetCalories: 420,
    exercises: [
      { exerciseId: 'ex_squat', sets: 4, reps: '8-10', rest: 120, targetWeight: 60 },
      { exerciseId: 'ex_panca_piana', sets: 4, reps: '8-10', rest: 90, targetWeight: 55 },
      { exerciseId: 'ex_spinte_manubri_30', sets: 3, reps: '10-12', rest: 75, targetWeight: 20 },
      { exerciseId: 'ex_alzate_laterali', sets: 4, reps: '12-15', rest: 60, targetWeight: 10 },
      { exerciseId: 'ex_pushdown_corda', sets: 3, reps: '12-15', rest: 60, targetWeight: 25 },
      { exerciseId: 'ex_plank', sets: 3, reps: '50 sec', rest: 45, targetWeight: 0 },
      { exerciseId: 'ex_hiit_tapis', sets: 5, reps: '30s Sprint / 60s Walk', rest: 0, targetWeight: 0 }
    ]
  },
  {
    id: 'routine_giorno_b',
    name: 'Giorno B: Tirata + Catena Posteriore',
    subtitle: 'Focus Dorso, Femorali, Glutei, Bicipiti + Lipolisi',
    tag: 'V-Shape & Metabolismo',
    estimatedTime: '55 min',
    targetCalories: 410,
    exercises: [
      { exerciseId: 'ex_stacco_rumeno', sets: 4, reps: '8-10', rest: 90, targetWeight: 65 },
      { exerciseId: 'ex_lat_machine', sets: 4, reps: '10-12', rest: 75, targetWeight: 50 },
      { exerciseId: 'ex_rematore_bilanciere', sets: 4, reps: '8-10', rest: 90, targetWeight: 50 },
      { exerciseId: 'ex_face_pull', sets: 3, reps: '15', rest: 60, targetWeight: 20 },
      { exerciseId: 'ex_curl_bilanciere', sets: 3, reps: '10-12', rest: 60, targetWeight: 25 },
      { exerciseId: 'ex_crunch_cavo', sets: 3, reps: '15', rest: 45, targetWeight: 30 },
      { exerciseId: 'ex_camminata_inclinata', sets: 1, reps: '15 min (Pend. 12%)', rest: 0, targetWeight: 0 }
    ]
  },
  {
    id: 'routine_giorno_c',
    name: 'Giorno C: Full Body Ipertrofia & Conditioning',
    subtitle: 'Alta densità muscolare e massimo dispendio calorico',
    tag: 'Ricomposizione Totale',
    estimatedTime: '60 min',
    targetCalories: 480,
    exercises: [
      { exerciseId: 'ex_leg_press', sets: 4, reps: '10-12', rest: 90, targetWeight: 120 },
      { exerciseId: 'ex_military_press', sets: 4, reps: '8-10', rest: 90, targetWeight: 35 },
      { exerciseId: 'ex_pulley_basso', sets: 3, reps: '10-12', rest: 60, targetWeight: 50 },
      { exerciseId: 'ex_dip_parallele', sets: 3, reps: '10', rest: 75, targetWeight: 0 },
      { exerciseId: 'ex_affondi_camminati', sets: 3, reps: '12/gamba', rest: 75, targetWeight: 14 },
      { exerciseId: 'ex_curl_martello', sets: 3, reps: '12', rest: 60, targetWeight: 14 },
      { exerciseId: 'ex_kettlebell_swing', sets: 4, reps: '20', rest: 45, targetWeight: 16 }
    ]
  }
];

// ==========================================
// 3. AUDIO SINTETIZZATO PER IL TIMER (Zero dipendenze esterne)
// ==========================================
const playBeepSound = (type = 'finish') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'finish') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.55);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Ignora errori se l'utente non ha ancora interagito con il DOM
  }
};

// ==========================================
// 4. COMPONENTE PRINCIPALE DELL'APPLICAZIONE
// ==========================================
export default function App() {
  // Navigazione principale: 'schede' | 'allenati' | 'esercizi' | 'progressi'
  const [activeTab, setActiveTab] = useState('schede');

  // Stato Utente e Cloud Storage
  const [user, setUser] = useState(null);
  const [dbInstance, setDbInstance] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Dati persistenti dell'app (inizializzati da localStorage per funzionamento immediato anche offline)
  const [routines, setRoutines] = useState(() => {
    try {
      const saved = localStorage.getItem('senzapane_routines');
      return saved ? JSON.parse(saved) : DEFAULT_ROUTINES;
    } catch (e) {
      return DEFAULT_ROUTINES;
    }
  });

  const [workoutLogs, setWorkoutLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('senzapane_workout_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('senzapane_personal_records');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sincronizzazione automatica su localStorage ad ogni modifica
  useEffect(() => {
    try {
      localStorage.setItem('senzapane_routines', JSON.stringify(routines));
    } catch (e) {
      console.error('Errore salvataggio routines locale:', e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem('senzapane_workout_logs', JSON.stringify(workoutLogs));
    } catch (e) {
      console.error('Errore salvataggio logs locale:', e);
    }
  }, [workoutLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('senzapane_personal_records', JSON.stringify(personalRecords));
    } catch (e) {
      console.error('Errore salvataggio PR locale:', e);
    }
  }, [personalRecords]);

  // Stato Allenamento Live in corso
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  // Stato Timer di Recupero
  const [restTimer, setRestTimer] = useState({
    isRunning: false,
    remaining: 0,
    total: 90,
    soundEnabled: true
  });

  // Modali e UI secondarie
  const [toastMessage, setToastMessage] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(null); // Per creare o modificare una scheda
  const [selectedExerciseModal, setSelectedExerciseModal] = useState(null); // Info esercizio
  const [confirmEndModal, setConfirmEndModal] = useState(false);

  // Logo Personalizzato Utente (salvato in localStorage)
  const [customLogo, setCustomLogo] = useState(() => {
    try {
      return localStorage.getItem('senzapane_custom_logo') || null;
    } catch (e) {
      return null;
    }
  });
  const fileInputRef = useRef(null);
  const backupInputRef = useRef(null);

  // Funzione per caricare, ritagliare in automatico sul volto e salvare il logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 260;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Auto-crop centrato sul volto
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = Math.max(0, (img.height - minDim) * 0.22);

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setCustomLogo(dataUrl);
        try {
          localStorage.setItem('senzapane_custom_logo', dataUrl);
        } catch (err) {
          console.error('Errore salvataggio localStorage:', err);
        }
        showToast('🔥 Logo senzapane aggiornato!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Esporta Backup JSON completo (Schede, Storico, PR, Logo)
  const handleExportBackup = () => {
    try {
      const backupPayload = {
        app: 'senzapane',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        routines,
        workoutLogs,
        personalRecords,
        customLogo
      };
      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `senzapane-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📦 Backup JSON esportato con successo!');
    } catch (error) {
      console.error('Errore esportazione backup:', error);
      showToast('⚠️ Errore durante l’esportazione del backup');
    }
  };

  // Importa Backup JSON completo
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || (!parsed.routines && !parsed.workoutLogs)) {
          showToast('⚠️ File di backup non valido');
          return;
        }

        if (Array.isArray(parsed.routines)) setRoutines(parsed.routines);
        if (Array.isArray(parsed.workoutLogs)) setWorkoutLogs(parsed.workoutLogs);
        if (parsed.personalRecords && typeof parsed.personalRecords === 'object') {
          setPersonalRecords(parsed.personalRecords);
        }
        if (parsed.customLogo) {
          setCustomLogo(parsed.customLogo);
          localStorage.setItem('senzapane_custom_logo', parsed.customLogo);
        }

        // Sincronizza anche su Cloud se attivo
        if (user && dbInstance) {
          const appId = typeof __app_id !== 'undefined' ? __app_id : 'senzapane-gym-app';
          if (Array.isArray(parsed.routines)) {
            for (const r of parsed.routines) {
              if (r.id) {
                await setDoc(doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'routines', r.id), r);
              }
            }
          }
          if (Array.isArray(parsed.workoutLogs)) {
            for (const l of parsed.workoutLogs) {
              if (l.id) {
                await setDoc(doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'workoutLogs', l.id), l);
              }
            }
          }
          if (parsed.personalRecords) {
            for (const [exId, recData] of Object.entries(parsed.personalRecords)) {
              await setDoc(doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'records', exId), recData);
            }
          }
        }

        showToast('✅ Backup importato e ripristinato!');
      } catch (err) {
        console.error('Errore importazione JSON:', err);
        showToast('⚠️ Impossibile leggere il file JSON selezionato');
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Filtri Libreria Esercizi
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');

  // Helper per mostrare notifiche non bloccanti
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // ==========================================
  // 5. INIZIALIZZAZIONE FIREBASE & SINCRONIZZAZIONE DATI
  // ==========================================
  useEffect(() => {
    let unsubscribeRoutines = null;
    let unsubscribeLogs = null;
    let unsubscribeRecords = null;

    const initFirebase = async () => {
      try {
        const rawConfig = typeof __firebase_config !== 'undefined' ? __firebase_config : null;
        if (!rawConfig) {
          setIsSyncing(false);
          return;
        }

        const firebaseConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        setDbInstance(db);

        // Regola 3: Autenticazione PRIMA di qualsiasi operazione
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }

        onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (!currentUser) {
            setIsSyncing(false);
            return;
          }

          const appId = typeof __app_id !== 'undefined' ? __app_id : 'senzapane-gym-app';
          const uid = currentUser.uid;

          // 1. Listener Schede (Routines)
          const routinesRef = collection(db, 'artifacts', appId, 'users', uid, 'routines');
          unsubscribeRoutines = onSnapshot(
            routinesRef,
            async (snapshot) => {
              if (snapshot.empty) {
                // Popola con le 3 schede "Dimagrimento + Massa" al primo avvio
                for (const r of DEFAULT_ROUTINES) {
                  await setDoc(doc(db, 'artifacts', appId, 'users', uid, 'routines', r.id), r);
                }
                setRoutines(DEFAULT_ROUTINES);
              } else {
                const loaded = snapshot.docs.map((d) => d.data());
                // Ordina per nome in memoria
                loaded.sort((a, b) => a.name.localeCompare(b.name));
                setRoutines(loaded);
              }
              setIsSyncing(false);
            },
            (err) => {
              console.error('Errore sync routines:', err);
              setIsSyncing(false);
            }
          );

          // 2. Listener Storico Allenamenti (Workout Logs)
          const logsRef = collection(db, 'artifacts', appId, 'users', uid, 'workoutLogs');
          unsubscribeLogs = onSnapshot(
            logsRef,
            (snapshot) => {
              const loadedLogs = snapshot.docs.map((d) => d.data());
              // Ordina dal più recente al meno recente in memoria (Regola 2)
              loadedLogs.sort((a, b) => b.timestamp - a.timestamp);
              setWorkoutLogs(loadedLogs);
            },
            (err) => console.error('Errore sync logs:', err)
          );

          // 3. Listener Record Personali e Ultimi Carichi
          const recordsRef = collection(db, 'artifacts', appId, 'users', uid, 'records');
          unsubscribeRecords = onSnapshot(
            recordsRef,
            (snapshot) => {
              const recMap = {};
              snapshot.docs.forEach((d) => {
                recMap[d.id] = d.data();
              });
              setPersonalRecords(recMap);
            },
            (err) => console.error('Errore sync records:', err)
          );
        });
      } catch (error) {
        console.error('Modalità sessione locale attiva:', error);
        setIsSyncing(false);
      }
    };

    initFirebase();

    return () => {
      if (unsubscribeRoutines) unsubscribeRoutines();
      if (unsubscribeLogs) unsubscribeLogs();
      if (unsubscribeRecords) unsubscribeRecords();
    };
  }, []);

  // ==========================================
  // 6. GESTIONE TIMER ALLENAMENTO E RECUPERO
  // ==========================================
  // Cronometro durata totale dell'allenamento attivo
  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setWorkoutElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Countdown Timer di Recupero tra le serie
  useEffect(() => {
    if (!restTimer.isRunning) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev.remaining <= 1) {
          if (prev.soundEnabled) playBeepSound('finish');
          if (navigator.vibrate) navigator.vibrate([250, 100, 250]);
          showToast('⏱️ Recupero terminato! Pronti per la prossima serie!');
          return { ...prev, isRunning: false, remaining: 0 };
        }
        if (prev.remaining === 4 && prev.soundEnabled) {
          playBeepSound('tick');
        }
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isRunning]);

  const startRestTimer = (seconds) => {
    if (!seconds || seconds <= 0) return;
    setRestTimer((prev) => ({
      ...prev,
      isRunning: true,
      remaining: seconds,
      total: seconds
    }));
  };

  const adjustRestTimer = (delta) => {
    setRestTimer((prev) => {
      const nextRemaining = Math.max(0, prev.remaining + delta);
      const nextTotal = Math.max(prev.total, nextRemaining);
      return {
        ...prev,
        isRunning: nextRemaining > 0,
        remaining: nextRemaining,
        total: nextTotal
      };
    });
  };

  // ==========================================
  // 7. FUNZIONI AZIONI: ALLENAMENTO LIVE E SALVATAGGIO
  // ==========================================
  const getExerciseDetails = (exerciseId) => {
    return (
      EXERCISE_LIBRARY.find((ex) => ex.id === exerciseId) || {
        id: exerciseId,
        name: 'Esercizio Personalizzato',
        category: 'Altro',
        type: 'Personalizzato',
        defaultSets: 3,
        defaultReps: '10',
        defaultRest: 60,
        caloriesPerSet: 15,
        tips: 'Mantieni il controllo del movimento in ogni fase.'
      }
    );
  };

  // Avvia una scheda in modalità Live
  const handleStartRoutine = (routine) => {
    const initializedExercises = routine.exercises.map((item) => {
      const details = getExerciseDetails(item.exerciseId);
      const savedRec = personalRecords[item.exerciseId];
      const defaultWeight = savedRec?.lastWeight !== undefined ? savedRec.lastWeight : (item.targetWeight || 0);
      const numReps = parseInt(String(item.reps).replace(/\D/g, ''), 10) || 10;

      const setsArray = Array.from({ length: item.sets }, (_, idx) => ({
        setNumber: idx + 1,
        weight: defaultWeight,
        reps: numReps,
        completed: false
      }));

      return {
        exerciseId: item.exerciseId,
        name: details.name,
        category: details.category,
        targetRepsLabel: item.reps,
        restSeconds: item.rest ?? details.defaultRest,
        caloriesPerSet: details.caloriesPerSet || 15,
        tips: details.tips,
        sets: setsArray
      };
    });

    setActiveWorkout({
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises: initializedExercises
    });
    setWorkoutElapsedSeconds(0);
    setActiveTab('allenati');
    showToast(`🔥 Allenamento "${routine.name}" avviato!`);
  };

  // Aggiorna Peso o Ripetizioni di una singola serie durante il workout
  const updateSetField = (exIndex, setIndex, field, value) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const updatedSets = [...updatedExercises[exIndex].sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: Math.max(0, Number(value) || 0)
      };
      updatedExercises[exIndex] = { ...updatedExercises[exIndex], sets: updatedSets };
      return { ...prev, exercises: updatedExercises };
    });
  };

  // Segna una serie come completata e fa partire il Timer di recupero automatico
  const toggleSetCompleted = (exIndex, setIndex) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetExercise = updatedExercises[exIndex];
      const updatedSets = [...targetExercise.sets];
      const isNowComplete = !updatedSets[setIndex].completed;

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        completed: isNowComplete
      };
      updatedExercises[exIndex] = { ...targetExercise, sets: updatedSets };

      // Se appena completata, avvia automaticamente il timer di recupero dell'esercizio
      if (isNowComplete && targetExercise.restSeconds > 0) {
        startRestTimer(targetExercise.restSeconds);
      }

      return { ...prev, exercises: updatedExercises };
    });
  };

  // Aggiungi una serie extra al volo durante l'allenamento
  const addLiveSet = (exIndex) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const currentSets = updatedExercises[exIndex].sets;
      const lastSet = currentSets[currentSets.length - 1] || { weight: 20, reps: 10 };

      updatedExercises[exIndex] = {
        ...updatedExercises[exIndex],
        sets: [
          ...currentSets,
          {
            setNumber: currentSets.length + 1,
            weight: lastSet.weight,
            reps: lastSet.reps,
            completed: false
          }
        ]
      };
      return { ...prev, exercises: updatedExercises };
    });
  };

  // Conclude e salva l'allenamento nello storico e aggiorna i Record Personali
  const finishAndSaveWorkout = async () => {
    if (!activeWorkout) return;

    let totalVolume = 0;
    let totalCompletedSets = 0;
    let totalCalories = 0;
    const updatedRecords = { ...personalRecords };

    activeWorkout.exercises.forEach((ex) => {
      let exMaxWeight = updatedRecords[ex.exerciseId]?.maxWeight || 0;
      let exLastWeight = updatedRecords[ex.exerciseId]?.lastWeight || 0;

      ex.sets.forEach((s) => {
        if (s.completed) {
          totalCompletedSets += 1;
          const setVol = (Number(s.weight) || 0) * (Number(s.reps) || 1);
          totalVolume += setVol;
          totalCalories += ex.caloriesPerSet || 15;

          if (s.weight > exMaxWeight) exMaxWeight = s.weight;
          exLastWeight = s.weight;
        }
      });

      if (exLastWeight > 0 || exMaxWeight > 0) {
        updatedRecords[ex.exerciseId] = {
          exerciseId: ex.exerciseId,
          maxWeight: exMaxWeight,
          lastWeight: exLastWeight,
          updatedAt: Date.now()
        };
      }
    });

    // Aggiungi dispendio calorico basale legato alla durata
    const durationMinutes = Math.max(1, Math.round(workoutElapsedSeconds / 60));
    const finalCalories = Math.round(totalCalories + durationMinutes * 3.5);

    const newLog = {
      id: `log_${Date.now()}`,
      routineName: activeWorkout.routineName,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      durationMinutes,
      totalVolume,
      totalCompletedSets,
      estimatedCalories: finalCalories,
      exercisesSummary: activeWorkout.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        name: e.name,
        completedSets: e.sets.filter((s) => s.completed).length,
        bestWeight: Math.max(0, ...e.sets.filter((s) => s.completed).map((s) => s.weight))
      }))
    };

    // Aggiorna stato locale subito per reattività istantanea
    setWorkoutLogs((prev) => [newLog, ...prev]);
    setPersonalRecords(updatedRecords);
    setActiveWorkout(null);
    setConfirmEndModal(false);
    setRestTimer((prev) => ({ ...prev, isRunning: false, remaining: 0 }));
    setActiveTab('progressi');
    showToast('🏆 Allenamento salvato! Ottimo lavoro!');

    // Salva su Firestore se autenticato
    if (user && dbInstance) {
      try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'senzapane-gym-app';
        await setDoc(
          doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'workoutLogs', newLog.id),
          newLog
        );

        for (const [exId, recData] of Object.entries(updatedRecords)) {
          await setDoc(
            doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'records', exId),
            recData
          );
        }
      } catch (e) {
        console.error('Errore salvataggio cloud workout:', e);
      }
    }
  };

  // ==========================================
  // 8. GESTIONE CREAZIONE / MODIFICA SCHEDE PERSONALIZZATE
  // ==========================================
  const handleSaveRoutine = async (routineData) => {
    if (!routineData.name.trim()) {
      showToast('⚠️ Inserisci un nome per la scheda');
      return;
    }
    if (routineData.exercises.length === 0) {
      showToast('⚠️ Aggiungi almeno un esercizio alla scheda');
      return;
    }

    const savedRoutine = {
      ...routineData,
      id: routineData.id || `routine_custom_${Date.now()}`,
      estimatedTime: `${routineData.exercises.length * 8} min`,
      targetCalories: routineData.exercises.length * 60
    };

    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === savedRoutine.id);
      if (exists) return prev.map((r) => (r.id === savedRoutine.id ? savedRoutine : r));
      return [...prev, savedRoutine];
    });

    setEditingRoutine(null);
    showToast('✅ Scheda salvata con successo!');

    if (user && dbInstance) {
      try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'senzapane-gym-app';
        await setDoc(
          doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'routines', savedRoutine.id),
          savedRoutine
        );
      } catch (e) {
        console.error('Errore salvataggio scheda:', e);
      }
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    showToast('🗑️ Scheda rimossa');

    if (user && dbInstance) {
      try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'senzapane-gym-app';
        await deleteDoc(doc(dbInstance, 'artifacts', appId, 'users', user.uid, 'routines', routineId));
      } catch (e) {
        console.error('Errore eliminazione scheda:', e);
      }
    }
  };

  // ==========================================
  // 9. STATISTICHE E FORMATTAZIONE
  // ==========================================
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  const statsSummary = useMemo(() => {
    const totalWorkouts = workoutLogs.length;
    const totalCaloriesBurned = workoutLogs.reduce((acc, l) => acc + (l.estimatedCalories || 0), 0);
    const totalKgLifted = workoutLogs.reduce((acc, l) => acc + (l.totalVolume || 0), 0);
    return { totalWorkouts, totalCaloriesBurned, totalKgLifted };
  }, [workoutLogs]);

  const categories = ['Tutti', 'Petto', 'Dorso', 'Gambe', 'Spalle', 'Braccia', 'Core & Addome', 'Cardio & HIIT'];

  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      const matchesCat = selectedCategory === 'Tutti' || ex.category === selectedCategory;
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Calcolo progresso dell'allenamento attivo in percentuale
  const workoutCompletionPercentage = useMemo(() => {
    if (!activeWorkout) return 0;
    let total = 0;
    let done = 0;
    activeWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        total++;
        if (s.completed) done++;
      });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [activeWorkout]);

  // ==========================================
  // 10. RENDER INTERFACCIA MOBILE-FIRST DARK NEON
  // ==========================================
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-36 selection:bg-lime-400 selection:text-zinc-950">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 border border-lime-400/50 text-lime-300 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-medium backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
        <input
          ref={backupInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportBackup}
          className="hidden"
        />
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Avatar Logo Circolare con anello Neon Ciano/Magenta e badge discreto fotocamera */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Cambia avatar logo"
              className="relative group w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-lime-400 to-pink-500 shadow-lg shadow-cyan-500/20 shrink-0 active:scale-95 transition"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                {customLogo ? (
                  <img
                    src={customLogo}
                    alt="Logo senzapane"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DefaultComicAvatar />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-900 text-cyan-400 flex items-center justify-center shadow border border-cyan-400/60">
                <Camera className="w-2.5 h-2.5" />
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-tight text-white lowercase">
                  senza<span className="text-lime-400">pane</span>
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  ZERO PANE!
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Niente scuse. Solo ghisa e zero pane.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pill stato allenamento in corso se l'utente cambia tab */}
            {activeWorkout && activeTab !== 'allenati' && (
              <button
                onClick={() => setActiveTab('allenati')}
                className="flex items-center gap-1.5 bg-lime-400 text-zinc-950 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg shadow-lime-400/20 animate-pulse"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{formatTime(workoutElapsedSeconds)}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER (Ottimizzato per Smartphone) */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        
        {/* ==========================================
            TAB 1: SCHEDE DI ALLENAMENTO (ROUTINES)
        ========================================== */}
        {activeTab === 'schede' && (
          <div className="space-y-5">
            {/* Hero Banner Obiettivo con Logo Pop-Art Integrato */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-fuchsia-950/40 border border-zinc-800 p-5 shadow-xl">
              <div className="flex items-center gap-4">
                {/* Grande Avatar Faccia senza contorno */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-lime-400 to-pink-500 shadow-xl shadow-pink-500/20">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950">
                      {customLogo ? (
                        <img
                          src={customLogo}
                          alt="Boss senzapane"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultComicAvatar />
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-zinc-950 font-black text-[9px] px-2 py-0.5 rounded-full border-2 border-zinc-950 shadow">
                    SENZA PANE!
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    Protocollo Ricomposizione
                  </div>
                  <h2 className="text-lg font-black text-white leading-tight">
                    Costruisci Muscolo, Brucia Grassi
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Fondamentali pesanti per la <strong className="text-white">massa magra</strong> + finisher HIIT per <strong className="text-lime-400">definizione estrema</strong>.
                  </p>
                </div>
              </div>

              {/* Quick KPI Strip */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-zinc-800/80">
                <div className="bg-zinc-950/60 rounded-2xl p-2.5 text-center border border-zinc-800/60">
                  <div className="text-xs text-zinc-400">Allenamenti</div>
                  <div className="text-base font-black text-white mt-0.5">{statsSummary.totalWorkouts}</div>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-2.5 text-center border border-zinc-800/60">
                  <div className="text-xs text-zinc-400">Kcal Bruciate</div>
                  <div className="text-base font-black text-lime-400 mt-0.5">{statsSummary.totalCaloriesBurned}</div>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-2.5 text-center border border-zinc-800/60">
                  <div className="text-xs text-zinc-400">Volume Totale</div>
                  <div className="text-base font-black text-cyan-400 mt-0.5">
                    {(statsSummary.totalKgLifted / 1000).toFixed(1)}t
                  </div>
                </div>
              </div>
            </div>

            {/* Intestazione Sezione Schede + Pulsante Nuova Scheda */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Le Tue Schede Pronte</h3>
                <p className="text-xs text-zinc-400">Tocca "Inizia" per entrare in modalità palestra</p>
              </div>
              <button
                onClick={() =>
                  setEditingRoutine({
                    id: '',
                    name: '',
                    subtitle: 'Scheda Personalizzata Massa + Definizione',
                    tag: 'Custom',
                    exercises: []
                  })
                }
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-lime-400 border border-lime-400/30 px-3.5 py-2 rounded-2xl text-xs font-bold transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Nuova Scheda</span>
              </button>
            </div>

            {/* Lista Schede */}
            <div className="space-y-4">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-4 shadow-lg hover:border-zinc-700 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20">
                        {routine.tag || 'Massa + Def'}
                      </span>
                      <h4 className="text-lg font-extrabold text-white">{routine.name}</h4>
                      <p className="text-xs text-zinc-400">{routine.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingRoutine(routine)}
                        className="p-2 text-zinc-400 hover:text-white bg-zinc-800/70 rounded-xl"
                        title="Modifica Scheda"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {routines.length > 1 && (
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className="p-2 text-zinc-400 hover:text-rose-400 bg-zinc-800/70 rounded-xl"
                          title="Elimina Scheda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info pillole durata & calorie */}
                  <div className="flex items-center gap-4 text-xs text-zinc-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {routine.estimatedTime || '55 min'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      ~{routine.targetCalories || 420} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
                      {routine.exercises.length} esercizi
                    </span>
                  </div>

                  {/* Anteprima esercizi della scheda */}
                  <div className="bg-zinc-950/70 rounded-2xl p-3 border border-zinc-800/70 space-y-2">
                    {routine.exercises.slice(0, 5).map((item, idx) => {
                      const details = getExerciseDetails(item.exerciseId);
                      const rec = personalRecords[item.exerciseId];
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-400 font-bold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="text-zinc-200 font-medium truncate">{details.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-zinc-400 font-mono">
                              {item.sets} × {item.reps}
                            </span>
                            {(rec?.lastWeight > 0 || item.targetWeight > 0) && (
                              <span className="text-[11px] font-bold text-lime-400 bg-lime-400/10 px-1.5 py-0.5 rounded">
                                {rec?.lastWeight || item.targetWeight}kg
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {routine.exercises.length > 5 && (
                      <div className="text-[11px] text-zinc-500 text-center pt-1">
                        + altri {routine.exercises.length - 5} esercizi inclusi
                      </div>
                    )}
                  </div>

                  {/* Bottone Inizia Allenamento */}
                  <button
                    onClick={() => handleStartRoutine(routine)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-300 hover:to-emerald-400 text-zinc-950 font-black text-sm shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99]"
                  >
                    <Play className="w-4 h-4 fill-zinc-950" />
                    <span>INIZIA ALLENAMENTO</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: MODALITÀ ALLENAMENTO LIVE (TRACKER)
        ========================================== */}
        {activeTab === 'allenati' && (
          <div className="space-y-5">
            {!activeWorkout ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mx-auto text-lime-400">
                  <Dumbbell className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white">Nessun allenamento attivo</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Scegli una scheda dalla sezione "Schede" per avviare il tracker interattivo con timer di recupero automatico.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('schede')}
                  className="px-6 py-3 rounded-2xl bg-lime-400 text-zinc-950 font-extrabold text-sm shadow-lg shadow-lime-400/20"
                >
                  Scegli una Scheda
                </button>
              </div>
            ) : (
              <>
                {/* Barra di stato superiore dell'allenamento attivo */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                        Sessione Live Attiva
                      </span>
                      <h2 className="text-base font-extrabold text-white">{activeWorkout.routineName}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">Durata</div>
                      <div className="text-lg font-mono font-black text-cyan-400">
                        {formatTime(workoutElapsedSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* Barra di progresso completamento serie */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Completamento scheda</span>
                      <span className="font-bold text-lime-400">{workoutCompletionPercentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${workoutCompletionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lista Esercizi & Serie Interattive */}
                <div className="space-y-4">
                  {activeWorkout.exercises.map((exercise, exIndex) => {
                    const savedRec = personalRecords[exercise.exerciseId];
                    return (
                      <div
                        key={`${exercise.exerciseId}_${exIndex}`}
                        className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-4 space-y-3.5 shadow-lg"
                      >
                        {/* Header Esercizio */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-cyan-400">
                                {exercise.category}
                              </span>
                              <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <Timer className="w-3.5 h-3.5 text-lime-400" />
                                Rec: {exercise.restSeconds}s
                              </span>
                            </div>
                            <h3 className="text-base font-extrabold text-white mt-1">{exercise.name}</h3>
                            <p className="text-xs text-zinc-400">
                              Target: <strong className="text-zinc-200">{exercise.targetRepsLabel}</strong>
                              {savedRec?.maxWeight > 0 && (
                                <span className="ml-2 text-amber-400 font-semibold">
                                  • PR: {savedRec.maxWeight}kg
                                </span>
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() => setSelectedExerciseModal(getExerciseDetails(exercise.exerciseId))}
                            className="p-2 rounded-xl bg-zinc-800/80 text-zinc-300 hover:text-lime-400"
                            title="Consigli esecuzione"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Intestazioni Tabella Serie */}
                        <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase text-zinc-400 px-1">
                          <div className="col-span-2 text-center">Serie</div>
                          <div className="col-span-4 text-center">Carico (Kg)</div>
                          <div className="col-span-4 text-center">Ripetizioni</div>
                          <div className="col-span-2 text-center">Fatto</div>
                        </div>

                        {/* Righe delle Serie */}
                        <div className="space-y-2">
                          {exercise.sets.map((setItem, setIndex) => (
                            <div
                              key={setIndex}
                              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition ${
                                setItem.completed
                                  ? 'bg-emerald-950/30 border-emerald-500/40'
                                  : 'bg-zinc-950/80 border-zinc-800/80'
                              }`}
                            >
                              {/* Numero Serie */}
                              <div className="col-span-2 flex justify-center">
                                <span
                                  className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                                    setItem.completed
                                      ? 'bg-emerald-500 text-zinc-950'
                                      : 'bg-zinc-800 text-zinc-300'
                                  }`}
                                >
                                  {setItem.setNumber}
                                </span>
                              </div>

                              {/* Controllo Carico (KG) ottimizzato per pollice */}
                              <div className="col-span-4 flex items-center justify-between bg-zinc-900 rounded-xl border border-zinc-800 px-1 py-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSetField(exIndex, setIndex, 'weight', setItem.weight - 2.5)
                                  }
                                  className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center active:bg-zinc-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  value={setItem.weight}
                                  onChange={(e) =>
                                    updateSetField(exIndex, setIndex, 'weight', e.target.value)
                                  }
                                  className="w-11 text-center bg-transparent font-extrabold text-sm text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSetField(exIndex, setIndex, 'weight', setItem.weight + 2.5)
                                  }
                                  className="w-6 h-6 rounded-lg bg-zinc-800 text-lime-400 flex items-center justify-center active:bg-zinc-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Controllo Ripetizioni */}
                              <div className="col-span-4 flex items-center justify-between bg-zinc-900 rounded-xl border border-zinc-800 px-1 py-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSetField(exIndex, setIndex, 'reps', setItem.reps - 1)
                                  }
                                  className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center active:bg-zinc-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  value={setItem.reps}
                                  onChange={(e) =>
                                    updateSetField(exIndex, setIndex, 'reps', e.target.value)
                                  }
                                  className="w-9 text-center bg-transparent font-extrabold text-sm text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSetField(exIndex, setIndex, 'reps', setItem.reps + 1)
                                  }
                                  className="w-6 h-6 rounded-lg bg-zinc-800 text-cyan-400 flex items-center justify-center active:bg-zinc-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Bottone Check Serie Completata */}
                              <div className="col-span-2 flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => toggleSetCompleted(exIndex, setIndex)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition active:scale-90 ${
                                    setItem.completed
                                      ? 'bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/30'
                                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  <Check className="w-5 h-5 stroke-[3]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Azioni rapide esercizio: Aggiungi Serie o Avvia Timer */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => addLiveSet(exIndex)}
                            className="text-xs font-bold text-zinc-400 hover:text-lime-400 flex items-center gap-1 py-1 px-2 rounded-lg"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Aggiungi Serie
                          </button>

                          {exercise.restSeconds > 0 && (
                            <button
                              type="button"
                              onClick={() => startRestTimer(exercise.restSeconds)}
                              className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 py-1 px-2.5 rounded-xl flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              Avvia Recupero ({exercise.restSeconds}s)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pulsante Termina e Salva Allenamento */}
                <div className="pt-2 pb-6">
                  <button
                    type="button"
                    onClick={() => setConfirmEndModal(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 text-zinc-950 font-black text-base shadow-xl shadow-lime-500/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    <span>TERMINA E SALVA ALLENAMENTO</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: LIBRERIA ESERCIZI (CON CONSIGLI TECNICI)
        ========================================== */}
        {activeTab === 'esercizi' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">Enciclopedia Esercizi</h2>
              <p className="text-xs text-zinc-400">
                Selezionati per massimizzare ipertrofia muscolare e dispendio calorico
              </p>
            </div>

            {/* Barra di ricerca */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca esercizio (es. Squat, Panca, HIIT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* Filtro Categorie Muscolari */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-lime-400 text-zinc-950 shadow-md shadow-lime-400/20'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lista Esercizi Filtrati */}
            <div className="space-y-3">
              {filteredExercises.map((ex) => {
                const rec = personalRecords[ex.id];
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExerciseModal(ex)}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-lime-400">
                          {ex.category}
                        </span>
                        <span className="text-[11px] text-zinc-400">{ex.type}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-1">{ex.tips}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      {rec?.maxWeight > 0 ? (
                        <div className="text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                          PR: {rec.maxWeight} kg
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {ex.defaultSets}×{ex.defaultReps}
                        </div>
                      )}
                      <div className="text-[10px] text-cyan-400">Rec. {ex.defaultRest}s</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: PROGRESSI, RECORD E STORICO
        ========================================== */}
        {activeTab === 'progressi' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">I Tuoi Progressi</h2>
              <p className="text-xs text-zinc-400">
                Monitora l'aumento dei carichi (massa) e le calorie bruciate (dimagrimento)
              </p>
            </div>

            {/* Cards Riepilogo Globale */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
                <Calendar className="w-4 h-4 text-lime-400" />
                <div className="text-xl font-black text-white">{statsSummary.totalWorkouts}</div>
                <div className="text-[11px] text-zinc-400">Sessioni Fatte</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <div className="text-xl font-black text-orange-400">{statsSummary.totalCaloriesBurned}</div>
                <div className="text-[11px] text-zinc-400">Kcal Stimate</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <div className="text-xl font-black text-cyan-400">
                  {statsSummary.totalKgLifted.toLocaleString('it-IT')}
                </div>
                <div className="text-[11px] text-zinc-400">Kg Sollevati</div>
              </div>
            </div>

            {/* Grafico Visuale Progressione Volume Ultime Sessioni */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Andamento Volume & Calorie</h3>
                  <p className="text-xs text-zinc-400">Ultime 7 sessioni registrate</p>
                </div>
                <BarChart3 className="w-5 h-5 text-lime-400" />
              </div>

              {workoutLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Completa il tuo primo allenamento per visualizzare i grafici di progressione.
                </div>
              ) : (
                <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2 border-b border-zinc-800">
                  {workoutLogs
                    .slice(0, 7)
                    .reverse()
                    .map((log, i) => {
                      const maxVol = Math.max(
                        1000,
                        ...workoutLogs.slice(0, 7).map((l) => l.totalVolume || 500)
                      );
                      const heightPct = Math.max(15, Math.round(((log.totalVolume || 300) / maxVol) * 100));
                      return (
                        <div key={log.id || i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[9px] font-bold text-lime-400">
                            {Math.round((log.totalVolume || 0) / 100) / 10}k
                          </span>
                          <div className="w-full bg-zinc-950 rounded-t-xl h-24 flex items-end overflow-hidden p-0.5">
                            <div
                              className="w-full bg-gradient-to-t from-emerald-500 to-lime-400 rounded-t-lg transition-all"
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400 truncate max-w-[44px]">
                            {log.dateFormatted?.split(' ').slice(0, 2).join(' ')}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Record Personali (PR) sui Fondamentali */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Record Personali (Carichi Massimi)</h3>
              </div>

              {Object.keys(personalRecords).length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">
                  I tuoi record di carico appariranno automaticamente qui appena salvi un allenamento.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.values(personalRecords)
                    .filter((r) => r.maxWeight > 0)
                    .map((rec) => {
                      const exDetails = getExerciseDetails(rec.exerciseId);
                      return (
                        <div
                          key={rec.exerciseId}
                          className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-3 flex flex-col justify-between"
                        >
                          <span className="text-xs font-semibold text-zinc-300 line-clamp-1">
                            {exDetails.name}
                          </span>
                          <div className="flex items-baseline justify-between mt-2">
                            <span className="text-lg font-black text-amber-400">{rec.maxWeight} kg</span>
                            <span className="text-[10px] text-zinc-500">Ultimo: {rec.lastWeight}kg</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Storico Cronologico Allenamenti */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Storico Allenamenti Completati</h3>
              {workoutLogs.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-xs text-zinc-400">
                  Nessun allenamento ancora registrato nello storico.
                </div>
              ) : (
                workoutLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-lime-400 font-bold">{log.dateFormatted}</span>
                        <h4 className="font-extrabold text-sm text-white">{log.routineName}</h4>
                      </div>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        🔥 {log.estimatedCalories} kcal
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400 border-t border-zinc-800 pt-2">
                      <span>⏱️ {log.durationMinutes} min</span>
                      <span>🏋️ Volume: {log.totalVolume} kg</span>
                      <span>✅ {log.totalCompletedSets} serie</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sezione Backup Dati (Esporta / Importa JSON) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Backup e Trasferimento Dati</h3>
                    <p className="text-[11px] text-zinc-400">
                      Salva o ripristina schede, storico, record e logo in formato JSON
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-cyan-400/30 text-cyan-300 font-bold text-xs transition active:scale-95"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Esporta Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => backupInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-lime-400/30 text-lime-300 font-bold text-xs transition active:scale-95"
                >
                  <Upload className="w-4 h-4 text-lime-400" />
                  <span>Importa Backup</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          FLOATING DOCKED TIMER DI RECUPERO
      ========================================== */}
      {(restTimer.isRunning || restTimer.remaining > 0) && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-lg mx-auto bg-zinc-900/95 backdrop-blur-xl border-2 border-lime-400 rounded-3xl p-3.5 shadow-2xl shadow-black pointer-events-auto space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-lime-400/15 border border-lime-400/40 flex items-center justify-center text-lime-400 font-mono font-black text-base">
                  {restTimer.remaining}s
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-lime-400">
                    Timer Recupero
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    Respira profondamente e preparati alla serie
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setRestTimer((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                  }
                  className="p-2 rounded-xl bg-zinc-800 text-zinc-300"
                  title="Audio Timer"
                >
                  {restTimer.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-lime-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
                <button
                  onClick={() => setRestTimer((prev) => ({ ...prev, isRunning: false, remaining: 0 }))}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
                >
                  Salta
                </button>
              </div>
            </div>

            {/* Controlli Rapidi Timer (-15s, +15s, 60s, 90s) */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => adjustRestTimer(-15)}
                className="py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-200 active:scale-95"
              >
                -15s
              </button>
              <button
                onClick={() => adjustRestTimer(15)}
                className="py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-lime-400 active:scale-95"
              >
                +15s
              </button>
              <button
                onClick={() => startRestTimer(60)}
                className="py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-cyan-400 active:scale-95"
              >
                60s
              </button>
              <button
                onClick={() => startRestTimer(90)}
                className="py-1.5 rounded-xl bg-zinc-800 text-xs font-bold text-cyan-400 active:scale-95"
              >
                90s
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALE INFO TECNICA ESERCIZIO
      ========================================== */}
      {selectedExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-lime-400/15 text-lime-400">
                  {selectedExerciseModal.category} • {selectedExerciseModal.type}
                </span>
                <h3 className="text-lg font-extrabold text-white mt-2">
                  {selectedExerciseModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExerciseModal(null)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-1.5">
              <div className="text-xs font-bold text-cyan-400">💡 Tecnica & Focus Esecuzione</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{selectedExerciseModal.tips}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400">Serie Consigliate</div>
                <div className="text-sm font-extrabold text-white">
                  {selectedExerciseModal.defaultSets}
                </div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400">Ripetizioni</div>
                <div className="text-sm font-extrabold text-lime-400">
                  {selectedExerciseModal.defaultReps}
                </div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400">Recupero</div>
                <div className="text-sm font-extrabold text-cyan-400">
                  {selectedExerciseModal.defaultRest}s
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedExerciseModal(null)}
              className="w-full py-3 rounded-2xl bg-lime-400 text-zinc-950 font-extrabold text-sm"
            >
              Ho Capito
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALE CREAZIONE / MODIFICA SCHEDA
      ========================================== */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">
                {editingRoutine.id ? 'Modifica Scheda' : 'Crea Nuova Scheda'}
              </h3>
              <button
                onClick={() => setEditingRoutine(null)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-400">Nome della Scheda</label>
                <input
                  type="text"
                  placeholder="Es. Giorno D: Spalle + Braccia + HIIT"
                  value={editingRoutine.name}
                  onChange={(e) =>
                    setEditingRoutine({ ...editingRoutine, name: e.target.value })
                  }
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400">Descrizione / Focus</label>
                <input
                  type="text"
                  placeholder="Es. Focus V-Shape + Circuito Addome"
                  value={editingRoutine.subtitle}
                  onChange={(e) =>
                    setEditingRoutine({ ...editingRoutine, subtitle: e.target.value })
                  }
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              {/* Esercizi attualmente nella scheda */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-lime-400">
                  Esercizi nella Scheda ({editingRoutine.exercises.length})
                </label>
                {editingRoutine.exercises.length === 0 ? (
                  <p className="text-xs text-zinc-500 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    Nessun esercizio aggiunto. Tocca un esercizio dalla lista in basso per inserirlo.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {editingRoutine.exercises.map((item, idx) => {
                      const details = getExerciseDetails(item.exerciseId);
                      return (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-bold text-white truncate flex-1">{details.name}</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={item.sets}
                              onChange={(e) => {
                                const updated = [...editingRoutine.exercises];
                                updated[idx] = { ...updated[idx], sets: Number(e.target.value) || 1 };
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="w-10 bg-zinc-900 border border-zinc-700 rounded text-center py-1 text-white font-bold"
                              title="Serie"
                            />
                            <span className="text-zinc-500">×</span>
                            <input
                              type="text"
                              value={item.reps}
                              onChange={(e) => {
                                const updated = [...editingRoutine.exercises];
                                updated[idx] = { ...updated[idx], reps: e.target.value };
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="w-14 bg-zinc-900 border border-zinc-700 rounded text-center py-1 text-white font-bold"
                              title="Ripetizioni"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editingRoutine.exercises.filter((_, i) => i !== idx);
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="p-1.5 text-rose-400 hover:bg-zinc-800 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Aggiungi rapida da libreria preimpostata */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-bold text-zinc-300">
                  Tocca per aggiungere un esercizio alla scheda:
                </label>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {EXERCISE_LIBRARY.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => {
                        setEditingRoutine({
                          ...editingRoutine,
                          exercises: [
                            ...editingRoutine.exercises,
                            {
                              exerciseId: ex.id,
                              sets: ex.defaultSets,
                              reps: ex.defaultReps,
                              rest: ex.defaultRest,
                              targetWeight: 20
                            }
                          ]
                        });
                      }}
                      className="w-full text-left bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{ex.name}</span>
                        <span className="ml-2 text-[10px] text-lime-400">({ex.category})</span>
                      </div>
                      <Plus className="w-4 h-4 text-lime-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRoutine(null)}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleSaveRoutine(editingRoutine)}
                className="flex-1 py-3 rounded-2xl bg-lime-400 text-zinc-950 font-black text-xs"
              >
                Salva Scheda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALE CONFERMA FINE ALLENAMENTO
      ========================================== */}
      {confirmEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-lime-400/15 text-lime-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Concludere l'allenamento?</h3>
              <p className="text-xs text-zinc-400">
                Salveremo i carichi sollevati, le calorie bruciate e aggiorneremo i tuoi record personali.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmEndModal(false)}
                className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Continua
              </button>
              <button
                onClick={finishAndSaveWorkout}
                className="flex-1 py-3 rounded-2xl bg-lime-400 text-zinc-950 font-black text-xs"
              >
                Salva Sessione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          BOTTOM NAVIGATION BAR (MOBILE THUMB-FRIENDLY)
      ========================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 px-3 py-2">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('schede')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition ${
              activeTab === 'schede' ? 'text-lime-400 bg-lime-400/10' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ListChecks className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-1">Schede</span>
          </button>

          <button
            onClick={() => setActiveTab('allenati')}
            className={`relative flex flex-col items-center justify-center py-2 rounded-2xl transition ${
              activeTab === 'allenati'
                ? 'text-lime-400 bg-lime-400/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeWorkout && (
              <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-lime-400 animate-ping" />
            )}
            <Dumbbell className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-1">Allenati</span>
          </button>

          <button
            onClick={() => setActiveTab('esercizi')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition ${
              activeTab === 'esercizi'
                ? 'text-lime-400 bg-lime-400/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-1">Esercizi</span>
          </button>

          <button
            onClick={() => setActiveTab('progressi')}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition ${
              activeTab === 'progressi'
                ? 'text-lime-400 bg-lime-400/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-1">Progressi</span>
          </button>
        </div>
      </nav>
    </div>
  );
}