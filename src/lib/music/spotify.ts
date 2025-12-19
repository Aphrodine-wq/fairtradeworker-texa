/**
 * Spotify Web API integration
 * OAuth 2.0 flow and API client
 */

import type { Track, Playlist, MusicServiceConfig, MusicServiceAPI } from './types'
import { MusicService } from './types'
import { secureTokenStorage, secureAPIRequest, sanitizeAPIResponse, validateAPIRequest } from '@/lib/void/apiSecurity'
import { sanitizeString } from '@/lib/void/validation'

const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/auth/spotify/callback`
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming'
].join(' ')

const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?` +
  `client_id=${SPOTIFY_CLIENT_ID}&` +
  `response_type=code&` +
  `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
  `scope=${encodeURIComponent(SPOTIFY_SCOPES)}`

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Token storage key
const SPOTIFY_TOKEN_KEY = 'spotify-token-config'

/**
 * Get stored Spotify configuration
 */
export function getSpotifyConfig(): MusicServiceConfig | null {
  try {
    const tokenStorage = secureTokenStorage()
    const accessToken = tokenStorage.get('spotify')
    
    if (!accessToken) return null
    
    // Get additional config from localStorage (non-sensitive data)
    const stored = localStorage.getItem(SPOTIFY_TOKEN_KEY)
    if (!stored) return null
    
    const config = JSON.parse(stored) as MusicServiceConfig
    // Check if token is expired
    if (config.expiresAt && Date.now() > config.expiresAt) {
      return { ...config, isAuthenticated: false, accessToken: null }
    }
    
    return {
      ...config,
      accessToken, // Use securely stored token
    }
  } catch {
    return null
  }
}

/**
 * Save Spotify configuration
 */
export function saveSpotifyConfig(config: MusicServiceConfig): void {
  try {
    const tokenStorage = secureTokenStorage()
    
    // Store token securely
    if (config.accessToken && config.expiresAt) {
      tokenStorage.set('spotify', config.accessToken, config.expiresAt)
    }
    
    // Store non-sensitive config in localStorage
    const { accessToken, refreshToken, ...publicConfig } = config
    localStorage.setItem(SPOTIFY_TOKEN_KEY, JSON.stringify({
      ...publicConfig,
      hasToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    }))
  } catch (error) {
    console.error('[Spotify] Failed to save config:', error)
  }
}

/**
 * Initialize Spotify OAuth flow
 */
export async function authenticateSpotify(): Promise<boolean> {
  try {
    // Redirect to Spotify authorization
    window.location.href = SPOTIFY_AUTH_URL
    return true
  } catch (error) {
    console.error('Spotify authentication error:', error)
    return false
  }
}

/**
 * Handle OAuth callback and exchange code for token
 */
export async function handleSpotifyCallback(code: string): Promise<MusicServiceConfig | null> {
  try {
    // Validate code input
    if (typeof code !== 'string' || code.length === 0 || code.length > 500) {
      throw new Error('Invalid authorization code')
    }

    // Validate request
    const validation = validateAPIRequest({
      endpoint: '/api/spotify/token',
      method: 'POST',
      body: { code, redirect_uri: SPOTIFY_REDIRECT_URI },
    })

    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid request')
    }

    // In production, this should be done server-side for security
    // For now, we'll use a proxy endpoint or client-side exchange
    const response = await secureAPIRequest('/api/spotify/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: SPOTIFY_REDIRECT_URI })
    })

    if (!response.ok) {
      throw new Error('Token exchange failed')
    }

    const rawData = await response.json()
    const data = sanitizeAPIResponse(rawData) as any

    // Validate response data
    if (!data.access_token || typeof data.access_token !== 'string') {
      throw new Error('Invalid token response')
    }

    const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600
    const config: MusicServiceConfig = {
      service: MusicService.SPOTIFY,
      isAuthenticated: true,
      accessToken: sanitizeString(data.access_token, 500),
      refreshToken: data.refresh_token ? sanitizeString(data.refresh_token, 500) : undefined,
      expiresAt: Date.now() + (expiresIn * 1000)
    }

    saveSpotifyConfig(config)
    return config
  } catch (error) {
    console.error('[Spotify] Callback error:', error)
    return null
  }
}

/**
 * Refresh Spotify access token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<MusicServiceConfig | null> {
  try {
    // Validate refresh token
    if (typeof refreshToken !== 'string' || refreshToken.length === 0 || refreshToken.length > 500) {
      throw new Error('Invalid refresh token')
    }

    const response = await secureAPIRequest('/api/spotify/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const rawData = await response.json()
    const data = sanitizeAPIResponse(rawData) as any

    if (!data.access_token || typeof data.access_token !== 'string') {
      throw new Error('Invalid token response')
    }

    const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 3600
    const config: MusicServiceConfig = {
      service: MusicService.SPOTIFY,
      isAuthenticated: true,
      accessToken: sanitizeString(data.access_token, 500),
      refreshToken: sanitizeString(refreshToken, 500),
      expiresAt: Date.now() + (expiresIn * 1000)
    }

    saveSpotifyConfig(config)
    return config
  } catch (error) {
    console.error('[Spotify] Token refresh error:', error)
    return null
  }
}

/**
 * Make authenticated Spotify API request with security measures
 */
async function spotifyRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Validate endpoint
  if (typeof endpoint !== 'string' || endpoint.length === 0 || endpoint.length > 500) {
    throw new Error('Invalid endpoint')
  }

  // Sanitize endpoint - remove any potential injection
  const sanitizedEndpoint = sanitizeString(endpoint.replace(/[^a-zA-Z0-9\/\?\=\&\-_]/g, ''), 500)

  const config = getSpotifyConfig()
  if (!config?.accessToken) {
    throw new Error('Not authenticated with Spotify')
  }

  // Check if token needs refresh
  if (config.expiresAt && Date.now() > config.expiresAt - 60000) {
    if (config.refreshToken) {
      const newConfig = await refreshSpotifyToken(config.refreshToken)
      if (newConfig) {
        config.accessToken = newConfig.accessToken
        config.expiresAt = newConfig.expiresAt
      }
    }
  }

  // Validate request
  const validation = validateAPIRequest({
    endpoint: `${SPOTIFY_API_BASE}${sanitizedEndpoint}`,
    method: options.method,
    body: options.body as unknown,
  })

  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid request')
  }

  const response = await secureAPIRequest(`${SPOTIFY_API_BASE}${sanitizedEndpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (response.status === 401) {
    // Token expired, try to refresh
    if (config.refreshToken) {
      const newConfig = await refreshSpotifyToken(config.refreshToken)
      if (newConfig) {
        // Retry request with new token
        return secureAPIRequest(`${SPOTIFY_API_BASE}${sanitizedEndpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${newConfig.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        })
      }
    }
    // Refresh failed, need to re-authenticate
    throw new Error('Authentication expired')
  }

  return response
}

/**
 * Get user's Spotify playlists
 */
export async function getSpotifyPlaylists(): Promise<Playlist[]> {
  try {
    const response = await spotifyRequest('/me/playlists?limit=50')
    if (!response.ok) throw new Error('Failed to fetch playlists')

    const rawData = await response.json()
    const data = sanitizeAPIResponse(rawData) as any
    
    if (!data.items || !Array.isArray(data.items)) {
      return []
    }
    
    return data.items.slice(0, 50).map((item: any) => ({
      id: sanitizeString(String(item.id || ''), 200),
      name: sanitizeString(String(item.name || ''), 200),
      description: item.description ? sanitizeString(String(item.description), 500) : undefined,
      service: MusicService.SPOTIFY,
      artwork: item.images?.[0]?.url ? sanitizeString(String(item.images[0].url), 500) : undefined,
      tracks: [] // Will be populated when playlist is selected
    }))
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error)
    return []
  }
}

/**
 * Get currently playing track from Spotify
 */
export async function getSpotifyCurrentlyPlaying(): Promise<Track | null> {
  try {
    const response = await spotifyRequest('/me/player/currently-playing')
    if (response.status === 204) return null // No track playing
    if (!response.ok) throw new Error('Failed to fetch current track')

    const rawData = await response.json()
    const data = sanitizeAPIResponse(rawData) as any
    
    if (!data.item) {
      return null
    }
    
    const artists = Array.isArray(data.item.artists)
      ? data.item.artists.slice(0, 10).map((a: any) => sanitizeString(String(a.name || ''), 100)).join(', ')
      : ''
    
    return {
      id: sanitizeString(String(data.item.id || ''), 200),
      title: sanitizeString(String(data.item.name || ''), 200),
      artist: artists,
      album: data.item.album?.name ? sanitizeString(String(data.item.album.name), 200) : '',
      duration: typeof data.item.duration_ms === 'number' ? Math.floor(data.item.duration_ms / 1000) : 0,
      artwork: data.item.album?.images?.[0]?.url ? sanitizeString(String(data.item.album.images[0].url), 500) : undefined,
      uri: data.item.uri ? sanitizeString(String(data.item.uri), 500) : undefined,
      service: MusicService.SPOTIFY
    }
  } catch (error) {
    console.error('Error fetching Spotify current track:', error)
    return null
  }
}

/**
 * Play a track on Spotify
 */
export async function playSpotifyTrack(track: Track): Promise<void> {
  try {
    if (!track.uri) throw new Error('Track URI required')
    
    // Validate and sanitize URI
    const sanitizedUri = sanitizeString(track.uri, 500)
    if (!sanitizedUri.startsWith('spotify:track:')) {
      throw new Error('Invalid track URI')
    }
    
    await spotifyRequest('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify({ uris: [sanitizedUri] })
    })
  } catch (error) {
    console.error('[Spotify] Error playing track:', error)
    throw error
  }
}

/**
 * Pause Spotify playback
 */
export async function pauseSpotifyPlayback(): Promise<void> {
  try {
    await spotifyRequest('/me/player/pause', { method: 'PUT' })
  } catch (error) {
    console.error('Error pausing Spotify playback:', error)
    throw error
  }
}

/**
 * Set Spotify volume
 */
export async function setSpotifyVolume(volume: number): Promise<void> {
  try {
    // Validate volume
    if (typeof volume !== 'number' || volume < 0 || volume > 1) {
      throw new Error('Invalid volume value')
    }
    
    const volumePercent = Math.max(0, Math.min(100, Math.round(volume * 100)))
    await spotifyRequest(`/me/player/volume?volume_percent=${volumePercent}`, {
      method: 'PUT'
    })
  } catch (error) {
    console.error('[Spotify] Error setting volume:', error)
    throw error
  }
}

/**
 * Update Media Session API metadata
 */
export function updateSpotifyMediaSession(track: Track | null, isPlaying: boolean): void {
  if (!('mediaSession' in navigator) || !track) {
    return
  }

  const { mediaSession } = navigator

  // Sanitize track metadata
  const sanitizedTitle = sanitizeString(track.title || '', 200)
  const sanitizedArtist = sanitizeString(track.artist || '', 200)
  const sanitizedAlbum = sanitizeString(track.album || '', 200)
  const sanitizedArtwork = track.artwork ? sanitizeString(track.artwork, 500) : undefined

  mediaSession.metadata = new MediaMetadata({
    title: sanitizedTitle,
    artist: sanitizedArtist,
    album: sanitizedAlbum,
    artwork: sanitizedArtwork
      ? [
          { src: sanitizedArtwork, sizes: '96x96', type: 'image/png' },
          { src: sanitizedArtwork, sizes: '128x128', type: 'image/png' },
          { src: sanitizedArtwork, sizes: '192x192', type: 'image/png' },
          { src: sanitizedArtwork, sizes: '256x256', type: 'image/png' },
          { src: sanitizedArtwork, sizes: '384x384', type: 'image/png' },
          { src: sanitizedArtwork, sizes: '512x512', type: 'image/png' },
        ]
      : [],
  })

  mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
}

/**
 * Cache track in IndexedDB (last 10 tracks)
 */
const CACHE_SIZE = 10
const CACHE_DB_NAME = 'spotify-tracks-cache'
const CACHE_STORE_NAME = 'tracks'

async function cacheTrack(track: Track): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([CACHE_STORE_NAME], 'readwrite')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      
      // Add new track
      store.add({ ...track, cachedAt: Date.now() })
      
      // Get all tracks and keep only last 10
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        const tracks = getAllRequest.result
        if (tracks.length > CACHE_SIZE) {
          // Sort by cachedAt and remove oldest
          tracks.sort((a, b) => a.cachedAt - b.cachedAt)
          const toRemove = tracks.slice(0, tracks.length - CACHE_SIZE)
          toRemove.forEach(t => store.delete(t.id))
        }
        resolve()
      }
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Get cached tracks from IndexedDB
 */
export async function getCachedTracks(): Promise<Track[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        resolve([])
        return
      }
      const transaction = db.transaction([CACHE_STORE_NAME], 'readonly')
      const store = transaction.objectStore(CACHE_STORE_NAME)
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        const tracks = getAllRequest.result.map(({ cachedAt, ...track }) => track)
        resolve(tracks)
      }
      getAllRequest.onerror = () => resolve([])
    }
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Spotify API client implementation
 */
export const spotifyAPI: MusicServiceAPI = {
  async authenticate() {
    return await authenticateSpotify()
  },
  async getPlaylists() {
    return await getSpotifyPlaylists()
  },
  async getStations() {
    return [] // Spotify doesn't have stations
  },
  async getCurrentlyPlaying() {
    const track = await getSpotifyCurrentlyPlaying()
    if (track) {
      // Cache track
      await cacheTrack(track).catch(console.error)
      // Update Media Session
      updateSpotifyMediaSession(track, true)
    }
    return track
  },
  async playTrack(track) {
    await playSpotifyTrack(track)
    await cacheTrack(track).catch(console.error)
    updateSpotifyMediaSession(track, true)
  },
  async playPlaylist(playlist) {
    // Implementation for playing playlist
    throw new Error('Not implemented')
  },
  async playStation() {
    throw new Error('Spotify does not support stations')
  },
  async pause() {
    await pauseSpotifyPlayback()
    const track = await getSpotifyCurrentlyPlaying()
    if (track) {
      updateSpotifyMediaSession(track, false)
    }
  },
  async resume() {
    await spotifyRequest('/me/player/play', { method: 'PUT' })
    const track = await getSpotifyCurrentlyPlaying()
    if (track) {
      updateSpotifyMediaSession(track, true)
    }
  },
  async setVolume(volume) {
    await setSpotifyVolume(volume)
  },
  async seek(position) {
    // Validate position
    if (typeof position !== 'number' || position < 0) {
      throw new Error('Invalid seek position')
    }
    
    const positionMs = Math.floor(position * 1000)
    await spotifyRequest(`/me/player/seek?position_ms=${positionMs}`, {
      method: 'PUT'
    })
  },
  async next() {
    await spotifyRequest('/me/player/next', { method: 'POST' })
    const track = await getSpotifyCurrentlyPlaying()
    if (track) {
      await cacheTrack(track).catch(console.error)
      updateSpotifyMediaSession(track, true)
    }
  },
  async previous() {
    await spotifyRequest('/me/player/previous', { method: 'POST' })
    const track = await getSpotifyCurrentlyPlaying()
    if (track) {
      await cacheTrack(track).catch(console.error)
      updateSpotifyMediaSession(track, true)
    }
  }
}
