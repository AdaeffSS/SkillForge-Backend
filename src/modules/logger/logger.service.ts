import { Injectable, LoggerService as BaseLogger, Scope } from "@nestjs/common";
import winston from "winston";
import chalk from "chalk";
import DailyRotateFile from "winston-daily-rotate-file";

@Injectable({ scope: Scope.TRANSIENT })
export class Logger implements BaseLogger {
  private logger: winston.Logger;
  private context: string;

  constructor() {
    this.context = 'SkillForge';
    this.logger = winston.createLogger({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp({
          format: () => {
            const date = new Date();
            const moscowOffset = 3 * 60;
            const moscowTime = new Date(
              date.getTime() + moscowOffset * 60 * 1000,
            );
            return moscowTime.toISOString().replace("Z", "+03:00");
          },
        }),
        winston.format.json(),
      ),
      defaultMeta: { service: this.context },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.printf(({ level, message, timestamp, service }) => {
              let coloredLevel: string;
              switch (level) {
                case "error":
                  coloredLevel = chalk.redBright.bgRed.bold(` ${level.toUpperCase()} `);
                  break;
                case "warn":
                  coloredLevel = chalk.yellowBright.bgYellow.bold(` ${level.toUpperCase()} `);
                  break;
                case "info":
                  coloredLevel = chalk.greenBright.bgGreen.bold(` ${level.toUpperCase()} `);
                  break;
                case "debug":
                  coloredLevel = chalk.blueBright.bgBlue.bold(` ${level.toUpperCase()} `);
                  break;
                default:
                  coloredLevel = chalk.gray(level.toUpperCase());
              }
              return `${coloredLevel} ${chalk.bold.hex('#B2004D')(
                service,
              )} ${timestamp}: ${message}`;
            }),
          ),
        }),
        new DailyRotateFile({
          filename: "logs/app-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: winston.format.json(),
        }),
      ],
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  private formatContext(context: string): string {
    if (!context) return context;
    return context.charAt(0).toUpperCase() + context.slice(1);
  }

  log(message: string, context?: string): void {
    this.logger.info(message, {
      service: context ? this.formatContext(context) : this.context,
    });
  }

  error(message: string, trace?: string, context?: string): void {
    const ctx = context ? this.formatContext(context) : this.context;
    const msgWithTrace = trace ? `${message}\nTrace: ${trace}` : message;

    this.logger.error(msgWithTrace, {
      service: ctx,
    });
  }


  warn(message: string, context?: string): void {
    this.logger.warn(message, {
      service: context ? this.formatContext(context) : this.context,
    });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, {
      service: context ? this.formatContext(context) : this.context,
    });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, {
      service: context ? this.formatContext(context) : this.context,
    });
  }
}
