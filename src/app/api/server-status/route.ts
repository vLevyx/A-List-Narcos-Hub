// app/api/server-status/route.ts
import { NextRequest, NextResponse } from 'next/server'

const SERVER_ID = "33065536"
const BATTLEMETRICS_API_URL = `https://api.battlemetrics.com/servers/${SERVER_ID}`

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers for public access
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60', // Cache for 30 seconds
    }

    // Fetch data from BattleMetrics API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(BATTLEMETRICS_API_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NarcosHub/1.0',
      },
      // Add next.js revalidation
      next: { revalidate: 30 } // Revalidate every 30 seconds
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`BattleMetrics API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Extract and format the data we need
    const server = data.data.attributes
    const details = server.details || {}
    
    const formattedData = {
      name: server.name || "Narcos Life",
      status: server.status || 'offline',
      players: server.players || 0,
      maxPlayers: server.maxPlayers || 128,
      country: server.country,
      region: details.regionName,
      map: details.map,
      gameMode: details.gameMode,
      version: details.version,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(formattedData, { headers })

  } catch (error) {
    console.error('Server status API error:', error)
    
    // Return error response with CORS headers
    const errorResponse = {
      error: 'Failed to fetch server data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}