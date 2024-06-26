import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_verified').defaultTo(false)
      table.string('otp_code').nullable()
      table.timestamp('otp_expire_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_verified')
      table.dropColumn('otp_code')
      table.dropColumn('otp_expire_at')
    })
  }
}
