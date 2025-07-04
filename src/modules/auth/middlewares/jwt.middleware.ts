import {
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TokensUtils } from "../utils/tokens.util";

@Injectable()
export class JwtDecodeMiddleware implements NestMiddleware {
  constructor(private readonly tokensUtils: TokensUtils) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = this.extractToken(req);

    console.log(accessToken);

    if (!accessToken) {
      return next();
    }

    try {
      console.log(await this.tokensUtils.validateAccessToken(accessToken))
      req.user = await this.tokensUtils.validateAccessToken(accessToken);
    } catch (err) {
      console.error(err);
    }

    next();
  }


  private extractToken(request: Request): string | null {
    return request.cookies?.accessToken ?? null;
  }
}