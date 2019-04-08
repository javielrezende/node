const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");

const authConfig = require("../../config/auth");

const User = require("../models/User");

const router = express.Router();

function generateToken(params = {}) {
  // id do user que recebera por parametro, secret da aplicacao gerada com md5, tempo de expiração em segundos referrente à 1 dia
  return jwt.sign(params, authConfig.secret, { expiresIn: 86400 });
}

//----------------------------------------------------------------------

router.post("/register", async (req, res) => {
  try {
    const { email } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).send({ error: "User already exists" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id })
    });
  } catch (err) {
    return res.status(400).send({ error: "Registration failed" + err });
  }
});

//----------------------------------------------------------------------

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).send({ error: "User not found" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: "Invalid password" });
  }

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id })
  });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).send({ error: "User not found" });

    // Gera um token aleatório de 20 caracteres
    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    // $set é utilizado para definir os campos que serao alterados
    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });

    mailer.sendMail(
      {
        to: email,
        from: "javielrezende@gmail.com",
        template: "auth/forgot_password",
        context: { token }
      },
      err => {
        if (err)
          return res
            .status(400)
            .send({ error: "Cannot send forgot password email" + err });
        return res.send();
      }
    );
  } catch (err) {
    res
      .status(400)
      .send({ error: "Error on forgot passowrd, try again " + err });
  }
});

router.post("/reset_password", async (req, res) => {

  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) return res.status(400).send({ error: "User not found" });

    if (token !== user.passwordResetToken)
      res.status(400).send({ error: "Token invalid" });

    const now = new Date();

    if (now > user.passowrdResetExpires)
      res
        .status(400)
        .send({ error: "Token expired, generate a new one" + err });

    user.password = password;

    await user.save();

    res.send();
  } catch (err) {
    res.status(400).send({ error: "Cannot reset password, try again" + err });
  }
});

module.exports = app => app.use("/auth", router);
