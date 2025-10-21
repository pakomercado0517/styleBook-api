import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from "sequelize-typescript";
import Providers from "./Providers";
import Employees from "./Employees";

@Table({
  tableName: "horarios_blocked",
  timestamps: true,
})
class HorariosBlocked extends Model {
  @ForeignKey(() => Providers)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

  @ForeignKey(() => Employees)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare employee_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  declare start_date: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  declare end_date: Date;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare reason: string; // "vacation", "sick_leave", "maintenance", "break"

  // Relaciones
  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;

  @BelongsTo(() => Employees, "employee_id")
  declare employee: Employees;
}

export default HorariosBlocked;


