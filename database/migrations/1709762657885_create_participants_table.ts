import { BaseSchema } from '@adonisjs/lucid/schema'
import ParticipantPolicies from '../../app/Enums/participantPolicies.js'

export default class extends BaseSchema {
  protected tableName = 'participants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').nullable()
      table.string('email')
      table.enum('policy', Object.values(ParticipantPolicies)).defaultTo(ParticipantPolicies.READ)

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
