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

// ================= SUBMIT =================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    email: email.value,
    password: pass.value,
  };

  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      showToast("Login fallito ❌");
      return;
    }

    const data = await response.json();
    console.log(data);

    showToast("Login riuscito 🎉");

  } catch (err) {
    showToast("Errore di connessione ⚠️");
  }
});

// ================= TOAST SYSTEM (stile TravelBuddy) =================

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

// animazioni toast
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