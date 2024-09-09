const https = require('https');

exports.generateText = async (req, res) => {
    try {
        const { message } = req.body;

        const accessToken = req.headers.authorization;
        console.log(req.headers);
        if (!accessToken) {
            throw new Error('Failed to obtain access token');
        }

        const data = JSON.stringify({
            model: 'GigaChat',
            stream: false,
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ]
        });

        const options = {
            method: 'POST',
            hostname: 'gigachat.devices.sberbank.ru',
            path: '/api/v1/chat/completions',
            rejectUnauthorized: false,
            headers: {
                'Authorization': `${accessToken}`,
                'Content-Type': 'application/json',
                'X-Request-ID': 'your-request-id',
                'X-Session-ID': 'your-session-id',
                'X-Client-ID': 'your-client-id'
            }
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
                    console.error('Error parsing response:', error);
                    res.status(500).json({ error: 'Failed to generate text' });
                }
            });
        });

        reqExternal.on('error', (error) => {
            console.error('Error generating text:', error);
            res.status(500).json({ error: 'Failed to generate text' });
        });

        reqExternal.write(data);
        reqExternal.end();
    } catch (error) {
        console.error('Error in generateText:', error);
        res.status(500).json({ error: 'Failed to generate text' });
    }
};
