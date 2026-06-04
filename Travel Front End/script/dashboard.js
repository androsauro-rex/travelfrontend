// ================= DOM =================

// NAVBAR
const logoutBtn = document.querySelector('.navbar-container .btn-secondary');

// CONTAINERS
const draftContainer = document.getElementById("draftTripsContainer");
const publishedContainer = document.getElementById("publishedTripsContainer");

// MODALE ITINERARIO
const modal = document.getElementById("tripModal");
const modalContent = document.getElementById("modalContent");
const createBtn = document.getElementById("createTripBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// FORM INPUTS ITINERARIO
const destinationInput = document.getElementById("tripDestination");
const titleInput = document.getElementById("tripTitle");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const budgetInput = document.getElementById("tripBudget");

// GIORNI
const daysContainer = document.getElementById("daysContainer");

// ACTIONS ITINERARIO
const saveDraftBtn = document.getElementById("saveDraftBtn");
const publishBtn = document.getElementById("publishBtn");
const generateDaysBtn = document.getElementById("generateDaysBtn");

// VISIBILITA ITINERARIO
const visibilityToggle = document.getElementById("visibilityToggle");
const visibilityLabel = document.getElementById("visibilityLabel");

// MODALE GESTIONE SPESE
const speseModal = document.getElementById("speseModal");
const speseModalContent = document.getElementById("speseModalContent");
const closeSpeseModalBtn = document.getElementById("closeSpeseModalBtn");
const speseModalSubtitle = document.getElementById("speseModalSubtitle");
const speseExtraList = document.getElementById("speseExtraList");
const speseExtraTotal = document.getElementById("speseExtraTotal");
const speseExtraNome = document.getElementById("speseExtraNome");
const speseExtraTipo = document.getElementById("speseExtraTipo");
const speseExtraCosto = document.getElementById("speseExtraCosto");
const addSpeseExtraBtn = document.getElementById("addSpeseExtraBtn");
const saveSpeseBtn = document.getElementById("saveSpeseBtn");

// MODALE SELEZIONE GIORNI DA RIMUOVERE
const daySelectionModal = document.getElementById("daySelectionModal");
const daySelectionContent = document.getElementById("daySelectionContent");
const closeDaySelectionBtn = document.getElementById("closeDaySelectionBtn");
const daySelectionSubtitle = document.getElementById("daySelectionSubtitle");
const daySelectionList = document.getElementById("daySelectionList");
const cancelDaySelectionBtn = document.getElementById("cancelDaySelectionBtn");
const confirmDaySelectionBtn = document.getElementById("confirmDaySelectionBtn");

// ================= ENUM TIPOLOGIE SPESE =================
// Tutte le spese (trasporti, alloggi, cibo, ecc.) sono raggruppate qui
// e salvate nella tabella "spese" (titolo, tipologia, costo).

const SPESA_TYPES = {
  TRASPORTO: "Trasporti",
  ALLOGGIO: "Alloggi",
  CIBO: "Cibo",
  ATTRAZIONE: "Attrazioni",
  SHOPPING: "Shopping",
  EXTRA: "Extra"
};

// ================= STATO =================

let trips = JSON.parse(localStorage.getItem("trips")) || [];
let currentTrip = null;          // itinerario aperto nella modale principale
let speseTripRef = null;         // itinerario di cui si stanno gestendo le spese

// ================= TOGGLE VISIBILITA =================

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

document.addEventListener("DOMContentLoaded", () => {
  renderTrips();
  popolaTipologieSpese();
});

// Popola il menu a tendina delle tipologie di spesa
function popolaTipologieSpese() {
  let options = '<option value="">Seleziona tipologia...</option>';
  Object.values(SPESA_TYPES).forEach(val => {
    options += `<option value="${val}">${val}</option>`;
  });
  speseExtraTipo.innerHTML = options;
}

// ================= LOGOUT =================

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");

  showLogoutNotification();

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});

function showLogoutNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background-color: #4caf50;
    color: white;
    padding: 1rem 1.5rem;
    border: 3px solid #000;
    border-radius: 0;
    box-shadow: 4px 4px 0 #000;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  notification.textContent = '👋 A presto! Logout effettuato';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ================= MODALE ITINERARIO =================

