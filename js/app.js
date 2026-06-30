/* ==========================================
   DOM
========================================== */

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchResults = document.getElementById("searchResults");

const candidateList = document.getElementById("candidateList");

const urlInput = document.getElementById("urlInput");
const urlButton = document.getElementById("urlButton");

const searchTab = document.getElementById("searchTab");
const urlTab = document.getElementById("urlTab");

const searchArea = document.getElementById("searchArea");
const urlArea = document.getElementById("urlArea");

const checkAllButton = document.getElementById("checkAll");
const uncheckAllButton = document.getElementById("uncheckAll");

const generateButton = document.getElementById("generateButton");
const regenerateButton = document.getElementById("regenerateButton");

const resultList = document.getElementById("resultList");


/* ==========================================
   Start
========================================== */

renderCandidateList();
initTabs();
initEvents();


/* ==========================================
   Tabs
========================================== */

function initTabs() {
    searchTab.onclick = () => {
        searchTab.classList.add("active");
        urlTab.classList.remove("active");

        searchArea.classList.remove("hidden");
        urlArea.classList.add("hidden");
    };

    urlTab.onclick = () => {
        urlTab.classList.add("active");
        searchTab.classList.remove("active");

        urlArea.classList.remove("hidden");
        searchArea.classList.add("hidden");
    };
}


/* ==========================================
   Events
========================================== */

function initEvents() {
    searchButton.onclick = searchAction;
    urlButton.onclick = addUrlAction;

    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") searchAction();
    });

    urlInput.addEventListener("keydown", e => {
        if (e.key === "Enter") addUrlAction();
    });

    checkAllButton.onclick = () => {
        checkAllVideos();
        renderCandidateList();
    };

    uncheckAllButton.onclick = () => {
        uncheckAllVideos();
        renderCandidateList();
    };

    generateButton.onclick = generateAction;
    regenerateButton.onclick = regenerateAction;
}


/* ==========================================
   Search
========================================== */

async function searchAction() {
    const keyword = searchInput.value.trim();

    if (!keyword) return;

    searchButton.disabled = true;

    try {
        const result = await searchYouTube(keyword);
        renderSearchResults(result);
    } catch (e) {
        alert(e.message);
    }

    searchButton.disabled = false;
}


/* ==========================================
   URL Add
========================================== */

async function addUrlAction() {
    const url = urlInput.value.trim();

    if (!url) return;

    urlButton.disabled = true;

    try {
        const video = await getVideoFromUrl(url);

        addVideo(normalizeVideo(video));

        renderCandidateList();

        urlInput.value = "";
    } catch (e) {
        alert(e.message);
    }

    urlButton.disabled = false;
}


/* ==========================================
   Search Result
========================================== */

function renderSearchResults(videos) {
    searchResults.innerHTML = "";

    videos.forEach(video => {
        const v = normalizeVideo(video);

        const card = document.createElement("div");
        card.className = "search-item";

        card.innerHTML = `
            <div class="search-thumbnail">
                <img src="${v.thumbnail}" alt="thumbnail">
            </div>

            <div class="search-content">
                <div class="search-title">
                    ${escapeHtml(v.title)}
                </div>

                <div class="search-channel">
                    ${escapeHtml(v.channel)}
                </div>

                <div class="search-duration">
                    ${v.duration}
                </div>

                <button type="button">
                    追加
                </button>
            </div>
        `;

        card.querySelector("button").onclick = () => {
            addVideo(v);

            renderCandidateList();

            searchResults.innerHTML = "";
            searchInput.value = "";
        };

        searchResults.appendChild(card);
    });
}


/* ==========================================
   Candidate List
========================================== */

function renderCandidateList() {
    const videos = getAllVideos();

    candidateList.innerHTML = "";

    if (videos.length === 0) {
        candidateList.innerHTML = `
            <div class="empty">
                動画を追加するとここに表示されます
            </div>
        `;

        return;
    }

    videos.forEach(video => {
        const card = createCandidateCard(video);
        candidateList.appendChild(card);
    });
}


