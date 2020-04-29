const { Router } = require('express')
const router = Router()
var DataBaseHandler =  require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

router.get('/Afi', (req, res) => res.json({ message: 'Hola Cristi desde afiliado.js' }))

router.get('/Afiliado', (req, res) => {
  let codigo = req.query.codigo
  let password = req.query.password
  let nombre
  let membresia = false
  let con = dataBaseHandler.createConnection()
  con.query('CALL sp_existeUsuario(?)', [codigo], function (error, result) {
    if (error) { res.status(404).send("Ocurrio un error durante la consulta: " + error)}
    if (result[0][0] == null) { // no existe afiliado
      res.status(404).send({
        status: 'Not found',
        message: 'El codigo de afiliado no existe.'
      })
    } else { // existe afiliado
      nombre = result[0][0].nombre 
      let con1 = dataBaseHandler.createConnection()
      con1.query('CALL sp_obtenerUsuario(1,?,?)', [codigo, password], function (error1, result1) {
        if (error1) { res.status(404).send("Ocurrio un error durante la consulta1: " + error1)}
        if (result1[0][0] == null) { // password incorrecto
          res.status(401).send({
            status: 'Unauthorized',
            message: 'La autenticación no es exitosa.'
          })
        } else {
          let con2 = dataBaseHandler.createConnection()
          con2.query('CALL sp_obtenerEstadoMembresia(?)', [codigo], function (error2, result2) {
             if (error2) { res.status(404).send("Ocurrio un error durante la consulta2: " + error2)}
            membresia = result2[0][0].estadoMembresia
            res.status(200).send({
              status: 'OK',
              message: 'La autenticacion es exitosa.',
              codigo: codigo,
              nombre: nombre,
              vigente: membresia
            })
          })
          con2.end()
        }
      })
      con1.end()
    }
  })
  con.end()
})

module.exports = router

