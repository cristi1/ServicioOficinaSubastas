const { Router } = require('express')
const router = Router()
require('dotenv').config()
var nJwt = require('njwt')
var DataBaseHandler = require('../config/conexion')
var validarScope = require('../config/validarScope')
var dataBaseHandler = new DataBaseHandler()

var signingKey = process.env.KEY_JWT

router.put('/Afiliado', function (req, res) {
  const codigo = req.body.codigo
  const nombre = req.body.nombre
  const password = req.body.password
  const jwt = req.body.jwt
  var cod = parseInt(codigo)

  if ((jwt == null && codigo == null) || (password == null && nombre == null)) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'Datos requeridos no ingresados o son incorrectos.'
    })
  } else {
    try {
      verifiedJwt = nJwt.verify(jwt, signingKey)
      if (!validarScope.validarScope(verifiedJwt, 'afiliado.put')) {
        res.status(403).send({
          status: 'Forbidden',
          message: 'El JWT no es válido o no contiene el scope de este servicio'
        })
      } else {
        updatePassword(res, codigo, nombre, password)
      }
    } catch (error) {
      res.status(403).send({
        status: 'Forbidden',
        message: 'El JWT no es válido o no contiene el scope de este servicio'
      })
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
    const con = dataBaseHandler.createConnection()
    con.query('CALL sp_existeUsuario(?);', [codigo], function (error, result) {
      if (error) { res.status(404).send('Ocurrio un error durante la consulta1: ' + error) }

      if (result[0][0] == null) { // no existe afiliado
        res.status(404).send({
          status: 'Not found',
          message: 'El codigo de afiliado no existe.'
        })
      } else {
        if (nombre != null) {
          const con1 = dataBaseHandler.createConnection()
          con1.query('CALL sp_actualizarNombre(?,?);', [codigo, nombre], function (error1, result1) {
            if (error1) { res.status(404).send('Ocurrio un error durante la consulta2: ' + error1) }
          })
          con1.end()
        }
        const con2 = dataBaseHandler.createConnection()
        con2.query('CALL sp_actualizarPassword(?,?);', [codigo, password], function (error2, result1) {
          if (error2) { res.status(404).send('Ocurrio un error durante la consulta3: ' + error2) }
          const con3 = dataBaseHandler.createConnection()
          con3.query('CALL sp_obtenerEstadoMembresia(?);', [codigo], function (error3, result2) {
            if (error3) { res.status(404).send('Ocurrio un error durante la consulta4: ' + error3) }

            membresia = result2[0][0].estadoMembresia
            membresia = (membresia === 'true')
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
