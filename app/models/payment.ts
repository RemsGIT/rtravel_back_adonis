import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import PaymentCategory from '../Enums/paymentCategory.js'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Participant from '#models/participant'
import Trip from "#models/trip";

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare amount: number

  @column()
  declare description?: string

  @column()
  declare category?: PaymentCategory

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare tripId: number

  @belongsTo(() => Trip)
  declare trip: BelongsTo<typeof Trip>

  @column()
  declare participantId: number | null

  @belongsTo(() => Participant)
  declare participant: BelongsTo<typeof Participant>

  @column()
  declare userId: number | null

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @column()
  declare createdById: number

  @column()
  declare updatedById: number

  @belongsTo(() => User, {
    foreignKey: 'createdById',
  })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedById',
  })
  declare updatedBy: BelongsTo<typeof User>
}
