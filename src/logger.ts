import pino from 'pino';
import pinoCaller from 'pino-caller';

export function getLogger(name: string): pino.Logger {
  return pinoCaller(pino({ name, level: process.env.LOG_LEVEL || 'info' }));
}
