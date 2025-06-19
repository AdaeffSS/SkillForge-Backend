import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ZvonokService } from "../zvonok/zvonok.service";
import { InjectModel } from "@nestjs/sequelize";
import { Otp } from "./entites/otp.entity";
import { JwtService } from "@nestjs/jwt";
import * as process from "node:process";
import { Response } from "express";

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

  async verifyCode(phoneNumber: string, code: string, res: Response) {
    if (!phoneNumber || !code) {
      throw new HttpException("Неверный запрос", 400);
    }

    const otp = await this.otpModel.findOne({
      where: { phoneNumber },
      order: [["createdAt", "DESC"]],
    });

    if (!otp) {
      throw new HttpException("Код не запрашивался", HttpStatus.UNAUTHORIZED);
    }

    otp.attempts += 1;
    await otp.save();

    if (otp.code != code) {
      throw new HttpException(`Код неверный. У тебя еще ${3-otp.attempts} попытки`, HttpStatus.UNAUTHORIZED);
    } else if (otp.expiresAt < new Date()) {
      throw new HttpException("Срок действия когда истек. Запроси код заново", HttpStatus.GONE);
    } else if (otp.attempts > 3) {
      throw new HttpException(
        "Превышено количество попыток ввода кода",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await otp.destroy();

    const { accessToken, refreshToken } = await this.generateTokens({
      sub: phoneNumber,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.setHeader("Authorization", `Bearer ${accessToken}`);
  }
}
