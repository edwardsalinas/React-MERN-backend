const { response } = require("express");
const  bcrypt = require("bcryptjs")
const Usuario = require("../models/Usuario");
const { generarJWT } = require("../helpers/jwt")

const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;
    try {

        let usuario = await Usuario.findOne({ email });
        if ( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'Un usuario existe con es correo'
            });
        }
        
        usuario = new Usuario(req.body);

        //Encriptar la contrasena 
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );

        await usuario.save();

        //Generar JWT
        const token = generarJWT( usuario.id, usuario.name );

        res.status(201).json({
            ok: true,
            uid: usuario._id,
            name: usuario.name,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
    }
};

const loginUsuario = async(req, res = response) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
         if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        }

        //confirmar los passwords
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        //Generar nuestro JWT
        const token = generarJWT( usuario.id, usuario.name );


        res.json({
            ok: true,
            uid: usuario._id,
            name: usuario.name,
            token
        })


        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        })
    }
};

const revalidarToken = async(req, res = response) => {

    const {u_id, name } = req;
    
    const token = await generarJWT( u_id, name );

    
    res.json({
        ok: true,
        uid: u_id,
        name,
        token,
    });
};

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken,
};