createBtn.addEventListener("click", () => {
  openModal(createEmptyTrip());
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function openModal(trip) {
  currentTrip = trip;

  destinationInput.value = trip.destination || "";
  titleInput.value = trip.title || "";
  startDateInput.value = trip.startDate || "";
  endDateInput.value = trip.endDate || "";
  budgetInput.value = trip.budgetPianificato || "";

  if (!trip.visibility) trip.visibility = "PRIVATE";

  daysContainer.innerHTML = "";

  updateVisibilityUI();

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
    destination: "",
    title: "",
    status: "DRAFT",
    visibility: "PRIVATE",
    startDate: "",
    endDate: "",
    budgetPianificato: "",
    days: [],
    speseExtra: []
  };
}

// ================= SAVE =================

saveDraftBtn.addEventListener("click", () => saveTrip("DRAFT"));
publishBtn.addEventListener("click", () => saveTrip("PUBLISHED"));

function saveTrip(status) {
  if (!currentTrip) return;

  // Raccolta dati dal form
  currentTrip.destination = destinationInput.value.trim();
  currentTrip.title = titleInput.value.trim();
  currentTrip.startDate = startDateInput.value;
  currentTrip.endDate = endDateInput.value;
  currentTrip.budgetPianificato = budgetInput.value;
  currentTrip.status = status;

  const index = trips.findIndex(t => t.id === currentTrip.id);

  if (index >= 0) trips[index] = currentTrip;
  else trips.push(currentTrip);

  localStorage.setItem("trips", JSON.stringify(trips));

  renderTrips();
  closeModal();

  if (status === "DRAFT") {
    showToast("✅ Itinerario salvato come bozza", "success");
  } else {
    showToast("🎉 Itinerario pubblicato!", "success");
  }
}

// ================= GENERAZIONE / AGGIORNAMENTO GIORNI =================

generateDaysBtn.addEventListener("click", () => {
  if (!currentTrip) return;

  const start = new Date(startDateInput.value);
  const end = new Date(endDateInput.value);

  if (isNaN(start) || isNaN(end) || end < start) {
    alert("Inserisci un intervallo di date valido.");
    return;
  }

  // Calcola quanti giorni servono nel nuovo intervallo
  const nuovoNumGiorni = diffInGiorni(start, end) + 1;
  const attualeNumGiorni = currentTrip.days ? currentTrip.days.length : 0;

  // CASO 1: nessun giorno ancora -> genera da zero
  if (attualeNumGiorni === 0) {
    currentTrip.days = costruisciGiorniVuoti(start, nuovoNumGiorni);
    renderAllDays();
    return;
  }

  // CASO 2: stesso numero di giorni -> aggiorna solo le date, mantieni contenuto
  if (nuovoNumGiorni === attualeNumGiorni) {
    ricalcolaDate(start);
    renderAllDays();
    showToast("📅 Date aggiornate", "success");
    return;
  }

  // CASO 3: piu giorni -> aggiungi card vuote in fondo, mantieni esistenti
  if (nuovoNumGiorni > attualeNumGiorni) {
    const daAggiungere = nuovoNumGiorni - attualeNumGiorni;
    for (let i = 0; i < daAggiungere; i++) {
      currentTrip.days.push({ date: "", title: "", stages: [] });
    }
    ricalcolaDate(start);
    renderAllDays();
    showToast(`📅 Aggiunti ${daAggiungere} giorno/i`, "success");
    return;
  }

  // CASO 4: meno giorni -> chiedi all'utente QUALI rimuovere
  const daRimuovere = attualeNumGiorni - nuovoNumGiorni;
  openDaySelectionModal(daRimuovere, start);
});

// Differenza in giorni tra due date (ignora ore/fusi)
function diffInGiorni(start, end) {
  const msPerGiorno = 1000 * 60 * 60 * 24;
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((e - s) / msPerGiorno);
}

// Costruisce un array di N giorni vuoti con date consecutive da "start"
function costruisciGiorniVuoti(start, numGiorni) {
  const giorni = [];
  const cursor = new Date(start);
  for (let i = 0; i < numGiorni; i++) {
    giorni.push({
      date: cursor.toISOString().split('T')[0],
      title: "",
      stages: []
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return giorni;
}

// Riassegna date consecutive ai giorni esistenti (mantiene titoli e tappe)
function ricalcolaDate(start) {
  const cursor = new Date(start);
  currentTrip.days.forEach(day => {
    day.date = cursor.toISOString().split('T')[0];
    cursor.setDate(cursor.getDate() + 1);
  });
}

// Ridisegna tutti i giorni nella modale
function renderAllDays() {
  daysContainer.innerHTML = "";
  currentTrip.days.forEach((day, index) => renderDay(day, index));
}

// ================= MODALE SELEZIONE GIORNI DA RIMUOVERE =================

let pendingStart = null;       // data di inizio "in attesa" durante la selezione
let pendingDaRimuovere = 0;    // quanti giorni vanno rimossi

function openDaySelectionModal(daRimuovere, start) {
  pendingStart = start;
  pendingDaRimuovere = daRimuovere;

  daySelectionSubtitle.textContent =
    `Il nuovo intervallo richiede ${daRimuovere} giorno/i in meno. Seleziona quale/i giorno/i vuoi rimuovere (contenuto compreso).`;

  // Costruisci la lista con checkbox
  daySelectionList.innerHTML = "";
  currentTrip.days.forEach((day, index) => {
    const item = document.createElement("div");
    item.className = "day-selection-item";

    const numTappe = day.stages ? day.stages.length : 0;
    const dataLeggibile = day.date ? day.date.split('-').reverse().join('/') : '---';
    const titoloGiorno = day.title ? day.title : "(nessun titolo)";

    item.innerHTML = `
      <input type="checkbox" data-index="${index}">
      <div class="day-selection-info">
        <div class="day-selection-title">Giorno ${index + 1} - ${dataLeggibile}</div>
        <div class="day-selection-detail">${titoloGiorno} · ${numTappe} tappa/e</div>
      </div>
    `;

    // Click sull'intera riga = toggle del checkbox
    item.addEventListener("click", (e) => {
      const checkbox = item.querySelector("input[type='checkbox']");
      if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
      item.classList.toggle("selected", checkbox.checked);
      aggiornaContatoreSelezione();
    });

    daySelectionList.appendChild(item);
  });

  // Contatore
  const counter = document.createElement("div");
  counter.className = "day-selection-counter";
  counter.id = "daySelectionCounter";
  counter.textContent = `Selezionati: 0 / ${daRimuovere}`;
  daySelectionList.appendChild(counter);

  confirmDaySelectionBtn.disabled = true;
  daySelectionModal.classList.remove("hidden");
}

function aggiornaContatoreSelezione() {
  const selezionati = daySelectionList.querySelectorAll("input[type='checkbox']:checked").length;
  const counter = document.getElementById("daySelectionCounter");
  if (counter) counter.textContent = `Selezionati: ${selezionati} / ${pendingDaRimuovere}`;

  // Abilita conferma solo quando il numero selezionato e' esattamente quello richiesto
  confirmDaySelectionBtn.disabled = (selezionati !== pendingDaRimuovere);
}

function closeDaySelection() {
  daySelectionModal.classList.add("hidden");
  pendingStart = null;
  pendingDaRimuovere = 0;
}

closeDaySelectionBtn.addEventListener("click", closeDaySelection);
cancelDaySelectionBtn.addEventListener("click", closeDaySelection);

daySelectionModal.addEventListener("click", (e) => {
  if (e.target === daySelectionModal) closeDaySelection();
});

confirmDaySelectionBtn.addEventListener("click", () => {
  // Conferma irreversibile
  const conferma = confirm(
    "Sei sicuro di voler rimuovere i giorni selezionati?\n\n" +
    "Tutto il contenuto di quei giorni (titoli e tappe) verra' perso. " +
    "L'operazione NON e' reversibile."
  );
  if (!conferma) return;

  // Raccogli gli indici selezionati
  const indiciDaRimuovere = [];
  daySelectionList.querySelectorAll("input[type='checkbox']:checked").forEach(cb => {
    indiciDaRimuovere.push(parseInt(cb.dataset.index));
  });

  // Tieni solo i giorni NON selezionati
  currentTrip.days = currentTrip.days.filter((day, index) => !indiciDaRimuovere.includes(index));

  // Ricalcola le date consecutive sui giorni rimasti
  ricalcolaDate(pendingStart);

  renderAllDays();
  closeDaySelection();
  showToast("🗑️ Giorni rimossi e date aggiornate", "warning");
});

// ================= TAPPE (STAGES) =================

function addStage(dayIndex) {
  if (!currentTrip || !currentTrip.days[dayIndex]) return;

  const stageTitleInput = document.getElementById(`stage-title-${dayIndex}`);
  const stageDescInput = document.getElementById(`stage-desc-${dayIndex}`);

  const stageTitle = stageTitleInput.value.trim();
  const stageDesc = stageDescInput.value.trim();

  if (!stageTitle) {
    alert("Inserisci un titolo per la tappa");
    return;
  }

  if (!currentTrip.days[dayIndex].stages) {
    currentTrip.days[dayIndex].stages = [];
  }

  currentTrip.days[dayIndex].stages.push({
    id: Date.now(),
    title: stageTitle,
    description: stageDesc
  });

  stageTitleInput.value = "";
  stageDescInput.value = "";
  renderStages(dayIndex);
}

function deleteStage(dayIndex, stageId) {
  if (!currentTrip || !currentTrip.days[dayIndex]) return;

  currentTrip.days[dayIndex].stages = currentTrip.days[dayIndex].stages.filter(s => s.id !== stageId);
  renderStages(dayIndex);
}

function renderStages(dayIndex) {
  if (!currentTrip || !currentTrip.days[dayIndex]) return;

  const stagesContainer = document.getElementById(`stages-container-${dayIndex}`);
  if (!stagesContainer) return;

  stagesContainer.innerHTML = "";

  const day = currentTrip.days[dayIndex];

  if (day.stages && day.stages.length > 0) {
    day.stages.forEach(stage => {
      const stageItem = document.createElement("div");
      stageItem.className = "stage-item";
      stageItem.innerHTML = `
        <div class="stage-text">
          <div class="stage-title">📍 ${stage.title}</div>
          ${stage.description ? `<div class="stage-description">${stage.description}</div>` : ''}
        </div>
        <button type="button" class="btn-small" onclick="deleteStage(${dayIndex}, ${stage.id})">Elimina</button>
      `;
      stagesContainer.appendChild(stageItem);
    });
  }
}

// ================= RENDER GIORNO =================

function renderDay(day, index) {
  const dayCard = document.createElement("div");
  dayCard.className = "day-card";

  // Formatta la data (DD/MM/YYYY)
  let formattedDate = "";
  if (day.date) {
    const d = new Date(day.date);
    formattedDate = !isNaN(d)
      ? ` - ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      : "";
  }

  dayCard.innerHTML = `
    <div class="day-header">
      <span>Giorno ${index + 1}${formattedDate}</span>
    </div>
    <div class="form-group">
      <input type="text" class="day-title-input" placeholder="Cosa farai in questo giorno? (es. Visita al museo, Relax in spiaggia...)" value="${day.title || ''}">
    </div>
    <div class="form-group">
      <label style="font-weight: 700; margin-top: 0.8rem;">Tappe della giornata</label>
      <div id="stages-container-${index}" class="stages-container"></div>

      <div class="new-stage-box">
        <p class="new-stage-title">➕ Aggiungi una nuova tappa</p>
        <input type="text" id="stage-title-${index}" class="stage-input" placeholder="Titolo tappa (es. Colazione, Museo, Cena...)" style="margin-bottom: 0.8rem;">
        <textarea id="stage-desc-${index}" class="stage-input" placeholder="Descrizione (opzionale - es. Visita la sezione di arte medievale)" rows="2" style="margin-bottom: 0.8rem;"></textarea>
        <button type="button" class="btn-add-stage" onclick="addStage(${index})">+ Aggiungi tappa</button>
      </div>
    </div>
  `;

  // Aggiorna il titolo del giorno in tempo reale
  const input = dayCard.querySelector(".day-title-input");
  input.addEventListener("input", (e) => {
    if (currentTrip && currentTrip.days[index]) {
      currentTrip.days[index].title = e.target.value;
    }
  });

  // Ctrl+Enter per aggiungere tappa
  const stageDescInput = dayCard.querySelector(`#stage-desc-${index}`);
  stageDescInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      addStage(index);
    }
  });

  daysContainer.appendChild(dayCard);

  renderStages(index);
}

// ================= RENDER LISTA VIAGGI =================

function renderTrips() {
  draftContainer.innerHTML = "";
  publishedContainer.innerHTML = "";

  trips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "trip-card";

    const badgeClass = trip.status === "DRAFT" ? "badge-draft" : "badge-published";
    const badgeText = trip.status === "DRAFT" ? "Bozza" : "Pubblicato";

    const budget = parseFloat(trip.budgetPianificato);
    const budgetText = !isNaN(budget) && budget > 0
      ? `<p style="font-size: 0.85rem; color: #ff6b35; font-weight: 700; margin-bottom: 0.5rem;">💰 Budget: €${budget.toFixed(2)}</p>`
      : '';

    const destText = trip.destination
      ? `<p style="font-size: 0.9rem; color: var(--primary); font-weight: 700;">📍 ${trip.destination}</p>`
      : '';

    card.innerHTML = `
      <span class="status-badge ${badgeClass}">${badgeText}</span>
      <h3 class="trip-title">${trip.title || "Senza titolo"}</h3>
      ${destText}
      <p style="font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem;">
        ${trip.startDate ? trip.startDate.split('-').reverse().join('/') : '---'} ➔ ${trip.endDate ? trip.endDate.split('-').reverse().join('/') : '---'}
      </p>
      ${budgetText}

      <div class="trip-actions">
        <button class="btn-primary open-btn">Apri</button>
        <button class="btn-danger del-btn">Elimina</button>
        <button class="btn-secondary pdf-btn">PDF</button>
        <button class="btn-spese-manage spese-btn">Gestione Spese</button>
      </div>
    `;

    const openBtn = card.querySelector(".open-btn");
    const delBtn = card.querySelector(".del-btn");
    const pdfBtn = card.querySelector(".pdf-btn");
    const speseBtn = card.querySelector(".spese-btn");

    openBtn.onclick = () => openModal(trip);

    delBtn.onclick = () => {
      if (confirm("Sei sicuro di voler eliminare questo itinerario?")) {
        trips = trips.filter(t => t.id !== trip.id);
        localStorage.setItem("trips", JSON.stringify(trips));
        renderTrips();
      }
    };

    pdfBtn.onclick = () => exportTripToPDF(trip);

    speseBtn.onclick = () => openSpeseModal(trip);

    if (trip.status === "DRAFT") draftContainer.appendChild(card);
    else publishedContainer.appendChild(card);
  });
}

