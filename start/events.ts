import emitter from '@adonisjs/core/services/emitter'
import Participant from '#models/participant'
const SendParticipantMail = () => import('#listeners/send_participant_mail')

declare module '@adonisjs/core/types' {
  interface EventsList {
    'participant:created': Participant
  }
}

// Send mail after participant has been added in a trip (participant with email)
//emitter.on(ParticipantCreated, [SendParticipantMail])

emitter.on('participant:created', [SendParticipantMail, 'handle'])
