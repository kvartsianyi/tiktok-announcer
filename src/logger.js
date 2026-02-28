const colors = {
  INFO: "\x1b[36m",
  WARN: "\x1b[33m",
  ERROR: "\x1b[31m",
  reset: "\x1b[0m",
};

const format = (level, args) => {
  const color = colors[level] || "";
  return `${color}[${level}]${colors.reset} ${args.join(' ')}`;
};

export const logger = {
  info: (...args) => console.log(format('INFO', args)),
  warn: (...args) => console.warn(format('WARN', args)),
  error: (...args) => console.error(format('ERROR', args)),
};