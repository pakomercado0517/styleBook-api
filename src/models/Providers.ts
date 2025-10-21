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
import Users from "./Users";
import Services from "./Services";
import Employees from "./Employees";
import Appointments from "./Appointments";
import Reviews from "./Reviews";
import HorariosBlocked from "./HorariosBlocked";
import CancellationPolicy from "./CancellationPolicy";
import Favorites from "./Favorites";

@Table({
  tableName: "providers",
  timestamps: true,
})
class Providers extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare user_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  declare business_name: string;

  @AllowNull(true)
  @Column({
    type: DataType.TEXT,
  })
  declare description: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(50),
  })
  declare business_type: string;

  @AllowNull(true)
  @Column({
    type: DataType.TIME,
  })
  declare opening_time: string;

  @AllowNull(true)
  @Column({
    type: DataType.TIME,
  })
  declare closing_time: string;

  @AllowNull(true)
  @Column({
    type: DataType.JSON,
  })
  declare working_days: JSON; // { mon: true, tue: true, ... }

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL(3, 2),
  })
  declare average_rating: number;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL(10, 8),
  })
  declare latitude: number;

  @AllowNull(true)
  @Column({
    type: DataType.DECIMAL(11, 8),
  })
  declare longitude: number;

  @AllowNull(true)
  @Column({
    type: DataType.STRING,
  })
  declare address: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(50),
  })
  declare city: string;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(50),
  })
  declare country: string;

  @AllowNull(false)
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare is_active: boolean;

  // Relaciones
  @BelongsTo(() => Users, "user_id")
  declare user: Users;

  @HasMany(() => Services, "provider_id")
  declare services: Services[];

  @HasMany(() => Employees, "provider_id")
  declare employees: Employees[];

  @HasMany(() => Appointments, "provider_id")
  declare appointments: Appointments[];

  @HasMany(() => Reviews, "provider_id")
  declare reviews: Reviews[];

  @HasMany(() => HorariosBlocked, "provider_id")
  declare blocked_times: HorariosBlocked[];

  @HasMany(() => CancellationPolicy, "provider_id")
  declare cancellation_policies: CancellationPolicy[];

  @HasMany(() => Favorites, "provider_id")
  declare favorited_by: Favorites[];
}

export default Providers;
