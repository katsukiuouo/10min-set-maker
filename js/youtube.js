/* ===========================================
   API
=========================================== */

const API_ENDPOINT = "/api/youtube";

/* ===========================================
   Search
=========================================== */

async function searchYouTube(keyword) {

    keyword = keyword.trim();

    if (!keyword) return [];

    const response = await fetch(

        `${API_ENDPOINT}?type=search&q=${encodeURIComponent(keyword)}`

    );

    if (!response.ok) {

        throw new Error("検索に失敗しました");

    }

    return await response.json();

}

/* ===========================================
   URL
=========================================== */

async function getVideoFromUrl(url) {

    const videoId = extractVideoId(url);

    if (!videoId) {

        throw new Error("URLが正しくありません");

    }

    const response = await fetch(

        `${API_ENDPOINT}?type=video&id=${videoId}`

    );

    if (!response.ok) {

        throw new Error("動画情報を取得できません");

    }

    return await response.json();

}
/* ===========================================
   ISO8601
=========================================== */

function parseDuration(duration) {

    const match = duration.match(

        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/

    );

    if (!match) {

        return 0;

    }

    const h = Number(match[1] || 0);

    const m = Number(match[2] || 0);

    const s = Number(match[3] || 0);

    return h * 3600 + m * 60 + s;

}
/* ===========================================
   Format Duration
=========================================== */

function formatDuration(seconds) {

    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    const s = seconds % 60;

    if (h > 0) {

        return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    }

    return `${m}:${String(s).padStart(2,"0")}`;

}
/* ===========================================
   Normalize
=========================================== */

function normalizeVideo(video){

    const seconds = parseDuration(video.duration);

    return {

        videoId: video.videoId,

        title: video.title,

        channel: video.channel,

        thumbnail: video.thumbnail,

        duration: formatDuration(seconds),

        durationSeconds: seconds

    };

}
