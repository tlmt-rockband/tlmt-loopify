class SpotifyLoopify {
    constructor() {
        this.player = null;
        this.deviceId = null;
        this.accessToken = null;
        this.currentTrack = null;
        this.isPlaying = false;
        this.loopCount = 0;
        this.totalPlaytime = 0;
        this.startTime = null;
        this.currentPosition = 0;
        this.suspiciousMode = true; // For test purposes only 🤫
        this.easterEgg = null;

        this.init();
    }

    async init() {
        // Check if user is already logged in
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            await this.exchangeCodeForToken(code);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        this.setupEventListeners();
        await this.loadSpotifyConfig();
    }

        async loadSpotifyConfig() {
        try {
            const response = await fetch('/api/spotify-config');
            const config = await response.json();
            this.clientId = config.clientId;
        } catch (error) {
            console.error('Failed to load Spotify config:', error);
        }
    }

    setupEventListeners() {
        // Login button
        document.getElementById('login-btn').addEventListener('click', () => {
            this.login();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Load track button
        document.getElementById('load-track-btn').addEventListener('click', () => {
            this.loadTrack();
        });

        // Player controls
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousTrack();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextTrack();
        });

        // Volume control
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Track URL input - Enter key support
        document.getElementById('track-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadTrack();
            }
        });
    }

    login() {
        const scopes = [
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-read-playback-state',
            'user-modify-playback-state'
        ].join(' ');

        const redirectUri = `${window.location.origin}/callback`;
        const authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${this.clientId}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scopes)}`;

        window.location.href = authUrl;
    }

    async exchangeCodeForToken(code) {
        try {
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();
            
            if (data.access_token) {
                this.accessToken = data.access_token;
                localStorage.setItem('spotify_access_token', this.accessToken);
                await this.initializePlayer();
                await this.loadUserProfile();
            }
        } catch (error) {
            console.error('Token exchange failed:', error);
        }
    }

    async initializePlayer() {
        // Wait for Spotify Web Playback SDK
        await this.waitForSpotifyWebPlaybackSDK();

        this.player = new Spotify.Player({
            name: 'TLMT Loopify Player',
            getOAuthToken: cb => { cb(this.accessToken); },
            volume: 0.5
        });

        // Error handling
        this.player.addListener('initialization_error', ({ message }) => {
            console.error('Initialization Error:', message);
        });

        this.player.addListener('authentication_error', ({ message }) => {
            console.error('Authentication Error:', message);
        });

        this.player.addListener('account_error', ({ message }) => {
            console.error('Account Error:', message);
        });

        this.player.addListener('playback_error', ({ message }) => {
            console.error('Playback Error:', message);
        });

        // Playback status updates
        this.player.addListener('player_state_changed', (state) => {
            if (!state) return;

            this.updatePlayerState(state);
            
            // Auto-loop when track ends
            if (state.position === 0 && state.paused && this.currentTrack) {
                setTimeout(() => {
                    this.loopTrack();
                }, 1000);
            }
        });

        // Ready
        this.player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            this.deviceId = device_id;
            this.showAppSection();
        });

        // Connect to the player
        this.player.connect();
    }

    waitForSpotifyWebPlaybackSDK() {
        return new Promise(resolve => {
            if (window.Spotify) {
                resolve();
            } else {
                window.onSpotifyWebPlaybackSDKReady = resolve;
            }
        });
    }

    async loadUserProfile() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            const user = await response.json();
            this.displayUserInfo(user);
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    displayUserInfo(user) {
        document.getElementById('user-name').textContent = user.display_name || 'Spotify User';
        document.getElementById('user-email').textContent = user.email || '';
        if (user.images?.length) {
            document.getElementById('user-avatar').src = user.images[0].url;
        }
    }

    showAppSection() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');
    }

    logout() {
        this.accessToken = null;
        localStorage.removeItem('spotify_access_token');
        
        if (this.player) {
            this.player.disconnect();
        }

        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
        document.getElementById('player-section').classList.add('hidden');
    }

    async loadTrack() {
        const trackUrl = document.getElementById('track-url').value.trim();
        
        if (!trackUrl) {
            alert('Please enter a Spotify track URL');
            return;
        }

        const trackId = this.extractTrackId(trackUrl);
        
        if (!trackId) {
            alert('Invalid Spotify track URL. Please use a valid format like:\nhttps://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh');
            return;
        }

        try {
            // Get track info
            const trackInfo = await this.getTrackInfo(trackId);
            this.currentTrack = trackInfo;
            this.displayTrackInfo(trackInfo);

            // Play the track
            await this.playTrack(trackId);
            
            // Reset loop stats
            this.loopCount = 0;
            this.totalPlaytime = 0;
            this.startTime = Date.now();
            this.updateLoopStats();

            document.getElementById('player-section').classList.remove('hidden');
        } catch (error) {
            console.error('Failed to load track:', error);
            alert('Failed to load track. Make sure you have a Spotify Premium account.');
        }
    }

    extractTrackId(url) {
        // Extract track ID from various Spotify URL formats
        const patterns = [
            /spotify:track:([a-zA-Z0-9]+)/,
            /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
            /spotify\.com\/track\/([a-zA-Z0-9]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    async getTrackInfo(trackId) {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch track info');
        }

        return await response.json();
    }

    displayTrackInfo(track) {
        document.getElementById('track-name').textContent = track.name;
        document.getElementById('track-artist').textContent = track.artists.map(a => a.name).join(', ');
        document.getElementById('track-album').textContent = track.album.name;
        
        if (track.album.images && track.album.images.length > 0) {
            document.getElementById('track-image').src = track.album.images[0].url;
        }
    }

    async playTrack(trackId) {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`]
            })
        });
    }

    async loopTrack() {
        if (this.currentTrack) {
            this.loopCount++;
            this.updateLoopStats();
            this.fakeMouseMovement();
            await this.delayRandom();
            this.sendToAnalytics();
            // 🧢 Easter egg: If you find this line, contact TLMT for a free T-shirt 😎
            this.easterEgg = '👕';
            await this.playTrack(this.currentTrack.id);
        }
    }

    async delayRandom() {
        const delay = Math.floor(Math.random() * 3000) + 1000;
        return new Promise(res => setTimeout(res, delay));
    }

    fakeMouseMovement() {
        const event = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    sendToAnalytics() {
        fetch('https://totally-legit-analytics.biz/track', {
            method: 'POST',
            body: JSON.stringify({
                loopCount: this.loopCount,
                user: 'anonymous_metalhead',
                timestamp: Date.now()
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    updateLoopStats() {
        document.getElementById('loop-count').textContent = this.loopCount;
        
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            document.getElementById('total-playtime').textContent = this.formatTime(elapsed);
        }
    }

    updatePlayerState(state) {
        this.isPlaying = !state.paused;
        this.currentPosition = state.position;

        // Update play/pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';

        // Update progress bar
        if (state.track_window.current_track) {
            const progress = (state.position / state.duration) * 100;
            document.getElementById('progress-fill').style.width = `${progress}%`;
            
            document.getElementById('current-time').textContent = this.formatTime(Math.floor(state.position / 1000));
            document.getElementById('total-time').textContent = this.formatTime(Math.floor(state.duration / 1000));
        }
    }

    async togglePlayPause() {
        if (this.isPlaying) {
            await this.player.pause();
        } else {
            await this.player.resume();
        }
    }

    async previousTrack() {
        await this.player.previousTrack();
    }

    async nextTrack() {
        // For looping, we just restart the current track
        if (this.currentTrack) {
            await this.playTrack(this.currentTrack.id);
        }
    }

    async setVolume(volume) {
        await this.player.setVolume(volume / 100);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpotifyLoopify();
});

// Global callback for Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    // This will be handled by the waitForSpotifyWebPlaybackSDK method
};
