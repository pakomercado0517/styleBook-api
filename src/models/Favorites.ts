import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Unique,
} from "sequelize-typescript";
import Users from "./Users";
import Providers from "./Providers";
import Services from "./Services";

@Table({
  tableName: "favorites",
  timestamps: true,
})
class Favorites extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare client_id: number;

  @ForeignKey(() => Providers)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare provider_id: number;

  @ForeignKey(() => Services)
  @AllowNull(true)
  @Column({
    type: DataType.INTEGER,
  })
  declare service_id: number;

  // Relaciones
  @BelongsTo(() => Users, "client_id")
  declare client: Users;

  @BelongsTo(() => Providers, "provider_id")
  declare provider: Providers;

  @BelongsTo(() => Services, "service_id")
  declare service: Services;
}

export default Favorites;
