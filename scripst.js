// ====== CONFIG & DATA ======
const questions = [
  {
    q: "Pelabuhan penting di masa lalu untuk perdagangan Jawa Timur adalah...",
    choices: ["Kediri","Banyuwangi","Madiun","Gresik"],
    answer: 3,
    explain: "Gresik merupakan pelabuhan penting sejarah Jawa Timur."
  },
  {
    q: "Ibukota kerajaan Majapahit adalah...",
    choices: ["Majapahit","Trowulan","Singhasari","Blitar"],
    answer: 1,
    explain: "Trowulan sering dikaitkan dengan pusat Majapahit."
  },
  // ... tambahkan sampai jumlah maksimal. Untuk demo kita pakai 10 soal.
  {
    q: "Siapakah tokoh proklamator Indonesia?",
    choices:["Sukarno","Soeharto","Sukarno-Hatta","Ahmad Yani"],
    answer: 2,
    explain: "Proklamator adalah Soekarno dan Hatta."
  },
  {
    q: "Gunung berapi di Jawa Timur yang terkenal adalah...",
    choices:["Bromo","Merapi","Semeru","Ijen"],
    answer: 2,
    explain: "Semeru adalah puncak tertinggi di Pulau Jawa."
  },
  {
    q: "Salah satu hasil bumi Jawa Timur adalah...",
    choices:["Beras","Kopi","Garam","Kelapa"],
    answer: 1,
    explain: "Kopi juga dihasilkan di beberapa daerah di Jawa Timur."
  },
  {
    q: "Salah satu seni tradisional Jawa Timur adalah...",
    choices:["Wayang","Reog","Kenthongan","Tari Remo"],
    answer: 3,
    explain: "Tari Remo populer di Jawa Timur."
  },
  {
    q: "Jalur perdagangan utama pada zaman kerajaan menggunakan...",
    choices:["Kereta Api","Jalan Raya","Jalur Laut","Telegraph"],
    answer: 2,
    explain: "Jalur laut penting untuk perdagangan antar pulau."
  },
  {
    q: "Salah satu kota pelabuhan di Jawa Timur era kolonial adalah...",
    choices:["Surabaya","Malang","Kediri","Madiun"],
    answer: 0,
    explain: "Surabaya adalah pelabuhan penting."
  },
  {
    q: "Era reformasi Indonesia terjadi pada tahun...",
    choices:["1997","1998","1999","2000"],
    answer: 1,
    explain: "Reformasi Indonesia dimulai pada 1998."
  },
  {
    q: "Bentuk pemerintahan RI setelah reformasi tetap...",
    choices:["Monarki","Republik","Kekaisaran","Federasi"],
    answer: 1,
    explain: "Indonesia tetap berbentuk republik."
  }
];

let state = {
  index: 0,
  score: 0,
  total: 10,
  timer: 20,
  interval: null,
  playing: false
};

// ====== DOM REFERENCES ======
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const timerEl = document.getElementById('timer');
const qTextEl = document.getElementById('questionText');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const qProgress = document.getElementById('qProgress');
const explainEl = document.getElementById('explain');
const leaderList = document.getElementById('leaderList');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const musicToggle = document.getElementById('musicToggle');
const bgMusic = document.getElementById('bgMusic');
const timerSelect = document.getElementById('timerSelect');
const countSelect = document.getElementById('countSelect');
const musicUrlInput = document.getElementById('musicUrl');

// ====== INITIAL SETUP ======
qTotalEl.textContent = state.total = parseInt(countSelect.value);
qIndexEl.textContent = state.index + 1;
timerEl.textContent = state.timer = parseInt(timerSelect.value);

// default music (lofi) — user can paste their own file URL in settings input
const DEFAULT_MUSIC = "https://cdn.jsdelivr.net/gh/anars/blank@master/blank.mp3";
bgMusic.src = DEFAULT_MUSIC;
bgMusic.volume = 0.25;
musicToggle.checked = true;

// simple beep generator for sfx
function beep(freq=440, duration=120, vol=0.07){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, duration);
  }catch(e){ console.warn("Audio error", e) }
}

