const express = require('express');
const router = express.Router();
const axios = require('axios');

// 代理任天堂官方播放列表API
router.get('/nm/playlist/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const { lang = 'ja-JP' } = req.query;
        const url = `https://api.m.nintendo.com/catalog/officialPlaylists/${pid}`;
        const response = await axios.get(url, {
            params: {
                lang: lang,
                country: 'JP',
                membership: 'BASIC',
                packageType: 'hls_cbcs',
                sdkVersion: 'ios-1.4.0_f362763-1'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Nintendo API Error:', error.message);

        if (error.response) {
            // 外部API返回了错误状态码
            res.status(error.response.status).json({
                error: 'Nintendo API Error',
                message: error.response.data || error.message,
                status: error.response.status
            });
        } else if (error.request) {
            // 请求发出但没有响应
            res.status(500).json({
                error: 'Network Error',
                message: 'Failed to connect to Nintendo API',
                details: error.message
            });
        } else {
            // 其他错误
            res.status(500).json({
                error: 'Request Error',
                message: error.message
            });
        }
    }
});

module.exports = router;