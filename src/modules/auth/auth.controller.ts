import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from './auth.service';
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(200)
  async sendOtp(@Body('phone') phone: string) {
    return await this.authService.requestCode(phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyCode(verifyOtpDto.phone, verifyOtpDto.code);
  }
}
