const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = ( req, res = response, next ) => {
    // x-token headers
    const token = req.header('x-token');
    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la peticion'
        })
    }

    try {
        
        const { u_id, name } = jwt.verify(
            token, 
            process.env.SECRET_JWT_SEED,
        );
        
        req.uid = u_id
        req.name = name

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no valido',
            error: error
        })
    }

    next();
}

module.exports = {
    validarJWT
}