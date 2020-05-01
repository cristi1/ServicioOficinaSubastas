const { Router } = require('express')
const router = Router()
var DataBaseHandler = require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

router.post('/Pago', function (req, res) {
  const codigo = req.body.codigo
  const monto = req.body.monto
  const jwt = req.body.jwt
  let membresia

  if (codigo == null || monto == null) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'Datos requeridos no ingresados.'
    })
  } else if (monto < 0 || monto != 100) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'El monto no es el requerido por el sistema.'
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
        const con1 = dataBaseHandler.createConnection()
        con1.query('CALL sp_obtenerEstadoMembresia(?);', [codigo], function (error2, result2) {
          if (error2) { res.status(404).send('Ocurrio un error durante la consulta2: ' + error2) }
          membresia = result2[0][0].estadoMembresia
          membresia = (membresia == 'true')
          if (membresia) {
            res.status(406).send({
              status: 'Not Acceptable',
              message: 'El Afiliado cuenta con membresía activa.'
            })
          } else {
            const con2 = dataBaseHandler.createConnection()
            con2.query('CALL sp_insertarMembresia(?,?,1,null);', [codigo, monto], function (error3, result3) {
              if (error3) { res.status(404).send('Ocurrio un error durante la consulta3: ' + error3) }
              var fechaEnc = new Date(result3[0][0].fecha)
              res.status(201).send({
                status: 'Created',
                id: result3[0][0].id,
                monto: result3[0][0].monto,
                fecha: fechaEnc.toLocaleString(),
                message: 'Membresía activada exitosamente.'
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
})

module.exports = router
