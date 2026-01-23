import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { WinstonModuleOptions } from 'nest-winston';

const timeZone = 'Asia/Bangkok';
const logVersion = '1.3.1';

const formatTimestamp = () => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
};

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: formatTimestamp }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message} (v${logVersion})`;
        }),
      ),
    }),
    new (DailyRotateFile as any)({
      dirname: './logs',
      filename: 'Robinson-Backend-log-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      format: winston.format.combine(
        winston.format.timestamp({ format: formatTimestamp }),
        winston.format.json(),
      ),
    }),
  ],
};
