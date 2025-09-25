export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file streams
  },
};

export default async function handler(req, res) {
  try {
    // The target n8n webhook. Using HTTPS as required.
    const n8nWebhookUrl = 'https://ai.senselive.io:5678/webhook-test/senselive-qc-agent';

    // 1. Manually read the incoming request body from the stream
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // 2. Prepare headers for the forwarded request
    const forwardedHeaders = { ...req.headers };

    // Delete headers that can cause issues when proxying
    delete forwardedHeaders.host;
    delete forwardedHeaders['content-length'];
    delete forwardedHeaders['connection'];

    // 3. Forward the request to n8n
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: req.method,
      headers: forwardedHeaders,
      body: body,
    });

    // 4. Set CORS headers on the response going back to the browser
    // This allows the browser to read the response from this API route
    res.setHeader('Access-Control-Allow-Origin', '*'); // Or your Vercel domain for more security
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // 5. Send the n8n response back to the client
    const responseData = await n8nResponse.arrayBuffer();
    const contentType = n8nResponse.headers.get('content-type');

    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.status(n8nResponse.status).send(Buffer.from(responseData));

  } catch (error) {
    console.error('Proxy forwarding error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
