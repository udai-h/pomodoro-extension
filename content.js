const bar = document.createElement("div");
bar.id = "pomodoro-bar";
document.body.appendChild(bar);

let width = 0;
const interval = setInterval(() => {
  width += 1;
  bar.style.width = width + "%";

  if (width >= 100) {
    clearInterval(interval);
  }
}, 1000);
