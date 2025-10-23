import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Index,
} from "sequelize-typescript";
import Users from "./Users";

/**
 * Modelo RefreshTokens
 *
 * Almacena los refresh tokens activos de los usuarios para:
 * - Permitir renovación de access tokens sin re-login
 * - Revocar sesiones específicas (logout)
 * - Detectar tokens reutilizados (seguridad)
 * - Implementar token rotation
 *
 * @table refresh_tokens
 */
@Table({
  tableName: "refresh_tokens",
  timestamps: true,
  underscored: true,
})
class RefreshTokens extends Model {
  @ForeignKey(() => Users)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.INTEGER,
  })
  declare user_id: number;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING(500),
  })
  declare token: string;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  declare expires_at: Date;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare is_revoked: boolean;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(100),
  })
  declare device_info: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(45),
  })
  declare ip_address: string | null;

  // ==================== RELACIONES ====================

  @BelongsTo(() => Users, "user_id")
  declare user: Users;

  // ==================== MÉTODOS DE INSTANCIA ====================

  /**
   * Verifica si el token ha expirado
   */
  isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  /**
   * Verifica si el token es válido (no revocado y no expirado)
   */
  isValid(): boolean {
    return !this.is_revoked && !this.isExpired();
  }
}

export default RefreshTokens;
