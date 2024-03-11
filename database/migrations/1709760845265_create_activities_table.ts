import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'activities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('place').nullable()
      table.string('city')
      table.timestamp('start')
      table.string('icon').nullable()

      table.timestamps(true, true)

      table
        .integer('trip_id')
        .unsigned()
        .references('trips.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
