const Yup = require("yup");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const createUserToken = require("../helpers/create-user-token");
module.exports = class SessionController {
  static async login(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required("E-mail obrigatório"),
      password: Yup.string().required("Senha obrigatória"),
    });

    try {
      await schema.validateSync(req.body, { abortEarly: false });
    } catch (err) {
      // desied order of error messages
      const errorPriority = ["E-mail obrigatório", "Senha obrigatória"];

      const sortedErrors = err.errors.sort(
        (a, b) => errorPriority.indexOf(a) - errorPriority.indexOf(b)
      );
      return res.status(400).json({ message: sortedErrors });
    }

    const userEmailOrPasswordIncorrect = () => {
      res
        .status(401)
        .json({
          message: "Certifique-se de que sua senha ou e-mail estejam corretos!",
        });
    };

    if (!(await schema.isValid(req.body))) {
      return userEmailOrPasswordIncorrect();
    }

    const { email, password } = req.body;

    //    check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return userEmailOrPasswordIncorrect();
    }

    //  check if password match with db password
    if (!(await bcrypt.compare(password, user.password))) {
      return userEmailOrPasswordIncorrect();
    }

    await createUserToken(user, req, res);
  }
};
