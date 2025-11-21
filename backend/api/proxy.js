const express = require('express');
const router = express.Router();
const axios = require('axios');


async function fetchNintendoMusicData(url, lang, res) {
    try {
        url = `https://api.m.nintendo.com/${url}`;
        console.log('Fetching Nintendo Music Data from URL:', url);
        const response = await axios.get(url, { 
            params: {
                lang: lang || 'ja-JP',
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
}

// 代理任天堂官方播放列表API
router.get('/nm/playlist/:pid', async (req, res) => {
    const pid = req.params.pid;
    const url = `catalog/officialPlaylists/${pid}`;
    const response = await fetchNintendoMusicData(url, req.query.lang, res);
});

// 代理任天堂游戏相关播放列表API
router.get('/nm/game/:gid/playlists', async (req, res) => {
    const gid = req.params.gid;
    const url = `catalog/games/${gid}/relatedPlaylists`;
    const response = await fetchNintendoMusicData(url, req.query.lang, res);
});

module.exports = router;