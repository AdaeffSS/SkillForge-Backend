import { Injectable } from "@nestjs/common";
import { ZvonokService } from "../zvonok/zvonok.service";
import { InjectModel } from "@nestjs/sequelize";
import { Otp } from "./entites/otp.entity";

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
}
