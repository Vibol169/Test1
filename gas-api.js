// Replace this with your actual Cloudflare Worker URL
const API_URL = "https://icy-band-de97.ppap-tec-2022.workers.dev/";

window.google = window.google || {};
window.google.script = window.google.script || {};

window.google.script.run = function() {
  let successHandler = null;
  let failureHandler = null;
  
  const runner = {
    withSuccessHandler: function(fn) { successHandler = fn; return runner; },
    withFailureHandler: function(fn) { failureHandler = fn; return runner; }
  };
  
  // This Proxy intercepts the function calls (like .getRequests())
  return new Proxy(runner, {
    get: function(target, prop) {
      if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
        return target[prop];
      }
      
      return function(...args) {
        const payload = { action: prop, payload: args };
        
        fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          if (successHandler) successHandler(data);
        })
        .catch(err => {
          console.error("API Error:", err);
          if (failureHandler) failureHandler(err);
          else if (successHandler) successHandler({ success: false, message: err.toString() });
        });
      };
    }
  });
};
