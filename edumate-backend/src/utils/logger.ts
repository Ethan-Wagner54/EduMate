import fs from 'fs';
import path from 'path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (_) {
    // ignore directory creation errors to avoid crashing app
  }
}

ensureLogDir();

function serialize(entry: Record<string, any>): string {
  try {
    return JSON.stringify(entry) + '\n';
  } catch {
    return JSON.stringify({ ts: new Date().toISOString(), level: 'error', msg: 'log_serialize_failed' }) + '\n';
  }
}

async function write(line: string) {
  try {
    await fs.promises.appendFile(LOG_FILE, line, { encoding: 'utf8' });
  } catch {
    // swallow to keep server alive
  }
}

function log(level: LogLevel, msg: string, meta?: Record<string, any>) {
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };
  write(serialize(entry));
}

export const logger = {
  debug: (msg: string, meta?: Record<string, any>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, any>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, any>) => log('error', msg, meta),
};

export default logger;

