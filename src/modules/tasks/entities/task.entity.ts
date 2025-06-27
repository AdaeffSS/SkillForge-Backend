import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "../../users/entities/user.entity";

export enum TaskStatus {
  ISSUED = 'issued',
  SOLVED = 'solved'
}

@Table({
  tableName: "tasks",
})
export class Task extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare task: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare seed: string;

  @Column({
    type: DataType.ENUM('issued', 'solved'),
    allowNull: false,
    defaultValue: 'issued',
  })
  declare status: TaskStatus;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare issuedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare solvedAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare attempts: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User
}
