const { Router } = require('express')
const router = Router()
require('dotenv').config()
var nJwt = require('njwt')
var DataBaseHandler = require('../config/conexion')
var validarScope = require('../config/validarScope')
var dataBaseHandler = new DataBaseHandler()

var signingKey = process.env.KEY_JWT

router.get('/Pago', (req, res) => {
  const jwt = req.query.jwt
  const codigo = req.query.codigo

  if (codigo == null || !Number.isInteger(codigo)) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'Datos requeridos no ingresados o son incorrectos.'
    })
  } else {
    try {
      verifiedJwt = nJwt.verify(jwt, signingKey)
      if (!validarScope.validarScope(verifiedJwt, 'pago.get')) {
        res.status(403).send({
          status: 'Forbidden',
          message: 'El JWT no es válido o no contiene el scope de este servicio'
        })
      } else {}

      const con = dataBaseHandler.createConnection()
      con.query('CALL sp_existeUsuario(?);', [codigo], function (error, result) {
        if (error) { res.status(404).send('Ocurrio un error durante la consulta1: ' + error) }
        if (result[0][0] == null) { // no existe afiliado
          res.status(404).send({
            status: 'Not found',
            message: 'El codigo de afiliado no existe.'
          })
        } else {
          const con1 = dataBaseHandler.createConnection()
          con1.query('CALL sp_obtenerMembresia(?);', [codigo], function (error1, result1) {
            if (error1) { res.status(404).send('Ocurrio un error durante la consulta2: ' + error1) }
            if (result1[0][0] == null) { // no tiene ninguna membresia
              res.status(404).send({
                status: 'Not found',
                message: 'Afiliado sin membresia activa.'
              })
            } else {
              var fechaEnc = new Date(result1[0][0].fecha)
              res.status(200).send({
                status: 'OK',
                id: result1[0][0].id,
                monto: result1[0][0].monto,
                fecha: fechaEnc.toLocaleString(),
                message: 'Membresía encontrada.'
              })
            }
          })
          con1.end()
        }
      })
      con.end()
    } catch {
      res.status(403).send({
        status: 'Forbidden',
        message: 'El JWT no es válido o no contiene el scope de este servicio'
      })
    }
  }
})

module.exports = router
