let interval = null;
let isPaused = false;
let pausedAtTime = null;
let flashTimer = null;

const DURATIONS = {
  work: 25 * 60 * 1000,
  short: 5 * 60 * 1000,
  long: 30 * 60 * 1000,
  flash: 3 * 1000,
};
const FLASH_INTERVAL = 250;

const COLOURS = {
  work: "var(--pomodoro-bar-color-work)",
  short: "var(--pomodoro-bar-color-short)",
  long: "var(--pomodoro-bar-color-long)",
  flash: "var(--pomodoro-bar-color-flash)",
};

// helper function to add state to storage
function setState(state, startedAt = Date.now(), cycleCount = 0, from = null) {
  chrome.storage.local.set({
    pomodoroState: state,
    pomodoroStartedAt: startedAt,
    cycleCount,
    from,
  });
}

// create bar if there are no bar
function createBarIfNeeded() {
  let wrapper = document.getElementById("pomodoro-bar-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "pomodoro-bar-wrapper";
    document.body.appendChild(wrapper);
  }

  let bar = document.getElementById("pomodoro-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "pomodoro-bar";
    bar.className = "pomodoro-bar";
    wrapper.appendChild(bar);
  }

  if (bar.parentElement) {
    bar.parentElement.style.display = "block";
  }

  return bar;
}

// remove bar if bar exists
function removeBarIfExists() {
  const wrapper = document.getElementById("pomodoro-bar-wrapper");
  if (wrapper) wrapper.remove();
}

function instantReset(bar) {
  bar.style.transition = "none";
  bar.style.width = "0%";
  void bar.offsetWidth;
  bar.style.transition = "width 0.2s linear";
}

// flash between each status
function startFlash(cycleCount, fromState) {
  const bar = createBarIfNeeded();
  let elapsed = 0;
  bar.style.width = "100%";
  bar.style.backgroundColor = COLOURS.flash;
  bar.parentElement.style.display = "block";

  clearInterval(flashTimer);
  flashTimer = setInterval(() => {
    bar.classList.toggle("pomodoro-bar-flash");
    elapsed += FLASH_INTERVAL;

    if (elapsed >= DURATIONS.flash) {
      clearInterval(flashTimer);
      bar.classList.remove("pomodoro-bar-flash");
      const next =
        fromState === "work"
          ? cycleCount % 4 === 0
            ? "long"
            : "short"
          : "work";
      instantReset(bar);
      setState(next, Date.now(), cycleCount);
    }
  }, FLASH_INTERVAL);
}

function startLoop(state, startedAt, cycleCount, pausedAt = null) {
  clearInterval(interval);
  clearInterval(flashTimer);

  if (state === "flash") {
    chrome.storage.local.get("from", ({ from }) =>
      startFlash(cycleCount, from || "work")
    );
    return;
  }

  const total = DURATIONS[state];
  const bar = createBarIfNeeded();
  bar.style.backgroundColor = COLOURS[state];
  const initElapsed = pausedAt ? pausedAt - startedAt : Date.now() - startedAt;
  bar.style.width = Math.min((initElapsed / total) * 100, 100) + "%";

  interval = setInterval(() => {
    const elapsed = isPaused
      ? pausedAtTime
        ? pausedAtTime - startedAt
        : initElapsed
      : Date.now() - startedAt;
    bar.style.width = Math.min((elapsed / total) * 100, 100) + "%";

    if (elapsed >= total) {
      clearInterval(interval);
      if (state === "work") cycleCount++;
      setState("flash", Date.now(), cycleCount, state);
    }
  }, 200);
}

// initializing the state
chrome.storage.local.get(
  ["pomodoroState", "pomodoroStartedAt", "cycleCount", "pausedAt"],
  ({ pomodoroState, pomodoroStartedAt, cycleCount = 0, pausedAt }) => {
    isPaused = !!pausedAt;
    pausedAtTime = pausedAt || null;
    if (pomodoroState) {
      startLoop(pomodoroState, pomodoroStartedAt, cycleCount, pausedAtTime);
    }
  }
);

// check change of storage status
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.pausedAt) {
    isPaused = !!changes.pausedAt.newValue;
    pausedAtTime = changes.pausedAt.newValue || null;
  }

  if (
    changes.pomodoroState ||
    changes.pomodoroStartedAt ||
    changes.cycleCount ||
    changes.pausedAt
  ) {
    chrome.storage.local.get(
      ["pomodoroState", "pomodoroStartedAt", "cycleCount", "pausedAt"],
      ({ pomodoroState, pomodoroStartedAt, cycleCount = 0, pausedAt }) => {
        if (pomodoroState) {
          startLoop(
            pomodoroState,
            pomodoroStartedAt,
            cycleCount,
            pausedAt || null
          );
        } else {
          clearInterval(interval);
          clearInterval(flashTimer);
          removeBarIfExists();
        }
      }
    );
  }
});
