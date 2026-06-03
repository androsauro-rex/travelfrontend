// ================= DOM =================

// NAVBAR
const logoutBtn = document.querySelector('.navbar-container .btn-secondary');

// CONTAINERS
const draftContainer = document.getElementById("draftTripsContainer");
const publishedContainer = document.getElementById("publishedTripsContainer");

// MODAL
const modal = document.getElementById("tripModal");
const modalContent = document.getElementById("modalContent");

// BUTTONS
const createBtn = document.getElementById("createTripBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// FORM INPUTS
const destinationInput = document.getElementById("tripDestination");
const titleInput = document.getElementById("tripTitle");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const budgetInput = document.getElementById("tripBudget");

// DAYS
const daysContainer = document.getElementById("daysContainer");

// ACTIONS
const saveDraftBtn = document.getElementById("saveDraftBtn");
const publishBtn = document.getElementById("publishBtn");
const generateDaysBtn = document.getElementById("generateDaysBtn");

// VISIBILITY
const visibilityToggle = document.getElementById("visibilityToggle");
const visibilityLabel = document.getElementById("visibilityLabel");

// ================= STATE =================

let trips = JSON.parse(localStorage.getItem("trips")) || [];
let currentTrip = null;
let activeEditingStage = null;

// ================= TOGGLE VISIBILITY =================

function updateVisibilityUI() {
  if (!currentTrip || !visibilityToggle || !visibilityLabel) return;

  const isPublic = currentTrip.visibilita === "PUBLIC";
  visibilityToggle.checked = isPublic;
  visibilityLabel.textContent = isPublic ? "Pubblico" : "Privato";
}

if (visibilityToggle) {
  visibilityToggle.addEventListener("change", () => {
    if (!currentTrip) return;
    currentTrip.visibilita = visibilityToggle.checked ? "PUBLIC" : "PRIVATE";
    updateVisibilityUI();
  });
}

// ================= INIT =================

document.addEventListener("DOMContentLoaded", renderTrips);

// ================= LOGOUT =================

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    showLogoutNotification();
    setTimeout(() => { window.location.href = "index.html"; }, 1000);
  });
}

function showLogoutNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 2rem; right: 2rem; background-color: #4caf50; color: white;
    padding: 1rem 1.5rem; border: 3px solid #000; box-shadow: 4px 4px 0 #000;
    font-weight: 600; font-family: 'Outfit', sans-serif; z-index: 10000;
  `;
  notification.textContent = '👋 A presto! Logout effettuato';
  document.body.appendChild(notification);
  setTimeout(() => { notification.remove(); }, 3000);
}

// ================= MODAL FIX =================

if (createBtn) {
  createBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(createEmptyTrip());
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });
}

// Cliccare sullo sfondo chiude la modale...
if (modal) {
  modal.addEventListener("click", (e) => {
    closeModal();
  });
}

// ...ma blocchiamo la propagazione del click quando avviene DENTRO il contenuto.
if (modalContent) {
  modalContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

function openModal(trip) {
  currentTrip = trip;
  activeEditingStage = null; 

  if (destinationInput) destinationInput.value = trip.destinazione || "";
  if (titleInput) titleInput.value = trip.titoloViaggio || "";
  if (startDateInput) startDateInput.value = trip.dataInizioViaggio || "";
  if (endDateInput) endDateInput.value = trip.dataFineViaggio || "";
  if (budgetInput) budgetInput.value = trip.budgetPianificato || "";

  if (!trip.visibilita) trip.visibilita = "PRIVATE";

  if (daysContainer) daysContainer.innerHTML = "";

  updateVisibilityUI();

  trip.days?.forEach((day, index) => renderDay(day, index));

  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  if (modal) modal.classList.add("hidden");
  currentTrip = null;
  activeEditingStage = null;
}

// ================= TRIP =================

function createEmptyTrip() {
  return {
    id: null,
    destinazione: "",
    titoloViaggio: "",
    likes: 0,
    visibilita: "PRIVATE",
    dataInizioViaggio: "",
    dataFineViaggio: "",
    budgetPianificato: 0,
    days: []
  };
}

// ================= SAVE =================

if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", (e) => {
    e.preventDefault();
    saveTrip("DRAFT");
  });
}

if (publishBtn) {
  publishBtn.addEventListener("click", (e) => {
    e.preventDefault();
    saveTrip("PUBLISHED");
  });
}

function saveTrip(status) {
  if (!currentTrip) return;

  currentTrip.destinazione = destinationInput ? destinationInput.value.trim() : "";
  currentTrip.titoloViaggio = titleInput ? titleInput.value.trim() : "";
  currentTrip.dataInizioViaggio = startDateInput ? startDateInput.value : "";
  currentTrip.dataFineViaggio = endDateInput ? endDateInput.value : "";
  currentTrip.budgetPianificato = budgetInput ? parseFloat(budgetInput.value) || 0 : 0;
  currentTrip.status = status; 

  if (!currentTrip.id) {
    currentTrip.id = Date.now(); 
  }

  const index = trips.findIndex(t => t.id === currentTrip.id);
  if (index >= 0) trips[index] = currentTrip;
  else trips.push(currentTrip);

  localStorage.setItem("trips", JSON.stringify(trips));
  renderTrips();
  closeModal();
}

// ================= DAYS =================

if (generateDaysBtn) {
  generateDaysBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!currentTrip || !startDateInput || !endDateInput) return;

    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);

    if (isNaN(start) || isNaN(end) || end < start) {
      alert("Inserisci un intervallo di date valido.");
      return;
    }

    currentTrip.days = [];
    if (daysContainer) daysContainer.innerHTML = "";

    let cursor = new Date(start);
    while (cursor <= end) {
      currentTrip.days.push({
        date: cursor.toISOString().split('T')[0],
        title: "",
        stages: []
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    currentTrip.days.forEach((day, index) => renderDay(day, index));
  });
}

// ================= STAGES MANAGEMENT =================

function addStage(dayIndex) {
  if (!currentTrip || !currentTrip.days[dayIndex]) return;

  const stageTitleInput = document.getElementById(`stage-title-${dayIndex}`);
  const stageDescInput = document.getElementById(`stage-desc-${dayIndex}`);
  
  if (!stageTitleInput) return;
  const stageTitle = stageTitleInput.value.trim();
  const stageDesc = stageDescInput ? stageDescInput.value.trim() : "";

  if (!stageTitle) {
    alert("Inserisci un titolo per la tappa");
    return;
  }

  currentTrip.days[dayIndex].stages.push({
    id: Date.now(),
    title: stageTitle,
    description: stageDesc
  });

  stageTitleInput.value = "";
  if (stageDescInput) stageDescInput.value = "";
  renderStages(dayIndex);
}

function deleteStage(dayIndex, stageId) {
  if (!currentTrip || !currentTrip.days[dayIndex]) return;
  currentTrip.days[dayIndex].stages = currentTrip.days[dayIndex].stages.filter(s => s.id !== stageId);
  if (activeEditingStage && activeEditingStage.dayIndex === dayIndex && activeEditingStage.stageId === stageId) {
    activeEditingStage = null;
  }
  renderStages(dayIndex);
}

function editStage(dayIndex, stageId) {
  activeEditingStage = { dayIndex, stageId };
  renderStages(dayIndex);
}

function saveEditedStage(dayIndex, stageId) {
  if (!currentTrip || !currentTrip.days[dayIndex]) return;

  const editTitleInput = document.getElementById(`edit-stage-title-${stageId}`);
  const editDescInput = document.getElementById(`edit-stage-desc-${stageId}`);

  if (!editTitleInput) return;
  const updatedTitle = editTitleInput.value.trim();
  const updatedDesc = editDescInput ? editDescInput.value.trim() : "";

  if (!updatedTitle) {
    alert("Il titolo della tappa non può essere vuoto.");
    return;
  }

  const stage = currentTrip.days[dayIndex].stages.find(s => s.id === stageId);
  if (stage) {
    stage.title = updatedTitle;
    stage.description = updatedDesc;
  }

  activeEditingStage = null;
  renderStages(dayIndex);
}

function cancelEditStage(dayIndex) {
  activeEditingStage = null;
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
      const isEditing = activeEditingStage && 
                        activeEditingStage.dayIndex === dayIndex && 
                        activeEditingStage.stageId === stage.id;

      if (isEditing) {
        const editBox = document.createElement("div");
        editBox.className = "stage-edit-box";
        editBox.innerHTML = `
          <input type="text" id="edit-stage-title-${stage.id}" class="stage-input" value="${stage.title}" style="margin-top:0;">
          <textarea id="edit-stage-desc-${stage.id}" class="stage-input" rows="2">${stage.description || ''}</textarea>
          <div class="stage-item-actions" style="align-self: flex-end; margin-top: 0.3rem;">
            <button type="button" class="btn-small btn-cancel-stage" data-day="${dayIndex}">Annulla</button>
            <button type="button" class="btn-small btn-save-stage" data-day="${dayIndex}" data-stage="${stage.id}">Salva</button>
          </div>
        `;
        stagesContainer.appendChild(editBox);
      } else {
        const stageItem = document.createElement("div");
        stageItem.className = "stage-item";
        stageItem.innerHTML = `
          <div class="stage-text">
            <div class="stage-title">📍 ${stage.title}</div>
            ${stage.description ? `<div class="stage-description">${stage.description}</div>` : ''}
          </div>
          <div class="stage-item-actions">
            <button type="button" class="btn-small btn-edit" data-day="${dayIndex}" data-stage="${stage.id}">Modifica</button>
            <button type="button" class="btn-small btn-delete" data-day="${dayIndex}" data-stage="${stage.id}">Elimina</button>
          </div>
        `;
        stagesContainer.appendChild(stageItem);
      }
    });
  }
}

function renderDay(day, index) {
  const dayCard = document.createElement("div");
  dayCard.className = "day-card";

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
      <input type="text" class="day-title-input" placeholder="Cosa farai in questo giorno?" value="${day.title || ''}">
    </div>
    <div class="form-group">
      <label style="font-weight: 700; margin-top: 0.8rem;">Tappe della giornata</label>
      <div id="stages-container-${index}" class="stages-container"></div>
      
      <div class="new-stage-box">
        <p class="new-stage-title">➕ Aggiungi una nuova tappa</p>
        <input type="text" id="stage-title-${index}" class="stage-input" placeholder="Titolo tappa..." style="margin-bottom: 0.8rem;">
        <textarea id="stage-desc-${index}" class="stage-input" placeholder="Descrizione (opzionale)" rows="2" style="margin-bottom: 0.8rem;"></textarea>
        <button type="button" class="btn-add-stage" data-day="${index}">+ Aggiungi tappa</button>
      </div>
    </div>
  `;

  dayCard.querySelector(".day-title-input").addEventListener("input", (e) => {
    if (currentTrip && currentTrip.days[index]) {
      currentTrip.days[index].title = e.target.value;
    }
  });

  dayCard.addEventListener("click", (e) => {
    const target = e.target;
    
    if (target.classList.contains("btn-add-stage")) {
      e.preventDefault();
      addStage(parseInt(target.getAttribute("data-day")));
    } 
    else if (target.classList.contains("btn-edit")) {
      e.preventDefault();
      editStage(parseInt(target.getAttribute("data-day")), parseInt(target.getAttribute("data-stage")));
    } 
    else if (target.classList.contains("btn-delete")) {
      e.preventDefault();
      deleteStage(parseInt(target.getAttribute("data-day")), parseInt(target.getAttribute("data-stage")));
    } 
    else if (target.classList.contains("btn-save-stage")) {
      e.preventDefault();
      saveEditedStage(parseInt(target.getAttribute("data-day")), parseInt(target.getAttribute("data-stage")));
    } 
    else if (target.classList.contains("btn-cancel-stage")) {
      e.preventDefault();
      cancelEditStage(parseInt(target.getAttribute("data-day")));
    }
  });

  if (daysContainer) daysContainer.appendChild(dayCard);
  renderStages(index);
}

