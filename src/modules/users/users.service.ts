import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Injectable()
export class UsersService {
  async createUser(phoneNumber: string, role: UserRole = UserRole.ADMIN) {
    return User.create({ phoneNumber, role });
  }

  async getUserByPhoneNumber(phoneNumber: string) {
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async loginByPhoneNumber(phoneNumber: string) {
    let user = await this.getUserByPhoneNumber(phoneNumber).catch()
    if (!user) {
      user = await this.createUser(phoneNumber);
    }

    const { id, phoneNumber: phone, role, username } = user;

    return { id, phoneNumber: phone, role, username };
  }
}
