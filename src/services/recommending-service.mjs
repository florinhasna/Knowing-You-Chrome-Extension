import { test } from './../api/aolabs-api.mjs';
import { getScorePercentage } from './../utils/utilities.mjs';
import { putItem } from './../utils/dynamo-db.mjs';
import { SCORE_THRESHOLD, RECOMMENDATIONS_TABLE } from './../config/constants.mjs';
import { processDataForRecommending } from './data-service.mjs';

/** Initialises recommendation process, retrieves processed video data
 * and tests each video against the given input. Updates the recommendations
 * table with the results when complete if successful.
 * @param {String} userId
 * @returns {Object} An object containing two arrays: toRecommend and lowScoreVideos
 */
export const startRecommending = async (userId) => {
    let inputsToProcess = await processDataForRecommending(userId);

    // If inputsToProcess is not an Array, is invalid
    if (inputsToProcess instanceof Array) {
        let toRecommend = [];
        let lowScoreVideos = [];

        for (let video of inputsToProcess) {
            const testResponse = await test(userId, video.input);

            // Check agent response
            if (testResponse.story) {
                video.story = testResponse.story;
                video.score = getScorePercentage(testResponse.story);
                delete video.input; // No longer needed

                if (video.score > SCORE_THRESHOLD) {
                    console.log(`The given input has a score of ${video.score}, requires recommending...`)
                    toRecommend.push(video);
                } else {
                    console.log(`The given input has a score of ${video.score}, should NOT be recommending...`)
                    lowScoreVideos.push(video);
                }
            }
        }

        // Descending sort by score
        toRecommend = toRecommend.sort((a, b) => b.score - a.score);
        lowScoreVideos = lowScoreVideos.sort((a, b) => b.score - a.score);

        await putItem(RECOMMENDATIONS_TABLE, { userId, timestamp: Date.now(), toRecommend, lowScoreVideos });

        return { toRecommend, lowScoreVideos };
    } else {
        return inputsToProcess;
    }


}