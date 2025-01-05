

const router = require('express').Router()

// Middleware
const verifyToken = require('../helpers/verify-token')



const UserController = require('../controllers/UserControllers')
const SessionController = require('../controllers/SessionControllers')
const {imageUpload} = require("../helpers/image-upload")

router.post('/register', UserController.register)
router.post('/login', SessionController.login)
router.get('/checkuser', UserController.checkUser)
router.get('/:id', UserController.getUserById)

router.use(verifyToken)
router.patch('/edit/:id', imageUpload.single("image"), UserController.editUser)

// Middleware de tratamento dos erros do Multer
router.use((err, req, res, next) => {
    if (err && err.error) {
      return res.status(400).json({ error: err.error });
    }
    res.status(500).json({ error: "Erro no servidor" });
  });


module.exports = router