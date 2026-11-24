
let selectedDate = todayKey();
let calendarDate = new Date();
let currentResult = null;

function todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatDate(date){
  return new Date(date+"T12:00:00").toLocaleDateString("id-ID",{
    day:"numeric",month:"long",year:"numeric"
  });
}

function getData(key){
  try{
    return JSON.parse(localStorage.getItem(key)||"[]");
  }catch{
    return [];
  }
}

function saveData(key,data){
  localStorage.setItem(key,JSON.stringify(data));
}

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",
    '"':"&quot;","'":"&#39;"
  }[c]));
}

// MASUK
function enterApp(){
  const intro=document.getElementById("intro");
  intro.style.opacity="0";

  setTimeout(()=>{
    intro.style.display="none";
    document.getElementById("app").style.display="block";
  },800);
}

// NAVIGASI
function showPage(id,button){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));

  if(button){
    button.classList.add("active");
  }else{
    const target=document.querySelector(
      `.nav-btn[onclick*="'${id}'"]`
    );
    if(target)target.classList.add("active");
  }

  const titles={
    home:"Beranda",
    diary:"Diary Harian",
    checkup:"Pemeriksaan Kondisi",
    health:"Pusat Kesehatan",
    history:"Riwayat"
  };

  document.getElementById("pageTitle").textContent=titles[id];

  if(id==="diary")renderCalendar();
  if(id==="history")renderHistory();
}

// DASHBOARD
function updateDashboard(){
  const today=todayKey();

  document.getElementById("today").textContent=formatDate(today);
  document.getElementById("homeDate").textContent=new Date().getDate();
  document.getElementById("diaryCount").textContent=getData("berryDiary").length;
  document.getElementById("checkCount").textContent=getData("berryChecks").length;
}

// KALENDER
function changeMonth(amount){
  calendarDate.setMonth(calendarDate.getMonth()+amount);
  renderCalendar();
}

function renderCalendar(){
  const year=calendarDate.getFullYear();
  const month=calendarDate.getMonth();

  document.getElementById("monthTitle").textContent=
    calendarDate.toLocaleDateString("id-ID",{month:"long",year:"numeric"});

  const firstDay=new Date(year,month,1).getDay();
  const totalDays=new Date(year,month+1,0).getDate();

  const entries=getData("berryDiary");
  const dates=new Set(entries.map(item=>item.date));

  let html="";

  for(let i=0;i<firstDay;i++)html+="<span></span>";

  for(let day=1;day<=totalDays;day++){
    const date=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    const classes=["calendar-day"];

    if(date===selectedDate)classes.push("selected");
    if(date===todayKey())classes.push("today");
    if(dates.has(date))classes.push("has-entry");

    html+=`
      <button class="${classes.join(" ")}" onclick="selectDate('${date}')">
        ${day}
      </button>
    `;
  }

  document.getElementById("calendarGrid").innerHTML=html;

  updateEditor();
  renderDiaryList();
}

function selectDate(date){
  selectedDate=date;

  const parts=date.split("-");
  calendarDate=new Date(Number(parts[0]),Number(parts[1])-1,1);

  renderCalendar();
}

function updateEditor(){
  const parts=selectedDate.split("-");

  document.getElementById("selectedDate").textContent=formatDate(selectedDate);
  document.getElementById("dateNumber").textContent=Number(parts[2]);

  const entry=getData("berryDiary").find(item=>item.date===selectedDate);

  document.getElementById("diaryTitle").value=entry?entry.title:"";
  document.getElementById("diaryText").value=entry?entry.content:"";

  document.getElementById("diaryMessage").textContent=
    entry?"Catatan tanggal ini sudah tersimpan.":"Belum ada catatan pada tanggal ini.";
}

// BERSIHKAN FORM
function clearEditor(){
  document.getElementById("diaryTitle").value="";
  document.getElementById("diaryText").value="";
}

// SIMPAN DIARY
function saveDiary(){
  const title=document.getElementById("diaryTitle").value.trim();
  const content=document.getElementById("diaryText").value.trim();

  if(!title||!content){
    alert("Isi judul dan cerita terlebih dahulu.");
    return;
  }

  let data=getData("berryDiary");

  const index=data.findIndex(item=>item.date===selectedDate);

  const entry={
    date:selectedDate,
    title,
    content
  };

  if(index>=0)data[index]=entry;
  else data.push(entry);

  data.sort((a,b)=>b.date.localeCompare(a.date));

  saveData("berryDiary",data);

  renderCalendar();
  updateDashboard();

  document.getElementById("diaryMessage").textContent=
    "Catatan berhasil disimpan.";
}

