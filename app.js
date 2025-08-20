let ELEMENTS = [];
let FACTS = [];
let MNEMO = [];
let LANG = localStorage.getItem("lang") || "en";
const $ = (q)=>document.querySelector(q);

const I18N = {
  en: {
    table_title: "Periodic Table",
    quiz_title: "Quiz",
    fun_title: "Fun Facts",
    mnemo_title: "Mnemonics",
    search_placeholder: "Search name, symbol or number",
    details: "Details",
    number: "Atomic Number",
    group: "Group",
    period: "Period",
    category: "Category",
    mass: "Atomic Mass",
    ok: "OK",
    start: "Start",
    next: "Next",
    correct: "Correct!",
    wrong: "Wrong. Correct answer: ",
    no_result: "No results."
  },
  bn: {
    table_title: "পর্যায় সারণী",
    quiz_title: "কুইজ",
    fun_title: "মজার তথ্য",
    mnemo_title: "Mnemonics",
    search_placeholder: "নাম, চিহ্ন বা নম্বর লিখে সার্চ করুন",
    details: "বিস্তারিত",
    number: "পারমাণবিক সংখ্যা",
    group: "গ্রুপ",
    period: "পিরিয়ড",
    category: "ক্যাটাগরি",
    mass: "পারমাণবিক ভর",
    ok: "ঠিক আছে",
    start: "শুরু",
    next: "পরের প্রশ্ন",
    correct: "সঠিক!",
    wrong: "ভুল। সঠিক উত্তর: ",
    no_result: "কিছু পাওয়া যায়নি।"
  }
};

function t(key){ return I18N[LANG][key] || key; }
function enbn(obj, key){ return obj[`${key}_${LANG}`] ?? obj[`${key}_en`]; }

function applyLangLabels(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  $("#search").placeholder = t("search_placeholder");
  $("#quiz-start").textContent = t("start");
}

async function loadAll(){
  ELEMENTS = await (await fetch("elements_118.json")).json();
  FACTS = await (await fetch("facts.json")).json();
  MNEMO = await (await fetch("mnemonics.json")).json();
  applyLangLabels();
  renderTable(ELEMENTS);
  renderMnemonics(MNEMO);
  showRandomFact();
}

function renderTable(data){
  const container = $("#table");
  container.innerHTML = "";
  for(let p=1; p<=7; p++){
    const row = document.createElement("div");
    row.className = "grid gap-1 mb-1 bg-white p-1 rounded border";
    row.style.gridTemplateColumns = "repeat(18,minmax(0,1fr))";
    for(let i=0;i<18;i++){
      const ph = document.createElement("div");
      ph.className = "h-14 rounded bg-slate-100";
      row.appendChild(ph);
    }
    data.filter(e => e.period===p && Number.isInteger(e.group)).forEach(e=>{
      const cell = makeCell(e);
      cell.style.gridColumn = String(e.group);
      row.replaceChild(cell, row.children[e.group-1]);
    });
    container.appendChild(row);
  }
  const lan = data.filter(e => String(e.group).toLowerCase()==="lanthanide");
  const act = data.filter(e => String(e.group).toLowerCase()==="actinide");
  const listRow = document.createElement("div");
  listRow.className = "mt-3 grid md:grid-cols-2 gap-3";
  listRow.appendChild(makeSeries("Lanthanides", lan));
  listRow.appendChild(makeSeries("Actinides", act));
  container.appendChild(listRow);
}

function makeSeries(title, arr){
  const wrap = document.createElement("div");
  wrap.className = "p-2 rounded border bg-white";
  const h = document.createElement("div");
  h.className = "text-sm font-semibold mb-2";
  h.textContent = title;
  wrap.appendChild(h);
  const row = document.createElement("div");
  row.className = "grid grid-cols-8 gap-1";
  arr.forEach(e=> row.appendChild(makeCell(e)));
  wrap.appendChild(row);
  return wrap;
}

function makeCell(e){
  const btn = document.createElement("button");
  const cat = e[`category_${LANG}`] || e.category_en;
  let color = "bg-slate-200";
  if(cat.toLowerCase().includes("alkali")) color = "bg-rose-200";
  else if(cat.toLowerCase().includes("alkaline")) color = "bg-orange-200";
  else if(cat.toLowerCase().includes("noble")) color = "bg-violet-200";
  else if(cat.toLowerCase().includes("halogen")) color = "bg-green-200";
  else if(cat.toLowerCase().includes("metalloid")) color = "bg-yellow-200";
  else if(cat.toLowerCase().includes("transition")) color = "bg-blue-200";
  else if(cat.toLowerCase().includes("lanthanide")) color = "bg-amber-200";
  else if(cat.toLowerCase().includes("actinide")) color = "bg-lime-200";
  btn.className = `${color} hover:brightness-95 h-14 w-full rounded p-1 flex flex-col items-start text-left`;
  btn.title = `${enbn(e,"name")} (#${e.number})`;
  btn.innerHTML = `
    <span class="text-[10px] opacity-80">#${e.number}</span>
    <span class="text-base font-semibold leading-none">${e.symbol}</span>
    <span class="text-[10px] truncate">${enbn(e,"name")}</span>
  `;
  btn.addEventListener("click", ()=> openModal(e));
  return btn;
}

