import vine from '@vinejs/vine'

export const createBudgetValidator = vine.compile(
  vine.object({
    budget: vine.number().positive(),
  })
)

export const updateBudgetValidator = vine.compile(
  vine.object({
    budget: vine.number().positive().optional(),
  })
)
