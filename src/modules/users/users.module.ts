import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./entities/user.entity";
import { Task } from "@tasks/entities/task.entity";

@Module({
  imports: [SequelizeModule.forFeature([User, Task])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
