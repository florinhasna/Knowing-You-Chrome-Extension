import { VIDEOS_TABLE, RECOMMENDATIONS_TABLE } from './../config/constants.mjs';
import { getEvaluationModel } from './../models/evaluation-model.mjs';
import { getConvertedData, getScorePercentage } from './../utils/utilities.mjs';

// Used to get the watch time prediction from the video that was recommended
let userRecommendations = {
    userId: '',
    recommendations: []
};

/** To get an array of objects, where each object holds evaluation data for
 * one user. Including total of videos watched, likes, dislikes etc.
 * @param {Array} userIds - Array of user ids
 * @returns {Array} - Array of evaluation data objects
 */
export const getEvaluationData = async (userIds) => {
    let evaluationByUser = [];
    for (let userId of userIds) {
        // Get user's entries in the video table converted from DynamoDB form to JSON
        let data = await getConvertedData(VIDEOS_TABLE, userId);
        let evaluationModel = getEvaluationModel();
        evaluationModel.userId = userId;

        // Loop videos
        for (let item of data) {
            evaluationModel.totalVideosWatched++;

            // Check if item was recommended by KnowingYou
            if (item.wasRecommended) {
                evaluationModel.kyRecommendations++;

                // Check if the recommendations to the users have been retrieved, do it otherwise
                if (!userRecommendations || userRecommendations.userId !== userId) {
                    userRecommendations.userId = userId;
                    userRecommendations.recommendations = await getConvertedData(RECOMMENDATIONS_TABLE, userId);
                }

                // Add watch time data of the video in the relevant array
                if (item.duration !== null) {
                    let watchTimeData = getWatchTimeData(item.videoId, item.watchTime, item.duration, userRecommendations.recommendations);
                    if(watchTimeData) {
                        evaluationModel.watchData.push(watchTimeData);
                    }
                }
            } else {
                evaluationModel.nonKyRecommendations++;
            }

            if (item.hasLiked) {
                evaluationModel.likes++;
                if (item.whileWatching.hasLiked) {
                    evaluationModel.likesDuringViewing++;
                    if (item.wasRecommended) {
                        evaluationModel.kyRecLikes++;
                    } else {
                        evaluationModel.nonKyRecLikes++;
                    }
                }
            } else if (item.hasDisliked) {
                evaluationModel.dislikes++;
                if (item.whileWatching.hasDisliked) {
                    evaluationModel.dislikesDuringViewing++;
                    if (item.wasRecommended) {
                        evaluationModel.kyRecDislikes++;
                    } else {
                        evaluationModel.nonKyRecDislikes++;
                    }
                }
            }

            if (item.hasSubscribed) {
                evaluationModel.subscriptions++;
                if (item.whileWatching.hasSubscribed) {
                    evaluationModel.subscriptionDuringViewing++;
                    if (item.wasRecommended) {
                        evaluationModel.kyRecSubscriptions++;
                    } else {
                        evaluationModel.nonKyRecSubscriptions++;
                    }
                }
            }
        };

        evaluationByUser.push(evaluationModel);
    }

    return evaluationByUser;
}

/** To get watch time data for a video. Includes predicted, actual and duration.
 * @param {String} videoId - Video id
 * @param {Number} watchTime - Watch time in seconds
 * @param {Number} duration - Video duration in seconds
 * @param {Array} recommendations - Array of recommendations
 * @returns {Object} - Watch time data object
*/
const getWatchTimeData = (videoId, watchTime, duration, recommendations) => {
    for (let item of recommendations) {
        for (let video of item.toRecommend) {
            if (video.videoId === videoId) {
                return {
                    predictedWatchTimeSeconds: getPredictedWatchTime(getScorePercentage(video.story.slice(-4)), duration),
                    actualWatchTimeSeconds: watchTime,
                    videoDuration: duration
                }
            }
        }
    }
}

/** To get predicted watch time in seconds based on story score
 * @param {Number} percentage - Story score percentage
 * @param {Number} duration - Video duration in seconds
 * @returns {Number} - Predicted watch time in seconds
 */
const getPredictedWatchTime = (percentage, duration) => {
    if (percentage >= 90) {
        return ((90 + 100) / 2) * duration / 100;
    } else if (percentage >= 75) {
        return ((75 + 90) / 2) * duration / 100;
    } else if (percentage >= 50) {
        return ((50 + 75) / 2) * duration / 100;
    } else if (percentage >= 25) {
        return ((25 + 50) / 2) * duration / 100;
    } else {
        return ((0 + 25) / 2) * duration / 100;
    }
}