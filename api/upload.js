import httpProxy from 'http-proxy';

// IMPORTANT: Replace this with your actual n8n webhook URL
const N8N_WEBHOOK_URL = 'https://ai.senselive.io/webhook-test/senselive-qc-agent';

const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's body parser to allow the proxy to stream the request
  },
};

export default async function handler(req, res) {
  // Wrap the proxy in a promise to handle potential errors
  return new Promise((resolve, reject) => {
    // The proxy will stream the request body and headers to the target URL
    proxy.web(req, res, {
      target: N8N_WEBHOOK_URL,
      changeOrigin: true, // Important for Vercel/hosting environments
      selfHandleResponse: false, // Let the proxy handle the response streaming back to the client
    }, (err) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy request failed' });
      reject(err);
    });
  });
}
