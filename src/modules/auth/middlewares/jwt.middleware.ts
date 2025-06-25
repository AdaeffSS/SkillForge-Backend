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
    const accessToken = this.extractTokenFromHeader(req);
    const refreshToken = this.extractTokenFromCookieOrHeader(req);

    if (!accessToken && !refreshToken) {
      return next();
    }

    try {
      req.user = await this.tokensUtils.validateAccessToken(accessToken);
    } catch (e) {
      if (refreshToken) {
        try {
          const payload =
            await this.tokensUtils.validateRefreshToken(refreshToken);
          if (!payload) {
            throw new Error("Payload is empty");
          }
          const { exp, iat, ...cleanPayload } = payload
          const newAccessToken =
            await this.tokensUtils.generateAccessToken(cleanPayload);
          res.setHeader("authorization", `Bearer ${newAccessToken}`);
          req.user = payload;
        } catch (err) {}
      }
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers["authorization"];
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return null;
    return parts[1];
  }
  private extractTokenFromCookieOrHeader(request: Request): string | null {
    return request.cookies?.refreshToken ?? null;
  }
}
