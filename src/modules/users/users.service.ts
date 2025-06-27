import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  async createUser(phoneNumber: string, role: "user" | "admin" = "user") {
    return await User.create({ phoneNumber, role });
  }

  async getUserByPhoneNumber(phoneNumber: string) {
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async loginByPhoneNumber(phoneNumber: string) {
    let user = await this.getUserByPhoneNumber(phoneNumber).catch(() => null);
    if (!user) {
      user = await this.createUser(phoneNumber);
    }

    const { id, phoneNumber: phone, role, username } = user;

    return { id, phoneNumber: phone, role, username };
  }
}
