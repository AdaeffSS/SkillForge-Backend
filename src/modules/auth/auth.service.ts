import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ZvonokService } from "../zvonok/zvonok.service";
import { InjectModel } from "@nestjs/sequelize";
import { Otp } from "./entites/otp.entity";
import { Response } from "express";
import { TokensUtils } from "./utils/tokens.util";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Otp) private readonly otpModel: typeof Otp,
    private readonly zvonokService: ZvonokService,
    private readonly tokensUtils: TokensUtils,
    private readonly usersService: UsersService,
  ) {}

  async requestCode(phoneNumber: string) {
    const code = await this.zvonokService.sendCall(phoneNumber);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpModel.create({
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      code,
      expiresAt,
    });

    return { message: "Звонок отправлен. Введите 4 последние цифры номера" };
  }

  async verifyCode(phoneNumber: string, code: string) {
    if (!phoneNumber || !code) {
      throw new HttpException("Неверный запрос", 400);
    }

    phoneNumber = phoneNumber.replace(/\D/g, "");

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
      throw new HttpException(
        `Код неверный. У тебя еще ${3 - otp.attempts} попытки`,
        HttpStatus.UNAUTHORIZED,
      );
    } else if (otp.expiresAt < new Date()) {
      throw new HttpException(
        "Срок действия когда истек. Запроси код заново",
        HttpStatus.GONE,
      );
    } else if (otp.attempts > 3) {
      throw new HttpException(
        "Превышено количество попыток ввода кода",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await otp.destroy();

    const user = await this.usersService.loginByPhoneNumber(phoneNumber);
    const { accessToken, refreshToken } =
      await this.tokensUtils.generateTokens(user);
    return { accessToken, refreshToken, user };
  }
}
