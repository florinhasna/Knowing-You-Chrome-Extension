/** Instructions object */
const INSTRUCTIONS = {
    videosWatched: 'videos',
    likes: 'likes',
    dislike: 'dislikes',
    likeDislikeRate: 'ldRate',
    interactionRate: 'iRate',
    subscriptions: 'subscriptions'
}

/** Object containing titles for charts */
const TITLES = {
    videosWatched: 'Source of the videos watched',
    likes: 'Like rate by source',
    dislike: 'Dislike rate by source',
    likeDislikeRate: 'Like/dislike rate per user',
    interactionRate: 'Rate the user interacted with video using like/dislike',
    subscriptions: 'Number of subscriptions while using the extension'
}

/** Object containing names for comparison charts, used for the legend */
const NAMES = {
    videosWatched: {
        t1: 'YouTube Recommendations/Search/Other',
        t2: 'KnowingYou Recommendations'
    },
    likes: {
        t1: 'Other Source',
        t2: 'KnowingYou Recommendation'
    },
    dislike: {
        t1: 'Other Source ',
        t2: 'KnowingYou Recommendation'
    },
    likeDislikeRate: {
        t1: 'Like rate',
        t2: 'Dislike rate'
    },
    interactionRate: {
        t1: '',
        t2: ''
    },
    subscriptions: {
        t1: 'Other Source Subscription',
        t2: 'KnowingYou Subscription'
    },
}

/** Function to fetch evaluation data from backend.
 * @returns {Object} Evaluation data
 */
const getEvalData = async () => {
    let response = await fetch("https://wruzvj4tp2.execute-api.eu-west-2.amazonaws.com/evaluation-data");

    let res = await response.json();

    return res;
}

/** To plot a double bar chart.
 * @data {Object} Data to be plotted
 * @element {String} DOM element to plot the chart
 * @instruction {String} Instruction to be used for the chart, chosing which chart is needed
 * @names {Object} Names for the legend
 * @title {String} Title for the chart
 */
const plotRecommendations = (data, element, instruction, names, title) => {
    var trace1 = {
        x: [],
        y: [],
        name: names.t1,
        type: 'bar'
    };

    var trace2 = {
        x: [],
        y: [],
        name: names.t2,
        type: 'bar'
    };

    let count = 1;

    for (let item of data) {
        trace1.x.push(`user${count}`);
        trace2.x.push(`user${count}`);

        switch (instruction) {
            case INSTRUCTIONS.videosWatched:
                trace1.y.push(item.nonKyRecommendations);
                trace2.y.push(item.kyRecommendations);
                break;
            case INSTRUCTIONS.likes:
                trace1.y.push(item.nonKyRecLikes / item.likesDuringViewing);
                trace2.y.push(item.kyRecLikes / item.likesDuringViewing);
                break;
            case INSTRUCTIONS.dislike:
                trace1.y.push(item.nonKyRecDislikes / item.dislikesDuringViewing);
                trace2.y.push(item.kyRecDislikes / item.dislikesDuringViewing);
                break;
            case INSTRUCTIONS.likeDislikeRate:
                let total = item.likes + item.dislikes;
                if (total !== 0) {
                    let likeRate = item.likes / total;
                    let dislikeRate = item.dislikes / total;

                    trace1.y.push(likeRate);
                    trace2.y.push(dislikeRate);
                } else {
                    // No interactions, push 0s
                    trace1.y.push(0);
                    trace2.y.push(0);
                }
                break;
            case INSTRUCTIONS.interactionRate:
                let totalInteractions = item.likes + item.dislikes;
                let interactionRate = item.totalVideosWatched !== 0 ? totalInteractions / item.totalVideosWatched : 0;

                trace1.y.push(interactionRate);

                break;
            case INSTRUCTIONS.subscriptions:
                trace1.y.push(item.nonKyRecSubscriptions);
                trace2.y.push(item.kyRecSubscriptions);
                break;
        }

        count++;
    }

    var data = [trace1, trace2];
    var layout = {
        title: {
            text: title
        },
        barmode: 'group'
    };

    Plotly.newPlot(element, data, layout);
}