// ================= MODALE GESTIONE SPESE =================

function openSpeseModal(trip) {
  speseTripRef = trip;

  // Assicura che l'array esista (per itinerari vecchi)
  if (!speseTripRef.speseExtra) speseTripRef.speseExtra = [];

  speseModalSubtitle.textContent = `Spese di "${trip.title || 'Senza titolo'}"`;

  // Pulisci il form
  speseExtraNome.value = "";
  speseExtraTipo.value = "";
  speseExtraCosto.value = "";

  renderSpeseExtra();
  speseModal.classList.remove("hidden");
}

function closeSpeseModal() {
  speseModal.classList.add("hidden");
  speseTripRef = null;
}

closeSpeseModalBtn.addEventListener("click", closeSpeseModal);

speseModal.addEventListener("click", (e) => {
  if (e.target === speseModal) closeSpeseModal();
});

function renderSpeseExtra() {
  if (!speseTripRef) return;

  speseExtraList.innerHTML = "";

  const spese = speseTripRef.speseExtra || [];

  if (spese.length === 0) {
    speseExtraList.innerHTML = `<div class="spese-extra-empty">Nessuna spesa registrata. Aggiungine una qui sotto!</div>`;
    speseExtraTotal.innerHTML = "";
    return;
  }

  let totale = 0;

  spese.forEach(spesa => {
    totale += parseFloat(spesa.costo) || 0;

    const item = document.createElement("div");
    item.className = "spesa-extra-item";
    item.innerHTML = `
      <div class="spesa-extra-info">
        <span class="spesa-extra-nome">${spesa.nome}</span>
        <span class="spesa-extra-badge">${spesa.tipologia}</span>
      </div>
      <span class="spesa-extra-costo">€${parseFloat(spesa.costo).toFixed(2)}</span>
      <button type="button" class="btn-small" onclick="deleteSpesaExtra(${spesa.id})">Elimina</button>
    `;
    speseExtraList.appendChild(item);
  });

  speseExtraTotal.innerHTML = `<span>TOTALE SPESE</span><span>€${totale.toFixed(2)}</span>`;
}

