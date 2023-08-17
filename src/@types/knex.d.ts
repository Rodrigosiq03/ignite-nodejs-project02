// .d.ts é utilizado para definição de tipos
// não tera codigo JS, apenas TS
// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      createdAt: string
      session_id?: string
    }
  }
}
