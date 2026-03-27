const NYAN_URL = chrome.runtime.getURL("images/nyancat.gif");

function addNyan(scrubber) {
    if (!scrubber || scrubber.querySelector("img.nyancat")) return;

    const img = document.createElement("img");
    img.src = NYAN_URL;
    img.className = "nyancat";
    img.style.transform = "rotate(-45deg) translate(-16px, 28px)";
    img.style.pointerEvents = "none";

    scrubber.appendChild(img);
}

// wait for the scrubber to spawn in
new MutationObserver(() => {
    addNyan(document.querySelector(".ytp-scrubber-pull-indicator"));
}).observe(document.body, { childList: true, subtree: true });

