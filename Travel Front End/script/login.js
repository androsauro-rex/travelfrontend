const email = document.getElementById("email");
const pass = document.getElementById("password");
const button = document.getElementById("btn");
const form = document.querySelector(".form");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkInputs() {
  const emailOk = emailRegex.test(email.value);
  if (form.checkValidity() && emailOk) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

form.addEventListener("input", checkInputs);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
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
      // errore lato server (401, 500 ecc.)
      alert("Login fallito");
      return;
    }

    const data = await response.json();

    console.log("Risposta backend:", data);
    alert("Login riuscito!");

  } catch (error) {
     console.error("Errore fetch:", error);
    alert("Errore di connessione al server");
  }
});
