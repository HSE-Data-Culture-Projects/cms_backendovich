// src/controllers/authController.js
const axios = require('axios');
const qs = require('qs');

exports.getAccessToken = async (req, res) => {
    const data = qs.stringify({
        grant_type: 'client_credentials',
        scope: 'GIGACHAT_API_PERS',
        client_id: 'd7408d85-fce1-4d87-abb1-5474290d1f58',
        client_secret: '3d58d114-6e70-471b-82e4-afb2b8ea530c'
    });

    const config = {
        method: 'post',
        url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    try {
        const response = await axios(config);
        const { access_token } = response.data;
        res.status(200).json({ access_token });
    } catch (error) {
        console.error('Error fetching access token:', error);
        res.status(500).json({ error: 'Failed to retrieve access token' });
    }
};
