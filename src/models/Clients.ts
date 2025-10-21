import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from "sequelize-typescript";
import Users from "./Users";

@Table({
  tableName: "clients",
  timestamps: true,
})
class Clients extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  declare user_id: number;

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

  @AllowNull(true)
  @Column({
    type: DataType.JSON,
  })
  declare preferences: JSON;

  // Relación
  @BelongsTo(() => Users, "user_id")
  declare user: Users;
}

export default Clients;


