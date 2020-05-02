const { Router } = require('express')
const router = Router()
var DataBaseHandler = require('../config/conexion')
var dataBaseHandler = new DataBaseHandler()

var credentials = 0;

router.get('/', (req, res) => {
    res.render('index')
})

router.get('/login', (req, res) => {
    res.render('login', {
        message: req.flash('login message')
    })
})

router.post('/login', (req, res) => {
    const id = req.body.id
    const pass = req.body.password
    credentials = id

    const con1 = dataBaseHandler.createConnection()
    con1.query('CALL sp_obtenerUsuario(2,?,?)', [id, pass], function (error1, result1) {
        if (error1) { res.status(404).send('Ocurrio un error durante la consulta1: ' + error1) }
        if (result1[0][0] == null) { // password incorrecto
            res.redirect('/login');
        } else { 
            res.redirect('/profile');
        }

    })
    con1.end()
})

router.get('/profile', (req, res) => {
    res.render('profile')
})

router.post('/profile', (req,res)=>{

    
    /*
    Aqui deberia ir tu codigo para procesar la data
    */
})

function pagarMembresia(){
    console.log("entro....")
}

/*app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));*/
module.exports = router