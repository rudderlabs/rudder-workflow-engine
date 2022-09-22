import pino from 'pino';

export function getLogger(name: string): pino.Logger {
  return pino({ name, level: process.env.LOG_LEVEL || 'info' });
}
