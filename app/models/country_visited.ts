import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CountryVisited extends BaseModel {
  static table = 'countries_visited'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare countryCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
