import { customAlphabet } from 'nanoid'

import { db } from "../database/database.connection.js"

export async function createShortenLink(req, res) {
  const { url } = req.body;
  const { userId } = res.locals.session;

  try {
    const nanoid = customAlphabet('1234567890abcdef', 8)
    const shortUrl = nanoid();
    const dateNow = new Date();

    const response = await db.query(
      `
        INSERT INTO links ("userId", url, "shortUrl", "visitCount", "createdAt")
        VALUES ($1, $2, $3, 0, $4) RETURNING id, "shortUrl"
      `, [userId, url, shortUrl, dateNow]);

    return res.status(201).send(response.rows[0]);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export async function getLinkById(req, res) {
  const { id } = req.params;
  try {
    const link = await db.query(
      `
        SELECT id, "shortUrl", url FROM links WHERE id=$1
      `, [id]);

    if (link.rowCount === 0) return res.status(404).send('URL não encontrada');

    return res.send(link.rows[0]);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};