// LIST DIARY
function renderDiaryList(){
  const data=getData("berryDiary").sort(
    (a,b)=>b.date.localeCompare(a.date)
  );

  const container=document.getElementById("diaryList");

  if(!data.length){
    container.innerHTML='<div class="empty-state">Belum ada cerita yang disimpan.</div>';
    return;
  }

  container.innerHTML=data.map(item=>`
    <div class="record">
      <small>${formatDate(item.date)}</small>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.content)}</p>
      <button class="delete-btn" onclick="deleteDiary('${item.date}')">Hapus catatan</button>
    </div>
  `).join("");
}

function deleteDiary(date){
  if(!confirm("Hapus catatan ini?"))return;

  const data=getData("berryDiary").filter(item=>item.date!==date);
  saveData("berryDiary",data);

  renderCalendar();
  updateDashboard();
}

// PEMERIKSAAN
function runCheckup(){
  const symptom=document.getElementById("symptom").value;
  const duration=document.getElementById("duration").value;
  const sleep=document.getElementById("sleep").value;
  const food=document.getElementById("food").value;
  const feeling=document.getElementById("feeling").value;
  const extra=document.getElementById("extra").value.trim();

  if(!symptom||!duration||!sleep||!food||!feeling){
    alert("Lengkapi seluruh pertanyaan terlebih dahulu.");
    return;
  }

  const guidance={
    lelah:{
      title:"Perhatian terhadap rasa lelah",
      explanation:"Rasa lelah bisa berkaitan dengan kurang istirahat, aktivitas, pola makan, stres, atau kondisi kesehatan lain.",
      advice:["Usahakan tidur secara teratur.","Penuhi kebutuhan makan dan minum.","Berikan waktu untuk beristirahat.","Konsultasikan jika keluhan menetap atau memburuk."]
    },
    pusing:{
      title:"Perhatian terhadap sakit kepala",
      explanation:"Pusing atau sakit kepala dapat memiliki berbagai penyebab dan tidak bisa dipastikan melalui formulir ini.",
      advice:["Beristirahat di tempat nyaman.","Minum air putih.","Jangan melewatkan waktu makan.","Periksakan diri jika keluhan berulang atau berat."]
    },
    tidur:{
      title:"Perhatian terhadap pola tidur",
      explanation:"Gangguan tidur dapat berkaitan dengan kebiasaan, lingkungan, aktivitas, maupun keadaan emosional.",
      advice:["Buat jadwal tidur konsisten.","Kurangi layar sebelum tidur.","Ciptakan suasana kamar nyaman.","Remaja umumnya membutuhkan 8–10 jam tidur."]
    },
    cemas:{
      title:"Perhatian terhadap kecemasan",
      explanation:"Rasa cemas dapat muncul dalam berbagai situasi. Jawaban ini tidak cukup untuk menentukan gangguan kecemasan.",
      advice:["Ceritakan perasaan kepada orang tepercaya.","Coba bernapas secara perlahan.","Luangkan waktu untuk beristirahat.","Pertimbangkan konsultasi psikolog."]
    },
    sedih:{
      title:"Perhatian terhadap suasana hati",
      explanation:"Perasaan sedih adalah pengalaman manusia. Jika berlangsung lama atau mengganggu aktivitas, dukungan profesional dapat membantu.",
      advice:["Jangan memendam perasaan sendirian.","Bicarakan dengan orang tepercaya.","Pertahankan rutinitas makan dan tidur.","Cari dukungan psikolog jika diperlukan."]
    },
    sulit:{
      title:"Perhatian terhadap konsentrasi",
      explanation:"Kesulitan berkonsentrasi dapat berkaitan dengan kelelahan, kurang tidur, stres, atau berbagai kondisi lainnya.",
      advice:["Bagi pekerjaan menjadi bagian kecil.","Berikan jeda saat belajar.","Perhatikan kualitas tidur.","Cari bantuan jika kesulitan terus berlangsung."]
    },
    nafsu:{
      title:"Perhatian terhadap pola makan",
      explanation:"Perubahan nafsu makan dapat berkaitan dengan kondisi fisik, kebiasaan, dan keadaan emosional.",
      advice:["Usahakan jadwal makan teratur.","Pilih makanan beragam dan bergizi.","Perhatikan perubahan pola makan.","Konsultasikan jika perubahan berlanjut."]
    },
    lainnya:{
      title:"Perhatian terhadap keluhan",
      explanation:"Keluhan kesehatan memerlukan penilaian langsung untuk mengetahui penyebabnya.",
      advice:["Catat kapan keluhan muncul.","Perhatikan perubahan kondisi.","Jaga pola makan dan istirahat.","Konsultasikan kepada dokter."]
    }
  };

  const info=guidance[symptom];

  const sleepAdvice={
    "Baik dan cukup":"Pertahankan kebiasaan tidur yang baik.",
    "Kadang terganggu":"Coba jadwal tidur yang konsisten.",
    "Sering kesulitan tidur":"Perhatikan pola tidur dan konsultasikan jika berlanjut.",
    "Tidak merasa segar saat bangun":"Perhatikan durasi serta kualitas tidur."
  };

  const foodAdvice={
    "Teratur":"Pertahankan pola makan seimbang.",
    "Kadang terlambat":"Usahakan jadwal makan lebih teratur.",
    "Sering melewatkan waktu makan":"Cobalah menyediakan waktu untuk makan.",
    "Nafsu makan berubah":"Perhatikan perubahan nafsu makan dan konsultasikan jika berlanjut."
  };

  const result=document.getElementById("result");

  result.style.display="block";

  result.innerHTML=`
    <span class="eyebrow">HASIL CATATAN KONDISI</span>
    <h2>${info.title}</h2>
    <p>${info.explanation}</p>

    <h3 style="margin-top:20px">Saran perawatan</h3>
    <ul>${info.advice.map(a=>`<li>${a}</li>`).join("")}</ul>

    <h3 style="margin-top:20px">Perhatian pola hidup</h3>
    <p><b>Kualitas tidur:</b> ${escapeHTML(sleepAdvice[sleep])}</p>
    <p><b>Pola makan:</b> ${escapeHTML(foodAdvice[food])}</p>
    <p><b>Keadaan emosional:</b> ${escapeHTML(feeling)}</p>
    <p><b>Durasi keluhan:</b> ${escapeHTML(duration)}</p>
    ${extra?`<p><b>Catatan tambahan:</b> ${escapeHTML(extra)}</p>`:""}

    <div class="medical-notice">
      <h3>Informasi medis</h3>
      <p>Hasil ini merupakan edukasi berdasarkan jawaban, bukan diagnosis penyakit atau resep obat. Jika keluhan menetap, memburuk, atau mengganggu kegiatan, konsultasikan kepada tenaga kesehatan.</p>
    </div>

    <button class="primary-button" onclick="saveCheckup()">Simpan Pemeriksaan</button>
  `;

  currentResult={
    title:info.title,
    symptom,duration,sleep,food,feeling,extra,
    date:todayKey(),
    time:new Date().toLocaleTimeString("id-ID")
  };

  result.scrollIntoView({behavior:"smooth"});
}

