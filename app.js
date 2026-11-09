// Your exact Worker URL
const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev/";

// Main elements
const form = document.getElementById("echoForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const output = document.getElementById("output");

// Popup elements
const openPopupBtn = document.getElementById("openPopupBtn");
const closePopupBtn = document.getElementById("closePopupBtn");
const popupOverlay = document.getElementById("popupOverlay");

// 1. RESTORE STATE ON LOAD
window.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem('echoFormDraft');
  
  if (savedDraft) {
    const data = JSON.parse(savedDraft);
    nameInput.value = data.name || '';
    messageInput.value = data.message || '';

    // If the popup was open when they left, open it again!
    if (data.isPopupOpen && popupOverlay) {
      popupOverlay.classList.remove("hidden");
    }
  }
});

// 2. SAVE STATE FUNCTION
function saveDraft() {
  const draftData = {
    name: nameInput.value,
    message: messageInput.value,
    isPopupOpen: popupOverlay ? !popupOverlay.classList.contains("hidden") : false
  };
  localStorage.setItem('echoFormDraft', JSON.stringify(draftData));
}

// Auto-save as the user types
nameInput.addEventListener('input', saveDraft);
messageInput.addEventListener('input', saveDraft);

// 3. POPUP OPEN/CLOSE LOGIC
if (openPopupBtn) {
  openPopupBtn.addEventListener("click", () => {
    popupOverlay.classList.remove("hidden");
    saveDraft(); // Save that it opened
  });
}

if (closePopupBtn) {
  closePopupBtn.addEventListener("click", () => {
    popupOverlay.classList.add("hidden");
    saveDraft(); // Save that it closed
  });
}

// 4. SUBMIT FORM
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

    // Clear the saved draft on success so next time it's blank
    localStorage.removeItem('echoFormDraft');
    
    // Optional: Close popup automatically after success
    // popupOverlay.classList.add("hidden"); 

  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
});
