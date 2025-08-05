# TLMT Loopify 🎵

A Spotify track looper app by **TLMT Band**. Paste any Spotify track URL and loop it forever!

## Features

- 🔗 Paste any Spotify track URL
- 🔐 Login with your Spotify Premium account
- 🔄 Automatically loops tracks when they end
- 🎚️ Volume and playback controls
- 🎨 Clean, band-themed interface

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Spotify app credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## How to Use

1. Login with your Spotify Premium account
2. Paste a Spotify track URL (e.g., `https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`)
3. Click "Load & Loop Track"
4. Enjoy infinite loops! 🔄

## Requirements

- Spotify Premium account (required for Web Playback SDK)
- Modern web browser
- Internet connection

## Tech Stack

- Frontend: Vanilla JavaScript, HTML5, CSS3
- Backend: Node.js, Express
- API: Spotify Web API & Web Playback SDK

---

Made with ❤️ by **TLMT Band**
