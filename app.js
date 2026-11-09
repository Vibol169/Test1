const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev";

const form = document.getElementById("echoForm");
const output = document.getElementById("output");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  output.textContent = "Sending…";

  const payload = {
    name: document.getElementById("name").value.trim(),
    message: document.getElementById("message").value.trim(),
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
});
