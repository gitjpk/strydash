import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

// Map our model names to Ollama model names
const MODEL_MAP: Record<string, string> = {
  'mistral': 'mistral:latest',
  'llama3.1': 'llama3.1:latest',
  'phi3': 'phi3:latest',
  'gemma2': 'gemma2:latest',
  'qwen2.5': 'qwen2.5:latest',
};

export async function GET(request: NextRequest) {
  try {
    // Get list of installed models from Ollama
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ models: [], ollamaNotRunning: true }, { status: 503 });
      }
      throw new Error('Failed to fetch models from Ollama');
    }

    const data = await response.json();
    const installedModels = data.models || [];
    
    // Map Ollama model names back to our model names
    const availableModels = Object.entries(MODEL_MAP)
      .filter(([_, ollamaName]) => 
        installedModels.some((m: any) => m.name.startsWith(ollamaName))
      )
      .map(([ourName]) => ourName);

    return NextResponse.json({ models: availableModels });
  } catch (error: any) {
    console.error('Models API error:', error);
    
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { models: [], ollamaNotRunning: true },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch models', models: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();
    
    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    const ollamaModel = MODEL_MAP[model];
    
    if (!ollamaModel) {
      return NextResponse.json({ error: 'Unknown model' }, { status: 400 });
    }

    // Pull the model from Ollama
    const response = await fetch(`${OLLAMA_API_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: ollamaModel,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to pull model from Ollama');
    }

    // Note: In production, you might want to stream the progress
    // For now, we'll wait for the entire response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    // Read the stream until complete
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }

    return NextResponse.json({ success: true, model: ollamaModel });
  } catch (error: any) {
    console.error('Pull model error:', error);
    return NextResponse.json(
      { error: 'Failed to pull model: ' + error.message },
      { status: 500 }
    );
  }
}
