import { LogLevel } from './types';

export function getInitialLogLevel() {
  if (typeof process === 'object' && process.env.LOG_LEVEL) {
    return parseInt(process.env.LOG_LEVEL, 10);
  }
  return LogLevel.INFO;
}

let logLevel: LogLevel = getInitialLogLevel();

const mustDebug = (...args) => {
  console.debug(...args);
};

const getLogLevel = () => {
  return logLevel;
};

const setLogLevel = (newLevel: LogLevel) => {
  logLevel = newLevel;
};

export const debug = (...args) => {
  if (LogLevel.DEBUG >= logLevel) {
    console.debug(...args);
  }
};

export const info = (...args) => {
  if (LogLevel.INFO >= logLevel) {
    console.info(...args);
  }
};

export const warn = (...args) => {
  if (LogLevel.WARN >= logLevel) {
    console.warn(...args);
  }
};

export const error = (...args) => {
  if (LogLevel.ERROR >= logLevel) {
    console.error(...args);
  }
};

export const logger = {
  setLogLevel,
  getLogLevel,
  debug,
  mustDebug,
  info,
  warn,
  error,
};
