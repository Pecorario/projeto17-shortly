import joi from 'joi';

export const linkSchema = joi.object({
  url: joi.string().uri({ scheme: ['http', 'https'] }).required(),
});