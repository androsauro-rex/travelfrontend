const email = document.getElementById("email");
const pass = document.getElementById("password");
const button = document.getElementById("btn");
const form = document.querySelector(".login-form");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ================= VALIDAZIONE =================

function checkInputs() {
  const emailOk = emailRegex.test(email.value);
  const passOk = pass.value.length >= 6;

  button.disabled = !(emailOk && passOk);
}

form.addEventListener("input", checkInputs);

// ================= LOGIN STATICO =================

form.addEventListener("submit", (e) => {
  e.preventDefault();

  button.disabled = true;

  const emailValue = email.value.trim();
  const passValue = pass.value.trim();

  // simulazione login
  if (!emailRegex.test(emailValue) || passValue.length < 6) {
    showToast("Credenziali non valide ❌");
    button.disabled = false;
    return;
  }

  showToast("Login effettuato 🎉");

  // simula tempo di login
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 800);
});

// ================= TOAST =================

function showToast(message) {
  const toast = document.createElement("div");

  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #1a4d5c;
    color: white;
    padding: 1rem 1.5rem;
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ================= ANIMAZIONI =================

const style = document.createElement("style");
style.textContent = `
@keyframes slideIn {
  from { transform: translateX(300px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(300px); opacity: 0; }
}
`;
document.head.appendChild(style);


// =============FETCH API===================


//Inviare email e password, lato backend confronta con il JWT, se corrispondono l'utene viene autenticato e può fare l'accesso.  