addSpeseExtraBtn.addEventListener("click", () => {
  if (!speseTripRef) return;

  const nome = speseExtraNome.value.trim();
  const tipo = speseExtraTipo.value.trim();
  const costo = speseExtraCosto.value.trim();

  if (!nome) {
    showToast("⚠️ Inserisci il nome della spesa", "warning");
    return;
  }
  if (!tipo) {
    showToast("⚠️ Seleziona una tipologia", "warning");
    return;
  }
  if (!costo || parseFloat(costo) <= 0) {
    showToast("⚠️ Inserisci un costo valido", "warning");
    return;
  }

  if (!speseTripRef.speseExtra) speseTripRef.speseExtra = [];

  speseTripRef.speseExtra.push({
    id: Date.now(),
    nome: nome,
    tipologia: tipo,
    costo: parseFloat(costo)
  });

  // Pulisci il form
  speseExtraNome.value = "";
  speseExtraTipo.value = "";
  speseExtraCosto.value = "";

  renderSpeseExtra();
  showToast("✅ Spesa aggiunta", "success");
});

function deleteSpesaExtra(spesaId) {
  if (!speseTripRef || !speseTripRef.speseExtra) return;

  speseTripRef.speseExtra = speseTripRef.speseExtra.filter(s => s.id !== spesaId);
  renderSpeseExtra();
  showToast("❌ Spesa eliminata", "warning");
}