// ================= RENDER DASHBOARD =================

function renderTrips() {
  if (!draftContainer || !publishedContainer) return;

  draftContainer.innerHTML = "";
  publishedContainer.innerHTML = "";

  trips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "trip-card";

    const badgeClass = trip.status === "DRAFT" ? "badge-draft" : "badge-published";
    const badgeText = trip.status === "DRAFT" ? "Bozza" : "Pubblicato";
    const displayTitle = trip.destinazione ? `${trip.destinazione}: ${trip.titoloViaggio || 'Senza titolo'}` : (trip.titoloViaggio || "Senza titolo");

    card.innerHTML = `
      <span class="status-badge ${badgeClass}">${badgeText}</span>
      <h3 class="trip-title">${displayTitle}</h3>
      <p style="font-size: 0.85rem; color: var(--gray); margin-bottom: 0.2rem;">Budget: <strong>€${parseFloat(trip.budgetPianificato || 0).toFixed(2)}</strong></p>
      <p style="font-size: 0.85rem; color: var(--gray); margin-bottom: 0.5rem;">
        ${trip.dataInizioViaggio ? trip.dataInizioViaggio.split('-').reverse().join('/') : '---'} ➔ ${trip.dataFineViaggio ? trip.dataFineViaggio.split('-').reverse().join('/') : '---'}
      </p>

      <div class="trip-actions">
        <button type="button" class="btn-primary open-btn">Apri</button>
        <button type="button" class="btn-danger del-btn">Elimina</button>
        <button type="button" class="btn-secondary pdf-btn">PDF</button>
      </div>
    `;

    card.querySelector(".open-btn").onclick = (e) => { e.preventDefault(); openModal(trip); };
    
    card.querySelector(".del-btn").onclick = (e) => {
      e.preventDefault();
      trips = trips.filter(t => t.id !== trip.id);
      localStorage.setItem("trips", JSON.stringify(trips));
      renderTrips();
    };

    card.querySelector(".pdf-btn").onclick = (e) => { e.preventDefault(); exportTripToPDF(trip); };

    if (trip.status === "DRAFT") draftContainer.appendChild(card);
    else publishedContainer.appendChild(card);
  });
}

