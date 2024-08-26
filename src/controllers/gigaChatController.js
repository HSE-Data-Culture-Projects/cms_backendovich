// src/controllers/gigaChatController.js
const axios = require('axios');

exports.generateText = async (req, res) => {
    const { access_token, message } = req.body;

    const data = {
        model: 'GigaChat',
        stream: false,
        messages: [
            {
                role: 'user',
                content: message
            }
        ]
    };

    const config = {
        method: 'post',
        url: 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'X-Request-ID': 'your-request-id',
            'X-Session-ID': 'your-session-id',
            'X-Client-ID': 'your-client-id'
        },
        data: JSON.stringify(data)
    };

    try {
        const response = await axios(config);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: 'Failed to generate text' });
    }
};
