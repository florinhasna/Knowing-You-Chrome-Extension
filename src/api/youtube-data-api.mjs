const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
};

/** API Call to YouTube Data API to get data of a videoId.
 * @param {string} videoId - The ID of the video to get data for.
 * @returns {Object} - The video data.
 */
export const getVideo = async (videoId) => {
    // Logic to get video data from YT API
    let url = process.env.YT_BASE_URL + process.env.YT_VIDEO_ENDPOINT;
    url += `?part=snippet&id=` + videoId + `&key=${process.env.YT_KEY1}`;

    // Fetch the data
    const response = await fetch(url, options);

    // Parse the response as JSON
    const data = await response.json();

    return data;
};

/** API Call to YouTube Data API to search videos based on
 * a collection of parameters.
 * @param {Object} params - The parameters to search for videos.
 * @param {string} params.q - The search query.
 * @param {string} params.categoryId - The category ID to search for.
 * @param {string} params.lang - The language to search for.
 * @param {string} params.type - The 
 * type to search for, usually 'video'.
 * @param {string} params.maxResults - The maximum number of results to look for.
 * @returns {Object} - The video data.
 */
export const searchVideos = async (params) => {
    console.log("Searching YT Data API for videos to recommend...");

    let url = process.env.YT_BASE_URL + process.env.YT_SEARCH_ENDPOINT;
    url += `?part=snippet`;

    if (params.maxResults) {
        // Add the maxResult parameter
        url += `&maxResults=${params.maxResults}`
    }

    if (params.q) {
        // Add the query parameter
        url += `&q=${params.q}`;
    }

    if (params.categoryId) {
        // Add the category parameter
        url += `&videoCategoryId=${params.categoryId}`;
        // categoryId requires type parameter
        url += `&type=${params.type}`;
    }

    if (params.lang) {
        // Add the language parameter
        url += `&relevanceLanguage=${params.lang}`;
    }

    url += `&key=${process.env.YT_KEY1}`;

    console.log("URL: " + url);

    // Fetch the data
    const response = await fetch(url, options);

    // Parse the response as JSON
    const data = await response.json();

    return data;
};