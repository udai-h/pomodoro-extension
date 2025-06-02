const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const stateText = document.getElementById("state");
const cycleDiv = document.getElementById("cycle");
const instructions = document.getElementById("instructions");

function getStateLabel(state) {
  switch (state) {
    case "work":
      return "25 min";
    case "short":
      return "5 min";
    case "long":
      return "30 min";
    case null:
    case undefined:
      return "";
    default:
      return state;
  }
}

// function to update popup user interface
function updatePopupUI(state, pausedAt, from = null, cycleCount = 0) {
  const label =
    state === "flash"
      ? from === "work"
        ? cycleCount % 4 === 0
          ? "long"
          : "short"
        : "work"
      : state;
  stateText.textContent = getStateLabel(label);

  if (state) {
    const idxWork = (cycleCount % 4) + 1;
    const idxShort = cycleCount % 4;

    cycleDiv.textContent =
      label === "work"
        ? `Focus ${idxWork} / 4`
        : label === "short"
        ? `Short Break ${idxShort} / 3`
        : label === "long"
        ? "Long Break"
        : "";
  } else {
    cycleDiv.textContent = "";
  }

  // show button
  const hasStarted = !!state;
  startBtn.style.display = hasStarted ? "none" : "block";
  pauseBtn.style.display = hasStarted ? "block" : "none";
  resetBtn.style.display = hasStarted ? "block" : "none";
  pauseBtn.textContent = pausedAt ? "Resume" : "Pause";
  instructions.style.display = hasStarted ? "none" : "block";
}

// initializing
const render = () =>
  chrome.storage.local.get(
    ["pomodoroState", "pausedAt", "from", "cycleCount"],
    ({ pomodoroState, pausedAt, from, cycleCount = 0 }) =>
      updatePopupUI(pomodoroState, pausedAt, from, cycleCount)
  );

render();
chrome.storage.onChanged.addListener(
  (c, a) =>
    a === "local" && (c.pomodoroState || c.pausedAt || c.cycleCount) && render()
);

// START
startBtn.addEventListener("click", () => {
  chrome.storage.local.get(
    ["pomodoroStartedAt", "pausedAt"],
    ({ pomodoroStartedAt, pausedAt }) => {
      if (pomodoroStartedAt && !pausedAt) return;
      chrome.storage.local.set({
        pomodoroState: "work",
        pomodoroStartedAt: Date.now(),
        cycleCount: 0,
        pausedAt: null,
        from: null,
      });
    }
  );
});

// PAUSE/RESUME
pauseBtn.addEventListener("click", () => {
  chrome.storage.local.get(
    ["pausedAt", "pomodoroStartedAt"],
    ({ pausedAt, pomodoroStartedAt }) => {
      if (pausedAt) {
        // RESUME
        const shift = Date.now() - pausedAt;
        const newStart = pomodoroStartedAt + shift;
        chrome.storage.local.set({ pomodoroStartedAt: newStart }, () =>
          chrome.storage.local.remove("pausedAt")
        );
      } else {
        // PAUSE
        chrome.storage.local.set({ pausedAt: Date.now() });
      }
    }
  );
});

// RESET
resetBtn.addEventListener("click", () =>
  chrome.storage.local.remove([
    "pomodoroState",
    "pomodoroStartedAt",
    "pausedAt",
    "cycleCount",
    "from",
  ])
);
