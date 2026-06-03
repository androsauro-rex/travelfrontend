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
  eta: false,
  email: false,
  password: false,
  termini: false
};

// ================= EVENT LISTENERS =================

document.addEventListener('DOMContentLoaded', () => {
  nameInput.addEventListener('input', validateName);
  surnameInput.addEventListener('input', validateSurname);
  nicknameInput.addEventListener('input', validateNickname);
  ageInput.addEventListener('input', validateAge);
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', validatePassword);
  checkboxInput.addEventListener('change', validateCheckbox);
  
  form.addEventListener('submit', handleFormSubmit);
  
  // Disattiva il bottone al caricamento
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
      showError(ageInput, 'L\'età è obbligatoria');
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
      showError(emailInput, 'L\'email è obbligatoria');
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

function validateCheckbox() {
  if (checkboxInput.checked) {
    validationState.termini = true;
    removeError(checkboxInput);
  } else {
    validationState.termini = false;
    showError(checkboxInput, 'Devi accettare i termini e condizioni');
  }
  
  updateButtonState();
}

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
  
  // Validazione finale
  validateName();
  validateSurname();
  validateNickname();
  validateAge();
  validateEmail();
  validatePassword();
  validateCheckbox();
  
  const isFormValid = Object.values(validationState).every(value => value === true);
  
  if (!isFormValid) {
    showNotification('Per favore, compila tutti i campi correttamente', 'error');
    return;
  }
  
  // Raccogli i dati del form
  const userData = {
    nome: nameInput.value.trim(),
    cognome: surnameInput.value.trim(),
    nickname: nicknameInput.value.trim(),
    eta: parseInt(ageInput.value),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    dataRegistrazione: new Date().toISOString()
  };
  
  console.log('📤 Invio dati:', userData);
  
  // Mostra loading
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Registrazione in corso...';
  
  try {
    // Invia i dati al backend Spring Boot
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const data = await response.json();
      showNotification('Registrazione completata! Benvenuto su TravelBuddy! 🎉', 'success');
      
      // Salva token se fornito
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Salva dati utente
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Redirect dopo 2 secondi
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      // Gestisci errori dal backend
      const errorData = await response.json();
      showNotification(errorData.message || 'Errore durante la registrazione', 'error');
      resetButton();
    }
  } catch (error) {
    console.error('Errore:', error);
    
    // FALLBACK: Se il backend non è disponibile, salva in localStorage (provvisorio)
    if (error.message.includes('Failed to fetch') || error.code === 'ECONNREFUSED') {
      console.log('⚠️ Backend non disponibile, salvo in localStorage');
      saveUserLocally(userData);
      showNotification('Backend non disponibile. Dati salvati localmente. ✅', 'warning');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      showNotification('Errore di connessione. Riprova più tardi.', 'error');
      resetButton();
    }
  }
}

// ================= FALLBACK: SAVE LOCALLY =================

function saveUserLocally(userData) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Controlla se l'email esiste già
  const userExists = users.some(user => user.email === userData.email);
  if (userExists) {
    showNotification('Questo email è già registrato!', 'error');
    resetButton();
    return false;
  }
  
  // Aggiungi nuovo utente
  users.push({
    ...userData,
    id: Date.now(),
    password: btoa(userData.password) // Encoding semplice (NON usare in produzione!)
  });
  
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(userData));
  
  console.log('💾 Utente salvato in localStorage');
  return true;
}

// ================= NOTIFICATION SYSTEM =================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  
  let bgColor = '#1a4d5c'; // default
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

// Aggiungi animazioni CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
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
console.log('🔧 Backend endpoint: http://localhost:8080/api/auth/register');