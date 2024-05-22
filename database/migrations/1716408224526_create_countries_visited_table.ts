import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'countries_visited'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('country_code')

      table.timestamp('created_at')

      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
