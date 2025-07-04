import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "jsonwebtoken";
import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class TokensUtils {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(user: { id: string }): Promise<string> {
    return await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn:
          this.configService.get<string>("JWT_ACCESS_EXPIRATION") || "10m",
      },
    );
  }

  async generateRefreshToken(payload: any): Promise<string> {
    return await this.jwtService.signAsync(
      { sub: payload.id },
      {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn:
          this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "7d",
      },
    );
  }

  async generateTokens(payload: {
    id: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
    };
  }

  async updateAccess(refreshToken: string) {
    try {
      const payload = await this.validateRefreshToken(refreshToken);
      const user = await User.findByPk(payload!.sub, {
        attributes: ["id", "phoneNumber", "role", "username"],
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }
      return await this.generateAccessToken(user);
    } catch (error) {}
  }

  async validateAccessToken(token: string | null): Promise<JwtPayload | null> {
    return await this.jwtService.verifyAsync(token || "", {
      secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validateRefreshToken(token: string | null): Promise<JwtPayload | null> {
    return await this.jwtService.verifyAsync(token || "", {
      secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
    });
  }
}
