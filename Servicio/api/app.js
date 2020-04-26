const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(require('./src/routes/rol'))
app.use(require('./src/routes/getAfiliado'))
app.use(require('./src/routes/postAfiliado'))
app.use(require('./src/routes/putAfiliado'))

async function main () {
  app.listen(8080)
  console.log('El servidor corre en el puerto 8080')
}

main()

