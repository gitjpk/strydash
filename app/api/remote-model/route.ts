import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { remoteUrl, remoteServerType } = await request.json();

    if (!remoteUrl) {
      return NextResponse.json(
        { error: 'Remote URL is required' },
        { status: 400 }
      );
    }

    const apiUrl = `http://${remoteUrl}`;
    
    // Query the appropriate endpoint based on server type
    if (remoteServerType === 'lmstudio') {
      // LM Studio: OpenAI-compatible /v1/models endpoint
      const response = await fetch(`${apiUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch models from LM Studio' },
          { status: response.status }
        );
      }

      const data = await response.json();
      // Get the first loaded model
      const loadedModel = data.data?.[0];
      
      if (loadedModel) {
        return NextResponse.json({ 
          modelName: loadedModel.id,
          serverType: 'lmstudio'
        });
      }
      
      return NextResponse.json({ 
        modelName: null,
        error: 'No model loaded in LM Studio'
      });
      
    } else {
      // Ollama: /api/tags endpoint
      const response = await fetch(`${apiUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch models from Ollama' },
          { status: response.status }
        );
      }

      const data = await response.json();
      // Get the first model if available
      const firstModel = data.models?.[0];
      
      if (firstModel) {
        return NextResponse.json({ 
          modelName: firstModel.name,
          serverType: 'ollama'
        });
      }
      
      return NextResponse.json({ 
        modelName: null,
        error: 'No models found in Ollama'
      });
    }
    
  } catch (error) {
    console.error('Remote model detection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to remote server' },
      { status: 500 }
    );
  }
}
