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
const titleInput = document.getElementById("tripTitle");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

// DAYS
const daysContainer = document.getElementById("daysContainer");

// ACTIONS
const saveDraftBtn = document.getElementById("saveDraftBtn");
const publishBtn = document.getElementById("publishBtn");
const generateDaysBtn = document.getElementById("generateDaysBtn");

// 🔥 VISIBILITY
const visibilityToggle = document.getElementById("visibilityToggle");
const visibilityLabel = document.getElementById("visibilityLabel");

// ================= ENUM SPESE =================

const SPESA_TYPES = {
  VITTO: "Cibo",
  TRASPORTO: "Trasporto",
  ALLOGGIO: "Alloggio",
  ATTRAZIONE: "Attrazione",
  SHOPPING: "Shopping",
  ALTRO: "Altro"
};

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

// ================= LOGOUT =================

logoutBtn.addEventListener("click", () => {
  // Rimuovi token e dati utente dal localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  
  // Mostra messaggio
  showLogoutNotification();
  
  // Redirect alla pagina index dopo 1 secondo
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

// ================= MODAL =================

createBtn.addEventListener("click", () => {
  openModal(createEmptyTrip());
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  // Chiudi SOLO se il click è avvenuto direttamente sullo sfondo della modale
  // (e non su un elemento interno che potrebbe essere stato rimosso dinamicamente)
  if (e.target === modal) closeModal();
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

  // Calcola budget totale da tutte le spese
  let budgetTotale = 0;
  currentTrip.days.forEach(day => {
    day.stages.forEach(stage => {
      if (stage.spese && stage.spese.length > 0) {
        stage.spese.forEach(spesa => {
          budgetTotale += parseFloat(spesa.costo) || 0;
        });
      }
    });
  });
  currentTrip.budgetPianificato = budgetTotale;

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

// ================= STAGES MANAGEMENT =================

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
    day.stages.forEach((stage, stageIndex) => {
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

      // Renderizza spese della tappa
      renderSpese(dayIndex, stageIndex, stage);
    });
  }
}

// ================= SPESE MANAGEMENT =================

function renderSpese(dayIndex, stageIndex, stage) {
  const stagesContainer = document.getElementById(`stages-container-${dayIndex}`);
  
  // Container spese
  const speseContainer = document.createElement("div");
  speseContainer.className = "spese-container";
  
  const speseHeader = document.createElement("div");
  speseHeader.className = "spese-header";
  speseHeader.textContent = "💰 Spese per questa tappa";
  speseContainer.appendChild(speseHeader);

  // Mostra spese esistenti
  if (stage.spese && stage.spese.length > 0) {
    stage.spese.forEach(spesa => {
      const speseItem = document.createElement("div");
      speseItem.className = "spesa-item";
      speseItem.innerHTML = `
        <div class="spesa-info">
          <span class="spesa-type">${spesa.tipologia}</span> - 
          <span class="spesa-amount">€${parseFloat(spesa.costo).toFixed(2)}</span>
          ${spesa.descrizione ? `<span class="spesa-desc">${spesa.descrizione}</span>` : ''}
        </div>
        <button type="button" class="btn-small btn-spesa-delete" onclick="deleteSpesa(${dayIndex}, ${stageIndex}, ${spesa.id})">Elimina</button>
      `;
      speseContainer.appendChild(speseItem);
    });
  }

  // Form aggiunta spesa
  const addSpeseDiv = document.createElement("div");
  addSpeseDiv.className = "add-spesa-box";

  let speseTypeOptions = '<option value="">Seleziona tipo...</option>';
  Object.entries(SPESA_TYPES).forEach(([key, val]) => {
    speseTypeOptions += `<option value="${val}">${val}</option>`;
  });

  addSpeseDiv.innerHTML = `
    <div class="spesa-input-row">
      <select id="spesa-type-${dayIndex}-${stageIndex}" class="spesa-select">
        ${speseTypeOptions}
      </select>
      <input type="number" id="spesa-costo-${dayIndex}-${stageIndex}" class="spesa-cost-input" placeholder="€ Costo" step="0.01" min="0">
    </div>
    <input type="text" id="spesa-desc-${dayIndex}-${stageIndex}" class="spesa-desc-input" placeholder="Descrizione (opzionale)">
    <button type="button" class="btn-spesa" onclick="addSpesa(${dayIndex}, ${stageIndex})">+ Aggiungi Spesa</button>
  `;

  speseContainer.appendChild(addSpeseDiv);
  stagesContainer.appendChild(speseContainer);
}

function addSpesa(dayIndex, stageIndex) {
  if (!currentTrip || !currentTrip.days[dayIndex] || !currentTrip.days[dayIndex].stages[stageIndex]) return;

  const stage = currentTrip.days[dayIndex].stages[stageIndex];

  const typeSelect = document.getElementById(`spesa-type-${dayIndex}-${stageIndex}`);
  const costoInput = document.getElementById(`spesa-costo-${dayIndex}-${stageIndex}`);
  const descInput = document.getElementById(`spesa-desc-${dayIndex}-${stageIndex}`);

  const tipo = typeSelect.value.trim();
  const costo = costoInput.value.trim();
  const desc = descInput.value.trim();

  if (!tipo || !costo) {
    alert("Inserisci tipo e costo della spesa");
    return;
  }

  // Inizializza array spese se non esiste
  if (!stage.spese) {
    stage.spese = [];
  }

  stage.spese.push({
    id: Date.now(),
    tipologia: tipo,
    costo: parseFloat(costo),
    descrizione: desc
  });

  typeSelect.value = "";
  costoInput.value = "";
  descInput.value = "";

  renderStages(dayIndex);
  showToast("✅ Spesa aggiunta!", "success");
}

function deleteSpesa(dayIndex, stageIndex, speseId) {
  if (!currentTrip || !currentTrip.days[dayIndex] || !currentTrip.days[dayIndex].stages[stageIndex]) return;

  const stage = currentTrip.days[dayIndex].stages[stageIndex];

  if (stage.spese) {
    stage.spese = stage.spese.filter(s => s.id !== speseId);
    renderStages(dayIndex);
    showToast("❌ Spesa eliminata", "warning");
  }
}

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

  // Ascolta i cambiamenti sul titolo del giorno e aggiorna lo stato in tempo reale
  const input = dayCard.querySelector(".day-title-input");
  input.addEventListener("input", (e) => {
    if (currentTrip && currentTrip.days[index]) {
      currentTrip.days[index].title = e.target.value;
    }
  });

  // Permetti di aggiungere una tappa premendo Ctrl+Enter sulla descrizione
  const stageDescInput = dayCard.querySelector(`#stage-desc-${index}`);
  stageDescInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      addStage(index);
    }
  });

  daysContainer.appendChild(dayCard);

  // Renderizza le tappe già esistenti
  renderStages(index);
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

    // Calcola budget totale da tutte le spese
    let budgetTotale = 0;
    trip.days?.forEach(day => {
      day.stages?.forEach(stage => {
        stage.spese?.forEach(spesa => {
          budgetTotale += parseFloat(spesa.costo) || 0;
        });
      });
    });

    card.innerHTML = `
      <span class="status-badge ${badgeClass}">${badgeText}</span>
      <h3 class="trip-title">${trip.title || "Senza titolo"}</h3>
      <p style="font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem;">
        ${trip.startDate ? trip.startDate.split('-').reverse().join('/') : '---'} ➔ ${trip.endDate ? trip.endDate.split('-').reverse().join('/') : '---'}
      </p>
      ${budgetTotale > 0 ? `
        <p style="font-size: 0.85rem; color: #ff6b35; font-weight: 700; margin-bottom: 0.8rem;">
          💰 Budget: €${budgetTotale.toFixed(2)}
        </p>
      ` : ''}

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

  // ===== PALETTE NEW BRUTALISM (RGB) =====
  const COLORS = {
    primary: [26, 77, 92],      // #1a4d5c blu marino
    accent: [255, 107, 53],     // #ff6b35 arancione
    highlight: [255, 214, 10],  // #ffd60a giallo
    dark: [0, 0, 0],            // nero
    white: [255, 255, 255],     // bianco
    light: [248, 248, 248],     // grigio chiaro
    gray: [107, 114, 128]       // grigio
  };

  const PAGE_WIDTH = 210;
  const MARGIN = 15;
  const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

  // ===== HELPER: Box con ombra brutalist =====
  function drawBrutalBox(x, y, w, h, fillColor, shadowOffset = 2) {
    // Ombra (rettangolo nero spostato)
    doc.setFillColor(...COLORS.dark);
    doc.rect(x + shadowOffset, y + shadowOffset, w, h, 'F');
    // Box principale
    doc.setFillColor(...fillColor);
    doc.setDrawColor(...COLORS.dark);
    doc.setLineWidth(0.8);
    doc.rect(x, y, w, h, 'FD');
  }

  // ===== HELPER: Controlla spazio pagina =====
  function checkPageSpace(yPos, needed = 20) {
    if (yPos + needed > 280) {
      doc.addPage();
      return 20;
    }
    return yPos;
  }

  // Calcola budget totale
  let budgetTotale = 0;
  trip.days?.forEach(day => {
    day.stages?.forEach(stage => {
      stage.spese?.forEach(spesa => {
        budgetTotale += parseFloat(spesa.costo) || 0;
      });
    });
  });

  // ============ HEADER ============
  // Box header blu marino
  drawBrutalBox(MARGIN, 15, CONTENT_WIDTH, 35, COLORS.primary, 3);

  // Logo TravelBuddy
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text("TRAVEL", MARGIN + 8, 26);
  doc.setTextColor(...COLORS.accent);
  doc.text("BUDDY", MARGIN + 30, 26);

  // Titolo viaggio
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  const titolo = trip.title || "Itinerario Senza Titolo";
  const titoloTruncated = titolo.length > 35 ? titolo.substring(0, 35) + "..." : titolo;
  doc.text(titoloTruncated, MARGIN + 8, 42);

  let yOffset = 60;

  // ============ INFO BADGES ============
  // Badge Stato
  const statoText = trip.status === "DRAFT" ? "BOZZA" : "PUBBLICATO";
  const statoColor = trip.status === "DRAFT" ? COLORS.highlight : COLORS.primary;
  const statoTextColor = trip.status === "DRAFT" ? COLORS.dark : COLORS.white;
  
  drawBrutalBox(MARGIN, yOffset, 45, 12, statoColor);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...statoTextColor);
  doc.text(statoText, MARGIN + 5, yOffset + 8);

  // Badge Visibilità
  const visText = trip.visibility === "PUBLIC" ? "PUBBLICO" : "PRIVATO";
  drawBrutalBox(MARGIN + 52, yOffset, 45, 12, COLORS.accent);
  doc.setTextColor(...COLORS.white);
  doc.text(visText, MARGIN + 57, yOffset + 8);

  // Badge Budget
  drawBrutalBox(MARGIN + 104, yOffset, 75, 12, COLORS.highlight);
  doc.setTextColor(...COLORS.dark);
  doc.text(`BUDGET: EUR ${budgetTotale.toFixed(2)}`, MARGIN + 109, yOffset + 8);

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
    
    // Titolo sezione
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.dark);
    doc.text("PROGRAMMA GIORNALIERO", MARGIN, yOffset);
    
    // Linea accent sotto il titolo
    doc.setFillColor(...COLORS.accent);
    doc.rect(MARGIN, yOffset + 2, 80, 2, 'F');
    yOffset += 12;

    trip.days.forEach((day, idx) => {
      yOffset = checkPageSpace(yOffset, 25);

      // ===== HEADER GIORNO =====
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

      // Titolo del giorno (a destra)
      if (day.title) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.white);
        const dayTitleTrunc = day.title.length > 40 ? day.title.substring(0, 40) + "..." : day.title;
        doc.text(dayTitleTrunc, MARGIN + 70, yOffset + 8.5);
      }

      yOffset += 18;

      // ===== TAPPE =====
      if (day.stages && day.stages.length > 0) {
        day.stages.forEach(stage => {
          yOffset = checkPageSpace(yOffset, 20);

          // Box tappa con accent arancione a sinistra
          doc.setFillColor(...COLORS.accent);
          doc.rect(MARGIN + 3, yOffset, 3, 10, 'F');

          // Titolo tappa
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(...COLORS.dark);
          doc.text(stage.title, MARGIN + 10, yOffset + 7);
          yOffset += 11;

          // Descrizione tappa
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

          // ===== SPESE =====
          if (stage.spese && stage.spese.length > 0) {
            // Calcola altezza box spese
            const speseHeight = 8 + (stage.spese.length * 6);
            yOffset = checkPageSpace(yOffset, speseHeight + 5);

            // Box spese giallo chiaro
            drawBrutalBox(MARGIN + 10, yOffset, CONTENT_WIDTH - 20, speseHeight, [255, 248, 220]);

            // Header spese
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...COLORS.accent);
            doc.text("SPESE", MARGIN + 14, yOffset + 6);

            let speseY = yOffset + 12;
            stage.spese.forEach(spesa => {
              doc.setFont("Helvetica", "bold");
              doc.setFontSize(8);
              doc.setTextColor(...COLORS.primary);
              doc.text(`${spesa.tipologia}:`, MARGIN + 14, speseY);
              
              doc.setTextColor(...COLORS.accent);
              doc.text(`EUR ${parseFloat(spesa.costo).toFixed(2)}`, MARGIN + 45, speseY);
              
              if (spesa.descrizione) {
                doc.setFont("Helvetica", "normal");
                doc.setTextColor(...COLORS.gray);
                const descTrunc = spesa.descrizione.length > 50 ? spesa.descrizione.substring(0, 50) + "..." : spesa.descrizione;
                doc.text(`- ${descTrunc}`, MARGIN + 75, speseY);
              }
              speseY += 6;
            });

            yOffset += speseHeight + 4;
          }

          yOffset += 4;
        });
      } else {
        // Nessuna tappa
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

  // ============ FOOTER su ogni pagina ============
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Linea footer accent
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 287, PAGE_WIDTH, 3, 'F');
    
    // Testo footer
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