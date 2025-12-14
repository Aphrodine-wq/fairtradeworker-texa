/**
 * Simple Weather Integration
 * Free Feature - Free API → show forecast on job cards
 */

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Lightning
} from "@phosphor-icons/react"

interface Weather {
  temp: number
  condition: string
  precipitation: number
  icon: string
}

interface WeatherIntegrationProps {
  zipCode: string
  jobType?: string
}

export function WeatherIntegration({ zipCode, jobType }: WeatherIntegrationProps) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!zipCode) {
      setLoading(false)
      return
    }

    // Free Open-Meteo API (no key required)
    const fetchWeather = async () => {
      try {
        // Get coordinates from zip (simplified - in production use geocoding)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=32.7767&longitude=-96.7970&current=temperature_2m,precipitation,weather_code&timezone=America/Chicago`
        )
        const data = await response.json()
        
        const current = data.current
        const weatherCodes: Record<number, { icon: string; condition: string }> = {
          0: { icon: 'sun', condition: 'Clear' },
          1: { icon: 'sun', condition: 'Mostly Clear' },
          2: { icon: 'cloud', condition: 'Partly Cloudy' },
          3: { icon: 'cloud', condition: 'Overcast' },
          45: { icon: 'cloud', condition: 'Foggy' },
          51: { icon: 'cloud-rain', condition: 'Light Drizzle' },
          53: { icon: 'cloud-rain', condition: 'Moderate Drizzle' },
          61: { icon: 'cloud-rain', condition: 'Light Rain' },
          63: { icon: 'cloud-rain', condition: 'Moderate Rain' },
          65: { icon: 'cloud-rain', condition: 'Heavy Rain' },
          71: { icon: 'cloud-snow', condition: 'Light Snow' },
          73: { icon: 'cloud-snow', condition: 'Moderate Snow' },
          75: { icon: 'cloud-snow', condition: 'Heavy Snow' },
          95: { icon: 'lightning', condition: 'Thunderstorm' },
        }

        const code = current.weather_code
        const weatherInfo = weatherCodes[code] || { icon: 'cloud', condition: 'Unknown' }

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: weatherInfo.condition,
          precipitation: current.precipitation || 0,
          icon: weatherInfo.icon
        })
      } catch (error) {
        console.error('Weather fetch failed:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [zipCode])

  // Only show for outdoor job types
  const outdoorJobs = ['roofing', 'landscaping', 'exterior', 'fence', 'deck', 'patio', 'siding']
  const isOutdoor = jobType && outdoorJobs.some(t => jobType.toLowerCase().includes(t))

  if (!zipCode || (!isOutdoor && jobType)) {
    return null
  }

  if (loading) {
    return (
      <Badge variant="outline" className="text-xs">
        Loading weather...
      </Badge>
    )
  }

  if (!weather) {
    return null
  }

  const getIcon = () => {
    switch (weather.icon) {
      case 'sun':
        return <Sun size={16} weight="fill" className="text-yellow-400" />
      case 'cloud-rain':
        return <CloudRain size={16} weight="fill" className="text-blue-400" />
      case 'cloud-snow':
        return <CloudSnow size={16} weight="fill" className="text-blue-200" />
      case 'lightning':
        return <Lightning size={16} weight="fill" className="text-yellow-400" />
      default:
        return <Cloud size={16} weight="fill" className="text-gray-400" />
    }
  }

  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1">
      {getIcon()}
      <span>{weather.temp}°F</span>
      {weather.precipitation > 0 && (
        <span className="text-blue-600 dark:text-blue-400">
          {weather.precipitation}% precip
        </span>
      )}
    </Badge>
  )
}
