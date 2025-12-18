/**
 * Music service types and interfaces
 */

export enum MusicService {
  LOCAL = 'local',
  SPOTIFY = 'spotify',
  PANDORA = 'pandora'
}

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number // in seconds
  artwork?: string
  uri?: string // Service-specific URI
  service: MusicService
}

export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: Track[]
  service: MusicService
  artwork?: string
}

export interface Station {
  id: string
  name: string
  description?: string
  service: MusicService
  artwork?: string
}

export interface MusicServiceConfig {
  service: MusicService
  isAuthenticated: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

export interface MusicPlayerState {
  isPlaying: boolean
  currentTrack?: Track
  currentTime: number
  volume: number
  isMuted: boolean
  service: MusicService
  playlist?: Playlist
  station?: Station
}

export interface MusicServiceAPI {
  authenticate(): Promise<boolean>
  getPlaylists(): Promise<Playlist[]>
  getStations(): Promise<Station[]>
  getCurrentlyPlaying(): Promise<Track | null>
  playTrack(track: Track): Promise<void>
  playPlaylist(playlist: Playlist): Promise<void>
  playStation(station: Station): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  setVolume(volume: number): Promise<void>
  seek(position: number): Promise<void>
  next(): Promise<void>
  previous(): Promise<void>
}
