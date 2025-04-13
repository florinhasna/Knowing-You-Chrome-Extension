import { extractVideoData } from './../models/video-data.mjs';
import { getVideo } from './../api/youtube-data-api.mjs';

/** Retrieving video data either from the collection of watched
 * videos, or from the youtube data api.
 * @param {string} userId - The user id.
 * @param {string} videoId - The video id.
 * @returns {Promise<VideoData>} - The video data.
 */
export const getVideoData = async (userId, videoId) => {
    console.log(`Getting video data for ${videoId}...`);

    // Fetch data from yt data api
    let video = await getVideo(videoId);

    if (video.items.length === 0) {
        console.log(`No video found for ${videoId}...`);
        return;
    }

    video = video.items[0];

    return extractVideoData(userId, videoId, video.snippet);
}