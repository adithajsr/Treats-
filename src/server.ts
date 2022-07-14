import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { authRegisterV1 } from './auth';
import { userProfileV1 } from './users';
import { clearV1 } from './other';

import cors from 'cors';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

app.post('/auth/register/v2', (req, res) => {
  // eslint-disable-next-line
  const { email, password, nameFirst, nameLast} = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.get('/user/profile/v2', (req, res) => {
  const token = req.query.token as string;
  const uId = Number(req.query.uId) as number;
  res.json(userProfileV1(token, uId));
});

app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
});
