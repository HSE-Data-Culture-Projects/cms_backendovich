const https = require('https');
const qs = require('qs');
const uuid = require('uuid');
const logger = require('../utils/logger');

let accessToken = null;
let accessTokenExpiresAt = null;

async function getAccessToken() {
    if (accessToken && accessTokenExpiresAt > Date.now()) {
        return accessToken;
    }

    const data = qs.stringify({
        grant_type: 'client_credentials',
        scope: 'GIGACHAT_API_PERS',
    });

    const clientId = 'd7408d85-fce1-4d87-abb1-5474290d1f58';
    const clientSecret = '3d58d114-6e70-471b-82e4-afb2b8ea530c';

    if (!clientId || !clientSecret) {
        logger.error('Client ID and Client Secret must be set in environment variables');
        throw new Error('Client credentials not set');
    }

    const rqUid = uuid.v4();
    const auth = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');

    const options = {
        method: 'POST',
        hostname: 'ngw.devices.sberbank.ru',
        port: 9443,
        path: '/api/v2/oauth',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
            RqUID: rqUid,
        },
    };

    return new Promise((resolve, reject) => {
        const reqExternal = https.request(options, (resExternal) => {
            let data = '';
            resExternal.on('data', (chunk) => {
                data += chunk;
            });
            resExternal.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    accessToken = parsedData.access_token;
                    accessTokenExpiresAt = Date.now() + parsedData.expires_in * 1000;
                    logger.info('Obtained new access token');
                    resolve(accessToken);
                } catch (error) {
                    logger.error('Error parsing access token response:', error);
                    reject(error);
                }
            });
        });

        reqExternal.on('error', (error) => {
            logger.error('Error fetching access token:', error);
            reject(error);
        });

        reqExternal.write(data);
        reqExternal.end();
    });
}

exports.getAccessToken = async (req, res) => {
    try {
        const token = await getAccessToken();
        res.status(200).json({ access_token: token });
    } catch (error) {
        logger.error('Error in getAccessToken controller:', error);
        res.status(500).json({ error: 'Failed to retrieve access token' });
    }
};