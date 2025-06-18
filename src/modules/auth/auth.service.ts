import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ZvonokService } from "../zvonok/zvonok.service";
import { InjectModel } from "@nestjs/sequelize";
import { Otp } from "./entites/otp.entity";
import { JwtService } from "@nestjs/jwt";
import * as process from "node:process";

@Injectable()
export class AuthService {
  constructor(
    private readonly zvonokService: ZvonokService,
    @InjectModel(Otp) private readonly otpModel: typeof Otp,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(payload: { sub: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRATION,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async requestCode(phoneNumber: string) {
    const code = await this.zvonokService.sendCall(phoneNumber);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpModel.create({
      phoneNumber,
      code,
      expiresAt,
    });

    return { message: "Звонок отправлен. Введите 4 последние цифры номера" };
  }

  async verifyCode(phoneNumber: string, code: string) {
    if (!phoneNumber || !code) {
      console.log(phoneNumber, code);
      throw new HttpException("Неверный запрос", 400);
    }

    const otp = await this.otpModel.findOne({
      where: { phoneNumber, code },
      order: [["createdAt", "DESC"]],
    });

    if (!otp) {
      throw new HttpException(
        "Неверный код подтверждения",
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (otp.expiresAt < new Date()) {
      throw new HttpException("Код подтверждения истек", HttpStatus.GONE);
    }
    await otp.destroy();

    return await this.generateTokens({ sub: phoneNumber });
  }
}