function openModal(e){
  $("#modal-title").textContent = `${enbn(e,"name")} (${e.symbol})`;
  const body = $("#modal-body");
  const fact = FACTS.find(f=>f.symbol===e.symbol) || FACTS[Math.floor(Math.random()*FACTS.length)];
  const groupStr = (Number.isInteger(e.group) ? e.group : String(e.group));
  body.innerHTML = `
    <div><b>${t("number")}:</b> ${e.number}</div>
    <div><b>${t("group")}:</b> ${groupStr}</div>
    <div><b>${t("period")}:</b> ${e.period}</div>
    <div><b>${t("category")}:</b> ${e[`category_${LANG}`] || e.category_en}</div>
    <div><b>${t("mass")}:</b> ${e.atomic_mass || "—"}</div>
    <hr class="my-2"/>
    <div class="text-sm opacity-80">${LANG==="bn"?fact.bn:fact.en}</div>
  `;
  $("#modal").classList.remove("hidden","opacity-0");
  $("#modal").classList.add("flex");
}

function closeModal(){
  $("#modal").classList.add("hidden");
  $("#modal").classList.remove("flex");
}

$("#modal-close").addEventListener("click", closeModal);
$("#modal").addEventListener("click", (e)=>{
  if(e.target.id==="modal") closeModal();
});

$("#search").addEventListener("input", e=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q){ renderTable(ELEMENTS); $("#results-count").textContent=""; return; }
  const filtered = ELEMENTS.filter(el=>{
    return el.symbol.toLowerCase().includes(q) ||
      String(el.number)===q ||
      el.name_en.toLowerCase().includes(q) ||
      (el.name_bn && el.name_bn.toLowerCase().includes(q));
  });
  renderTable(filtered);
  $("#results-count").textContent = filtered.length ? `${filtered.length} found` : t("no_result");
});

let quiz = null;
$("#quiz-start").addEventListener("click", ()=>{
  const type = $("#quiz-type").value;
  quiz = makeQuiz(type);
  $("#quiz-box").classList.remove("hidden");
  renderQuiz();
});

function makeQuiz(type){
  const pool = [...ELEMENTS];
  return { type, i:0, score:0, questions: shuffle(pool).slice(0,10) };
}
function renderQuiz(){
  const box = $("#quiz-box");
  const q = quiz.questions[quiz.i];
  const type = quiz.type;
  let question = "";
  let correct = "";
  let options = [];
  if(type==="name_to_symbol"){ question = `${enbn(q,"name")} → ?`; correct = q.symbol; options = distractors("symbol",correct); }
  if(type==="symbol_to_name"){ question = `${q.symbol} → ?`; correct = enbn(q,"name"); options = distractorsName(q); }
  if(type==="number_to_name"){ question = `#${q.number} → ?`; correct = enbn(q,"name"); options = distractorsName(q); }
  if(type==="name_to_number"){ question = `${enbn(q,"name")} → ?`; correct = String(q.number); options = distractors("number",correct); }
  options.push(correct);
  options = shuffle(options).slice(0,4);

  box.innerHTML = `
    <div class="mb-2"><b>Q${quiz.i+1}/10</b> • ${question}</div>
    <div class="grid grid-cols-2 gap-2">
      ${options.map((opt)=>`<button data-ans="${escapeHtml(String(opt))}" class="ans px-3 py-2 rounded border hover:bg-slate-50">${opt}</button>`).join("")}
    </div>
    <div class="mt-3 text-sm opacity-80" id="quiz-msg"></div>
  `;
  box.querySelectorAll(".ans").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const pick = btn.getAttribute("data-ans");
      const ok = normalize(pick)===normalize(String(correct));
      $("#quiz-msg").textContent = ok ? t("correct") : (t("wrong")+correct);
      if(ok) quiz.score++;
      setTimeout(()=>{
        quiz.i++;
        if(quiz.i>=quiz.questions.length){
          $("#quiz-box").innerHTML = `<div class="text-center">Score: ${quiz.score}/${quiz.questions.length}</div>`;
          $("#quiz-status").textContent = `Score: ${quiz.score}`;
        } else {
          renderQuiz();
        }
      },700);
    });
  });
}

function distractors(field, correct){
  const pool = Array.from(new Set(ELEMENTS.map(e=>String(e[field])))).filter(v=>normalize(v)!==normalize(String(correct)));
  return shuffle(pool).slice(0,8);
}
function distractorsName(q){
  const pool = ELEMENTS.filter(e=>e.symbol!==q.symbol).map(e=>enbn(e,"name"));
  return shuffle(pool).slice(0,8);
}
function shuffle(a){ return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]); }
function normalize(s){ return String(s).trim().toLowerCase(); }
function escapeHtml(s){ return s.replace(/[&<>'"]/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;" }[c])); }

function showRandomFact(){
  const fact = FACTS[Math.floor(Math.random()*FACTS.length)];
  $("#fun-fact").textContent = LANG==="bn" ? fact.bn : fact.en;
}

function renderMnemonics(list){
  const wrap = $("#mnemonics");
  wrap.innerHTML = "";
  list.forEach(m=>{
    const card = document.createElement("div");
    card.className = "p-3 rounded border bg-white";
    card.innerHTML = `<div class="text-sm opacity-70">Group ${m.group}</div><div>${LANG==="bn"?m.bn:m.en}</div>`;
    wrap.appendChild(card);
  });
}

$("#theme-toggle").addEventListener("click", ()=>{
  document.documentElement.classList.toggle("dark");
  document.body.classList.toggle("bg-slate-900");
  document.body.classList.toggle("text-slate-100");
});

$("#lang-en").addEventListener("click", ()=>{ LANG="en"; localStorage.setItem("lang","en"); applyLangLabels(); renderTable(ELEMENTS); renderMnemonics(MNEMO); showRandomFact(); });
$("#lang-bn").addEventListener("click", ()=>{ LANG="bn"; localStorage.setItem("lang","bn"); applyLangLabels(); renderTable(ELEMENTS); renderMnemonics(MNEMO); showRandomFact(); });

loadAll();
