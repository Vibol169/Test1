// REPLACE WITH YOUR ACTUAL CLOUDFLARE WORKER URL
const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev/";

window.google = window.google || {};
window.google.script = window.google.script || {};

// This factory function creates a unique chain for every request
function createRunner(handlers) {
  return new Proxy({}, {
    get: function(target, prop) {
      if (prop === 'withSuccessHandler') {
        return function(fn) {
          handlers.success = fn;
          return createRunner(handlers);
        };
      }
      if (prop === 'withFailureHandler') {
        return function(fn) {
          handlers.failure = fn;
          return createRunner(handlers);
        };
      }
      
      // The actual API call (e.g., validateLogin, getRequests)
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
          if (handlers.success) handlers.success(data);
        })
        .catch(err => {
          console.error("API Error on " + prop + ":", err);
          if (handlers.failure) handlers.failure(err);
          else if (handlers.success) handlers.success({ success: false, message: err.toString() });
        });
      };
    }
  });
}

// Initialize the global object
window.google.script.run = createRunner({ success: null, failure: null });
