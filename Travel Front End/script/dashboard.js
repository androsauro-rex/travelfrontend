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

// 🔥 VISIBILITY
const visibilityToggle = document.getElementById("visibilityToggle");
const visibilityLabel = document.getElementById("visibilityLabel");

// ================= STATE =================

let trips = JSON.parse(localStorage.getItem("trips")) || [];
let currentTrip = null;

// ================= TOGGLE VISIBILITY =================

function updateVisibilityUI() {
  if (!currentTrip) return;

  const isPublic = currentTrip.visibility === "PUBLIC";

  visibilityToggle.checked = isPublic;
  visibilityLabel.textContent = isPublic ? "Pubblico" : "Privato";
}

visibilityToggle.addEventListener("change", () => {
  if (!currentTrip) return;

  currentTrip.visibility = visibilityToggle.checked ? "PUBLIC" : "PRIVATE";
  updateVisibilityUI();
});

// ================= INIT =================

document.addEventListener("DOMContentLoaded", renderTrips);

// ================= MODAL =================

createBtn.addEventListener("click", () => {
  openModal(createEmptyTrip());
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (!modalContent.contains(e.target)) closeModal();
});

function openModal(trip) {
  currentTrip = trip;

  titleInput.value = trip.title || "";
  startDateInput.value = trip.startDate || "";
  endDateInput.value = trip.endDate || "";

  if (!trip.visibility) trip.visibility = "PRIVATE";

  daysContainer.innerHTML = "";

  updateVisibilityUI();

  // Il check previene errori se days è undefined
  trip.days?.forEach((day, index) => renderDay(day, index));

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
    visibility: "PRIVATE",
    startDate: "",
    endDate: "",
    days: []
  };
}

// ================= SAVE =================

saveDraftBtn.addEventListener("click", () => saveTrip("DRAFT"));
publishBtn.addEventListener("click", () => saveTrip("PUBLISHED"));

function saveTrip(status) {
  if (!currentTrip) return;

  currentTrip.title = titleInput.value.trim();
  currentTrip.startDate = startDateInput.value;
  currentTrip.endDate = endDateInput.value;
  currentTrip.status = status;

  const index = trips.findIndex(t => t.id === currentTrip.id);

  if (index >= 0) trips[index] = currentTrip;
  else trips.push(currentTrip);

  localStorage.setItem("trips", JSON.stringify(trips));

  renderTrips();
  closeModal();
}

// ================= DAYS =================

generateDaysBtn.addEventListener("click", () => {
  if (!currentTrip) return;

  const start = new Date(startDateInput.value);
  const end = new Date(endDateInput.value);

  if (isNaN(start) || isNaN(end) || end < start) {
    alert("Inserisci un intervallo di date valido.");
    return;
  }

  currentTrip.days = [];
  daysContainer.innerHTML = "";

  let cursor = new Date(start);

  while (cursor <= end) {
    currentTrip.days.push({
      date: cursor.toISOString().split('T')[0], // salva in formato YYYY-MM-DD
      title: "",
      stages: []
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  currentTrip.days.forEach((day, index) => renderDay(day, index));
});

// FUNZIONE AGGIUNTA: Renderizza i singoli giorni all'interno del modale
function renderDay(day, index) {
  const dayCard = document.createElement("div");
  dayCard.className = "day-card";

  // Formatta la data per renderla leggibile (DD/MM/YYYY)
  let formattedDate = "";
  if (day.date) {
    const d = new Date(day.date);
    formattedDate = !isNaN(d) ? ` - ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}` : "";
  }

  dayCard.innerHTML = `
    <div class="day-header">
      <span>Giorno ${index + 1}${formattedDate}</span>
    </div>
    <div class="form-group">
      <input type="text" class="day-title-input" placeholder="Cosa farai in questo giorno? (es. Visita al museo, Relax in spiaggia...)" value="${day.title || ''}">
    </div>
  `;

  // Ascolta i cambiamenti sul titolo del giorno e aggiorna lo stato in tempo reale
  const input = dayCard.querySelector(".day-title-input");
  input.addEventListener("input", (e) => {
    if (currentTrip && currentTrip.days[index]) {
      currentTrip.days[index].title = e.target.value;
    }
  });

  daysContainer.appendChild(dayCard);
}

// ================= RENDER =================

function renderTrips() {
  draftContainer.innerHTML = "";
  publishedContainer.innerHTML = "";

  trips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "trip-card";

    // Gestione dinamica dei badge neo-brutalisti in base allo stato
    const badgeClass = trip.status === "DRAFT" ? "badge-draft" : "badge-published";
    const badgeText = trip.status === "DRAFT" ? "Bozza" : "Pubblicato";

    card.innerHTML = `
      <span class="status-badge ${badgeClass}">${badgeText}</span>
      <h3 class="trip-title">${trip.title || "Senza titolo"}</h3>
      <p style="font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem;">
        ${trip.startDate ? trip.startDate.split('-').reverse().join('/') : '---'} ➔ ${trip.endDate ? trip.endDate.split('-').reverse().join('/') : '---'}
      </p>

      <div class="trip-actions">
        <button class="btn-primary open-btn">Apri</button>
        <button class="btn-danger del-btn">Elimina</button>
        <button class="btn-secondary pdf-btn">PDF</button>
      </div>
    `;

    const openBtn = card.querySelector(".open-btn");
    const delBtn = card.querySelector(".del-btn");
    const pdfBtn = card.querySelector(".pdf-btn");

    openBtn.onclick = () => openModal(trip);

    delBtn.onclick = () => {
      trips = trips.filter(t => t.id !== trip.id);
      localStorage.setItem("trips", JSON.stringify(trips));
      renderTrips();
    };

    pdfBtn.onclick = () => exportTripToPDF(trip);

    if (trip.status === "DRAFT") draftContainer.appendChild(card);
    else publishedContainer.appendChild(card);
  });
}

// ================= PDF =================

function exportTripToPDF(trip) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.text(trip.title || "Itinerario Senza Titolo", 10, 20);

  doc.setFontSize(12);
  doc.setFont("Helvetica", "normal");
  doc.text("Stato: " + (trip.status === "DRAFT" ? "Bozza" : "Pubblicato"), 10, 32);
  doc.text("Visibilita': " + (trip.visibility === "PUBLIC" ? "Pubblico" : "Privato"), 10, 40);
  doc.text(`Periodo: ${trip.startDate || '---'} a ${trip.endDate || '---'}`, 10, 48);
  
  doc.line(10, 55, 200, 55);

  let yOffset = 65;
  if (trip.days && trip.days.length > 0) {
    doc.setFont("Helvetica", "bold");
    doc.text("Programma Giornaliero:", 10, yOffset);
    yOffset += 10;
    
    doc.setFont("Helvetica", "normal");
    trip.days.forEach((day, idx) => {
      if (yOffset > 270) { // Nuova pagina se lo spazio finisce
        doc.addPage();
        yOffset = 20;
      }
      const dayLine = `Giorno ${idx + 1} (${day.date || ''}): ${day.title || 'Nessuna attività programmata'}`;
      doc.text(dayLine, 15, yOffset);
      yOffset += 8;
    });
  } else {
    doc.text("Nessun giorno generato nell'itinerario.", 10, yOffset);
  }

  doc.save(`${trip.title ? trip.title.replace(/\s+/g, '_') : 'itinerario'}.pdf`);
}