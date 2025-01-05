const Pet = require("../models/Pet");
const Yup = require("yup");
const ObjectId = require("mongoose").Types.ObjectId;

// helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class PetController {
  // create a pet
  static async create(req, res) {
    // validations
    const schema = Yup.object().shape({
      name: Yup.string().required("O nome é obrigatório"),
      age: Yup.number().required("Idade obrigatória"),
      weight: Yup.number().required("Peso obrigatório"),
      color: Yup.string().required("Cor obrigatória"),
    });

    try {
      await schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({ message: err.errors });
    }

    const available = true;
    const { name, age, weight, color } = req.body;

    const images = req.files;

    if (!images || images.length === 0) {
      res.status(400).json({ message: "A imagem é um campo obrigatório" });
      return;
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
      pet.images.push(image.filename);
    });

    try {
      const newPet = await pet.save();
      res.status(200).json({ message: "Pet criado com sucesso!", newPet });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  static async getAll(req, res) {
    const pets = await Pet.find();

    res.status(200).json({
      pets: pets,
    });
  }

  static async getAllUserPets(req, res) {
    // get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);
    console.log(user);

    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
    res.status(200).json({ pets });
  }

  static async getAllUserAdoptions(req, res) {
    // get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt");

    res.status(200).json({ pets });
  }

  static async getPetById(req, res) {
    const { id } = req.params;
    // check if id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido!" });
    }
    // check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" });
    }
    res.status(200).json({ pets: pet });
  }

  static async removePetById(req, res) {
    const { id } = req.params;

    // check if id is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido!" });
    }
    // check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      return res.status(404).json({ message: "Pet não encontrado!" });
    }

    // check if logget in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({
        message:
          "Ocorreu um problema ao processar sua solicitação. Tente novamente mais tarde!",
      });
    }
    await Pet.findByIdAndDelete(id);
    res.status(200).json({ message: "Pet removido com sucesso!" });
  }

  static async updatePet(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required("Nome obrigatório"),
      age: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          originalValue === "null" || originalValue === "" ? null : value
        )
        .required("Idade obrigatória"),
      weight: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          originalValue === "null" || originalValue === "" ? null : value
        )
        .min(0, "O peso não pode ser negativo")
        .required("Peso brigatório"),
      color: Yup.string().required("Cor obrigatório"),
    });

    try {
      await schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      res.status(400).json({ message: err.errors });
      return;
    }

    const { name, age, weight, color, available } = req.body;

    const images = req.files;

    const { id } = req.params;

    // check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "ID inválido!" });
      return;
    }

    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" });
      return;
    }

    const updatedData = {};

    updatedData.name = name;
    updatedData.age = age;
    updatedData.weight = weight;
    updatedData.color = color;
    updatedData.available = available;
    if (images.length > 0) {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Ocorreu um problema ao processar sua solicitação. Tente novamente mais tarde!",
      });
      return;
    }

    try {
      await Pet.findByIdAndUpdate(id, updatedData);
      res.status(200).json({ message: "Pet atualizado com sucesso!" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erro ao atualizar o Pet. Tente novamente!" });
    }
  }

  static async schedule(req, res) {
    const { id } = req.params;

    //  check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(400).json({ message: "Pet não encontrado!" });
      return;
    }

    // check if user registered the pet

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) {
      res.status(422).json({
        message: "Você não pode agendar uma visita para seu próprio Pet!",
      });
      return;
    }

    // check if user has already schedule a visit

    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(422).json({
          message: "Você já agendou uma visita para este Pet!",
        });
        return;
      }
    }

    // add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(id, pet);

    res.status(200).json({
      message: `A visita foi agendada com sucesso, por favor contacte ${pet.user.name} pelo telefone ${pet.user.phone}`,
    });
  }

  static async concludeAdoption(req, res) {
    const { id } = req.params;

    // check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(400).json({ message: "Pet não encontrado!" });
      return;
    }

    // check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({
        message:
          "Ocorreu um problema ao processar sua solicitação. Tente novamente mais tarde!",
      });
      return;
    }

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);
    res.status(200).json({
      message: "Parabéns! O ciclo de adoção foi concluído com sucesso!",
    });
  }
};
