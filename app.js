// Your actual Worker URL
const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev/";

const form = document.getElementById("echoForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const output = document.getElementById("output");

// 1. RESTORE DATA ON LOAD
// When the app opens, check if there is a saved draft and fill the inputs
window.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem('echoFormDraft');
  
  if (savedDraft) {
    const data = JSON.parse(savedDraft);
    nameInput.value = data.name || '';
    messageInput.value = data.message || '';
    console.log("Draft restored!");
  }
});

// 2. AUTO-SAVE AS THE USER TYPES
// This function saves the current input values to local storage
function saveDraft() {
  const draftData = {
    name: nameInput.value,
    message: messageInput.value
  };
  localStorage.setItem('echoFormDraft', JSON.stringify(draftData));
}

// Attach the save function to the input fields
nameInput.addEventListener('input', saveDraft);
messageInput.addEventListener('input', saveDraft);

// 3. HANDLE SUBMISSION
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  output.textContent = "Sending…";

  const payload = {
    name: nameInput.value.trim(),
    message: messageInput.value.trim(),
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);

    // 4. CLEAR THE DRAFT ON SUCCESS
    // If the submission worked, remove the saved draft so the form is blank next time
    localStorage.removeItem('echoFormDraft');
    
    // Optional: Clear the input fields visually
    // form.reset(); 

  } catch (err) {
    output.textContent = "Error: " + err.message;
    // Note: If there is an error, we DO NOT clear the draft, so the user doesn't lose their text!
  }
});
