import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from "sequelize-typescript";
import Providers from "./Providers";
import Appointments from "./Appointments";
import HorariosBlocked from "./HorariosBlocked";

@Table({
  tableName: "employees",
  timestamps: true,
})
class Employees extends Model {
  @ForeignKey(() => Providers)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  declare email: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(20),
  })
  declare phone: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(50),
  })
  declare specialty: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare photo_url: string;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL(3, 2),
  })
  declare rating: number;

  // Relaciones
  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;

  @HasMany(() => Appointments, "employee_id")
  declare appointments: Appointments[];

  @HasMany(() => HorariosBlocked, "employee_id")
  declare blocked_times: HorariosBlocked[];
}

export default Employees;


