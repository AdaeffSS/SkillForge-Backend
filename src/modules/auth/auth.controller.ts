import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { Response, Request } from "express";
import { TokensUtils } from "./utils/tokens.util";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensUtils: TokensUtils
  ) {}

  @Post('send-otp')
  @HttpCode(200)
  async sendOtp(@Body('phone') phone: string) {
    return await this.authService.requestCode(phone);
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.verifyCode(
      verifyOtpDto.phone,
      verifyOtpDto.code,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });


    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { user };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const tokens = await this.tokensUtils.updateTokens(refreshToken);
    if (!tokens) { throw new UnauthorizedException('Failed to refresh tokens'); }
    const { accessToken, refreshToken: newRefreshToken } = tokens

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { message: 'Tokens refreshed' };
  }
}
