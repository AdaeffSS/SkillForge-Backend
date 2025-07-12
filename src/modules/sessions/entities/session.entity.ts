import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  HasOne
} from "sequelize-typescript";
import { User } from "../../users/entities/user.entity";
import { SessionEvent } from "./session-event.entity";
import { Task } from "@tasks/entities/task.entity";
import { SessionConfiguration } from "./session-configuration.entity";
import { SessionType } from "../unums/session-type.enum";
import { TrainSession } from "./train-session.entity";

@Table({
  tableName: 'sessions',
  timestamps: false,
})
export class Session extends Model {

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.ENUM(...Object.values(SessionType)),
    allowNull: false,
  })
  declare type: SessionType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isOpen: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare name: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare startedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare closedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: () => new Date(Date.now() + 6 * 60 * 60 * 1000),
  })
  declare expireAt: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare percentBase: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare percentAdvance: number;

  @ForeignKey(() => SessionConfiguration)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare configurationCode: string | null;

  @BelongsTo(() => SessionConfiguration)
  declare configuration: SessionConfiguration;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare taskCount: number;

  @HasMany(() => SessionEvent)
  declare events: SessionEvent[];

  @HasMany(() => Task)
  declare tasks: Task[];

  @HasOne(() => TrainSession, { foreignKey: 'id' })
  declare trainSession: TrainSession;
}
