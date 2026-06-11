// Netlify Function: proxy to QClaw Gateway
// POST /api/chat
// Forward to local Gateway chatCompletions endpoint

export default async function handler(request, context) {
  const GATEWAY_URL = 'http://127.0.0.1:51386';
  const GATEWAY_TOKEN = 'f14121dd834b65c04f51e996f888ab577f229afdadb9c6df';

  try {
    // Parse incoming request
    const body = await request.json();
    
    // Build OpenAI-compatible chat completions request
    const gatewayBody = {
      model: 'agnes/agnes-2.0-flash',
      messages: body.messages || [
        { role: 'system', content: body.systemPrompt || '' },
        { role: 'user', content: body.message || '' }
      ],
      max_tokens: 8192,
      stream: false
    };

    // Call Gateway chatCompletions
    const response = await fetch(`${GATEWAY_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`
      },
      body: JSON.stringify(gatewayBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Gateway error: ${response.status}`, details: errorText })
      };
    }

    const data = await response.json();
    
    // Extract the reply from Gateway response
    const reply = data.choices?.[0]?.message?.content || data.text || data.reply || '';
    
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal error', message: err.message })
    };
  }
}
