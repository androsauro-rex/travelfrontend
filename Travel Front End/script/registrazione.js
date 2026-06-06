// ================= DOM ELEMENTS =================

const form = document.querySelector('.registration-form');
const nameInput = document.getElementById('nome');
const surnameInput = document.getElementById('cognome');
const nicknameInput = document.getElementById('nickname');
const ageInput = document.getElementById('eta');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const checkboxInput = document.querySelector('input[type="checkbox"]');
const submitBtn = document.querySelector('.btn-register');

// ================= VALIDATION STATE =================

let validationState = {
  nome: false,
  cognome: false,
  nickname: false,
  email: false,
  eta: false,
  password: false,
  // ✅ MODIFICA 1: rimosso "termini" — era commentato qui ma scritto
  // dinamicamente da validateCheckbox(), causando comportamento imprevedibile
};

// ================= EVENT LISTENERS =================

document.addEventListener('DOMContentLoaded', () => {
  nameInput.addEventListener('input', validateName);
  surnameInput.addEventListener('input', validateSurname);
  nicknameInput.addEventListener('input', validateNickname);
  ageInput.addEventListener('input', validateAge);
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', validatePassword);
  // ✅ MODIFICA 2: rimosso listener sulla checkbox — non è parte della validazione
  // checkboxInput.addEventListener('change', validateCheckbox);

  form.addEventListener('submit', handleFormSubmit);

  updateButtonState();

  console.log('✅ Form validation inizializzato');
});


// ================= VALIDATION FUNCTIONS =================

function validateName() {
  const value = nameInput.value.trim();

  if (value.length > 0 && value.length <= 128) {
    validationState.nome = true;
    removeError(nameInput);
  } else {
    validationState.nome = false;
    if (value.length === 0) {
      showError(nameInput, 'Il nome è obbligatorio');
    } else {
      showError(nameInput, 'Il nome deve avere massimo 128 caratteri');
    }
  }

  updateButtonState();
}

function validateSurname() {
  const value = surnameInput.value.trim();

  if (value.length > 0 && value.length <= 128) {
    validationState.cognome = true;
    removeError(surnameInput);
  } else {
    validationState.cognome = false;
    if (value.length === 0) {
      showError(surnameInput, 'Il cognome è obbligatorio');
    } else {
      showError(surnameInput, 'Il cognome deve avere massimo 128 caratteri');
    }
  }

  updateButtonState();
}

function validateNickname() {
  const value = nicknameInput.value.trim();

  if (value.length >= 3 && value.length <= 50) {
    validationState.nickname = true;
    removeError(nicknameInput);
  } else {
    validationState.nickname = false;
    if (value.length === 0) {
      showError(nicknameInput, 'Il nickname è obbligatorio');
    } else if (value.length < 3) {
      showError(nicknameInput, 'Il nickname deve avere almeno 3 caratteri');
    } else {
      showError(nicknameInput, 'Il nickname deve avere massimo 50 caratteri');
    }
  }

  updateButtonState();
}

function validateAge() {
  const value = parseInt(ageInput.value);

  if (!isNaN(value) && value >= 18 && value <= 120) {
    validationState.eta = true;
    removeError(ageInput);
  } else {
    validationState.eta = false;
    if (ageInput.value === '' || isNaN(value)) {
      showError(ageInput, "L'età è obbligatoria");
    } else {
      showError(ageInput, 'Devi avere almeno 18 anni');
    }
  }

  updateButtonState();
}

function validateEmail() {
  const value = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(value)) {
    validationState.email = true;
    removeError(emailInput);
  } else {
    validationState.email = false;
    if (value === '') {
      showError(emailInput, "L'email è obbligatoria");
    } else {
      showError(emailInput, 'Inserisci un email valido (es: user@domain.com)');
    }
  }

  updateButtonState();
}

function validatePassword() {
  const value = passwordInput.value;

  if (value.length >= 6 && value.length <= 20) {
    validationState.password = true;
    removeError(passwordInput);
  } else {
    validationState.password = false;
    if (value === '') {
      showError(passwordInput, 'La password è obbligatoria');
    } else if (value.length < 6) {
      showError(passwordInput, 'La password deve avere almeno 6 caratteri');
    } else {
      showError(passwordInput, 'La password deve avere massimo 20 caratteri');
    }
  }

  updateButtonState();
}

