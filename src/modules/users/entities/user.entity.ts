import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  HasMany
} from "sequelize-typescript";
import { Session } from "../../sessions/entities/session.entity";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare phoneNumber: string;

  @Column({
    type: DataType.ENUM("user", "admin"),
    allowNull: false,
    defaultValue: "user",
  })
  declare role: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare username: string;

  @HasMany(() => Session)
  declare sessions: Session[];
}
