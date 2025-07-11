import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Session } from "./session.entity";


export enum EventType {
  CREATE = 'create', START = 'start', CLOSE = 'close', AUTO_CLOSE = 'auto_close', INTERRUPT = 'interrupt', CONTINUE = 'continue',
  ADD_TASK = 'add_task', SKIP_TASK = 'skip_task', COPY_TASK_TEXT = 'copy_task_text', VIEW_HINT = 'view_hint', VIEW_SOLUTION = 'view_solution', SOLVE_CORRECTLY = 'solve_correctly', SOLVE_INCORRECTLY = 'solve_incorrectly',
}

@Table({
  tableName: 'sessions_events',
  timestamps: false,
})
export class SessionEvent extends Model {

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    allowNull: false,
  })
  declare id: number;

  @ForeignKey(() => Session)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: () => new Date,
  })
  declare timestamp: Date

  @Column({
    type: DataType.ENUM(...Object.values(EventType)),
    allowNull: false,
  })
  declare type: EventType;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare context: Record<string, unknown>
}