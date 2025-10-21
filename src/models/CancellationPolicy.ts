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
import Providers from "./Providers";

@Table({
  tableName: "cancellation_policies",
  timestamps: true,
})
class CancellationPolicy extends Model {
  @ForeignKey(() => Providers)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

  @AllowNull(false)
  @Default(24)
  @Column({
    type: DataType.INTEGER,
  })
  declare min_hours_before: number; // Mínimo de horas antes para cancelar sin penalidad

  @AllowNull(false)
  @Default(100)
  @Column({
    type: DataType.INTEGER,
  })
  declare full_refund_hours: number; // Horas antes para reembolso total

  @AllowNull(false)
  @Default(50)
  @Column({
    type: DataType.INTEGER,
  })
  declare partial_refund_percentage: number; // % de reembolso si se cancela entre full y min

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare description: string; // Descripción amigable de la política

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare is_active: boolean; // Si la política está activa

  // Relaciones
  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;
}

export default CancellationPolicy;
