import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'
import { ConfigModule } from '@nestjs/config'
import { User } from "../users/entities/user.entity";
import { Otp } from "../auth/entites/otp.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [User, Otp],
      autoLoadModels: true,
      synchronize: true
    }),
  ]
})

export class AppModule {}