/* ==========================================
   Candidate Card
========================================== */

function createCandidateCard(video) {
    const card = document.createElement("div");

    card.className = "candidate-item";

    card.innerHTML = `
        <div class="candidate-thumbnail">
            <img src="${video.thumbnail}" alt="thumbnail">
        </div>

        <div class="candidate-content">
            <div class="candidate-title">
                ${escapeHtml(video.title)}
            </div>

            <div class="candidate-channel">
                ${escapeHtml(video.channel)}
            </div>

            <div class="candidate-duration">
                ${video.duration}
            </div>

            <div class="candidate-bottom">
                <input
                    type="checkbox"
                    class="candidate-check"
                    ${video.checked ? "checked" : ""}
                >

                <button
                    type="button"
                    class="delete-button"
                >
                    ×
                </button>
            </div>
        </div>
    `;

    const checkbox = card.querySelector(".candidate-check");

    checkbox.onchange = () => {
        toggleVideo(video.id);
        renderCandidateList();
    };

    const removeButton = card.querySelector(".delete-button");

    removeButton.onclick = () => {
        removeVideo(video.id);
        renderCandidateList();
    };

    return card;
}


/* ==========================================
   Generate
========================================== */

async function generateAction() {
    showLoading();

    await new Promise(resolve => {
        requestAnimationFrame(resolve);
    });

    const sets = generateSets();

    renderResultList(sets);

    regenerateButton.classList.remove("hidden");

    hideLoading();
}


async function regenerateAction() {
    showLoading();

    await new Promise(resolve => {
        requestAnimationFrame(resolve);
    });

    const sets = regenerateSets();

    renderResultList(sets);

    hideLoading();
}


/* ==========================================
   Result List
========================================== */

function renderResultList(resultSets) {
    resultList.innerHTML = "";

    if (resultSets.length === 0) {
        resultList.innerHTML = `
            <div class="empty">
                条件を満たすセットを作成できませんでした
            </div>
        `;

        return;
    }

    resultSets.forEach((set, index) => {
        resultList.appendChild(
            createResultCard(set, index + 1)
        );
    });

    document
        .querySelectorAll(".share-button")
        .forEach(button => {
            button.onclick = () => {
                const index = Number(button.dataset.index);

                shareSet(resultSets[index]);
            };
        });
}


/* ==========================================
   Result Card
========================================== */

function createResultCard(set, number) {
    const card = document.createElement("div");

    card.className = "result-card";

    let html = `
        <div class="result-header">
            <div class="result-time">
                合計 ${formatTotalTime(set)}
            </div>
        </div>

        <div class="result-video-list">
    `;

    set.forEach(video => {
        html += `
            <div class="result-video">
                <div class="result-thumbnail">
                    <img src="${video.thumbnail}" alt="thumbnail">
                </div>

                <div class="result-content">
                    <div class="result-title">
                        ${escapeHtml(video.title)}
                    </div>

                    <div class="result-channel">
                        ${escapeHtml(video.channel)}
                    </div>

                    <div class="result-duration">
                        ${video.duration}
                    </div>

                    <a
                        class="result-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://youtu.be/${video.videoId}"
                    >
                        YouTubeで開く
                    </a>
                </div>
            </div>
        `;
    });

    html += `
        </div>

        <div class="result-footer">
            <button
                type="button"
                class="share-button"
                data-index="${number - 1}"
            >
                Xで共有
            </button>
        </div>
    `;

    card.innerHTML = html;

    return card;
}


/* ==========================================
   Loading
========================================== */

function showLoading() {
    document
        .getElementById("loadingOverlay")
        .classList
        .remove("hidden");
}


function hideLoading() {
    document
        .getElementById("loadingOverlay")
        .classList
        .add("hidden");
}


/* ==========================================
   Escape
========================================== */

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
