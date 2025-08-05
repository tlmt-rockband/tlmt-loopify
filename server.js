const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get Spotify client ID
app.get('/api/spotify-config', (req, res) => {
    res.json({
        clientId: process.env.SPOTIFY_CLIENT_ID
    });
});

// API endpoint to exchange authorization code for access token
app.post('/api/token', async (req, res) => {
    const { code } = req.body;
    
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
                ).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `http://localhost:${PORT}/callback`
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Failed to exchange token' });
    }
});

// Callback route for Spotify OAuth
app.get('/callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'callback.html'));
});

app.listen(PORT, () => {
    console.log(`🎵 TLMT Loopify server running on http://localhost:${PORT}`);
    console.log('🚀 Ready to loop some tracks!');
});
