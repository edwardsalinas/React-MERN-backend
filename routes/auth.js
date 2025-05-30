/**
 *  Rutas de Usuarios / Auth
 *  hots + /api/auth
 */

const { Router } = require("express");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validar-campos")
const { crearUsuario, loginUsuario, revalidarToken } = require(
    "../controllers/auth",
);
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();
router.post(
    "/new",
    [
        check("name", "El nombre es obligatorio").not().isEmpty(),
        check("email", "El nombre es obligatorio").isEmail(),
        check("password", "El password debe de ser 6 caracteres").isLength({
            min: 6,
        }),
        validarCampos,
    ],
    crearUsuario,
);

router.post(
    "/",
    [
        check("email", "El nombre es obligatorio").isEmail(),
        check("password", "El password debe de ser 6 caracteres").isLength({
            min: 6,
        }),
        validarCampos,
    ],
    loginUsuario,
);

router.get("/renew", validarJWT, revalidarToken);

module.exports = router;
