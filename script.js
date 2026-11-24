
let selectedDate = getToday();
let calendarDate = new Date();
let currentSymptom = "";

// FORMAT TANGGAL
function getToday(){
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth()+1).padStart(2,"0"),
    String(d.getDate()).padStart(2,"0")
  ].join("-");
}

function formatDate(date){
  return new Date(date+"T12:00:00").toLocaleDateString("id-ID",{
    day:"numeric",
    month:"long",
    year:"numeric"
  });
}

function getData(key){
  try {
    return JSON.parse(localStorage.getItem(key)||"[]");
  } catch {
    return [];
  }
}

function saveData(key,data){
  localStorage.setItem(key,JSON.stringify(data));
}

// MASUK WEBSITE
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
  document.querySelectorAll(".page").forEach(page=>{
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.classList.remove("active");
  });

  if(button){
    button.classList.add("active");
  }else{
    const nav=document.querySelector(
      `.nav-btn[onclick*="'${id}'"]`
    );
    if(nav) nav.classList.add("active");
  }

  const titles={
    home:"Beranda",
    diary:"Diary Harian",
    checkup:"Pemeriksaan Kondisi",
    health:"Perhatian Kesehatan",
    history:"Riwayat Pemeriksaan"
  };

  document.getElementById("pageTitle").textContent=titles[id];

  if(id==="diary") renderCalendar();
  if(id==="history") renderHistory();
}

// DASHBOARD
function updateDashboard(){
  const today=getToday();

  document.getElementById("today").textContent=
    formatDate(today);

  document.getElementById("homeDate").textContent=
    new Date().getDate();

  document.getElementById("diaryCount").textContent=
    getData("berryDiary").length;

  document.getElementById("checkCount").textContent=
    getData("berryChecks").length;
}

// KALENDER DIARY
function changeMonth(amount){
  calendarDate.setMonth(calendarDate.getMonth()+amount);
  renderCalendar();
}

function renderCalendar(){
  const year=calendarDate.getFullYear();
  const month=calendarDate.getMonth();

  document.getElementById("monthTitle").textContent=
    calendarDate.toLocaleDateString("id-ID",{
      month:"long",
      year:"numeric"
    });

  const firstDay=new Date(year,month,1).getDay();
  const totalDays=new Date(year,month+1,0).getDate();

  const entries=getData("berryDiary");
  const savedDates=new Set(entries.map(item=>item.date));

  let html="";

  for(let i=0;i<firstDay;i++){
    html+="<span></span>";
  }

  for(let day=1;day<=totalDays;day++){
    const date=[
      year,
      String(month+1).padStart(2,"0"),
      String(day).padStart(2,"0")
    ].join("-");

    let classes=["calendar-day"];

    if(date===selectedDate) classes.push("selected");
    if(date===getToday()) classes.push("today");
    if(savedDates.has(date)) classes.push("has-entry");

    html+=`
      <button
        class="${classes.join(" ")}"
        onclick="selectDate('${date}')">
        ${day}
      </button>
    `;
  }

  document.getElementById("calendarGrid").innerHTML=html;

  updateSelectedDate();
  renderDiaryList();
}

function selectDate(date){
  selectedDate=date;

  const parts=date.split("-");
  calendarDate=new Date(
    Number(parts[0]),
    Number(parts[1])-1,
    1
  );

  renderCalendar();
}

function updateSelectedDate(){
  const parts=selectedDate.split("-");

  document.getElementById("selectedDate").textContent=
    formatDate(selectedDate);

  document.getElementById("dateNumber").textContent=
    Number(parts[2]);

  const entries=getData("berryDiary");

  const entry=entries.find(item=>item.date===selectedDate);

  document.getElementById("diaryTitle").value=
    entry ? entry.title : "";

  document.getElementById("diaryText").value=
    entry ? entry.content : "";

  document.getElementById("diaryMessage").textContent=
    entry ? "Catatan pada tanggal ini sudah tersedia." :
    "Belum ada cerita pada tanggal ini.";
}

// SIMPAN DIARY
function saveDiary(){
  const title=document.getElementById("diaryTitle").value.trim();
  const content=document.getElementById("diaryText").value.trim();

  if(!title||!content){
    alert("Silakan isi judul dan cerita terlebih dahulu.");
    return;
  }

  let data=getData("berryDiary");

  const existing=data.findIndex(item=>item.date===selectedDate);

  const newEntry={
    date:selectedDate,
    title:title,
    content:content,
    updated:new Date().toLocaleString("id-ID")
  };

  if(existing>=0){
    data[existing]=newEntry;
  }else{
    data.push(newEntry);
  }

  data.sort((a,b)=>b.date.localeCompare(a.date));

  saveData("berryDiary",data);

  renderCalendar();
  updateDashboard();

  document.getElementById("diaryMessage").textContent=
    "Catatan berhasil disimpan.";

  alert("Diary berhasil disimpan.");
}

