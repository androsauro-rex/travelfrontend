// ================= DOM =================

const draftContainer = document.getElementById("draftTripsContainer");
const publishedContainer = document.getElementById("publishedTripsContainer");

const modal = document.getElementById("tripModal");
const modalContent = document.getElementById("modalContent");

const createBtn = document.getElementById("createTripBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

const titleInput = document.getElementById("tripTitle");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

const daysContainer = document.getElementById("daysContainer");

const saveDraftBtn = document.getElementById("saveDraftBtn");
const publishBtn = document.getElementById("publishBtn");
const generateDaysBtn = document.getElementById("generateDaysBtn");

// ================= STATE =================

let trips = JSON.parse(localStorage.getItem("trips")) || [];
let currentTrip = null;

// ================= HELPERS (FIX DATE BUG) =================

function normalizeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function safeDate(value) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("it-IT");
}

// ================= INIT =================

document.addEventListener("DOMContentLoaded", () => {
  renderTrips();
});

// ================= MODAL =================

createBtn.addEventListener("click", () => {
  openModal(createEmptyTrip());
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (!modalContent.contains(e.target)) {
    closeModal();
  }
});

function openModal(trip) {
  currentTrip = trip;

  titleInput.value = trip.title || "";
  startDateInput.value = trip.startDate ? trip.startDate.slice(0, 10) : "";
  endDateInput.value = trip.endDate ? trip.endDate.slice(0, 10) : "";

  daysContainer.innerHTML = "";

  if (trip.days?.length) {
    trip.days.forEach(renderDay);
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  currentTrip = null;
}

// ================= TRIP =================

function createEmptyTrip() {
  return {
    id: Date.now(),
    title: "",
    status: "DRAFT",
    startDate: "",
    endDate: "",
    days: [],
  };
}

// ================= GENERATE DAYS =================

generateDaysBtn.addEventListener("click", () => {
  if (!currentTrip) return;

  const start = new Date(startDateInput.value);
  const end = new Date(endDateInput.value);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return;

  currentTrip.days = [];
  daysContainer.innerHTML = "";

  let cursor = new Date(start);

  while (cursor <= end) {
    const day = {
      date: normalizeDate(cursor), // FIX
      title: "",
      stages: [],
    };

    currentTrip.days.push(day);
    renderDay(day);

    cursor.setDate(cursor.getDate() + 1);
  }
});

// ================= RENDER DAY =================

function renderDay(day) {
  const dayEl = document.createElement("div");
  dayEl.className = "day-card";

  const dateStr = safeDate(day.date); // FIX

  dayEl.innerHTML = `
    <div class="day-header">
      <span><strong>Giorno</strong> - ${dateStr}</span>
    </div>

    <input class="day-title-input" placeholder="Titolo giornata" value="${day.title || ""}" />

    <div class="stages-container"></div>

    <button class="btn-secondary add-stage-btn">
      + Aggiungi tappa
    </button>
  `;

  const stagesContainer = dayEl.querySelector(".stages-container");
  const addStageBtn = dayEl.querySelector(".add-stage-btn");
  const titleInputEl = dayEl.querySelector(".day-title-input");

  titleInputEl.addEventListener("input", (e) => {
    day.title = e.target.value;
  });

  addStageBtn.addEventListener("click", () => {
    const stage = { name: "", description: "" };
    day.stages.push(stage);

    const stageEl = document.createElement("div");
    stageEl.className = "stage-card";

    stageEl.innerHTML = `
      <input placeholder="Nome tappa" class="stage-name"/>
      <textarea placeholder="Descrizione" class="stage-desc"></textarea>
    `;

    stageEl.querySelector(".stage-name").addEventListener("input", (e) => {
      stage.name = e.target.value;
    });

    stageEl.querySelector(".stage-desc").addEventListener("input", (e) => {
      stage.description = e.target.value;
    });

    stagesContainer.appendChild(stageEl);
  });

  daysContainer.appendChild(dayEl);
}

// ================= SAVE =================

saveDraftBtn.addEventListener("click", () => saveTrip("DRAFT"));
publishBtn.addEventListener("click", () => saveTrip("PUBLISHED"));

function saveTrip(status) {
  if (!currentTrip) return;
  if (!titleInput.value.trim()) return;

  currentTrip.title = titleInput.value.trim();
  currentTrip.startDate = normalizeDate(startDateInput.value); // FIX
  currentTrip.endDate = normalizeDate(endDateInput.value); // FIX
  currentTrip.status = status;

  const index = trips.findIndex((t) => t.id === currentTrip.id);

  if (index >= 0) trips[index] = currentTrip;
  else trips.push(currentTrip);

  localStorage.setItem("trips", JSON.stringify(trips));

  renderTrips();
  closeModal();
}

// ================= RENDER TRIPS =================

function renderTrips() {
  draftContainer.innerHTML = "";
  publishedContainer.innerHTML = "";

  const template = document.getElementById("tripCardTemplate");

  trips.forEach((trip) => {
    const card = template.content.cloneNode(true);

    const badge = card.querySelector(".status-badge");
    const title = card.querySelector(".trip-title");
    const mainBtn = card.querySelector(".trip-main-action");
    const deleteBtn = card.querySelector(".trip-delete-action");
    const pdfBtn = card.querySelector(".trip-download");

    const isDraft = trip.status === "DRAFT";

    badge.textContent = isDraft ? "BOZZA" : "PUBBLICATO";
    badge.classList.add(isDraft ? "badge-draft" : "badge-published");

    title.textContent = trip.title || "Senza titolo";

    mainBtn.textContent = isDraft
      ? "Continua itinerario"
      : "Visualizza itinerario";

    mainBtn.onclick = () => openModal(trip);

    deleteBtn.onclick = () => {
      trips = trips.filter((t) => t.id !== trip.id);
      localStorage.setItem("trips", JSON.stringify(trips));
      renderTrips();
    };

    pdfBtn.onclick = () => exportTripToPDF(trip);

    if (isDraft) draftContainer.appendChild(card);
    else publishedContainer.appendChild(card);
  });
}

// ================= PDF EXPORT =================

function exportTripToPDF(trip) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const navy = "#033c4f";
  const dark = "#062631";
  const gray = "#666";
  const light = "#f4f7f8";
  const accent = "#fee440";

  let y = 20;

  // ================= HEADER (clean banner) =================
  doc.setFillColor(navy);
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor("#ffffff");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TravelBuddy", 14, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Itinerario di viaggio", 14, 22);

  // ================= TITLE =================
  y = 48;

  doc.setTextColor(dark);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(trip.title || "Senza titolo", 14, y);

  y += 10;

  // status pill (pulito)
  doc.setFillColor(trip.status === "DRAFT" ? "#ffe066" : accent);
  doc.roundedRect(14, y, 38, 9, 4, 4, "F");

  doc.setTextColor(dark);
  doc.setFontSize(9);
  doc.text(trip.status === "DRAFT" ? "BOZZA" : "PUBBLICATO", 19, y + 6);

  y += 18;

  // ================= DATE =================
