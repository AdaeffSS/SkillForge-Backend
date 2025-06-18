import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ZvonokService } from "../zvonok/zvonok.service";
import { InjectModel } from "@nestjs/sequelize";
import { Otp } from "./entites/otp.entity";
import { HttpErrorByCode } from "@nestjs/common/utils/http-error-by-code.util";

@Injectable()
export class AuthService {
  constructor(
    private readonly zvonokService: ZvonokService,
    @InjectModel(Otp) private readonly otpModel: typeof Otp,
  ) {}

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
    })

    if (!otp) {
      throw new HttpException("Неверный код подтверждения", HttpStatus.UNAUTHORIZED);
    }

    if (otp.expiresAt < new Date()) {
      throw new HttpException("Код подтверждения истек",  HttpStatus.GONE);
    }
    await otp.destroy();

    return { message: "Код подтвержден" };

  }

}