// SIMPAN PEMERIKSAAN
function saveCheckup(){
  if(!currentResult){
    alert("Lakukan pemeriksaan terlebih dahulu.");
    return;
  }

  const data=getData("berryChecks");

  data.unshift(currentResult);
  saveData("berryChecks",data);

  currentResult=null;
  updateDashboard();
  renderHistory();

  alert("Pemeriksaan berhasil disimpan.");
}

// RIWAYAT
function renderHistory(){
  const data=getData("berryChecks");
  const container=document.getElementById("historyList");

  if(!data.length){
    container.innerHTML='<div class="empty-state">Belum ada riwayat pemeriksaan.</div>';
    return;
  }

  container.innerHTML=data.map((item,index)=>`
    <div class="record">
      <small>${formatDate(item.date)} · ${escapeHTML(item.time)}</small>
      <h3>${escapeHTML(item.title)}</h3>
      <p>Keluhan: ${escapeHTML(item.symptom)}</p>
      <p>Durasi: ${escapeHTML(item.duration)}</p>
      <p>Tidur: ${escapeHTML(item.sleep)}</p>
      <p>Pola makan: ${escapeHTML(item.food)}</p>
      <p>Keadaan emosional: ${escapeHTML(item.feeling)}</p>
      <button class="delete-btn" onclick="deleteHistory(${index})">Hapus riwayat</button>
    </div>
  `).join("");
}

function deleteHistory(index){
  if(!confirm("Hapus riwayat pemeriksaan?"))return;

  const data=getData("berryChecks");
  data.splice(index,1);
  saveData("berryChecks",data);

  renderHistory();
  updateDashboard();
}

// INISIALISASI
updateDashboard();
renderCalendar();
renderDiaryList();
renderHistory();
