const jwt = require("jsonwebtoken");
const Yup = require("yup");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const authConfig = require("../config/auth");

const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
  static async register(req, res) {
    // validations
    const schema = Yup.object().shape({
      name: Yup.string().required("O nome é obrigatório"),
      phone: Yup.string().required("O telefone é obrigatório"),
      email: Yup.string().email().required("O e-mail é obrigatório"),
      password: Yup.string()
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .required("A senha é obrigatória"),
      confirmpassword: Yup.string()
        .transform((value) => (value.trim() === "" ? undefined : value)) // transform empty string into undefined
        .oneOf([Yup.ref("password"), null], "As senhas devem corresponder")
        .required("Confirmação de senha obrigatória"),
    });

    try {
      await schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      // desired order of error messages
      const errorPriority = [
        "O nome é obrigatório",
        "O telefone é obrigatório",
        "E-mail inválido",
        "O e-mail é obrigatório",
        "A senha é obrigatória",
        "A senha deve ter pelo menos 6 caracteres",
        "As senhas devem corresponder",
        "Confirmação de senha obrigatória",
      ];

      const sortedErrors = err.errors.sort(
        (a, b) => errorPriority.indexOf(a) - errorPriority.indexOf(b)
      );

      return res.status(400).json({ message: sortedErrors });
    }

    const { name, email, phone, password } = req.body;

    // check if user exists
    const userExixst = await User.findOne({ email: email });

    if (userExixst) {
      res.status(422).json({ message: "E-mail já cadastrado!" });
      return;
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async checkUser(req, res) {
    let currentUser;

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token, authConfig.secret);

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }

    res.status(200).send(currentUser);
  }

  static async getUserById(req, res) {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(400).json({ message: "Usuário não encontrado" });
      return;
    }

    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    // validations
    const schema = Yup.object().shape({
      name: Yup.string().required("O nome é obrigatório"),
      email: Yup.string()
        .email("E-mail inválido")
        .required("O e-mail é obrigatório"),
      phone: Yup.string().required("O telefone é obrigatório"),
      password: Yup.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      confirmpassword: Yup.string()
        .transform((value) => (value.trim() === "" ? undefined : value)) // transform empty string into undefined
        .oneOf([Yup.ref("password"), null], "As senhas devem corresponder"),
    });

    try {
      await schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      const errorPriority = [
        "O nome é obrigatório",
        "E-mail inválido",
        "O e-mail é obrigatório",
        "O telefone é obrigatório",
        "A senha deve ter pelo menos 6 caracteres",
        "As senhas devem corresponder",
      ];

      const sortedErrors = err.errors.sort(
        (a, b) => errorPriority.indexOf(a) - errorPriority.indexOf(b)
      );
      return res.status(400).json({ message: sortedErrors });
    }

    const { name, email, phone, password, confirmpassword } = req.body;

    // check if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (req.file) {
      user.image = req.file.filename;
    }

    if (!user) {
      res.status(400).json({ message: "Usuário não encontrado" });
      return;
    }

    // check if email has already taken
    const userExixst = await User.findOne({ email: email });

    if (user.email !== email && userExixst) {
      res.status(422).json({ mesage: "Por favor, use outro e-mail!" });
      return;
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // Update password if provided

    if (password && !confirmpassword) {
      return res
        .status(422)
        .json({ message: "Confirmação de senha obrigatória" });
    }

    if (password === confirmpassword && password != null) {
      // creating password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }

    // Save update user
    try {
      // return user updated data
      await User.findByIdAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
};
