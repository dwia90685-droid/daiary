
const $ = (selector) => document.querySelector(selector);

const diaryKey = "berryMindDiary";
const assessmentKey = "berryMindAssessment";

let diaries = JSON.parse(localStorage.getItem(diaryKey) || "{}");
let assessments = JSON.parse(localStorage.getItem(assessmentKey) || "[]");

const now = new Date();
let selectedDate = formatDate(now);
let calendarDate = new Date(now.getFullYear(), now.getMonth(), 1);

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function readableDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function saveStorage() {
    localStorage.setItem(diaryKey, JSON.stringify(diaries));
    localStorage.setItem(assessmentKey, JSON.stringify(assessments));
}

// INTRO

$("#enterButton").addEventListener("click", () => {
    $("#intro").style.display = "none";
    $("#app").style.display = "block";
    updateDashboard();
    renderCalendar();
});

// NAVIGATION

function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageName);
    });

    const page = document.getElementById(pageName);
    if (!page) return;

    page.classList.add("active");

    const titles = {
        dashboard: "Beranda",
        diary: "Jurnal Harian",
        assessment: "Pemeriksaan Kondisi",
        health: "Informasi Kesehatan",
        history: "Riwayat Aktivitas"
    };

    $("#pageTitle").textContent = titles[pageName];

    if (pageName === "dashboard") updateDashboard();
    if (pageName === "diary") renderCalendar();
    if (pageName === "history") renderHistory();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => showPage(button.dataset.go));
});

// DASHBOARD

