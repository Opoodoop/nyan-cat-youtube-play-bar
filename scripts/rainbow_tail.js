let scrubberObserver = null;
let chapterObserver = null;
let resizeTimeout = null;
let fullscreenTimeout = null;
let start = Date.now();

let lastFired = Date.now();

function cleanupNyanChapters() {
  // console.log("nuking everything...");
  const chapter = document.querySelector('.ytp-chapter-hover-container');
  if (!chapter._initialized) return;

  chapter.querySelectorAll('.nyan-layer').forEach(el => el.remove());
  chapter.classList.remove('nyan-chapter', 'nyan-first', 'nyan-last');

  delete chapter._initialized;
  delete chapter._fg;
  delete chapter._width;
  delete chapter._marginRight;
}

function updateTailLength() {
  const tail = document.querySelector('.ytp-chapter-hover-container')
  if (!tail) return;

  if (!tail._initialized) {
    rebuildNyan();
    return;
  }

  remaining = getScrubberProgress()

  const fill = Math.min(tail._width, remaining);
  tail._fg.style.width = fill + 'px';
}

function getScrubberProgress() {
  const scrubber = document.querySelector('.ytp-scrubber-container');
  if (!scrubber) return;

  /* Extract progress from scrubber */
  const match = scrubber.style.transform.match(/translateX\(([\d.]+)px\)/);
  if (!match) return;

  return Math.max(0, parseFloat(match[1])); /* Ensure progress is always positive*/
}

function rebuildNyan() {
  const now = Date.now();
  if (now - lastFired < 2000) {
    return;
  }
  lastFired = now;
  
  cleanupNyanChapters();
  initializeChapters();
  updateTailLength();
}

function initializeChapters() {
  const chapter = document.querySelector('.ytp-chapter-hover-container')
  if (!chapter) return;

  const fg = document.createElement('div');
  fg.className = 'nyan-layer nyan-tail';
  chapter.appendChild(fg);

  chapter._fg = fg;
  chapter._initialized = true;
  chapter._width = chapter.clientWidth;
  const style = getComputedStyle(chapter);
  chapter._marginRight = parseFloat(style.marginRight) || 0;
}

function rebindScrubberObserver() {
  if (scrubberObserver) scrubberObserver.disconnect();
  scrubberObserver = null;
  observeScrubber();
}

function observeScrubber() {
  const scrubber = document.querySelector('.ytp-scrubber-container');
  if (!scrubber) return;

  scrubberObserver = new MutationObserver(updateTailLength);
  scrubberObserver.observe(scrubber, {
    attributes: true,
    attributeFilter: ['style']
  });
}

function startChapterObserver() {
  if (chapterObserver) chapterObserver.disconnect();

  const progressBar = document.querySelector('.ytp-progress-bar-container');
  if (!progressBar) return;

  chapterObserver = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.addedNodes.length || m.removedNodes.length) {
        rebuildNyan();
        rebindScrubberObserver();
        break;
      }
    }
  });

  chapterObserver.observe(progressBar, {
    childList: true,
    subtree: true
  });
}

function waitForChapters(callback, interval = 50, timeout = 1500) {

  let delta = Date.now() - start;

  console.log("Time delta: " + delta);

  const check = () => {
    const chapters = document.querySelectorAll('.ytp-chapter-hover-container');
    if (chapters.length) {
      callback();
      return;
    }
    if (Date.now() - start > timeout) return;
    setTimeout(check, interval);
  };

  check();
}

function initRainbow() {
  if (location.pathname !== "/watch") return;
  start = Date.now();
  waitForChapters(() => {
    rebuildNyan();
    rebindScrubberObserver();
    startChapterObserver();
  });
}


document.addEventListener("yt-navigate-finish", initRainbow, true);
document.addEventListener("yt-page-data-updated", initRainbow, true);

let flexyResizeObserver = null;

function observeFlexyResize() {
  if (flexyResizeObserver) flexyResizeObserver.disconnect();

  const flexy = document.querySelector('ytd-watch-flexy');
  if (!flexy) return;

  flexyResizeObserver = new ResizeObserver(() => {
    clearTimeout(fullscreenTimeout);
    fullscreenTimeout = setTimeout(() => {
      rebuildNyan();
      rebindScrubberObserver();
    }, 500);
  });

  flexyResizeObserver.observe(flexy);
}

document.addEventListener("yt-navigate-finish", observeFlexyResize, true);
document.addEventListener("yt-page-data-updated", observeFlexyResize, true);
observeFlexyResize();

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    rebuildNyan();
    rebindScrubberObserver();
  }, 200);
});

initRainbow();
