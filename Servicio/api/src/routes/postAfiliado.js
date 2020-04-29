const { Router } = require('express')
const router = Router()
var DataBaseHandler =  require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

router.post('/Afiliado', function (req, res) {
  const nombre = req.body.nombre
  const password = req.body.password
  let codigo
  let membresia

  if (password.length < 6) {
    res.status(406).send({
      status: 'Not Acceptable',
      message: 'El password no cumple las características mínimas de seguridad.'
    })
  } else {
    let con = dataBaseHandler.createConnection()
    con.query('CALL sp_insertarUsuario(1,null,?,?,null,null,null,null,null);', [password, nombre], function (error, result) {
      if (error) { res.status(404).send("Ocurrio un error durante la consulta1: " + error)}

      codigo = result[0][0].cod
      let con1 = dataBaseHandler.createConnection()
      con1.query('CALL sp_obtenerEstadoMembresia(?);', [codigo], function (error2, result2) {
        if (error2) { res.status(404).send("Ocurrio un error durante la consulta2: " + error2)}

        membresia = result2[0][0].estadoMembresia
        membresia = (membresia == 'true')
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
})

module.exports = router

