const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()

const path = require('path')
const passport = require('passport')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')

//require('./src/config/passport')(passport)

app.set('views', path.join(__dirname, 'src/views'))
app.set('view engine', 'ejs') // motor de plantillas
// middlewares
app.use(bodyParser.urlencoded({ extended: false })) // no recibe imagenes
app.use(bodyParser.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(session({
  secret: 'oficina',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// static files
app.use(express.static(path.join(__dirname, 'public')))

// routes
// require('./src/routes/routes')(app, passport)

app.use(require('./src/routes/rol'))
app.use(require('./src/routes/getAfiliado'))
app.use(require('./src/routes/postAfiliado'))
app.use(require('./src/routes/putAfiliado'))
app.use(require('./src/routes/getPago'))
app.use(require('./src/routes/postPago'))

async function main () {
  app.listen(8081)
  console.log('El servidor corre en el puerto 8080')
}

main()
