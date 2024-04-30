import vine from '@vinejs/vine'

export const createBudgetValidator = vine.compile(
  vine.object({
    amount: vine.number().positive(),
  })
)

export const updateBudgetValidator = vine.compile(
  vine.object({
    amount: vine.number().positive().optional(),
  })
)
