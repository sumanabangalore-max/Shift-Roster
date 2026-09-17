import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function teamsWebhookProxyPlugin(): Plugin {
  const middleware = (req: any, res: any) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const { url, payload } = data;

        if (!url) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing webhook url' }));
          return;
        }

        // Forward to Microsoft Teams webhook
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const text = await response.text();
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = response.ok ? 200 : response.status;
        res.end(JSON.stringify({ 
          success: response.ok, 
          status: response.status, 
          response: text || 'OK' 
        }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Webhook proxy error' }));
      }
    });
  };

  return {
    name: 'teams-webhook-proxy',
    configureServer(server) {
      server.middlewares.use('/api/webhook/teams', middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/webhook/teams', middleware);
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), teamsWebhookProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