// Salva le spese nel localStorage
saveSpeseBtn.addEventListener("click", () => {
  if (!speseTripRef) return;

  const index = trips.findIndex(t => t.id === speseTripRef.id);
  if (index >= 0) trips[index] = speseTripRef;

  localStorage.setItem("trips", JSON.stringify(trips));

  // QUI in futuro: invio al backend delle spese collegate all'itinerario
  // (tabella "spese": titolo/nome, tipologia, costo)
  // inviaSpeseAlBackend(speseTripRef.id, speseTripRef.speseExtra);

  closeSpeseModal();
  showToast("💾 Spese salvate", "success");
});

// ================= TOAST =================

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  let bgColor = "#1a4d5c";
  if (type === "error") bgColor = "#ff4d4d";
  if (type === "success") bgColor = "#4caf50";
  if (type === "warning") bgColor = "#ff9800";

  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background-color: ${bgColor};
    color: white;
    padding: 1rem 1.5rem;
    border: 3px solid #000;
    border-radius: 0;
    box-shadow: 4px 4px 0 #000;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Animazioni toast (iniettate una sola volta)
const toastStyle = document.createElement("style");
toastStyle.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(toastStyle);

// ================= PDF =================
// NOTA: il PDF include destinazione, date, programma giornaliero, tappe.
// NON include le spese (per scelta).

