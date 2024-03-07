import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import PaymentCategory from '../Enums/paymentCategory.js'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Participant from '#models/participant'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare amount: number

  @column()
  declare category: PaymentCategory

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Participant)
  declare participant: BelongsTo<typeof Participant>

  @belongsTo(() => User)
  declare createdBy: BelongsTo<typeof User>
}
