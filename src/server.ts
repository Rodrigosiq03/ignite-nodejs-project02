import { app } from './app'
import { env } from './env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('\u001b[34m', 'Server is running on port \u001b[31m3333 🚀')
  })