// ================= PDF =================

function exportTripToPDF(trip) {
  if (!window.jspdf) {
    alert("Libreria jsPDF non caricata.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.text(trip.titoloViaggio || "Itinerario Senza Titolo", 10, 20);

  doc.setFontSize(12);
  doc.setFont("Helvetica", "normal");
  doc.text("Destinazione: " + (trip.destinazione || "Non specificata"), 10, 30);
  doc.text("Budget Pianificato: €" + parseFloat(trip.budgetPianificato || 0).toFixed(2), 10, 38);
  
  // FIX: Formattazione delle date nel PDF in formato Europeo/Italiano (GG/MM/AAAA)
  const dataInizioFormattata = trip.dataInizioViaggio ? trip.dataInizioViaggio.split('-').reverse().join('/') : '---';
  const dataFineFormattata = trip.dataFineViaggio ? trip.dataFineViaggio.split('-').reverse().join('/') : '---';
  doc.text(`Periodo: dal ${dataInizioFormattata} al ${dataFineFormattata}`, 10, 54);
  
  doc.line(10, 59, 200, 59);

  let yOffset = 69;
  if (trip.days && trip.days.length > 0) {
    doc.setFont("Helvetica", "bold");
    doc.text("Programma Giornaliero:", 10, yOffset);
    yOffset += 10;
    
    doc.setFont("Helvetica", "normal");
    trip.days.forEach((day, idx) => {
      if (yOffset > 270) { doc.addPage(); yOffset = 20; }
      const dayLine = `Giorno ${idx + 1} (${day.date ? day.date.split('-').reverse().join('/') : ''}): ${day.title || 'Nessuna attività programmata'}`;
      doc.text(dayLine, 15, yOffset);
      yOffset += 8;

      if (day.stages && day.stages.length > 0) {
        day.stages.forEach(stage => {
          if (yOffset > 270) { doc.addPage(); yOffset = 20; }
          doc.setFont("Helvetica", "bold"); doc.setFontSize(10);
          doc.text(`  • ${stage.title}`, 20, yOffset);
          yOffset += 6;

          if (stage.description) {
            doc.setFont("Helvetica", "normal"); doc.setFontSize(9);
            const descLines = doc.splitTextToSize(stage.description, 170);
            descLines.forEach(line => {
              if (yOffset > 270) { doc.addPage(); yOffset = 20; }
              doc.text(line, 25, yOffset);
              yOffset += 5;
            });
          }
          yOffset += 2;
        });
        doc.setFontSize(12); doc.setFont("Helvetica", "normal");
      }
      yOffset += 2;
    });
  } else {
    doc.text("Nessun giorno generato nell'itinerario.", 10, yOffset);
  }

  doc.save(`${trip.titoloViaggio ? trip.titoloViaggio.replace(/\s+/g, '_') : 'itinerario'}.pdf`);
}