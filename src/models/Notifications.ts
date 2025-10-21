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
import Users from "./Users";
import Appointments from "./Appointments";

@Table({
  tableName: "notifications",
  timestamps: true,
})
class Notifications extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare recipient_id: number;

  @ForeignKey(() => Appointments)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare appointment_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      "appointment_confirmed",
      "appointment_cancelled",
      "appointment_reminder",
      "appointment_completed",
      "review_request",
      "new_booking",
      "payment_received",
      "provider_response",
      "general"
    ),
  })
  declare type:
    | "appointment_confirmed"
    | "appointment_cancelled"
    | "appointment_reminder"
    | "appointment_completed"
    | "review_request"
    | "new_booking"
    | "payment_received"
    | "provider_response"
    | "general";

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  declare title: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare message: string;

  @AllowNull(false)
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare is_read: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.ENUM("email", "sms", "push", "in_app"),
  })
  declare channel: "email" | "sms" | "push" | "in_app";

  @AllowNull(true)
  @Column({
    type: DataType.JSON,
  })
  declare metadata: any; // Datos adicionales específicos del tipo de notificación

  // Relaciones
  @BelongsTo(() => Users, "recipient_id")
  declare recipient: Users;

  @BelongsTo(() => Appointments, "appointment_id")
  declare appointment: Appointments;
}

export default Notifications;