// DAFTAR DIARY
function renderDiaryList(){
  const data=getData("berryDiary").sort(
    (a,b)=>b.date.localeCompare(a.date)
  );

  const container=document.getElementById("diaryList");

  if(!data.length){
    container.innerHTML=
      '<div class="empty-state">Belum ada catatan diary. Pilih tanggal untuk mulai menulis.</div>';
    return;
  }

  container.innerHTML=data.map(item=>`
    <div class="record">
      <small>${formatDate(item.date)}</small>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.content)}</p>
      <button class="delete-btn"
        onclick="deleteDiary('${item.date}')">
        Hapus catatan
      </button>
    </div>
  `).join("");
}

function deleteDiary(date){
  if(!confirm("Apakah kamu ingin menghapus catatan ini?")) return;

  let data=getData("berryDiary");
  data=data.filter(item=>item.date!==date);

  saveData("berryDiary",data);

  renderCalendar();
  updateDashboard();
}

// PEMERIKSAAN KONDISI
function runCheckup(){
  const symptom=document.getElementById("symptom").value;
  const duration=document.getElementById("duration").value;
  const sleep=document.getElementById("sleep").value;
  const food=document.getElementById("food").value;
  const feeling=document.getElementById("feeling").value;
  const extra=document.getElementById("extra").value.trim();

  if(!symptom||!duration||!sleep||!food||!feeling){
    alert("Silakan lengkapi seluruh pertanyaan pemeriksaan.");
    return;
  }

  const guidance={
    lelah:{
      title:"Perhatian terhadap rasa lelah",
      explanation:"Rasa lelah dapat berkaitan dengan kurang istirahat, aktivitas yang padat, pola makan, stres, atau kondisi kesehatan lainnya.",
      advice:[
        "Usahakan tidur dengan jadwal teratur.",
        "Makan dengan gizi seimbang.",
        "Minum air putih secara cukup.",
        "Kurangi aktivitas berlebihan dan berikan waktu istirahat."
      ]
    },
    pusing:{
      title:"Perhatian terhadap keluhan pusing",
      explanation:"Pusing atau sakit kepala dapat memiliki berbagai penyebab. Catatan ini belum dapat menentukan penyebab medisnya.",
      advice:[
        "Beristirahat di tempat yang nyaman.",
        "Minum air putih.",
        "Jangan melewatkan waktu makan.",
        "Perhatikan apakah keluhan muncul berulang."
      ]
    },
    tidur:{
      title:"Perhatian terhadap pola tidur",
      explanation:"Gangguan tidur dapat berkaitan dengan kebiasaan tidur, aktivitas, lingkungan, atau kondisi emosional.",
      advice:[
        "Usahakan jadwal tidur yang konsisten.",
        "Kurangi penggunaan layar menjelang tidur.",
        "Buat suasana kamar nyaman.",
        "Remaja umumnya membutuhkan 8–10 jam tidur."
      ]
    },
    cemas:{
      title:"Perhatian terhadap perasaan cemas",
      explanation:"Rasa cemas bisa muncul karena berbagai situasi dan tidak otomatis berarti seseorang mengalami gangguan kecemasan.",
      advice:[
        "Ceritakan perasaan kepada orang tepercaya.",
        "Coba latihan pernapasan secara perlahan.",
        "Berikan waktu untuk beristirahat.",
        "Pertimbangkan konsultasi dengan psikolog jika mengganggu aktivitas."
      ]
    },
    sedih:{
      title:"Perhatian terhadap suasana hati",
      explanation:"Perasaan sedih merupakan bagian dari pengalaman manusia. Jika berlangsung lama atau mengganggu kehidupan sehari-hari, dukungan profesional dapat membantu.",
      advice:[
        "Jangan memendam perasaan sendirian.",
        "Berbicaralah dengan orang yang dipercaya.",
        "Jaga pola makan dan tidur.",
        "Pertimbangkan konsultasi dengan psikolog."
      ]
    },
    sulit:{
      title:"Perhatian terhadap konsentrasi",
      explanation:"Kesulitan berkonsentrasi dapat berkaitan dengan kurang tidur, kelelahan, stres, atau berbagai kondisi lainnya.",
      advice:[
        "Bagi pekerjaan menjadi bagian kecil.",
        "Berikan jeda saat belajar.",
        "Perhatikan kualitas tidur.",
        "Kurangi gangguan ketika mengerjakan sesuatu."
      ]
    },
    nafsu:{
      title:"Perhatian terhadap pola makan",
      explanation:"Perubahan nafsu makan dapat dipengaruhi oleh kondisi fisik, aktivitas, kebiasaan, maupun keadaan emosional.",
      advice:[
        "Usahakan waktu makan teratur.",
        "Pilih makanan yang beragam dan bergizi.",
        "Perhatikan perubahan pola makan.",
        "Konsultasikan kepada dokter jika perubahan berlanjut."
      ]
    },
    lainnya:{
      title:"Perhatian terhadap keluhan",
      explanation:"Keluhan yang kamu rasakan perlu dipahami berdasarkan gejala, riwayat, dan pemeriksaan langsung oleh tenaga kesehatan.",
      advice:[
        "Catat kapan keluhan muncul.",
        "Perhatikan perubahan kondisi tubuh.",
        "Jaga pola makan dan istirahat.",
        "Konsultasikan keluhan kepada dokter."
      ]
    }
  };

  const info=guidance[symptom];

  const sleepAdvice={
    "Baik dan cukup":"Pertahankan jadwal tidur yang baik.",
    "Kadang terganggu":"Coba buat rutinitas tidur yang lebih konsisten.",
    "Sering kesulitan tidur":"Perhatikan kebiasaan tidur dan konsultasikan jika terus berlangsung.",
    "Sering merasa tidak segar saat bangun":"Perhatikan durasi dan kualitas tidur."
  };

  const foodAdvice={
    "Teratur":"Pertahankan pola makan yang teratur.",
    "Kadang terlambat":"Usahakan menyediakan waktu makan.",
    "Sering melewatkan waktu makan":"Cobalah membangun jadwal makan yang konsisten.",
    "Nafsu makan berubah":"Perhatikan perubahan nafsu makan dan konsultasikan jika berlanjut."
  };

  const result=document.getElementById("result");

  result.style.display="block";

  result.innerHTML=`
    <span class="pill">HASIL CATATAN KONDISI</span>
    <h2>${info.title}</h2>
    <p>${info.explanation}</p>

    <h3 style="margin-top:20px">Saran perawatan umum</h3>
    <ul>
      ${info.advice.map(x=>`<li>${escapeHTML(x)}</li>`).join("")}
    </ul>

    <h3 style="margin-top:20px">Perhatian pola hidup</h3>
    <p><b>Tidur:</b> ${escapeHTML(sleepAdvice[sleep])}</p>
    <p><b>Makan:</b> ${escapeHTML(foodAdvice[food])}</p>
    <p><b>Perasaan:</b> ${escapeHTML(feeling)}</p>
    <p><b>Durasi keluhan:</b> ${escapeHTML(duration)}</p>

    ${extra ? `<p><b>Catatan tambahan:</b> ${escapeHTML(extra)}</p>` : ""}

    <div class="medical-warning">
      <h3>Penting diketahui</h3>
      <p>Hasil ini merupakan panduan edukasi berdasarkan jawabanmu, bukan diagnosis penyakit, resep obat, atau penentuan kondisi medis. Jika keluhan menetap, memburuk, atau mengganggu aktivitas, mintalah bantuan tenaga kesehatan.</p>
    </div>

    <button class="primary-btn" onclick="saveCheckup()">
      Simpan hasil pemeriksaan
    </button>
  `;

  currentSymptom=JSON.stringify({
    symptom,
    duration,
    sleep,
    food,
    feeling,
    extra,
    title:info.title
  });

  result.scrollIntoView({behavior:"smooth",block:"start"});
}