// load leaderboard from localStorage
function loadLeaderboard(){
  let list = JSON.parse(localStorage.getItem('gq_leader')||'[]');
  if(!list.length){ leaderList.innerHTML = "<li><em>Belum ada skor tersimpan.</em></li>"; return; }
  leaderList.innerHTML = "";
  list.forEach((it,i)=>{
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${it.name} — ${it.score} pt`;
    leaderList.appendChild(li);
  });
}

// save a score
function saveScore(){
  const name = prompt("Simpan skor — Masukkan nama:");
  if(!name) return alert("Nama dibatalkan");
  const list = JSON.parse(localStorage.getItem('gq_leader')||'[]');
  list.push({name, score:state.score, date: new Date().toISOString()});
  list.sort((a,b)=>b.score-a.score);
  localStorage.setItem('gq_leader', JSON.stringify(list.slice(0,20)));
  loadLeaderboard();
}

// clear history
function clearHistory(){
  if(!confirm("Hapus semua skor leaderboard?")) return;
  localStorage.removeItem('gq_leader');
  loadLeaderboard();
}

// export leaderboard CSV
function exportLeaderboard(){
  const list = JSON.parse(localStorage.getItem('gq_leader')||'[]');
  if(!list.length) return alert("Tidak ada data untuk diexport");
  let csv = "Nama,Score,Date\n";
  list.forEach(l=> csv += `${l.name},${l.score},${l.date}\n`);
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leaderboard.csv'; a.click();
}

// reset leaderboard and state
resetBtn.addEventListener('click', ()=>{
  if(confirm("Reset skor & history?")){ localStorage.removeItem('gq_leader'); loadLeaderboard(); location.reload(); }
});

// export
exportBtn.addEventListener('click', exportLeaderboard);
saveScoreBtn.addEventListener('click', saveScore);
clearHistoryBtn.addEventListener('click', clearHistory);

// music toggle
musicToggle.addEventListener('change', ()=>{
  if(musicToggle.checked){ bgMusic.play().catch(()=>{}); } else { bgMusic.pause(); }
});

// update music URL input: set music
musicUrlInput.addEventListener('change', ()=>{
  const url = musicUrlInput.value.trim();
  if(url){ bgMusic.src = url; bgMusic.play().catch(()=>{}); }
});

// timer / count changes
timerSelect.addEventListener('change', ()=>{
  state.timer = parseInt(timerSelect.value);
  timerEl.textContent = state.timer;
});
countSelect.addEventListener('change', ()=>{
  state.total = parseInt(countSelect.value);
  qTotalEl.textContent = state.total;
  resetQuiz();
});

// skip button (acts like next but counts as 0)
skipBtn.addEventListener('click', ()=>{
  markAnswered(-1); // skip
});

// next button
nextBtn.addEventListener('click', ()=>{
  // next only if current question already answered or timed out
  if(!state.answered){ alert("Jawab dulu atau lewati soal."); return; }
  goNext();
});

// ====== QUIZ FLOW ======
function startTimer(){
  clearInterval(state.interval);
  state.remaining = state.timer;
  timerEl.textContent = state.remaining;
  state.interval = setInterval(()=>{
    state.remaining--;
    timerEl.textContent = state.remaining;
    if(state.remaining <= 0){
      clearInterval(state.interval);
      markAnswered(-1); // treat as wrong/skip
    }
  }, 1000);
}

function resetQuiz(){
  state.index = 0; state.score = 0; state.answered = false;
  qTotalEl.textContent = state.total;
  qIndexEl.textContent = state.index+1;
  qProgress.value = 0;
  explainEl.textContent = "Penjelasan akan muncul di sini.";
  loadQuestion();
}

function loadQuestion(){
  // pick current question (wrap or shuffle simple)
  const idx = state.index % questions.length;
  const item = questions[idx];
  qTextEl.textContent = item.q;
  answersEl.innerHTML = "";
  item.choices.forEach((c,i)=>{
    const btn = document.createElement('button');
    btn.className = "answer-btn";
    btn.innerText = c;
    btn.dataset.idx = i;
    btn.addEventListener('click', ()=>selectAnswer(i));
    answersEl.appendChild(btn);
  });
  qIndexEl.textContent = state.index+1;
  qProgress.value = Math.round((state.index / state.total) * 100);
  state.answered = false;
  explainEl.textContent = "Penjelasan akan muncul di sini.";
  // start timer
  startTimer();
  // sound hint
  beep(600,80,0.04);
}

function selectAnswer(chosen){
  if(state.answered) return;
  state.answered = true;
  clearInterval(state.interval);
  const idx = state.index % questions.length;
  const item = questions[idx];
  const buttons = answersEl.querySelectorAll('button');
  buttons.forEach(b=>{
    const i = parseInt(b.dataset.idx);
    if(i === item.answer){
      b.classList.add('correct');
    }
    if(i === chosen && i !== item.answer){
      b.classList.add('wrong');
    }
    b.disabled = true;
  });

  // correct?
  if(chosen === item.answer){
    state.score += 10;
    explainEl.textContent = "Benar! " + item.explain;
    beep(880,120,0.06);
  } else {
    explainEl.textContent = "Salah. " + item.explain;
    beep(220,180,0.08);
  }
  // enable next
}

function markAnswered(chosen){
  // treat as skip/wrong
  if(state.answered) { goNext(); return; }
  state.answered = true;
  clearInterval(state.interval);
  explainEl.textContent = "Waktu habis / dilewati. " + (questions[state.index % questions.length].explain || "");
  beep(220,180,0.06);
}

function goNext(){
  state.index++;
  if(state.index >= state.total){
    finishQuiz();
    return;
  }
  loadQuestion();
}

function finishQuiz(){
  clearInterval(state.interval);
  qProgress.value = 100;
  // show final / enable save
  alert(`Sesi selesai! Skor: ${state.score}`);
  // automatically show summary in explanation box
  explainEl.textContent = `Selesai — Skor: ${state.score}. Simpan skor di leaderboard jika mau.`;
}

// ====== INIT ======
loadLeaderboard();
resetQuiz();
if(musicToggle.checked) bgMusic.play().catch(()=>{});
