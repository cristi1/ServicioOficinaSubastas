const { Router } = require('express')
const router = Router()
var DataBaseHandler =  require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

router.get('/', (req, res) => res.json({ message: 'Hola Cristi desde rol.js nuevamente roles!' }))

router.get('/rol', (req, res) => {
  let connection = dataBaseHandler.createConnection()
  connection.query("insert into rol(descripcion) values ('administrador')", function (err, result) {
    if (err) { res.status(404).send("Ocurrio un error durante la consulta1: " + err)}
    res.status(202).send({
        status: 'SUCCESS',
        message: 'Rol insertado'
      })
  })
  connection.end()
})

router.get('/roles', (req, res) => {
  let conexion = dataBaseHandler.createConnection()
  conexion.query('CALL sp_obtenerRoles()', function (error, result, fields) {
    if (error) { res.status(404).send("Ocurrio un error durante la consulta2: " + error)}
    if (result[0].length === 0) {
      res.status(404).send({
        status: 'ERROR',
        message: 'No existen roles en la base de datos'
      })
    } else {
      res.status(202).send({
        status: 'SUCCESS',
        message: 'Roles encontrados',
        data: result[0]
      })
    }
  })
  conexion.end()
})

module.exports = router

