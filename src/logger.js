import { json } from "sequelize";
import winston from "winston";
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });

export const infoLogger = createLogger({
    format: combine(
        timestamp(),
        colorize(),
        json()
      ),
      transports: [
        new transports.File({ filename: 'info.log', level: 'info' })
      ]
  });

  
export const errorLogger = createLogger({
    format: combine(
        timestamp(),
        colorize(),
        json()
      ),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' })
      ]
  });