function updateDashboard() {
    const today = formatDate(new Date());

    $("#todayLabel").textContent = readableDate(today);
    $("#totalDiary").textContent = Object.keys(diaries).length;
    $("#totalAssessment").textContent = assessments.length;
    $("#todayStatus").textContent = diaries[today] ? "Ada" : "Belum";

    const entries = Object.entries(diaries)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 4);

    const container = $("#recentDiary");

    if (!entries.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span>🌸</span>
                <p>Belum ada catatan. Mulai tulis jurnal pertamamu.</p>
            </div>`;
        return;
    }

    container.innerHTML = entries.map(([date, entry]) => `
        <div class="recent-item">
            <div>
                <strong>${escapeHTML(entry.title || "Catatan Harian")}</strong>
                <p>${escapeHTML(entry.mood || "Belum memilih kondisi perasaan")}</p>
            </div>
            <span class="recent-date">${readableDate(date)}</span>
        </div>
    `).join("");
}

// CALENDAR

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    $("#monthYear").textContent = calendarDate.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = formatDate(new Date());

    let html = "";

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= lastDate; day++) {
        const date = formatDate(new Date(year, month, day));
        const selected = date === selectedDate ? "selected" : "";
        const isToday = date === today ? "today" : "";
        const hasEntry = diaries[date] ? "has-entry" : "";

        html += `
            <button class="calendar-day ${selected} ${isToday} ${hasEntry}"
                data-date="${date}">
                ${day}
            </button>`;
    }

    $("#calendarDays").innerHTML = html;

    document.querySelectorAll(".calendar-day[data-date]").forEach(button => {
        button.addEventListener("click", () => {
            selectedDate = button.dataset.date;
            renderCalendar();
            updateEditor();
        });
    });

    updateEditor();
}

$("#prevMonth").addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

$("#nextMonth").addEventListener("click", () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

// DIARY EDITOR

function updateEditor() {
    const entry = diaries[selectedDate];

    $("#selectedDateTitle").textContent = readableDate(selectedDate);
    $("#diaryTitle").value = entry?.title || "";
    $("#diaryMood").value = entry?.mood || "";
    $("#diaryContent").value = entry?.content || "";
}

$("#saveDiary").addEventListener("click", () => {
    const title = $("#diaryTitle").value.trim();
    const mood = $("#diaryMood").value;
    const content = $("#diaryContent").value.trim();

    if (!title || !content) {
        alert("Silakan isi judul dan isi catatan terlebih dahulu.");
        return;
    }

    diaries[selectedDate] = {
        title,
        mood,
        content,
        updatedAt: new Date().toISOString()
    };

    saveStorage();
    renderCalendar();
    updateDashboard();

    alert("Catatan berhasil disimpan.");
});

$("#deleteDiary").addEventListener("click", () => {
    if (!diaries[selectedDate]) {
        alert("Tidak ada catatan pada tanggal ini.");
        return;
    }

    if (confirm("Apakah kamu yakin ingin menghapus catatan ini?")) {
        delete diaries[selectedDate];
        saveStorage();
        renderCalendar();
        updateDashboard();
        alert("Catatan berhasil dihapus.");
    }
});

// ASSESSMENT

$("#assessmentForm").addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const answers = {
        feeling: formData.get("feeling"),
        sleep: formData.get("sleep"),
        activity: formData.get("activity"),
        selfcare: formData.get("selfcare"),
        need: formData.get("need")
    };

    let advice = "";

    if (
        answers.feeling === "Kurang nyaman" ||
        answers.sleep === "Terganggu" ||
        answers.activity === "Sulit"
    ) {
        advice = "Beberapa jawaban menunjukkan bahwa akhir-akhir ini kamu mungkin sedang menghadapi keadaan yang terasa berat. Cobalah memberi waktu untuk beristirahat dan berbicara dengan orang yang kamu percaya. Jika keadaan ini berlanjut atau mengganggu aktivitas, pertimbangkan untuk berkonsultasi dengan tenaga profesional.";
    } else if (
        answers.feeling === "Campur" ||
        answers.sleep === "Tidak teratur" ||
        answers.activity === "Cukup berat"
    ) {
        advice = "Kondisimu mungkin membutuhkan perhatian lebih. Cobalah mengenali hal-hal yang membuatmu lelah, menjaga waktu istirahat, dan menyediakan waktu untuk diri sendiri.";
    } else {
        advice = "Terus jaga kebiasaan baik yang mendukung kesejahteraanmu. Tetap perhatikan kebutuhan istirahat, nutrisi, hubungan sosial, dan waktu untuk diri sendiri.";
    }

    const record = {
        date: formatDate(new Date()),
        answers,
        advice
    };

    assessments.unshift(record);
    saveStorage();

    const result = $("#assessmentResult");
    result.classList.remove("hidden");

    result.innerHTML = `
        <h3>Hasil Refleksi Diri</h3>
        <p>${escapeHTML(advice)}</p>
        <p><strong>Kebutuhan yang kamu pilih:</strong> ${escapeHTML(answers.need)}</p>
        <p style="margin-top:10px;font-size:10px;">
            Hasil ini bukan diagnosis atau penilaian medis.
            Jika membutuhkan bantuan, hubungi tenaga profesional.
        </p>
    `;

    updateDashboard();
});

// HISTORY

function renderHistory() {
    const diaryContainer = $("#historyDiary");
    const assessmentContainer = $("#historyAssessment");

    const entries = Object.entries(diaries)
        .sort((a, b) => b[0].localeCompare(a[0]));

    if (!entries.length) {
        diaryContainer.innerHTML = `<div class="empty-state">Belum ada riwayat jurnal.</div>`;
    } else {
        diaryContainer.innerHTML = entries.map(([date, entry]) => `
            <div class="history-item">
                <div>
                    <strong>${escapeHTML(entry.title || "Catatan Harian")}</strong>
                    <p>${escapeHTML(entry.content)}</p>
                    <span class="history-badge">${escapeHTML(entry.mood || "Belum memilih perasaan")}</span>
                </div>
                <span class="history-date">${readableDate(date)}</span>
            </div>
        `).join("");
    }

    if (!assessments.length) {
        assessmentContainer.innerHTML = `<div class="empty-state">Belum ada riwayat refleksi.</div>`;
    } else {
        assessmentContainer.innerHTML = assessments.map(item => `
            <div class="history-item">
                <div>
                    <strong>Refleksi Kondisi Diri</strong>
                    <p>Perasaan: ${escapeHTML(item.answers.feeling)}</p>
                    <p>Istirahat: ${escapeHTML(item.answers.sleep)}</p>
                    <p>Kebutuhan: ${escapeHTML(item.answers.need)}</p>
                    <span class="history-badge">Refleksi pribadi</span>
                </div>
                <span class="history-date">${readableDate(item.date)}</span>
            </div>
        `).join("");
    }
}

// BASIC HTML ESCAPE

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// INITIAL DATE

$("#todayLabel").textContent = readableDate(formatDate(new Date()));
