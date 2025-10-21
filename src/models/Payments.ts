import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
} from "sequelize-typescript";
import Appointments from "./Appointments";

@Table({
  tableName: "payments",
  timestamps: true,
})
class Payments extends Model {
  @ForeignKey(() => Appointments)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare appointment_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  declare amount: number;

  @AllowNull(false)
  @Default("pending")
  @Column({
    type: DataType.ENUM("pending", "completed", "failed", "refunded"),
  })
  declare status: "pending" | "completed" | "failed" | "refunded";

  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare method: string; // "credit_card", "debit_card", "mercadopago", "bank_transfer"

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare reference_id: string; // ID de la transacción del proveedor de pagos

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare transaction_details: string;

  // Relación
  @BelongsTo(() => Appointments, "appointment_id")
  declare appointment: Appointments;
}

export default Payments;


