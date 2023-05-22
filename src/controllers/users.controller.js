import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

import { db } from "../database/database.connection.js"

export async function getAllUsers(req, res) {
  try {
    const users = await db.query(`SELECT * FROM users;`);

    return res.send(users.rows);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export async function createUser(req, res) {
  const { name, email, password } = req.body;

  try {
    // const dateNow = new Date();
    const hash = bcrypt.hashSync(password, 10);

    await db.query(`
      INSERT INTO users 
      (
        name, email, password, "linksCount", "visitCount"
      ) 
      VALUES ($1, $2, $3, 0, 0)
    `, [name, email, hash]);

    return res.sendStatus(201);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const userExists = await db.query(
      `
        SELECT * FROM users WHERE email=$1;
      `, [email]);

    if (userExists.rowCount === 0) {
      return res.status(401).send({ message: "E-mail/senha incorretos!" });
    };

    const isPasswordCorrect = bcrypt.compareSync(password, userExists.rows[0].password);

    if (!isPasswordCorrect) {
      return res.status(401).send({ message: "E-mail/senha incorretos!" });
    };

    const sessionExists = await db.query(
      `
        SELECT * FROM sessions WHERE "userId"=$1;
      `, [userExists.rows[0].id]);

    if (sessionExists.rowCount > 0) await db.query(`DELETE FROM sessions WHERE id=$1`, [sessionExists.rows[0].id]);

    const token = uuid();
    // const dateNow = new Date();

    await db.query(
      `
        INSERT INTO sessions ("userId", token)
          VALUES ($1, $2);
      `, [userExists.rows[0].id, token]);

    return res.status(200).send({ token: token });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export async function logout(req, res) {
  const { id } = res.locals.session;

  try {
    await db.query("DELETE FROM sessions WHERE id=$1", [id]);

    return res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message)
  }
}