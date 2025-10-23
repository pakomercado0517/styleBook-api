import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
  AllowNull,
  Default,
} from "sequelize-typescript";
import Users from "./Users";
import Employees from "./Employees";
import Services from "./Services";
import Providers from "./Providers";
import Payments from "./Payments";
import Reviews from "./Reviews";

@Table({
  tableName: "appointments",
  timestamps: true,
})
class Appointments extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare client_id: number;

  @ForeignKey(() => Employees)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare employee_id: number;

  @ForeignKey(() => Services)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare service_id: number;

  @ForeignKey(() => Providers)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

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

  @AllowNull(false)
  @Default("pending")
  @Column({
    type: DataType.ENUM(
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no_show"
    ),
  })
  declare status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare notes: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare location: string;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  declare final_price: number;

  // Relaciones
  @BelongsTo(() => Users, "client_id")
  declare client: Users;

  @BelongsTo(() => Employees, "employee_id")
  declare employee: Employees;

  @BelongsTo(() => Services, "service_id")
  declare service: Services;

  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;

  @HasOne(() => Payments, "appointment_id")
  declare payment: Payments;

  @HasOne(() => Reviews, "appointment_id")
  declare review: Reviews;
}

export default Appointments;