// ✅ MODIFICA 3: rimossa la funzione validateCheckbox() interamente —
// scriveva validationState.termini dinamicamente anche se non era
// dichiarato nel validationState, inquinando Object.values()

// ================= UPDATE BUTTON STATE =================

function updateButtonState() {
  const isFormValid = Object.values(validationState).every(value => value === true);

  console.log('Validation State:', validationState);
  console.log('Form Valid:', isFormValid);

  if (isFormValid) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
    console.log('✅ BOTTONE ATTIVO');
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
    console.log('❌ Bottone disattivo');
  }
}

// ================= ERROR HANDLING =================

function showError(input, message) {
  removeError(input);

  const errorEl = document.createElement('span');
  errorEl.className = 'error-message';
  errorEl.textContent = '❌ ' + message;
  errorEl.style.cssText = `
    color: #ff4d4d;
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.3rem;
    display: block;
  `;

  input.style.borderColor = '#ff4d4d';
  input.style.boxShadow = '3px 3px 0 #ff4d4d';

  input.parentElement.appendChild(errorEl);
}

function removeError(input) {
  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.remove();
  }

  input.style.borderColor = '';
  input.style.boxShadow = '';
}

// ================= FORM SUBMISSION =================

async function handleFormSubmit(e) {
  e.preventDefault();

  validateName();
  validateSurname();
  validateNickname();
  validateAge();
  validateEmail();
  validatePassword();
  // ✅ MODIFICA 4: rimossa chiamata a validateCheckbox() — non esiste più

  const isFormValid = Object.values(validationState).every(value => value === true);

  if (!isFormValid) {
    showNotification('Per favore, compila tutti i campi correttamente', 'error');
    return;
  }

  const userData = {
    nome:     nameInput.value.trim(),
    cognome:  surnameInput.value.trim(),
    nickname: nicknameInput.value.trim(),
    email:    emailInput.value.trim(),
    eta:      parseInt(ageInput.value),
    password: passwordInput.value,
  };

  console.log('📤 Invio dati:', userData);

  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Registrazione in corso...';

  try {
    const response = await fetch('http://localhost:8080/api/v1/guest/registrazione', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      // ✅ MODIFICA 5: rimossa la lettura di data.token — la registrazione
      // restituisce l'Utente creato, non un token JWT. Il token si ottiene
      // solo dopo il login. Rimosso anche il salvataggio in localStorage.
      showNotification('Registrazione completata! Benvenuto su TravelBuddy! 🎉', 'success');
      setTimeout(() => {
        window.location.href = 'login.html'; // ✅ MODIFICA 6: redirect al login, non alla dashboard
      }, 2000);

    } else if (response.status === 409) {
      // ✅ MODIFICA 7: gestione esplicita per email/nickname duplicati
      const errorData = await response.json();
      showNotification(errorData.message || 'Email o nickname già in uso', 'error');
      resetButton();

    } else if (response.status === 400) {
      // Validazione @Valid fallita — il GlobalExceptionHandler restituisce
      // una mappa { campo: messaggio }
      const errorData = await response.json();
      showNotification('Dati non validi. Controlla i campi.', 'error');
      console.error('Errori validazione:', errorData);
      resetButton();

    } else {
      showNotification('Errore durante la registrazione', 'error');
      resetButton();
    }

  } catch (error) {
    // ✅ MODIFICA 8: rimosso il fallback saveUserLocally — se il server
    // non risponde, l'utente non è registrato nel DB. Fingere il contrario
    // è scorretto. Si mostra semplicemente un errore.
    console.error('Errore di rete:', error);
    showNotification('Impossibile contattare il server. Riprova più tardi.', 'error');
    resetButton();
  }
}

// ================= NOTIFICATION SYSTEM =================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');

  let bgColor = '#1a4d5c';
  if (type === 'error') bgColor = '#ff4d4d';
  if (type === 'success') bgColor = '#4caf50';
  if (type === 'warning') bgColor = '#ff9800';

  notification.style.cssText = `
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
    max-width: 400px;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0);     opacity: 1; }
    to   { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ================= RESET BUTTON =================

function resetButton() {
  submitBtn.disabled = false;
  submitBtn.textContent = 'Registrati';
  updateButtonState();
}

console.log('✅ Form validation script caricato');
console.log('🔧 Backend endpoint: http://localhost:8080/api/v1/guest/registrazione');