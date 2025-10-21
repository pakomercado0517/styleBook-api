import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from "sequelize-typescript";
import Appointments from "./Appointments";
import Users from "./Users";
import Providers from "./Providers";

@Table({
  tableName: "reviews",
  timestamps: true,
})
class Reviews extends Model {
  @ForeignKey(() => Appointments)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare appointment_id: number;

  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare client_id: number;

  @ForeignKey(() => Providers)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare rating: number; // 1-5

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare comment: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare provider_response: string;

  // Relaciones
  @BelongsTo(() => Appointments, "appointment_id")
  declare appointment: Appointments;

  @BelongsTo(() => Users, "client_id")
  declare client: Users;

  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;
}

export default Reviews;


