import { Body, Controller, HttpCode, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { Response } from "express";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(200)
  async sendOtp(@Body('phone') phone: string) {
    return await this.authService.requestCode(phone);
  }

  @HttpCode(200)
  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return await this.authService.verifyCode(verifyOtpDto.phone, verifyOtpDto.code, res);
  }
}
