import Participant from "#models/participant";
import mail from "@adonisjs/mail/services/main";

export default class SendParticipantMail {
  async handle(participant: Participant) {
    // Send mail

    if (participant.email) {

      await participant.load('trip', (p) => {
        p.preload('user')
      })

      await mail.send((message) => {
        message
          .from('Rtravel <noreply@rtravel.fr>')
          .to(participant.email ?? '')
          .subject(`Tu as été invité à un voyage par ${participant.trip.user.username}`)
          .htmlView('emails/participant_created', {
            username: participant.name,
            trip_name: participant.trip.name,
            author: participant.trip.user.username,
            trip_thumbnail:
              participant.trip.thumbnail ??
              'https://a.cdn-hotels.com/gdcs/production40/d811/5e89ad90-8f10-11e8-b6b0-0242ac110007.jpg?impolicy=fcrop&w=1600&h=1066&q=medium',
            trip_link: `https://rtravel.fr/voyage/${participant.tripId}`,
          })
      })
    }
  }
}
