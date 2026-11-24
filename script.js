
let selectedMood = "";

function enterApp(){
 const intro=document.getElementById("intro");
 intro.style.opacity="0";

 setTimeout(()=>{
  intro.style.display="none";
  document.getElementById("app").style.display="block";
 },900);
}

function showPage(id,button){
 document.querySelectorAll(".page").forEach(p=>{
  p.classList.remove("active");
 });

 document.getElementById(id).classList.add("active");

 document.querySelectorAll(".nav button").forEach(b=>{
  b.classList.remove("active");
 });

 if(button) button.classList.add("active");

 const titles={
  home:"Beranda",
  diary:"Diary Saya",
  mood:"Mood Journal",
  doctor:"Profil Psikologi",
  care:"Self Care"
 };

 document.getElementById("pageTitle").textContent=titles[id];
}

document.getElementById("today").textContent=
new Date().toLocaleDateString("id-ID",{
 day:"numeric",month:"long",year:"numeric"
});

function getData(key){
 return JSON.parse(localStorage.getItem(key)||"[]");
}

function escapeHTML(value){
 return String(value).replace(/[&<>"']/g,c=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
 }[c]));
}

function saveDiary(){
 let title=document.getElementById("diaryTitle").value.trim();
 let content=document.getElementById("diaryText").value.trim();

 if(!title||!content){
  alert("Isi judul dan ceritamu terlebih dahulu 🌷");
  return;
 }

 let data=getData("berryDiary");

 data.unshift({
  title,content,
  date:new Date().toLocaleString("id-ID")
 });

 localStorage.setItem("berryDiary",JSON.stringify(data));

 document.getElementById("diaryTitle").value="";
 document.getElementById("diaryText").value="";

 renderDiary();
 alert("Cerita berhasil disimpan ♡");
}

function renderDiary(){
 let data=getData("berryDiary");

 document.getElementById("diaryList").innerHTML=
 data.map((d,i)=>`
  <div class="entry">
   <small>${escapeHTML(d.date)}</small>
   <h3>${escapeHTML(d.title)}</h3>
   <p>${escapeHTML(d.content).replace(/\n/g,"<br>")}</p>
   <button class="action pink" onclick="deleteDiary(${i})">Hapus</button>
  </div>
 `).join("")||"<p>Belum ada cerita 🌸</p>";
}

function deleteDiary(i){
 if(confirm("Hapus cerita ini?")){
  let data=getData("berryDiary");
  data.splice(i,1);
  localStorage.setItem("berryDiary",JSON.stringify(data));
  renderDiary();
 }
}

function selectMood(button,mood){
 selectedMood=mood;

 document.querySelectorAll(".mood").forEach(b=>{
  b.classList.remove("selected");
 });

 button.classList.add("selected");

 document.getElementById("moodResult").textContent=
 "Mood kamu: "+mood;
}

function saveMood(){
 if(!selectedMood){
  alert("Pilih mood terlebih dahulu 🌷");
  return;
 }

 let data=getData("berryMood");

 data.unshift({
  mood:selectedMood,
  note:document.getElementById("moodNote").value,
  date:new Date().toLocaleString("id-ID")
 });

 localStorage.setItem("berryMood",JSON.stringify(data));

 document.getElementById("moodNote").value="";
 selectedMood="";

 document.querySelectorAll(".mood").forEach(b=>{
  b.classList.remove("selected");
 });

 document.getElementById("moodResult").textContent=
 "Mood berhasil disimpan ♡";

 renderMood();
}

function renderMood(){
 let data=getData("berryMood");

 document.getElementById("moodList").innerHTML=
 data.map(d=>`
  <div class="entry">
   <small>${escapeHTML(d.date)}</small>
   <h3>${escapeHTML(d.mood)}</h3>
   <p>${escapeHTML(d.note||"Tidak ada catatan tambahan.")}</p>
  </div>
 `).join("")||"<p>Belum ada riwayat mood 🌷</p>";
}

renderDiary();
renderMood();
