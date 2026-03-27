function addNyan(scrubber) {
    if (!scrubber || scrubber.querySelector("div.nyancat")) return;

    const nyancat = document.createElement("div");
    nyancat.className = "nyancat";

    scrubber.appendChild(nyancat);
}

// wait for the scrubber to spawn in
new MutationObserver(() => {
    addNyan(document.querySelector(".ytp-scrubber-pull-indicator"));
}).observe(document.body, { childList: true, subtree: true });

