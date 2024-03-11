import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Trip from '#models/trip'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Budget extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare budget: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare tripId: number

  @belongsTo(() => Trip)
  declare trip: BelongsTo<typeof Trip>
}
