import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtDecodeMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = this.extractTokenFromHeader(req);
    const refreshToken = this.extractTokenFromCookieOrHeader(req);

    if (!accessToken && !refreshToken) {
      return next();
    }

    console.log(accessToken, refreshToken);

    try {
      req.user = await this.jwtService.verifyAsync(accessToken || '', {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch (e) {
      if (refreshToken) {
        try {
          const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          });

          const newAccessToken = await this.jwtService.signAsync(
            { sub: payload.sub },
            {
              secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
              expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
            },
          );

          res.setHeader('Authorization', `Bearer ${newAccessToken}`);
          req.user = payload;
        } catch (err) {
        }
      }
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | null {
    console.log(request.headers)
    const authHeader = request.headers['Authorization'];
    if (!authHeader) return null;
    if (typeof authHeader === "string") {
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
      return parts[1];
    }
    throw new UnauthorizedException();
  }
  private extractTokenFromCookieOrHeader(request: Request): string | null {
    return request.cookies?.refreshToken ?? null;
  }
}
