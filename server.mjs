import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(ROOT, 'raahi-demo-data.json');
const PORT = Number(process.env.PORT || 4173);
// Bind publicly in a cloud web service; localhost still works on your machine.
const HOST = process.env.HOST || '0.0.0.0';
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.css':'text/css; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml' };
async function cases() { if (!existsSync(DATA_FILE)) return []; try { return JSON.parse(await readFile(DATA_FILE, 'utf8')); } catch { return []; } }
async function save(data) { await writeFile(DATA_FILE, JSON.stringify(data, null, 2)); }
function reply(res, code, payload) { res.writeHead(code, { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' }); res.end(JSON.stringify(payload)); }
function ticket(prefix, body) {
  const seq = String(Math.floor(100000 + Math.random() * 900000));
  return `${prefix}-2026-${seq.slice(-6)}`;
}
function caseView(item) { return { id:item.id, type:item.type, status:item.status, submittedAt:item.submittedAt, expectedBy:item.expectedBy, timeline:item.timeline }; }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://' + req.headers.host);
  if (req.method === 'POST' && (url.pathname === '/api/road-reports' || url.pathname === '/api/fastag-reports')) {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 32000) req.destroy(); });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}'); const isRoad = url.pathname.includes('road');
        const submittedAt = new Date().toISOString();
        const record = { id:body.reference || ticket(isRoad ? 'REFAB' : 'RY-FT', body), type:isRoad ? 'road' : 'fastag', status:'Received', submittedAt, expectedBy:isRoad ? 'Assignment within 1 working day' : 'Review within 3 working days', payload:body,
          timeline:[
            { label:isRoad ? 'Road report received' : 'FASTag report received', detail:isRoad ? 'Location, issue details and evidence were saved.' : 'The selected transaction and issue details were saved.', at:submittedAt, complete:true },
            { label:isRoad ? 'Assigned to road team' : 'Issuer and plaza review', detail:isRoad ? 'An authorised maintenance team would be assigned in production.' : 'Authorised issuer and plaza channels would validate the report in production.', complete:false },
            { label:isRoad ? 'Resolved or escalated' : 'Refund decision', detail:isRoad ? 'A field update or escalation result will appear here.' : 'A refund decision or explanation will appear here.', complete:false }
          ] };
        const all = await cases(); all.unshift(record); await save(all);
        reply(res, 201, { case:caseView(record), acknowledgement:{ channel:'in-app sample email', subject:isRoad ? 'Your road report has been received' : 'Your FASTag dispute has been received' } });
      } catch { reply(res, 400, { error:'Please send a valid JSON report.' }); }
    });
    return;
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/cases/')) {
    const id = decodeURIComponent(url.pathname.split('/').pop());
    const record = (await cases()).find(item => item.id === id);
    return record ? reply(res, 200, { case:caseView(record) }) : reply(res, 404, { error:'Case not found.' });
  }
  if (req.method === 'GET' && url.pathname === '/api/health') return reply(res, 200, { ok:true, storage:'local JSON', data:'synthetic', app:'REFAB' });
  const target = url.pathname === '/' ? '/fastag-sahara.html' : url.pathname;
  const safe = normalize(target).replace(/^(\.\.(\/|\\\\|$))+/, '');
  const file = join(ROOT, safe);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  try { const info = await stat(file); if (info.isDirectory()) throw new Error('directory'); const type = MIME[extname(file)] || 'application/octet-stream'; let content = await readFile(file); if (file.endsWith('.html')) content = Buffer.from(content.toString().replace('</head>', '<link rel="stylesheet" href="/refab.css"></head>').replace('</body>', '<script src="/mock-data.js"></script><script src="/refab-services.js"></script><script src="/refab-app.js"></script></body>')); res.writeHead(200, { 'content-type': type }); res.end(content); }
  catch { res.writeHead(404, { 'content-type':'text/plain; charset=utf-8' }); res.end('Not found'); }
});
server.listen(PORT, HOST, () => console.log('REFAB prototype: http://' + HOST + ':' + PORT));
