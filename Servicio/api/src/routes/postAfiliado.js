const { Router } = require('express')
const router = Router()
require('dotenv').config()
var nJwt = require('njwt')
var validarScope = require('../config/validarScope')
var DataBaseHandler = require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

var signingKey = process.env.KEY_JWT

router.post('/Afiliado', function (req, res) {
  const nombre = req.body.nombre
  const password = req.body.password
  const jwt = req.body.jwt
  let codigo
  let membresia

  if (nombre == null || password == null || jwt == null) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'Hacen falta parametros requeridos.'
    })
  } else {
    try {
      verifiedJwt = nJwt.verify(jwt, signingKey)
      if (!validarScope.validarScope(verifiedJwt, 'afiliado.post')) {
        res.status(403).send({
          status: 'Forbidden',
          message: 'El JWT no es válido o no contiene el scope de este servicio'
        })
      } else {
        if (password.length < 6) {
          res.status(406).send({
            status: 'Not Acceptable',
            message: 'El password no cumple las características mínimas de seguridad.'
          })
        } else {
          const con = dataBaseHandler.createConnection()
          con.query('CALL sp_insertarUsuario(1,?,?,null,null,null,null,null);', [password, nombre], function (error, result) {
            if (error) { res.status(404).send('Ocurrio un error durante la consulta1: ' + error) }

            codigo = result[0][0].cod
            const con1 = dataBaseHandler.createConnection()
            con1.query('CALL sp_obtenerEstadoMembresia(?);', [codigo], function (error2, result2) {
              if (error2) { res.status(404).send('Ocurrio un error durante la consulta2: ' + error2) }

              membresia = result2[0][0].estadoMembresia
              membresia = (membresia === 'true')
              res.status(201).send({
                status: 'Created',
                message: 'Usuario creado exitosamente.',
                codigo: codigo,
                nombre: nombre,
                vigente: membresia
              })
            })
            con1.end()
          })
          con.end()
        }
      }
    } catch {
      res.status(403).send({
        status: 'Forbidden',
        message: 'El JWT no es válido o no contiene el scope de este servicio'
      })
    }
  }
})

module.exports = router