//   const formatDate = (d) => {
//     const date = new Date(d);
//     return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("it-IT");
//   };

//   doc.setTextColor(gray);
//   doc.setFontSize(11);
//   doc.text(
//     `${formatDate(trip.startDate)}  →  ${formatDate(trip.endDate)}`,
//     14,
//     y
//   );

//   y += 18;

  // ================= DAYS =================
  trip.days.forEach((day, i) => {
    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    const date = new Date(day.date);
    const dateStr = isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("it-IT");

    // DAY HEADER (no box pesante, solo barra laterale)
    doc.setFillColor(navy);
    doc.rect(10, y - 4, 2, 10, "F");

    doc.setTextColor(navy);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Giorno ${i + 1}`, 16, y);

    doc.setTextColor(gray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, 45, y);

    y += 10;

    // DAY TITLE
    if (day.title) {
      doc.setTextColor(dark);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(day.title, 16, y);
      y += 8;
    }

    // STAGES (clean list style)
    if (day.stages?.length) {
      day.stages.forEach((stage) => {
        doc.setTextColor(dark);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        doc.text(`• ${stage.name || "Tappa"}`, 18, y);
        y += 6;

        if (stage.description) {
          doc.setTextColor(gray);
          doc.setFont("helvetica", "normal");

          const lines = doc.splitTextToSize(stage.description, 160);
          doc.text(lines, 22, y);
          y += lines.length * 5;
        }
      });
    }

    y += 10;

    // subtle divider (NOT aggressive line)
    doc.setDrawColor("#eaeaea");
    doc.line(14, y, 196, y);

    y += 12;
  });

  // ================= FOOTER =================
  doc.setFontSize(9);
  doc.setTextColor("#999");
  doc.text(
    "TravelBuddy • Your travel planner",
    14,
    287
  );

  doc.save(`${trip.title || "itinerario"}.pdf`);
}

// ================= LOG =================

console.log("TravelBuddy FIX DEFINITIVE 🚀");