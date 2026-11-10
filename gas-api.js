// =========================================================
// SMART POLYFILL: Only runs if we are NOT inside Google Apps Script
// =========================================================

// Check if google.script.run already exists (which means we are in GAS)
if (typeof google === 'undefined' || !google.script || !google.script.run) {
  console.log("GitHub Pages detected: Loading Cloudflare Worker API bridge.");
  
  // REPLACE WITH YOUR ACTUAL CLOUDFLARE WORKER URL
  const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev/";

  window.google = window.google || {};
  window.google.script = window.google.script || {};

  function createRunner(currentHandlers) {
    const localHandlers = { success: currentHandlers.success, failure: currentHandlers.failure };

    return new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'withSuccessHandler') {
          return function(fn) {
            localHandlers.success = fn;
            return createRunner(localHandlers);
          };
        }
        if (prop === 'withFailureHandler') {
          return function(fn) {
            localHandlers.failure = fn;
            return createRunner(localHandlers);
          };
        }
        
        return function(...args) {
          const payload = { action: prop, payload: args };
          
          fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          .then(res => {
            if (!res.ok) throw new Error('HTTP Error ' + res.status);
            return res.json();
          })
          .then(data => {
            if (localHandlers.success) localHandlers.success(data);
          })
          .catch(err => {
            console.error("API Error on " + prop + ":", err);
            if (localHandlers.failure) localHandlers.failure(err);
            else if (localHandlers.success) localHandlers.success({ success: false, message: err.toString() });
          });
        };
      }
    });
  }

  window.google.script.run = createRunner({ success: null, failure: null });
} else {
  console.log("Google Apps Script detected: Using native google.script.run.");
}