/** Function to calculate the RMSE and display the results into a table
 * @param {Object} data - Evaluation data
 */
const calculateRMSE = (data) => {
    let computation = [];
    let users = [];
    for (let item of data) {
        if (item.watchData.length === 0)
            continue;

        let squaredErrors = item.watchData.map(entry => {
            return Math.pow(entry.actualWatchTimeSeconds - entry.predictedWatchTimeSeconds, 2);
        });

        let meanSquaredError = squaredErrors.reduce((sum, err) => sum + err, 0) / item.watchData.length;

        computation.push(parseFloat(Math.sqrt(meanSquaredError).toFixed(2)));
        users.push(item.userId);
    }

    var values = [users, computation];

    var data = [{
        type: 'table',
        header: {
            values: [["<b>UserId</b>"], ["<b>RMSE</b>"]],
            align: "center",
            height: 40,
            line: { width: 1, color: 'black' },
            fill: { color: "grey" },
            font: { family: "Arial", size: 24, color: "white" }
        },
        cells: {
            values: values,
            align: "center",
            height: 45,
            line: { color: "black", width: 1 },
            font: { family: "Arial", size: 24, color: ["black"] }
        }
    }];

    Plotly.newPlot(document.getElementById('rmse'), data);
}

/** Function to display a radar chart for the survey evaluation, scores table is already filled with data
 * from SurveyMonkey.
 */
const radarChart = () => {
    const metrics = [
        "YouTube Usage (Hours/Day)",
        "Past YouTube Recs (%)",
        "KnowingYou Recs Watched (%)",
        "YouTube Recs Post-KnowingYou (%)",
        "Alignment with Preferences",
        "Ease of Installation"
    ]

    const scores = [
        [1.5, 35, 65, 25, 3, 1],
        [1.5, 65, 75, 75, 4, 1],
        [1.5, 85, 95, 5, 5, 1],
        [0.5, 85, 45, 45, 4, 1],
        [2.5, 25, 65, 15, 4, 1],
        [1.5, 85, 55, 45, 4, 1]
    ];
    const maxScores = [4, 100, 100, 100, 5, 1];

    // Radar chart data
    const radarData = [];

    let count = 1;
    for (let response of scores) {
        const normalizedScores = response.map((score, i) =>
            score / maxScores[i]
        );
        radarData.push({
            type: 'scatterpolar',
            r: normalizedScores,
            theta: metrics,
            fill: 'toself',
            name: `User ${count}`
        });
        count++;
    }

    // Layout configuration
    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 1],
                tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1],
                ticktext: ['0%', '20%', '40%', '60%', '80%', '100%']
            }
        },
        title: 'KnowingYou Survey Results (Normalized Averages)',
        showlegend: true
    };

    // Render the chart
    Plotly.newPlot(document.getElementById('radarChart'), radarData, layout);
}

/** Initialisation function to plot all charts and rmse table. */
const initialise = async () => {
    let data = await getEvalData();

    plotRecommendations(data, document.getElementById('videosWatched'), INSTRUCTIONS.videosWatched, NAMES.videosWatched, TITLES.videosWatched);
    plotRecommendations(data, document.getElementById('likesCount'), INSTRUCTIONS.likes, NAMES.likes, TITLES.likes);
    plotRecommendations(data, document.getElementById('dislikesCount'), INSTRUCTIONS.dislike, NAMES.dislike, TITLES.dislike);
    plotRecommendations(data, document.getElementById('subscriptionCount'), INSTRUCTIONS.subscriptions, NAMES.subscriptions, TITLES.subscriptions);
    plotRecommendations(data, document.getElementById('ldRate'), INSTRUCTIONS.likeDislikeRate, NAMES.likeDislikeRate, TITLES.likeDislikeRate);
    plotRecommendations(data, document.getElementById('iRate'), INSTRUCTIONS.interactionRate, NAMES.interactionRate, TITLES.interactionRate);

    calculateRMSE(data);

    radarChart();
}

initialise();