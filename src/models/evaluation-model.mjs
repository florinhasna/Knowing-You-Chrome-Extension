export const getEvaluationModel = () => {
    return {
        userId: '',
        totalVideosWatched: 0,
        nonKyRecommendations: 0,
        kyRecommendations: 0,
        likes: 0,
        likesDuringViewing: 0,
        dislikes: 0,
        dislikesDuringViewing: 0,
        subscriptions: 0,
        subscriptionDuringViewing: 0,
        nonKyRecLikes: 0,
        kyRecLikes: 0,
        nonKyRecDislikes: 0,
        kyRecDislikes: 0,
        nonKyRecSubscriptions: 0,
        kyRecSubscriptions: 0,
        watchData: []
    }
}