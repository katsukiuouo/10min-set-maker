const STORAGE_KEY = "ten-minute-set-maker";

let candidateVideos = [];

/* ==========================
   Load
========================== */

function loadVideos() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {

        candidateVideos = [];
        return;

    }

    try {

        candidateVideos = JSON.parse(data);

    } catch {

        candidateVideos = [];

    }

}

/* ==========================
   Save
========================== */

function saveVideos() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(candidateVideos)

    );

}

/* ==========================
   Add
========================== */

function addVideo(video) {

    candidateVideos.push({

        id: crypto.randomUUID(),

        videoId: video.videoId,

        title: video.title,

        channel: video.channel,

        duration: video.duration,

        durationSeconds: video.durationSeconds,

        thumbnail: video.thumbnail,

        checked: true

    });

    saveVideos();

}

/* ==========================
   Remove
========================== */

function removeVideo(id) {

    candidateVideos = candidateVideos.filter(

        video => video.id !== id

    );

    saveVideos();

}

/* ==========================
   Toggle
========================== */

function toggleVideo(id) {

    const video = candidateVideos.find(

        item => item.id === id

    );

    if (!video) return;

    video.checked = !video.checked;

    saveVideos();

}
/* ==========================
   Check All
========================== */

function checkAllVideos() {

    candidateVideos.forEach(video => {

        video.checked = true;

    });

    saveVideos();

}

/* ==========================
   Uncheck All
========================== */

function uncheckAllVideos() {

    candidateVideos.forEach(video => {

        video.checked = false;

    });

    saveVideos();

}

/* ==========================
   Get Checked
========================== */

function getCheckedVideos() {

    return candidateVideos.filter(

        video => video.checked

    );

}

/* ==========================
   Get All
========================== */

function getAllVideos() {

    return candidateVideos;

}

/* ==========================
   Clear
========================== */

function clearVideos() {

    candidateVideos = [];

    saveVideos();

}

/* ==========================
   Initialize
========================== */

loadVideos();