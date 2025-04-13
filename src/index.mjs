import { startTraining } from './services/training-service.mjs';
import { startRecommending } from './services/recommending-service.mjs';
import { getEvaluationData } from './services/evaluation-data-service.mjs';
import { USERS } from './config/constants.mjs';

/** Handles the HTTP Gateway API reuqests. */
export const handler = async (event) => {
    const httpMethod = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    if (httpMethod === 'POST' && path === '/train-agent') {
        const body = JSON.parse(event.body);

        if (!body.userId || !body.videoInteraction) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid data!' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(await startTraining(body.userId, body.videoInteraction, body.whileWatching))
        };
    } else if (httpMethod === 'GET' && path === '/recommendations') {
        // Extract query parameters
        const queryParams = event.queryStringParameters;

        if (!queryParams.userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid data!' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(await startRecommending(queryParams.userId))
        };
    } else if (httpMethod === 'GET' && path === '/evaluation-data') {
        return {
            statusCode: 200,
            body: JSON.stringify(await getEvaluationData(USERS))
        };
    } else { // Return 404 on unknown route
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Route Not Found' })
        };
    }
};