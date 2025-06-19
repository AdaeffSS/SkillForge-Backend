import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const accessToken = this.extractTokenFromHeader(request);
    const refreshToken = this.extractTokenFromCookieOrHeader(request);

    try {
      request.user = await this.jwtService.verifyAsync(accessToken || '', {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      });
      return true;
    } catch (e) {
      if (refreshToken) {
        try {
          const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
          });

          const newAccessToken = await this.jwtService.signAsync(
            { sub: payload.sub },
            {
              secret: this.configService.get("JWT_ACCESS_SECRET"),
              expiresIn: this.configService.get("JWT_ACCESS_EXPIRATION"),
            },
          );

          const newRefreshToken = await this.jwtService.signAsync(
            { sub: payload.sub },
            {
              secret: this.configService.get("JWT_REFRESH_SECRET"),
              expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION"),
            },
          );

          const response = context.switchToHttp().getResponse();

          response.setHeader("authorization", `Bearer ${newAccessToken}`);

          response.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          request.user = payload;
          return true;
        } catch (refreshError) {
          throw new UnauthorizedException("Требуется повторная авторизация");
        }
      }
      throw new UnauthorizedException("Токен недействителен");
    }
  }

  private extractTokenFromHeader(request: Request): string | null {

    const authHeader = request.headers["authorization"];

    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1]
  }

  private extractTokenFromCookieOrHeader(request: Request): string | null {
    return request.cookies?.refreshToken ?? null;
  }
}
