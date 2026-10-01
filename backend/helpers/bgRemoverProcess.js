// helpers/bgRemoverProcess.js
//
// The background remover (bg-remover/app.py: Python, rembg, BiRefNet) is part
// of the backend, not a separate app: the API starts it as a child process on
// 127.0.0.1 and restarts it if it stops, so deploying the backend deploys the
// remover too. A second Node process (a script) reuses one that is already
// running on the port.
//
// Env: BG_REMOVER_URL (use that service instead of starting one here),
// BG_REMOVER_EMBEDDED=false (never start one here), BG_PYTHON (the Python to
// run; the Docker image sets its own), BG_REMOVER_PORT (default 7860),
// BG_REMOVER_MODEL (default birefnet-general), BG_REMOVER_KEY.
import { spawn } from 'child_process';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bg-remover');
const PORT = Number(process.env.BG_REMOVER_PORT) || 7860;
export const EMBEDDED_URL = `http://127.0.0.1:${PORT}`;
const MODEL = process.env.BG_REMOVER_MODEL || 'birefnet-general';
const PYTHON = process.env.BG_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const RESTART_WAITS = [2000, 5000, 15000, 30000, 60000];

// One key shared by every process of this backend (the server and its scripts), never sent anywhere else.
const SECRET = process.env.BG_REMOVER_KEY || process.env.JWT_SECRET || process.env.SECRETS_ENCRYPTION_KEY;
export const EMBEDDED_KEY = SECRET
  ? crypto.createHmac('sha256', SECRET).update('bg-remover').digest('hex')
  : crypto.randomBytes(24).toString('hex');

// Only what Python needs; the API's own secrets stay out of the child.
const PASS_ENV = ['PATH', 'Path', 'SYSTEMROOT', 'SystemRoot', 'WINDIR', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA',
  'TEMP', 'TMP', 'TMPDIR', 'LANG', 'LC_ALL', 'U2NET_HOME', 'OMP_NUM_THREADS', 'VIRTUAL_ENV', 'BG_CONCURRENCY', 'BG_MAX_UPLOAD_MB'];

const state = { status: 'stopped', detail: '', startedAt: null, restarts: 0 };
let child = null;
let starting = null;
let restartTimer = null;
let quickFailures = 0;
let lastOutput = [];

export const embeddedAllowed = () => !process.env.BG_REMOVER_URL && process.env.BG_REMOVER_EMBEDDED !== 'false';
export const embeddedState = () => ({ ...state, model: MODEL });

async function health(timeoutMs = 2000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${EMBEDDED_URL}/health`, { signal: controller.signal });
    return res.ok ? await res.json() : null;
  } catch { return null; } finally { clearTimeout(timer); }
}

function remember(chunk) {
  for (const line of String(chunk).split(/\r?\n/)) {
    if (!line.trim()) continue;
    console.log(`[bg-remover] ${line}`);
    lastOutput = [...lastOutput.slice(-7), line.trim()];
  }
}

function scheduleRestart() {
  if (restartTimer) return;
  const wait = RESTART_WAITS[Math.min(quickFailures, RESTART_WAITS.length - 1)];
  // a service that keeps dying straight away (Python or a package missing) is retried every 10 minutes, not in a loop
  const delay = quickFailures >= 5 ? 10 * 60 * 1000 : wait;
  state.status = quickFailures >= 5 ? 'unavailable' : 'restarting';
  restartTimer = setTimeout(() => { restartTimer = null; startBgRemover(); }, delay);
  restartTimer.unref();
}

function launch() {
  const env = Object.fromEntries(PASS_ENV.filter((k) => process.env[k] !== undefined).map((k) => [k, process.env[k]]));
  Object.assign(env, { BG_API_KEY: EMBEDDED_KEY, BG_MODEL: MODEL, PYTHONUNBUFFERED: '1' });
  const args = ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', String(PORT), '--workers', '1', '--no-access-log'];
  const proc = spawn(PYTHON, args, { cwd: DIR, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  const startedAt = Date.now();
  lastOutput = [];
  proc.stdout.on('data', remember);
  proc.stderr.on('data', remember);
  // the remover never keeps a script alive on its own; the server keeps running anyway
  proc.unref(); proc.stdout.unref?.(); proc.stderr.unref?.();
  proc.on('error', (error) => {
    child = null;
    quickFailures += 1;
    state.detail = error.code === 'ENOENT' ? `Python not found (${PYTHON}); set BG_PYTHON` : error.message;
    console.error(`bg-remover: could not start: ${state.detail}`);
    scheduleRestart();
  });
  proc.on('exit', (code, signal) => {
    if (child !== proc) return;
    child = null;
    if (state.status === 'stopping') { state.status = 'stopped'; return; }
    quickFailures = Date.now() - startedAt < 60000 ? quickFailures + 1 : 0;
    state.restarts += 1;
    state.detail = `stopped (${signal || `code ${code}`})${lastOutput.length ? `: ${lastOutput[lastOutput.length - 1]}` : ''}`;
    console.error(`bg-remover: ${state.detail}; restarting`);
    scheduleRestart();
  });
  return proc;
}

/**
 * Make sure the built-in remover is running and answering; resolves to its URL.
 * Starts it when needed (or adopts one another process of this backend started).
 */
export function startBgRemover() {
  if (!embeddedAllowed()) return Promise.reject(new Error('the built-in background remover is switched off'));
  if (starting) return starting;
  starting = (async () => {
    const existing = await health(1500);
    if (existing?.ok) {
      state.status = existing.ready ? 'ready' : 'warming';
      return EMBEDDED_URL;
    }
    if (!child) {
      state.status = 'starting';
      state.startedAt = new Date().toISOString();
      child = launch();
    }
    // Python + FastAPI answer within seconds; the model loads in the background after that
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
      if (!child) throw new Error(state.detail || 'the background remover did not start');
      const h = await health(1500);
      if (h?.ok) {
        quickFailures = 0;
        state.status = h.ready ? 'ready' : 'warming';
        state.detail = '';
        return EMBEDDED_URL;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error('the background remover did not answer within 2 minutes');
  })().finally(() => { starting = null; });
  return starting;
}

/** Current state for the admin; refreshes "warming" to "ready" once the model is loaded. */
export async function refreshEmbeddedState() {
  if (!embeddedAllowed()) return embeddedState();
  const h = await health(1500);
  if (h?.ok) { state.status = h.ready ? 'ready' : 'warming'; state.detail = ''; }
  else if (['ready', 'warming'].includes(state.status)) state.status = child ? 'starting' : 'stopped';
  return embeddedState();
}

export function stopBgRemover() {
  if (!child) return;
  state.status = 'stopping';
  child.kill();
}

process.on('exit', () => { if (child) child.kill(); });
