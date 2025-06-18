import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ZvonokModule } from "../zvonok/zvonok.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { Otp } from "./entites/otp.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.register({}),
    ZvonokModule,
    SequelizeModule.forFeature([Otp]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
