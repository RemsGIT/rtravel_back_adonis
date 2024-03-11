import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Activity from '#models/activity'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Participant from '#models/participant'
import User from '#models/user'
import Budget from '#models/budget'
import Payment from "#models/payment";

export default class Trip extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare city: string

  @column.dateTime()
  declare start: DateTime

  @column.dateTime()
  declare end: DateTime

  @column()
  declare publicLink?: string

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => Activity)
  declare activities: HasMany<typeof Activity>

  @hasMany(() => Participant)
  declare participants: HasMany<typeof Participant>

  @hasOne(() => Budget)
  declare budget: HasOne<typeof Budget>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
