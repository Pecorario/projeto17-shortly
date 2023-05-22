import { db } from "../database/database.connection.js";

export async function validateCreateUser(req, res, next) {
  const { password, confirmPassword, email } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(422).send({ message: "As senhas devem ser iguais!" });
    };

    const userExists = await db.query(
      `
        SELECT * FROM users WHERE email=$1;
      `, [email]);

    if (userExists.rowCount > 0) {
      return res.status(409).send({ message: "Esse usuário já existe!" });
    };

    next();
  } catch (error) {
    return res.status(500).send(error.message);
  }
};