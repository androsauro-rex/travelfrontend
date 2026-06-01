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

// ================= INIT =================

document.addEventListener("DOMContentLoaded", () => {
  renderTrips();
});

// ================= MODAL =================

createBtn.addEventListener("click", () => {
  openModal(createEmptyTrip());
});

closeModalBtn.addEventListener("click", closeModal);

// click fuori modale
modal.addEventListener("click", (e) => {
  if (!modalContent.contains(e.target)) {
    closeModal();
  }
});

function openModal(trip) {
  currentTrip = trip;

  titleInput.value = trip.title || "";
  startDateInput.value = trip.startDate || "";
  endDateInput.value = trip.endDate || "";

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
    days: []
  };
}

// ================= DAYS =================

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
      date: new Date(cursor),
      title: "",
      stages: []
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

  const dateStr = new Date(day.date).toLocaleDateString("it-IT");

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
    const stage = {
      name: "",
      description: ""
    };

    day.stages.push(stage);

    const stageEl = document.createElement("div");
    stageEl.className = "stage-card";

    stageEl.innerHTML = `
      <input placeholder="Nome tappa" class="stage-name"/>
      <textarea placeholder="Descrizione" class="stage-desc"></textarea>
    `;

    const nameInput = stageEl.querySelector(".stage-name");
    const descInput = stageEl.querySelector(".stage-desc");

    nameInput.addEventListener("input", (e) => {
      stage.name = e.target.value;
    });

    descInput.addEventListener("input", (e) => {
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
  currentTrip.startDate = startDateInput.value;
  currentTrip.endDate = endDateInput.value;
  currentTrip.status = status;

  const index = trips.findIndex(t => t.id === currentTrip.id);

  if (index >= 0) {
    trips[index] = currentTrip;
  } else {
    trips.push(currentTrip);
  }

  localStorage.setItem("trips", JSON.stringify(trips));

  renderTrips();
  closeModal();
}

// ================= RENDER TRIPS =================

function renderTrips() {
  draftContainer.innerHTML = "";
  publishedContainer.innerHTML = "";

  trips.forEach(trip => {
    const template = document.getElementById("tripCardTemplate");
    const card = template.content.cloneNode(true);

    const badge = card.querySelector(".status-badge");
    const title = card.querySelector(".trip-title");
    const mainBtn = card.querySelector(".trip-main-action");
    const deleteBtn = card.querySelector(".trip-delete-action");

    const isDraft = trip.status === "DRAFT";

    badge.textContent = isDraft ? "BOZZA" : "PUBBLICATO";
    badge.classList.add(isDraft ? "badge-draft" : "badge-published");

    title.textContent = trip.title || "Senza titolo";

    mainBtn.textContent = isDraft ? "Continua itinerario" : "Visualizza itinerario";

    mainBtn.onclick = () => openModal(trip);

    deleteBtn.onclick = () => {
      trips = trips.filter(t => t.id !== trip.id);
      localStorage.setItem("trips", JSON.stringify(trips));
      renderTrips();
    };

    if (isDraft) {
      draftContainer.appendChild(card);
    } else {
      publishedContainer.appendChild(card);
    }
  });
}

// ================= LOG =================

console.log("TravelBuddy Dashboard FIXED 🚀");