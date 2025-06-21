import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
} from "sequelize-typescript";

@Table({
  tableName: "tasks",
  timestamps: true,
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
  declare seed: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare answer: string;
}
