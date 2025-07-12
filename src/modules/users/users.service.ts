import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Injectable()
export class UsersService {
  /**
   * Создаёт нового пользователя с указанным номером телефона и ролью.
   * @param phoneNumber - Номер телефона пользователя.
   * @param role - Роль пользователя (по умолчанию ADMIN).
   * @returns Promise с созданным пользователем.
   */
  async createUser(phoneNumber: string, role: UserRole = UserRole.ADMIN) {
    return User.create({ phoneNumber, role });
  }

  /**
   * Получает пользователя по номеру телефона.
   * @param phoneNumber - Номер телефона для поиска.
   * @throws NotFoundException если пользователь не найден.
   * @returns Promise с найденным пользователем.
   */
  async getUserByPhoneNumber(phoneNumber: string) {
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  /**
   * Логин пользователя по номеру телефона.
   * Если пользователь не найден, создаёт нового.
   * @param phoneNumber - Номер телефона пользователя.
   * @returns Promise с данными пользователя: id, phoneNumber, role, username.
   */
  async loginByPhoneNumber(phoneNumber: string) {
    let user = await this.getUserByPhoneNumber(phoneNumber).then();
    if (!user) {
      user = await this.createUser(phoneNumber);
    }

    const { id, phoneNumber: phone, role, username } = user;

    return { id, phoneNumber: phone, role, username };
  }
}