// SIMPAN RIWAYAT PEMERIKSAAN
function saveCheckup(){
  if(!currentSymptom){
    alert("Lakukan pemeriksaan terlebih dahulu.");
    return;
  }

  const data=getData("berryChecks");
  const detail=JSON.parse(currentSymptom);

  data.unshift({
    ...detail,
    date:getToday(),
    time:new Date().toLocaleTimeString("id-ID")
  });

  saveData("berryChecks",data);

  currentSymptom="";
  updateDashboard();
  renderHistory();

  alert("Riwayat pemeriksaan berhasil disimpan.");
}

// RIWAYAT PEMERIKSAAN
function renderHistory(){
  const data=getData("berryChecks");
  const container=document.getElementById("historyList");

  if(!data.length){
    container.innerHTML=
      '<div class="empty-state">Belum ada riwayat pemeriksaan yang tersimpan.</div>';
    return;
  }

  container.innerHTML=data.map((item,index)=>`
    <div class="record">
      <small>${formatDate(item.date)} · ${escapeHTML(item.time)}</small>
      <h3>${escapeHTML(item.title)}</h3>
      <p>Keluhan: ${escapeHTML(item.symptom)}</p>
      <p>Durasi: ${escapeHTML(item.duration)}</p>
      <p>Kualitas tidur: ${escapeHTML(item.sleep)}</p>
      <p>Pola makan: ${escapeHTML(item.food)}</p>
      <p>Perasaan: ${escapeHTML(item.feeling)}</p>
      <button class="delete-btn" onclick="deleteHistory(${index})">
        Hapus riwayat
      </button>
    </div>
  `).join("");
}

function deleteHistory(index){
  if(!confirm("Hapus riwayat pemeriksaan ini?")) return;

  const data=getData("berryChecks");
  data.splice(index,1);

  saveData("berryChecks",data);
  renderHistory();
  updateDashboard();
}

// KEAMANAN TAMPILAN TEKS
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,char=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[char]));
}

// JALANKAN SAAT WEBSITE DIBUKA
updateDashboard();
renderCalendar();
renderDiaryList();
renderHistory();
