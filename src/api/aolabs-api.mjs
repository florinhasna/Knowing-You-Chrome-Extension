import { KENNEL_ID } from './../config/constants.mjs'

const options = {
    method: 'POST',
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-API-KEY': process.env.AO_LABS_KEY
    }
}

/** API Call to AO Labs to train an agent with a given input
 * and label. Returns the training response.
 * @param {string} agentId - The ID of the agent to be trained, usually the userId
 * @param {string} input - The input data for training
 * @param {string} label - The label data for training
 * @returns {Object} - The training response
 */
export const train = async (agentId, input, label) => {
    options.body = JSON.stringify({
        kennel_id: KENNEL_ID,
        agent_id: agentId,
        INPUT: input,
        LABEL: label,
        control: {
            US: true
        }
    });

    try {
        console.log(`Training agent...`);
        const res = await fetch(process.env.AO_LABS_AGENT_URL, options);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (e) {
        console.error("Error fetching data:", e);
    }
}

/** API Call to AO Labs to test an agent with a given input.
 * Returns the test response.
 * @param {string} agentId - The ID of the agent to be tested
 * @param {string} input - The input data for testing
 * @returns {Object} - The test response
 */
export const test = async (agentId, input) => {
    options.body = JSON.stringify({
        kennel_id: KENNEL_ID,
        agent_id: agentId,
        INPUT: input,
        control: {
            US: false,
            states: 5
        }
    });

    try {
        console.log(`Testing agent...`);
        const res = await fetch(process.env.AO_LABS_AGENT_URL, options);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        return data;
    } catch (e) {
        console.error("Error fetching data:", e);
    }
}