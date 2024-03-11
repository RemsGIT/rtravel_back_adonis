import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import Trip from "#models/trip";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

export default class Activity extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare place?: string

  @column()
  declare city: string

  @column.dateTime()
  declare start: DateTime

  @column()
  declare icon?: string

  @column()
  declare tripId: number

  @belongsTo(() => Trip)
  declare trip: BelongsTo<typeof Trip>
}
