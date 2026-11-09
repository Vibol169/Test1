// REPLACE THIS WITH YOUR ACTUAL CLOUDFLARE WORKER URL
const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev/";

window.google = window.google || {};
window.google.script = window.google.script || {};

let _successHandler = null;
let _failureHandler = null;

// We use a Proxy to intercept any property access (like getRequests or withSuccessHandler)
window.google.script.run = new Proxy({}, {
  get: function(target, prop) {
    // 1. Handle Success Handler
    if (prop === 'withSuccessHandler') {
      return function(fn) {
        _successHandler = fn;
        return window.google.script.run;
      };
    }
    
    // 2. Handle Failure Handler
    if (prop === 'withFailureHandler') {
      return function(fn) {
        _failureHandler = fn;
        return window.google.script.run;
      };
    }
    
    // 3. Handle the actual API call (e.g., validateLogin, getRequests)
    return function(...args) {
      // Ensure we have a valid URL
      if (!API_URL || API_URL.includes("YOUR_WORKER_URL")) {
        console.error("Please set your Cloudflare Worker URL in gas-api.js");
        return;
      }

      const payload = { action: prop, payload: args };
      
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        return res.json();
      })
      .then(data => {
        if (_successHandler) _successHandler(data);
      })
      .catch(err => {
        console.error("API Error:", err);
        if (_failureHandler) _failureHandler(err);
        else if (_successHandler) _successHandler({ success: false, message: err.toString() });
      })
      .finally(() => {
        // Reset handlers so the next call starts fresh
        _successHandler = null;
        _failureHandler = null;
      });
    };
  }
});
