# 🎵 TLMT Loopify Setup Guide

## Quick Start

Your TLMT Loopify app is ready! Here's how to get it fully working:

### 1. Server is Running ✅
The server is already running at: **http://localhost:3000**

### 2. Set Up Spotify App Credentials

To make the app work with real Spotify accounts, you need to:

1. **Go to Spotify Developer Dashboard:**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account

2. **Create a New App:**
   - Click "Create App"
   - App Name: `TLMT Loopify`
   - Description: `Spotify track looper for TLMT band`
   - Redirect URI: `http://localhost:3000/callback`
   - Check "Web Playback SDK" and "Web API"

3. **Get Your Credentials:**
   - Copy your `Client ID`
   - Click "Show Client Secret" and copy it

4. **Update the .env file:**
   ```bash
   # Replace these in .env file:
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   ```

5. **Restart the server:**
   ```bash
   npm start
   ```

### 3. Test the App

1. Open http://localhost:3000
2. Click "Login with Spotify"
3. Paste a Spotify track URL like:
   `https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh`
4. Click "Load & Loop Track"
5. Enjoy infinite loops! 🔄

## Features Included

✅ **Spotify OAuth Login** - Premium account required  
✅ **Track URL Parser** - Supports all Spotify URL formats  
✅ **Web Playback SDK** - Real audio streaming  
✅ **Auto-Loop** - Automatically restarts when track ends  
✅ **Loop Counter** - Tracks how many times it's looped  
✅ **Playtime Counter** - Shows total listening time  
✅ **Player Controls** - Play, pause, volume, etc.  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **TLMT Branding** - Custom styled for your band  

## Requirements

- **Spotify Premium Account** (required for Web Playback SDK)
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Internet Connection**

## Troubleshooting

### "Login Failed"
- Make sure your Spotify app redirect URI is set to: `http://localhost:3000/callback`
- Check that your Client ID and Secret are correct in `.env`

### "Premium Required"
- Spotify Web Playback SDK only works with Premium accounts
- Free accounts cannot stream audio through the Web API

### "Track Won't Load"
- Make sure the Spotify URL is valid
- Try copying the URL directly from Spotify app "Share" menu
- Check browser console for error messages

## Development

- **Start dev server:** `npm run dev` (auto-restarts on changes)
- **Production build:** `npm start`
- **View logs:** Check terminal output

---

**Made with ❤️ by TLMT Band**  
Ready to create some epic looping videos! 🎬🎵
