import request from 'supertest'
import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('\u001b[35m[Transactions HTTP Requests]', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('yarn run knex migrate:rollback --all') // evita conflitos entre os testes
    execSync('yarn run knex migrate:latest')
  })

  // tests e2e

  it('Should be able to create a transaction \u001b[31m[POST]', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit',
    })

    expect(response.statusCode).toBe(201)
  })

  it('Should be able to list all transactions \u001b[31m[GET - All]', async () => {
    const createTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransaction.get('Set-Cookie')

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const body = response.body

    expect(response.statusCode).toBe(200)
    expect(body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 5000,
      }),
    ])
    expect(body.transactions.length).toBe(1)
  })

  it('Should be able to get specific transaction \u001b[31m[GET]', async () => {
    const createTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransaction.get('Set-Cookie')

    const listAllTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = listAllTransactions.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(getTransactionResponse.statusCode).toBe(200)
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 5000,
      }),
    )
  })

  it('Should be able to get the summary \u001b[31m[GET]', async () => {
    const createTransaction = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransaction.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.statusCode).toBe(200)
    expect(summaryResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      }),
    )
  })
})
