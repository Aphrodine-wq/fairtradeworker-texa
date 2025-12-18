/**
 * Spotify Web API integration
 * OAuth 2.0 flow and API client
 */

import type { Track, Playlist, MusicServiceConfig, MusicServiceAPI } from './types'
import { MusicService } from './types'

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
    const stored = localStorage.getItem(SPOTIFY_TOKEN_KEY)
    if (!stored) return null
    
    const config = JSON.parse(stored) as MusicServiceConfig
    // Check if token is expired
    if (config.expiresAt && Date.now() > config.expiresAt) {
      return { ...config, isAuthenticated: false }
    }
    return config
  } catch {
    return null
  }
}

/**
 * Save Spotify configuration
 */
export function saveSpotifyConfig(config: MusicServiceConfig): void {
  try {
    localStorage.setItem(SPOTIFY_TOKEN_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save Spotify config:', error)
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
    // In production, this should be done server-side for security
    // For now, we'll use a proxy endpoint or client-side exchange
    const response = await fetch('/api/spotify/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: SPOTIFY_REDIRECT_URI })
    })

    if (!response.ok) {
      throw new Error('Token exchange failed')
    }

    const data = await response.json()
    const config: MusicServiceConfig = {
      service: MusicService.SPOTIFY,
      isAuthenticated: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000)
    }

    saveSpotifyConfig(config)
    return config
  } catch (error) {
    console.error('Spotify callback error:', error)
    return null
  }
}

/**
 * Refresh Spotify access token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<MusicServiceConfig | null> {
  try {
    const response = await fetch('/api/spotify/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    const config: MusicServiceConfig = {
      service: MusicService.SPOTIFY,
      isAuthenticated: true,
      accessToken: data.access_token,
      refreshToken: refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000)
    }

    saveSpotifyConfig(config)
    return config
  } catch (error) {
    console.error('Spotify token refresh error:', error)
    return null
  }
}

/**
 * Make authenticated Spotify API request
 */
async function spotifyRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
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

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
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
        return fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
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

    const data = await response.json()
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      service: MusicService.SPOTIFY,
      artwork: item.images?.[0]?.url,
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

    const data = await response.json()
    return {
      id: data.item.id,
      title: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(', '),
      album: data.item.album.name,
      duration: Math.floor(data.item.duration_ms / 1000),
      artwork: data.item.album.images?.[0]?.url,
      uri: data.item.uri,
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
    
    await spotifyRequest('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify({ uris: [track.uri] })
    })
  } catch (error) {
    console.error('Error playing Spotify track:', error)
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
    const volumePercent = Math.round(volume * 100)
    await spotifyRequest(`/me/player/volume?volume_percent=${volumePercent}`, {
      method: 'PUT'
    })
  } catch (error) {
    console.error('Error setting Spotify volume:', error)
    throw error
  }
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
    return await getSpotifyCurrentlyPlaying()
  },
  async playTrack(track) {
    await playSpotifyTrack(track)
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
  },
  async resume() {
    await spotifyRequest('/me/player/play', { method: 'PUT' })
  },
  async setVolume(volume) {
    await setSpotifyVolume(volume)
  },
  async seek(position) {
    await spotifyRequest(`/me/player/seek?position_ms=${position * 1000}`, {
      method: 'PUT'
    })
  },
  async next() {
    await spotifyRequest('/me/player/next', { method: 'POST' })
  },
  async previous() {
    await spotifyRequest('/me/player/previous', { method: 'POST' })
  }
}
