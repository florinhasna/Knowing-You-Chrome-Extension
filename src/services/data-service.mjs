import { getItem, getEntries } from './../utils/dynamo-db.mjs';
import { assignTagIndexes } from './../utils/tags-utility.mjs';
import { checkAndRemoveDuplicates } from './../utils/utilities.mjs';
import { getVideoData } from './video-service.mjs';
import { searchVideosToRecommend } from './search-service.mjs';
import { getInput, getLabel } from './../models/agent-models.mjs';
import { MINIMUM_THRESHOLD, TAGS_TABLE, VIDEOS_TABLE } from './../config/constants.mjs';

/** Retrieves video data from YouTube Data API, normalises it, and converts it
 * into binary format for training. Also retrieves and updates the latest tag 
 * assignments of the user.
 * @param {string} userId - The user's ID.
 * @param {Object} videoInteractions - Interactions of the user with the video.
 * @returns {object} - The processed video data.
 */
export const processDataForTraining = async (userId, videoInteractions) => {
    console.log('Data processing for training started...');

    let videoWatched = await getVideoData(userId, videoInteractions.videoId);

    let input, label, previousAssignments;

    if (videoWatched.tags && videoWatched.categoryId) {
        videoWatched.tags = checkAndRemoveDuplicates(videoWatched.tags);

        // Get latest assignment of tags
        previousAssignments = await getItem(TAGS_TABLE, { userId, categoryId: videoWatched.categoryId });
        previousAssignments = previousAssignments.Item;

        if (previousAssignments) {
            previousAssignments = previousAssignments.tagAssignments;
        }

        let tagAssignments = assignTagIndexes(previousAssignments, videoWatched.tags);

        input = getInput(videoWatched, tagAssignments);
        label = getLabel(videoInteractions);

        videoInteractions = { userId, ...videoInteractions, trainingLabel: label };

        previousAssignments = { userId, categoryId: videoWatched.categoryId, tagAssignments };
    }

    return { input, label, videoInteractions, previousAssignments };
}

/** Runs neccessary checks for recommending videos back to the user, takes the 
 * videos from search and process them into binary format for prediction.
 * @param {string} userId - The user's ID.
 * @returns {object} - The processed video data.
 */
export const processDataForRecommending = async (userId) => {
    console.log('Data processing for recommending started...');

    let videoEntries = await getEntries(VIDEOS_TABLE, userId);

    // Check if user watched enough videos
    if(!videoEntries || videoEntries.length < MINIMUM_THRESHOLD){
        return {
            message: `Not enough data to recommend videos for user: ${userId}.`,
            needsMoreTraining: true
        };
    }

    let categoryEntries = await getEntries(TAGS_TABLE, userId);

    if (!categoryEntries) {
        return {
            message: `Error occured retrieving categories and their tags for user: ${userId}`
        };
    }

    // Initialise video search
    let { searchResults, tagsByCategory } = await searchVideosToRecommend(categoryEntries);

    let inputsToProcess = [];

    // Loop videos and process to inputs
    for (let video of searchResults) {
        if (!video || !video.id || !video.id.videoId) {
            continue;
        }

        let vId = video.id.videoId;

        let videoData = await getVideoData(userId, vId);

        // Skip the iteration when the given data is invalid
        if (!videoData || !videoData.categoryId || !videoData.tags) {
            console.log(`Insufficient data for videoId: ${vId}, skipping...`);
            continue;
        }

        videoData.tags = checkAndRemoveDuplicates(videoData.tags);

        const input = getInput(videoData, tagsByCategory[videoData.categoryId]);

        inputsToProcess.push({
            videoId: vId,
            input: input,
            ...videoData
        });
    }

    return inputsToProcess;
}
