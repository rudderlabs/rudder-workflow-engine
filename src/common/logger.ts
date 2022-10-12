import pino from 'pino';
import pinoCaller from 'pino-caller';

/**
 * Returns the pino compatible log level
 * @returns pino log level
 */
function getLogLevel(): string {
  switch (process.env.LOG_LEVEL) {
    case 'debug':
    case '0':
      return 'debug';
    case 'info':
    case '1':
      return 'info';
    case 'warn':
    case '2':
      return 'warn';
    case 'error':
    case '3':
      return 'error';
    default:
      return 'info';
  }
}

export function getLogger(name: string): pino.Logger {
  return pinoCaller(pino({ name, level: getLogLevel() }));
}
