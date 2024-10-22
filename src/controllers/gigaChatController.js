const https = require('https');
const logger = require('../utils/logger');

exports.generateText = async (req, res) => {
    try {
        const { message } = req.body;

        const accessToken = req.headers.authorization;
        if (!accessToken) {
            logger.warn('No access token provided');
            return res.status(401).json({ error: 'Access token required' });
        }

        const data = JSON.stringify({
            model: 'GigaChat',
            stream: false,
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
        });

        const options = {
            method: 'POST',
            hostname: 'gigachat.devices.sberbank.ru',
            path: '/api/v1/chat/completions',
            rejectUnauthorized: false,
            headers: {
                Authorization: `${accessToken}`,
                'Content-Type': 'application/json',
                'X-Request-ID': 'your-request-id',
                'X-Session-ID': 'your-session-id',
                'X-Client-ID': 'your-client-id',
            },
        };

        const reqExternal = https.request(options, (resExternal) => {
            let response = '';
            resExternal.on('data', (chunk) => {
                response += chunk;
            });
            resExternal.on('end', () => {
                try {
                    const parsedData = JSON.parse(response);
                    res.status(200).json(parsedData);
                } catch (error) {
                    logger.error('Error parsing response from GigaChat:', error);
                    res.status(500).json({ error: 'Failed to generate text' });
                }
            });
        });

        reqExternal.on('error', (error) => {
            logger.error('Error in request to GigaChat:', error);
            res.status(500).json({ error: 'Failed to generate text' });
        });

        reqExternal.write(data);
        reqExternal.end();
    } catch (error) {
        logger.error('Error in generateText:', error);
        res.status(500).json({ error: 'Failed to generate text' });
    }
};
