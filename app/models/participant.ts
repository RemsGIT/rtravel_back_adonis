import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from "@adonisjs/lucid/orm";
import ParticipantPolicies from "../Enums/participantPolicies.js";
import Trip from "#models/trip";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";
import Payment from "#models/payment";

export default class Participant extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name?: string

  @column()
  declare email: string

  @column()
  declare policy: ParticipantPolicies

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Trip)
  declare trip: BelongsTo<typeof Trip>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>
}
