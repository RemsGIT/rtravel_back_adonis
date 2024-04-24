import vine from '@vinejs/vine'
import ParticipantPolicies from '../Enums/participantPolicies.js'

export const createParticipantValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    email: vine.string().email().optional(),
    policy: vine.enum(Object.values(ParticipantPolicies)).optional(),
  })
)

export const updateParticipantValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    email: vine.string().email().optional(),
    policy: vine.enum(Object.values(ParticipantPolicies)).optional(),
  })
)
