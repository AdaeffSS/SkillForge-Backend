import {
  Injectable,
  NestMiddleware,
  Logger,
} from "@nestjs/common";
import { Request, NextFunction } from "express";
import { TokensUtils } from "../utils/tokens.util";

@Injectable()
export class JwtDecodeMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtDecodeMiddleware.name);

  constructor(private readonly tokensUtils: TokensUtils) {}

  async use(req: Request, next: NextFunction) {
    const accessToken = this.extractToken(req);

    if (!accessToken) {
      return next();
    }

    try {
      req.user = await this.tokensUtils.validateAccessToken(accessToken);
    } catch (error) {
      this.logger.debug(`Invalid access token: ${error.message || error}`);
    }

    next();
  }

  private extractToken(req: Request): string | null {
    return req.cookies?.accessToken ?? null;
  }
}