function exportTripToPDF(trip) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const COLORS = {
    primary: [26, 77, 92],
    accent: [255, 107, 53],
    highlight: [255, 214, 10],
    dark: [0, 0, 0],
    white: [255, 255, 255],
    light: [248, 248, 248],
    gray: [107, 114, 128]
  };

  const PAGE_WIDTH = 210;
  const MARGIN = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

  function drawBrutalBox(x, y, w, h, fillColor, shadowOffset = 2) {
    doc.setFillColor(...COLORS.dark);
    doc.rect(x + shadowOffset, y + shadowOffset, w, h, 'F');
    doc.setFillColor(...fillColor);
    doc.setDrawColor(...COLORS.dark);
    doc.setLineWidth(0.8);
    doc.rect(x, y, w, h, 'FD');
  }

  function checkPageSpace(yPos, needed = 20) {
    if (yPos + needed > 280) {
      doc.addPage();
      return 20;
    }
    return yPos;
  }

  // ============ HEADER ============
  drawBrutalBox(MARGIN, 15, CONTENT_WIDTH, 35, COLORS.primary, 3);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text("TRAVEL", MARGIN + 8, 26);
  doc.setTextColor(...COLORS.accent);
  doc.text("BUDDY", MARGIN + 30, 26);

  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  const titolo = trip.title || "Itinerario Senza Titolo";
  const titoloTruncated = titolo.length > 35 ? titolo.substring(0, 35) + "..." : titolo;
  doc.text(titoloTruncated, MARGIN + 8, 42);

  let yOffset = 60;

  // ============ DESTINAZIONE ============
  if (trip.destination) {
    drawBrutalBox(MARGIN, yOffset, CONTENT_WIDTH, 12, COLORS.accent);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text(`DESTINAZIONE: ${trip.destination}`, MARGIN + 6, yOffset + 8);
    yOffset += 20;
  }

  // ============ BADGES STATO / VISIBILITA ============
  const statoText = trip.status === "DRAFT" ? "BOZZA" : "PUBBLICATO";
  const statoColor = trip.status === "DRAFT" ? COLORS.highlight : COLORS.primary;
  const statoTextColor = trip.status === "DRAFT" ? COLORS.dark : COLORS.white;

  drawBrutalBox(MARGIN, yOffset, 60, 12, statoColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...statoTextColor);
  doc.text(statoText, MARGIN + 6, yOffset + 8);

  const visText = trip.visibility === "PUBLIC" ? "PUBBLICO" : "PRIVATO";
  drawBrutalBox(MARGIN + 67, yOffset, 60, 12, COLORS.accent);
  doc.setTextColor(...COLORS.white);
  doc.text(visText, MARGIN + 73, yOffset + 8);

  yOffset += 22;

  // ============ PERIODO ============
  drawBrutalBox(MARGIN, yOffset, CONTENT_WIDTH, 14, COLORS.light);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  const startFormatted = trip.startDate ? trip.startDate.split('-').reverse().join('/') : '---';
  const endFormatted = trip.endDate ? trip.endDate.split('-').reverse().join('/') : '---';
  doc.text(`PERIODO:  ${startFormatted}  >>>  ${endFormatted}`, MARGIN + 6, yOffset + 9);

  yOffset += 24;

  // ============ PROGRAMMA GIORNALIERO ============
  if (trip.days && trip.days.length > 0) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.dark);
    doc.text("PROGRAMMA GIORNALIERO", MARGIN, yOffset);

    doc.setFillColor(...COLORS.accent);
    doc.rect(MARGIN, yOffset + 2, 80, 2, 'F');
    yOffset += 12;

    trip.days.forEach((day, idx) => {
      yOffset = checkPageSpace(yOffset, 25);

      const dateFormatted = day.date ? day.date.split('-').reverse().join('/') : '';
      drawBrutalBox(MARGIN, yOffset, CONTENT_WIDTH, 13, COLORS.primary);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.white);
      doc.text(`GIORNO ${idx + 1}`, MARGIN + 5, yOffset + 8.5);

      if (dateFormatted) {
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.highlight);
        doc.text(dateFormatted, MARGIN + 35, yOffset + 8.5);
      }

      if (day.title) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.white);
        const dayTitleTrunc = day.title.length > 40 ? day.title.substring(0, 40) + "..." : day.title;
        doc.text(dayTitleTrunc, MARGIN + 70, yOffset + 8.5);
      }

      yOffset += 18;

      if (day.stages && day.stages.length > 0) {
        day.stages.forEach(stage => {
          yOffset = checkPageSpace(yOffset, 20);

          doc.setFillColor(...COLORS.accent);
          doc.rect(MARGIN + 3, yOffset, 3, 10, 'F');

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...COLORS.dark);
          doc.text(stage.title, MARGIN + 10, yOffset + 7);
          yOffset += 11;

          if (stage.description) {
            doc.setFont("Helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(...COLORS.gray);
            const descLines = doc.splitTextToSize(stage.description, CONTENT_WIDTH - 20);
            descLines.forEach(line => {
              yOffset = checkPageSpace(yOffset, 6);
              doc.text(line, MARGIN + 10, yOffset);
              yOffset += 5;
            });
            yOffset += 2;
          }

          yOffset += 4;
        });
      } else {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.gray);
        doc.text("Nessuna tappa programmata", MARGIN + 10, yOffset + 3);
        yOffset += 10;
      }

      yOffset += 6;
    });
  } else {
    drawBrutalBox(MARGIN, yOffset, CONTENT_WIDTH, 20, COLORS.light);
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.gray);
    doc.text("Nessun giorno generato nell'itinerario.", MARGIN + 6, yOffset + 12);
  }

  // ============ FOOTER ============
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 287, PAGE_WIDTH, 3, 'F');
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.primary);
    doc.text("TravelBuddy", MARGIN, 295);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(...COLORS.gray);
    doc.text(`Pagina ${i} di ${pageCount}`, PAGE_WIDTH - MARGIN - 25, 295);
  }

  doc.save(`${trip.title ? trip.title.replace(/\s+/g, '_') : 'itinerario'}.pdf`);
}