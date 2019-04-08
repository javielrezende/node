const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se possui um authorizatoin no header da requisição
  if (!authHeader) return res.status(401).send({ error: "No token provided" });

  const parts = authHeader.split(" ");

  // Verifica se o token possui o formato válido, começando com Bearer e acabando com o hash
  if (!parts.length === 2) {
    return res.status(401).send({ error: "Token error" });
  }

  const [scheme, token] = parts;

  //Verifica se o token comeca com Bearer
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({ erro: "Token malformatted" });

  // Verifica: token, o secret e recebe-se um callback
  // Dentro cdo callback passa um erro se existir,
  // e o id do usuario no decoded caso não exista erro
  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) return res.status(401).send({ error: "Token invalid" + err });

    req.userId = decoded.id;

    next();
  });
};
