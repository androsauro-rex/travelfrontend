// ============================================================
//  api.js  —  Versione a DUE PROGETTI (AUTH separato)
//  Include questo file PRIMA di login.js e dashboard.js
// ============================================================

// DUE indirizzi base: uno per AUTH (login), uno per TravelBuddy (dati)
const AUTH_BASE = "http://localhost:8081/api/v1";   // progetto AUTH (biglietteria)
const APP_BASE  = "http://localhost:8080/api/v1";   // progetto TravelBuddy (dati)

// ---------- GESTIONE TOKEN ----------

function salvaAuth(loginResponse) {
  // loginResponse = { token, id, nickname, ruolo }  (adatta ai campi che AUTH ti restituisce)
  localStorage.setItem("authToken", loginResponse.token);
  localStorage.setItem("userId", loginResponse.id);
  localStorage.setItem("nickname", loginResponse.nickname || "");
  localStorage.setItem("ruolo", loginResponse.ruolo || "");
}

function getToken() {
  return localStorage.getItem("authToken");
}

function isLoggedIn() {
  return !!getToken();
}

function logoutPulisci() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("nickname");
  localStorage.removeItem("ruolo");
}

// Header con il token, per le chiamate protette verso TravelBuddy
function authHeaders() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  return headers;
}

// ---------- TRADUTTORE FRONTEND -> BACKEND ----------

function traduciVisibilita(v) {
  return v === "PUBLIC" ? "PUBBLICO" : "PRIVATO";
}

function traduciGiorno(day) {
  return {
    descrizioneAttivitaGiorno: day.title && day.title.trim() !== "" ? day.title : "Giornata",
    data: day.date,
    tappe: (day.stages || []).map(stage => ({
      nomeTappa: stage.title,
      descrizioneTappa: stage.description || null
    }))
  };
}

function costruisciBodyCreazione(trip) {
  return {
    itinerarioCreateDTO: {
      titoloViaggio: trip.title,
      visibilita: traduciVisibilita(trip.visibility),
      dataInizioViaggio: trip.startDate,
      dataFineViaggio: trip.endDate,
      budgetPianificato: Number(trip.budgetPianificato)
    },
    destinazioneDTO: { nomeDestinazione: trip.destination },
    giornoDTO: (trip.days || []).map(traduciGiorno)
  };
}

function costruisciBodyModifica(trip) {
  return {
    itinerarioDTO: {
      titoloViaggio: trip.title,
      visibilita: traduciVisibilita(trip.visibility),
      dataInizioViaggio: trip.startDate,
      dataFineViaggio: trip.endDate,
      budgetPianificato: Number(trip.budgetPianificato),
      recensioneItinerario: trip.recensioneItinerario || null
    },
    giornoDTO: (trip.days || []).map(traduciGiorno)
  };
}

// ============================================================
//  CHIAMATA 1 — LOGIN  -> va al progetto AUTH (porta 8081)
//  Avviene al click di "Accedi", manda email+password,
//  riceve il token.
// ============================================================
async function apiLogin(email, password) {
  const res = await fetch(AUTH_BASE + "/public/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Login fallito");
  }
  return res.json(); // { token, id, nickname, ruolo }
}

// ============================================================
//  CHIAMATE 2 — DATI  -> vanno al progetto TravelBuddy (8080)
//  Portano il token nell'header. TravelBuddy lo verifica
//  da solo (stessa jwt.secret di AUTH) e ti autorizza.
// ============================================================
async function apiCreaItinerario(trip) {
  const res = await fetch(APP_BASE + "/user/creazione/itinerario/completo", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(costruisciBodyCreazione(trip))
  });
  if (!res.ok) throw new Error(await res.text() || "Creazione fallita");
  return res.json();
}

async function apiModificaItinerario(idItinerario, trip) {
  const res = await fetch(APP_BASE + "/user/modifica/itinerario/" + idItinerario, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(costruisciBodyModifica(trip))
  });
  if (!res.ok) throw new Error(await res.text() || "Modifica fallita");
  return res.json();
}

async function apiEliminaItinerario(idItinerario) {
  const res = await fetch(APP_BASE + "/user/itinerario/" + idItinerario, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await res.text() || "Eliminazione fallita");
  return true;
}

// ============================================================
//  SPESE  —  collegamento al backend TravelBuddy
// ============================================================

// Traduce la tipologia dal frontend all'enum Java EnumTipologiaSpesa
function traduciTipologiaSpesa(tipoFrontend) {
  const mappa = {
    "Trasporti": "TRASPORTO",
    "Alloggi": "ALLOGGIO",
    "Cibo": "CIBO",
    "Attrazioni": "ATTRAZIONE",
    "Shopping": "SHOPPING",
    "Extra": "ALTRO"
  };
  return mappa[tipoFrontend] || "ALTRO";
}

// Costruisce il corpo di UNA spesa per il backend (SpesaDTO)
// Frontend: { nome, tipologia, costo }  ->  Backend: { tipologia, costo, descrizioneSpesa }
function costruisciBodySpesa(spesa) {
  return {
    tipologia: traduciTipologiaSpesa(spesa.tipologia),
    costo: Number(spesa.costo),
    descrizioneSpesa: spesa.nome   // il "nome" del frontend diventa descrizioneSpesa
    // niente data: la mette il backend
  };
}

// AGGIUNGE una spesa a un itinerario (ritorna la spesa creata, con id del DB)
async function apiAggiungiSpesa(idItinerario, spesa) {
  const res = await fetch(APP_BASE + "/user/itinerario/" + idItinerario + "/spesa", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(costruisciBodySpesa(spesa))
  });
  if (!res.ok) throw new Error(await res.text() || "Aggiunta spesa fallita");
  return res.json();
}

// ELENCA le spese di un itinerario
async function apiGetSpese(idItinerario) {
  const res = await fetch(APP_BASE + "/common/itinerario/" + idItinerario + "/spese", {
    method: "GET",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await res.text() || "Lettura spese fallita");
  return res.json();
}

// ELIMINA una spesa dal DB
async function apiEliminaSpesa(idSpesa) {
  const res = await fetch(APP_BASE + "/user/spesa/" + idSpesa, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error(await res.text() || "Eliminazione spesa fallita");
  return true;
}