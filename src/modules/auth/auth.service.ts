import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { ZvonokService } from "../zvonok/zvonok.service"
import { Otp } from "./entites/otp.entity"
import { TokensUtils } from "./utils/tokens.util"
import { UsersService } from "../users/users.service"

@Injectable()
export class AuthService {
  private readonly MAX_ATTEMPTS = 3
  private readonly CODE_EXPIRATION_MS = 5 * 60 * 1000 // 5 минут

  constructor(
    private readonly zvonokService: ZvonokService,
    private readonly tokensUtils: TokensUtils,
    private readonly usersService: UsersService,
  ) {}

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "")
  }

  async requestCode(phoneNumber: string) {
    const normalizedPhone = this.normalizePhone(phoneNumber)
    const code = await this.zvonokService.sendCall(normalizedPhone)
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRATION_MS)

    Otp.create({
      phoneNumber: normalizedPhone,
      code,
      expiresAt,
      attempts: 0,
    }).then()

    return { message: "Звонок отправлен. Введите 4 последние цифры номера" }
  }

  async verifyCode(phoneNumber: string, code: string) {
    if (!phoneNumber || !code) {
      throw new HttpException("Неверный запрос", HttpStatus.BAD_REQUEST)
    }

    const normalizedPhone = this.normalizePhone(phoneNumber)

    const otp = await Otp.findOne({
      where: { phoneNumber: normalizedPhone },
      order: [["createdAt", "DESC"]],
    })

    if (!otp) {
      throw new HttpException("Код не запрашивался", HttpStatus.UNAUTHORIZED)
    }

    if (otp.attempts >= this.MAX_ATTEMPTS) {
      otp.destroy().then()
      throw new HttpException(
        "Превышено количество попыток ввода кода",
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    if (otp.expiresAt < new Date()) {
      otp.destroy().then()
      throw new HttpException(
        "Срок действия кода истек. Запроси код заново",
        HttpStatus.GONE,
      )
    }

    otp.attempts += 1
    otp.save().then()

    if (otp.code !== code) {
      const attemptsLeft = this.MAX_ATTEMPTS - otp.attempts
      throw new HttpException(
        `Код неверный. Осталось попыток: ${attemptsLeft}`,
        HttpStatus.UNAUTHORIZED,
      )
    }

    otp.destroy().then()

    const user = await this.usersService.loginByPhoneNumber(normalizedPhone)
    const { accessToken, refreshToken } = await this.tokensUtils.generateTokens(user)
    return { accessToken, refreshToken, user }
  }
}
