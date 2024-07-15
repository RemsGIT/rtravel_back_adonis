import { BaseSchema } from '@adonisjs/lucid/schema'
import Roles from '../../app/Enums/roles.js'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').nullable()
      table.enum('role', Object.values(Roles)).defaultTo(Roles.USER)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
