import {
  Model,
  Table,
  Column,
  DataType,
  HasMany,
  HasOne,
  Default,
  Unique,
  AllowNull,
} from "sequelize-typescript";
import Clients from "./Clients";
import Providers from "./Providers";
import Appointments from "./Appointments";
import Reviews from "./Reviews";
import Payments from "./Payments";

@Table({
  tableName: "users",
  timestamps: true,
  underscored: true,
})
class Users extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare apellido: string;

  @Unique(true)
  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
  })
  declare email: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(60),
  })
  declare password: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(20),
  })
  declare phone: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM("client", "admin", "provider"),
  })
  declare role: "client" | "admin" | "provider";

  @AllowNull(true)
  @Column({
    type: DataType.STRING(500),
  })
  declare avatar_url: string;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare is_active: boolean;

  @AllowNull(false)
  @Default("America/Mexico_City")
  @Column({
    type: DataType.STRING(50),
  })
  declare timezone: string;

  // ==================== RELACIONES ====================

  @HasOne(() => Clients, "user_id")
  declare client: Clients;

  @HasOne(() => Providers, "user_id")
  declare provider: Providers;

  @HasMany(() => Appointments, "client_id")
  declare appointments_as_client: Appointments[];

  @HasMany(() => Reviews, "client_id")
  declare reviews_written: Reviews[];
}

export default Users;
