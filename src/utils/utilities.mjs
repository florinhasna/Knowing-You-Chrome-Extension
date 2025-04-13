import { unmarshall } from "@aws-sdk/util-dynamodb";
import { getEntries } from './dynamo-db.mjs';

/** Get a random index between min and max
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} - Random index
 */
export const getRandomIndex = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Calcualte a percentage of a string output from an agent.
 * Every 1 in the string represents 10%.
 * @param {String} score - String output from an agent
 * @returns {Number} - Percentage of the string output
 */
export const getScorePercentage = (score) => {
    const countOnes = (score.match(/1/g) || []).length;

    const totalLength = score.length;

    const percentage = (countOnes / totalLength) * 100;

    return percentage;
};

/** Take a numeric value and a length, convert the number
 * to its binary representation and pad it with zeros to the
 * specified length.
 * @param {Number} number - Numeric value
 * @param {Number} length - Length of the binary sequence
 * @returns {Array} - Binary sequence
 */
export const encodeToBinarySequence = (number, length) => {
    let binaryValue = number.toString(2);

    while (binaryValue.length < length) {
        binaryValue = '0' + binaryValue;
    }

    return binaryValue.split('').map(bit => parseInt(bit, 10));
}

/** Appends a binary sequence to a target array, from a given start point
 * Used to append the binary encoding of a category or language.
 * @param {Array} targetArray - Target array
 * @param {Array} binarySequence - Binary sequence
 * @param {Number} startIndex - Start index
 * @returns {Array} - Target array with the binary sequence appended
 */
export const insertBinarySequence = (targetArray, binarySequence, startIndex) => {
    for (let i = 0; i < binarySequence.length; i++) {
        targetArray[startIndex + i] = binarySequence[i];
    }

    return targetArray;
}

/** Convert string in the array to lower case, convert the array to a set
 * to remove duplicates, and convert the set back to an array.
 * @param {Array} array - Array of strings
 * @returns {Array} - Array of unique strings in lower case
 */
export const checkAndRemoveDuplicates = (array) => {
    let arrLowerCase = array.map((element) => element.toLowerCase());

    const arrToSet = new Set(arrLowerCase);

    let arrWithoutDuplicates = Array.from(arrToSet);

    if (arrWithoutDuplicates.length < array.length) {
        console.log("Duplicates found and removed...");
    }

    return arrWithoutDuplicates;
}

/** Filter an array by videoId, remove duplicates if found when searching.
 * @param {Array} arr - Array of objects
 * @returns {Array} - Array of unique objects by videoId
 */
export const removeDuplicatesByVideoId = (arr) => {
    console.log("Checking and removing duplicates of search results...");
    const idSeen = new Set();
    return arr.filter(object => {
        if (object.id && object.id.videoId) {
            if (idSeen.has(object.id.videoId)) {
                console.log(`Duplicate found and removed, ${object.id.videoId}...`);
                return false
            };
            idSeen.add(object.id.videoId);
            return true;
        }
    });
}

/** Convert data from DynamoDB to a more readable format
 * @param {String} table - DynamoDB table name
 * @param {String} primaryKey - Primary key of the table
 * @returns {Array} - Array of objects
 */
export const getConvertedData = async (table, primaryKey) => {
    const data = await getEntries(table, primaryKey);

    return data.map((item) => unmarshall(item));
}