let intervalID;
let lastUrl = location.href;

// attempt to parse a table & create the button
function tryParse() {
  if (isTablesLoaded()) {
    clearInterval(intervalID);
    createExportButtons();
  }
}

// run the main program
function runProgram() {
  getTables();
  intervalID = setInterval(tryParse, 1000);
}

// check for course schedule fragment
function shouldRunOnPage() {
  return location.href.includes("d/task/2998$28771");
}

// handle SPA navigation
function onSpaNavigation() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    if (shouldRunOnPage()) {
      runProgram();
    }
  }
}

// patch history API
function hookHistory(fn) {
  const original = history[fn];
  history[fn] = function (...args) {
    const result = original.apply(this, args);
    window.dispatchEvent(new Event("spa-url-change"));
    return result;
  };
}

// observe DOM mutations (backup method for detecting SPA nav)
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    onSpaNavigation();
  }
});
observer.observe(document, { subtree: true, childList: true });

// hook into SPA nav
hookHistory("pushState");
hookHistory("replaceState");
window.addEventListener("spa-url-change", onSpaNavigation);

// initial DOM ready handler
function main() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runProgram);
  } else {
    runProgram();
  }
}

main();
