import { customAlphabet } from 'nanoid'

import { db } from "../database/database.connection.js"

export async function createShortenLink(req, res) {
  const { url } = req.body;
  const { userId } = res.locals.session;

  try {
    const nanoid = customAlphabet('1234567890abcdef', 8)
    const shortUrl = nanoid();

    const response = await db.query(
      `
        INSERT INTO links ("userId", url, "shortUrl", "visitCount")
        VALUES ($1, $2, $3, 0) RETURNING id, "shortUrl";
      `, [userId, url, shortUrl]);

    await db.query(
      `
          UPDATE users SET "linksCount" = "linksCount" + 1 WHERE id=$1;
        `, [userId]);

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
        SELECT id, "shortUrl", url FROM links WHERE id=$1;
      `, [id]);

    if (link.rowCount === 0) return res.status(404).send('URL não encontrada');

    return res.send(link.rows[0]);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export async function openShortUrl(req, res) {
  const { shortUrl } = req.params;
  try {
    const link = await db.query(
      `
        SELECT * FROM links WHERE "shortUrl"=$1;
      `, [shortUrl]);

    if (link.rowCount === 0) return res.status(404).send('URL não encontrada');

    await db.query(
      `
        UPDATE links SET "visitCount" = "visitCount" + 1 WHERE id=$1;
      `, [link.rows[0].id]);

    await db.query(
      `
        UPDATE users SET "visitCount" = "visitCount" + 1 WHERE id=$1;
      `, [link.rows[0].userId]);

    return res.redirect(`${link.rows[0].url}`);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

export async function deleteShortLink(req, res) {
  const { id } = req.params;
  const { userId } = res.locals.session;

  try {
    const link = await db.query(
      `
        SELECT * FROM links WHERE id=$1;
      `, [id]);

    if (link.rowCount === 0) return res.status(404).send('URL não encontrada');

    if (link.rows[0].userId !== Number(userId)) return res.sendStatus(401);

    const visitCount = link.rows[0].visitCount;

    await db.query(
      `
        UPDATE users SET "visitCount" = "visitCount" - $2, "linksCount" = "linksCount" - 1 WHERE id=$1;
      `, [link.rows[0].userId, visitCount]);

    await db.query(
      `
        DELETE FROM links WHERE id=$1
      `, [id]);

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}
