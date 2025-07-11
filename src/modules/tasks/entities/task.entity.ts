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
import { Session } from "../../sessions/entities/session.entity";

export enum TaskStatus {
  ISSUED = 'issued',
  SOLVED = 'solved',
  INCORRECT = 'incorrect'
}

@Table({
  tableName: "tasks",
  timestamps: false,
})
export class Task extends Model {

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    unique: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare task: string;

  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
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

  @ForeignKey(() => Session)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session
}
