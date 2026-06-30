/* ==========================================
   Supabase
========================================== */

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_KEY;

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ==========================================
   Save Shared Set
========================================== */

async function saveSharedSet(videos) {
    const payload = videos.map(video => ({
        videoId: video.videoId,
        title: video.title,
        channel: video.channel,
        duration: video.duration,
        thumbnail: video.thumbnail
    }));

    const { data, error } = await supabaseClient
        .from("shared_sets")
        .insert({
            videos: payload
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data.id;
}


/* ==========================================
   Share URL
========================================== */

function createShareUrl(id) {
    return `${location.origin}/share.html?id=${id}`;
}


/* ==========================================
   X Share
========================================== */

function openXShare(url) {
    const text = "再生リストに挟む10分セットを作りました！";

    const shareUrl =
        "https://twitter.com/intent/tweet?" +
        new URLSearchParams({
            text,
            url
        }).toString();

    window.open(
        shareUrl,
        "_blank",
        "noopener,noreferrer"
    );
}


/* ==========================================
   Share Set
========================================== */

async function shareSet(videos) {
    try {
        showLoading();

        const id = await saveSharedSet(videos);
        const url = createShareUrl(id);

        hideLoading();

        openXShare(url);
    } catch (e) {
        hideLoading();

        alert("共有に失敗しました");
        console.error(e);
    }
}
