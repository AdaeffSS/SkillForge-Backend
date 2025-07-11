import {
  Column,
  DataType, HasMany,
  Model,
  PrimaryKey,
  Table
} from "sequelize-typescript";
import { Session } from "./session.entity";
import { SessionType } from "../unums/session-type.enum";

@Table({ tableName: 'session_configurations' })
export class SessionConfiguration extends Model {

  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.ENUM(...Object.values(SessionType)),
    allowNull: false,
  })
  declare sessionType: SessionType;

  @Column(DataType.JSONB)
  declare context: Record<string, any>;

  @HasMany(() => Session)
  declare events: Session[];
}