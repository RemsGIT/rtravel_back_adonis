import { BaseEvent } from '@adonisjs/core/events'
import Participant from '#models/participant'

export default class ParticipantCreated extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public participant: Participant) {
    super()
  }
}
