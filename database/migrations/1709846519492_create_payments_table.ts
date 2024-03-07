import { BaseSchema } from '@adonisjs/lucid/schema'
import PaymentCategory from "../../app/Enums/paymentCategory.js";

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.float('amount')
      table.enum('category', Object.values(PaymentCategory)).defaultTo(PaymentCategory.other)

      table.timestamps(true, true)

      table
        .integer('created_by')
        .unsigned()
        .references('users.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')

      table
        .integer('participant_id')
        .unsigned()
        .references('participants.id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
