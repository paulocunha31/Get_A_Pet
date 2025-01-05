const router = require("express").Router();

const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

const PetController = require("../controllers/PetController");

router.get("/", PetController.getAll);
router.get("/mypets", verifyToken, PetController.getAllUserPets);
router.get("/myadoptions", verifyToken, PetController.getAllUserAdoptions);
router.post("/create",verifyToken, imageUpload.array("images"), PetController.create);
router.get("/:id", PetController.getPetById)
router.patch("/:id", verifyToken, imageUpload.array("images"), PetController.updatePet);
router.delete("/:id", verifyToken, PetController.removePetById);
router.patch("/schedule/:id", verifyToken, PetController.schedule);
router.patch("/conclude/:id", verifyToken, PetController.concludeAdoption);

// Middleware de tratamento dos erros do Multer
router.use((err, req, res, next) => {
    if (err && err.error) {
      return res.status(400).json({ error: err.error });
    }
    res.status(500).json({ error: "Erro no servidor" });
  });

module.exports = router;
