import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  BelongsTo,
} from "sequelize-typescript";
import { Session } from "./session.entity";

@Table({ tableName: "train_sessions", timestamps: false })
export class TrainSession extends Model {
  @PrimaryKey
  @ForeignKey(() => Session)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  declare id: number;

  @BelongsTo(() => Session)
  declare session: Session;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare difficultyLevel: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare extraData: Record<string, any>;
}
