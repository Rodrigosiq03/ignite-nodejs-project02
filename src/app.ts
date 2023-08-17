import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'

export const app = fastify()

// query builder, construtor de queries, Knex.js, focando na linguagem q estamos utilizando
// as queries são reutilizadas para outros bancos de dados
// mais pra frente ORMs

// migration, controle de versão nos banco de dados, historico de mudanças feitas no banco de dados
app.register(cookie)
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

