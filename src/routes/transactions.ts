import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// cookies -> formas de manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    console.log(`[${request.method}]`)
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply
      .status(201)
      .send({ message: 'Transaction created successfully!' })
  })

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      if (!sessionId) {
        return reply.status(401).send({
          error: 'Unauthorized!',
        })
      }

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions, message: 'Transactions retrieved successfully!' }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)
      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary, message: 'Summary retrieved successfully!' }
    },
  )
}
