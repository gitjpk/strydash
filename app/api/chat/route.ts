import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

// Map our model names to Ollama model names
const MODEL_MAP: Record<string, string> = {
  'mistral': 'mistral:latest',
  'llama3.1': 'llama3.1:latest',
  'phi3': 'phi3:latest',
  'gemma2': 'gemma2:latest',
  'qwen2.5': 'qwen2.5:latest',
};

function getTrainingContext() {
  try {
    const dbPath = path.join(process.cwd(), 'stryd_activities.db');
    const db = new Database(dbPath, { readonly: true });
    
    // Get recent activities (last 30 days)
    const recentActivities = db.prepare(`
      SELECT 
        name, type, date, distance, moving_time, 
        average_speed, average_power, average_heart_rate, 
        average_cadence, calories, total_elevation_gain, tags
      FROM activities 
      ORDER BY date DESC 
      LIMIT 20
    `).all();
    
    // Get overall statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(distance) as total_distance,
        SUM(moving_time) as total_time,
        AVG(average_power) as avg_power,
        AVG(average_heart_rate) as avg_hr,
        AVG(average_cadence) as avg_cadence,
        AVG(average_speed) as avg_speed
      FROM activities
    `).get() as any;
    
    // Get 7-day rolling stats
    const rolling7d = db.prepare(`
      SELECT 
        SUM(distance) as distance_7d,
        SUM(moving_time) as duration_7d,
        COUNT(*) as count_7d
      FROM activities
      WHERE date >= date('now', '-7 days')
    `).get() as any;
    
    db.close();
    
    // Format context for LLM
    const context = `You are StrAId, a running assistant analyzing Stryd running data.

OVERALL STATISTICS:
- Total activities: ${stats.total_activities}
- Total distance: ${(stats.total_distance / 1000).toFixed(1)} km
- Total time: ${Math.round(stats.total_time / 3600)} hours
- Average power: ${Math.round(stats.avg_power)} W
- Average heart rate: ${Math.round(stats.avg_hr)} bpm
- Average cadence: ${Math.round(stats.avg_cadence)} spm
- Average pace: ${formatPace(stats.avg_speed)}

LAST 7 DAYS:
- Activities: ${rolling7d.count_7d}
- Distance: ${(rolling7d.distance_7d / 1000).toFixed(1)} km
- Duration: ${Math.round(rolling7d.duration_7d / 60)} minutes

RECENT ACTIVITIES (last 20):
${recentActivities.map((a: any, i: number) => 
  `${i + 1}. ${a.name} (${a.type}) - ${new Date(a.date).toLocaleDateString('fr-FR')}
   Distance: ${(a.distance / 1000).toFixed(2)} km, Time: ${formatDuration(a.moving_time)}
   Power: ${Math.round(a.average_power)} W, HR: ${Math.round(a.average_heart_rate)} bpm
   Pace: ${formatPace(a.average_speed)}, Cadence: ${Math.round(a.average_cadence)} spm${a.tags ? `\n   Tags: ${a.tags}` : ''}`
).join('\n\n')}

Answer questions about this training data in a helpful and insightful way. Provide specific recommendations based on the actual data. Always respond in the same language as the user's question (French or English).`;
    
    return context;
  } catch (error) {
    console.error('Error getting training context:', error);
    return 'You are StrAId, a running assistant. The training data is currently unavailable.';
  }
}

function formatPace(speedMs: number): string {
  if (!speedMs || speedMs <= 0) return 'N/A';
  const paceMinPerKm = 1000 / (speedMs * 60);
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}min`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const ollamaModel = MODEL_MAP[model] || 'mistral:latest';

    // Add system context with training data
    const systemContext = getTrainingContext();
    const messagesWithContext = [
      { role: 'system', content: systemContext },
      ...messages
    ];

    // Call Ollama API
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messagesWithContext,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      
      // Check if it's a model not found error
      if (response.status === 404 || errorText.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Model not found. Please pull the model first using: ollama pull ' + ollamaModel,
            needsPull: true,
            model: ollamaModel
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to get response from Ollama: ' + errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Ollama returns { message: { role, content } }, we need just the content
    const messageContent = typeof data.message === 'string' 
      ? data.message 
      : data.message?.content || 'No response';
    return NextResponse.json({ message: messageContent });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Check if Ollama is not running
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Cannot connect to Ollama. Please make sure Ollama is running (ollama serve)',
          ollamaNotRunning: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
