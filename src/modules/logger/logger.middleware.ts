import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { Logger } from "./logger.service.js";
import chalk from "chalk";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(LoggerMiddleware.name);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();
    const requestId = uuid();
    req.requestId = requestId;

    this.logger.log(
      `${chalk.bgYellowBright.hex("1E1E1E").bold(" >> Incoming >> ")} ${method} ${originalUrl} [ID: ${requestId}]`,
    );

    res.on("finish", () => {
      const statusCode = res.statusCode;
      const duration = Date.now() - startTime;
      this.logger.log(
        `${chalk.bgGreenBright.hex("1E1E1E").bold(" << Completed << ")} ${method} ${200 <= statusCode && statusCode < 300 ? chalk.green.bold(statusCode) : chalk.red.bold(statusCode)} ${originalUrl} in ${duration}ms [ID: ${requestId}]`,
      );
    });

    next();
  }
}