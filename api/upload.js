// This file should be placed in your backend's API routes folder (e.g., /pages/api/upload.js for Next.js)

export const config = {
  api: {
    bodyParser: false, // Important: This allows us to handle the raw request stream
  },
};

export default async function handler(req, res) {
  try {
    // IMPORTANT: Replace this with your actual n8n webhook URL
    const n8nWebhookUrl = 'YOUR_N8N_WEBHOOK_URL_HERE';

    // 1. Read the incoming request body from the stream
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // 2. Prepare headers for the forwarded request
    const forwardedHeaders = { ...req.headers };

    // Delete headers that can cause issues when proxying
    delete forwardedHeaders.host;
    delete forwardedHeaders['content-length']; // The length will be recalculated by fetch

    // 3. Forward the complete request (with files) to your n8n webhook
    const response = await fetch(n8nWebhookUrl, {
      method: req.method,
      headers: forwardedHeaders,
      body: body,
    });

    // 4. Send the response from n8n back to the frontend client
    const responseData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type');

    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.status(response.status).send(Buffer.from(responseData));

  } catch (error) {
    console.error('Proxy forwarding error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
