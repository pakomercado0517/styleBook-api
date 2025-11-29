import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
  Default,
} from "sequelize-typescript";
import Providers from "./Providers";
import Appointments from "./Appointments";

@Table({
  tableName: "services",
  timestamps: true,
})
class Services extends Model {
  @ForeignKey(() => Providers)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  declare name: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare description: string;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare duration_minutes: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  declare price: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(
      "corte",
      "tinte",
      "peinado",
      "manicure",
      "pedicure",
      "tratamiento_capilar",
      "barba",
      "afeitado",
      "masaje",
      "facial",
      "corporal",
      "aromaterapia",
      "limpieza_dental",
      "estetica_dental"
    ),
  })
  declare category:
    | "corte"
    | "tinte"
    | "peinado"
    | "manicure"
    | "pedicure"
    | "tratamiento_capilar"
    | "barba"
    | "afeitado"
    | "masaje"
    | "facial"
    | "corporal"
    | "aromaterapia"
    | "limpieza_dental"
    | "estetica_dental"
    | "asesoria";

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare image_url: string;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare is_active: boolean;

  // Relación
  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;

  @HasMany(() => Appointments, "service_id")
  declare appointments: Appointments[];
}

export default Services;
