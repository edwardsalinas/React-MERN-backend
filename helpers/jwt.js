const jwt = require('jsonwebtoken');

const generarJWT = (u_id, name) => {
    const payload = { u_id, name };
 
    try {
        const token = jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '2h',
        });
 
        return token;
    } catch (err) {
        console.log(err);
 
        return 'No se pudo generar el token';
    }
};

module.exports = {
    generarJWT
}

