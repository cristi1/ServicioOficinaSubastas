const { Router } = require('express')
const router = Router()
var DataBaseHandler =  require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

router.put('/Afiliado', function (req, res) {
  const codigo = req.body.codigo
  const nombre = req.body.nombre
  const password = req.body.password

  if (password == null && nombre == null) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'Se esperaba un nuevo password.'
    })
  } else {
    if (password != null) {
      updatePassword(res, codigo, nombre, password)
    }
  }
})

function updatePassword (res, codigo, nombre, password) {
  let membresia
  if (password.length < 6) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'El password no cumple las características mínimas de seguridad.'
    })
  } else {
    let con = dataBaseHandler.createConnection()
    con.query('CALL sp_existeUsuario(?);', [codigo], function (error, result) {
      if (error) { res.status(404).send("Ocurrio un error durante la consulta1: " + error)}

      if (result[0][0] == null) { // no existe afiliado
        res.status(404).send({
          status: 'Not found',
          message: 'El codigo de afiliado no existe.'
        })
      } else {
        if (nombre != null) {
          let con1 = dataBaseHandler.createConnection()
          con1.query('CALL sp_actualizarNombre(?,?);', [codigo, nombre], function (error1, result1) {
            if (error1) { res.status(404).send("Ocurrio un error durante la consulta2: " + error1)}
          })
          con1.end()
        }
        let con2 = dataBaseHandler.createConnection()
        con2.query('CALL sp_actualizarPassword(?,?);', [codigo, password], function (error2, result1) {
          if (error2) { res.status(404).send("Ocurrio un error durante la consulta3: " + error2)}
          let con3 = dataBaseHandler.createConnection()
          con3.query('CALL sp_obtenerEstadoMembresia(?);', [codigo], function (error3, result2) {
            if (error3) { res.status(404).send("Ocurrio un error durante la consulta4: " + error3)}

            membresia = result2[0][0].estadoMembresia
            res.status(201).send({
              status: 'Created',
              message: 'Usuario actualizado exitosamente.',
              codigo: codigo,
              nombre: nombre,
              vigente: membresia
            })
          })
          con3.end()
        })
        con2.end()
      }
    })
    con.end()
  }
}

module.exports = router
