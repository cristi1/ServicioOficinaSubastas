const { Router } = require('express')
const router = Router()
require('dotenv').config()
var nJwt = require('njwt')
var DataBaseHandler = require('../config/conexion')
var validarScope = require('../config/validarScope')
var dataBaseHandler = new DataBaseHandler()

var signingKey = process.env.KEY_JWT

router.get('/Afi', (req, res) => res.json({ message: 'Hola Cristi desde afiliado.js' }))

router.get('/Afiliado', (req, res) => {
  const jwt = req.query.jwt
  const codigo = req.query.codigo
  const password = req.query.password
  let nombre
  let membresia = false

  if (jwt == null || codigo == null || password == null) {
    res.status(401).send({
      status: 'Unauthorized',
      message: 'La autenticación no es exitosa, hacen falta datos requeridos o son incorrectos.'
    })
  } else {
    try {
      verifiedJwt = nJwt.verify(jwt, signingKey)

      if (!validarScope.validarScope(verifiedJwt, 'afiliado.get')) {
        res.status(403).send({
          status: 'Forbidden',
          message: 'El JWT no es válido o no contiene el scope de este servicio 1'
        })
      } else {
        const con = dataBaseHandler.createConnection()
        con.query('CALL sp_existeUsuario(?)', [codigo], function (error, result) {
          if (error) { res.status(404).send('Ocurrio un error durante la consulta: ' + error) }
          if (result[0][0] == null) { // no existe afiliado
            res.status(404).send({
              status: 'Not found',
              message: 'El codigo de afiliado no existe.'
            })
          } else { // existe afiliado
            nombre = result[0][0].nombre
            const con1 = dataBaseHandler.createConnection()
            con1.query('CALL sp_obtenerUsuario(1,?,?)', [codigo, password], function (error1, result1) {
              if (error1) { res.status(404).send('Ocurrio un error durante la consulta1: ' + error1) }
              if (result1[0][0] == null) { // password incorrecto
                res.status(401).send({
                  status: 'Unauthorized',
                  message: 'La autenticación no es exitosa.'
                })
              } else {
                const con2 = dataBaseHandler.createConnection()
                con2.query('CALL sp_obtenerEstadoMembresia(?)', [codigo], function (error2, result2) {
                  if (error2) { res.status(404).send('Ocurrio un error durante la consulta2: ' + error2) }
                  membresia = result2[0][0].estadoMembresia
                  membresia = (membresia === 'true')
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
      }
    } catch (error) {
      res.status(403).send({
        status: 'Forbidden',
        message: 'El JWT no es válido o no contiene el scope de este servicio try error: ' + error
      })
    }
  }
})

module.exports = router
