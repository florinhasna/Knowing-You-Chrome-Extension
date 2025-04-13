/** @constant {number} INPUT_LENGTH - The length of the input vector. */
export const INPUT_LENGTH = 500;

/** @constant {number} LABEL_LENGTH - The length of the label vector. */
export const LABEL_LENGTH = 10;

/** @constant {number} LANG_START_INDEX - The start index of languages in the input vector. */
export const LANG_START_INDEX = 0;

/** @constant {number} LANG_ENCODING_LENGTH - The length of the language binary encoding vector. */
export const LANG_ENCODING_LENGTH = 7;

/** @constant {number} CATEGORY_START_INDEX - The start index of categories in the input vector. */
export const CATEGORY_START_INDEX = 7;

/** @constant {number} CATEGORY_ENCODING_LENGTH - The length of the category binary encoding vector. */
export const CATEGORY_ENCODING_LENGTH = 6;

/** @constant {number} TAGS_START_INDEX - The start index of tags in the input vector. */
export const TAGS_START_INDEX = 13;

/** @constant {string} VIDEOS_TABLE - DynamoDB table required for storing videos watched. */
export const VIDEOS_TABLE = "videos_watched_by_user";

/** @constant {string} TAGS_TABLE - DynamoDB table required for storing tag index assignments. */
export const TAGS_TABLE = "user_tags_by_category";

/** @constant {string} RECOMMENDATIONS_TABLE - DynamoDB table required for storing recommendations. */
export const RECOMMENDATIONS_TABLE = "knowingyou_recommendations";

/** @constant {string} KENNEL_ID - The kennel created in AO Labs API to run training/tests. */
export const KENNEL_ID = 'recommender500'

/** @constant {number} MINIMUM_THRESHOLD - The minimum threshold for a recommendation to be considered. */
export const MINIMUM_THRESHOLD = 5;

/** @constant {number} SCORE_THRESHOLD - The minimum score threshold for a recommendation to be shown to user. */
export const SCORE_THRESHOLD = 49;

/** @constant {number} VIDEOS_TO_RETURN - The number of videos to test for recommendations. */
export const VIDEOS_TO_RETURN = 10;

/** @constant {number} MAX_RESULTS - The maximum number of recommendations to search in one iteration. */
export const MAX_RESULTS = 2;

/** @constant {Array} USERS - Relevant user IDs to be used in evaluation. */
export const USERS = ['1742817790125', '1742973144298', '1742993821037', '1743005866662', '1743008964623', 
'1743146373825', '1743249881947', '1743345182999', '1743443306830', '1743452479199', '1743496298859'];