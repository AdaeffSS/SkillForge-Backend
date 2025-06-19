import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "jsonwebtoken";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TokensUtils {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: object): Promise<string> {
    console.log(payload)

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      expiresIn:
        this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "10m",
    });
  }

  async generateRefreshToken(payload: object): Promise<string> {
    console.log(payload)
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      expiresIn:
        this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "7d",
    });
  }

  async generateTokens(
    payload: object,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
    };
  }

  async validateAccessToken(token: string | null): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync(token || "", {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
      });
    } catch (e) {
      return null;
    }
  }

  async validateRefreshToken(token: string | null): Promise<JwtPayload | null> {
    try {
      return await this.jwtService.verifyAsync(token || "", {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
    } catch (e) {
      return null;
    }
  }
}
