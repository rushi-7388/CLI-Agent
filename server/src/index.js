import express from 'express';
import dotenv from 'dotenv';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(
  cors({
    origin:"http://localhost:3000",
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
  })
);
// Forward all Better Auth API routes under /api/auth to the Better Auth handler.
// `toNodeHandler` returns a standard request handler that can be mounted with `app.use`.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.get("/api/me", async(req,res)=> {
  const session = await auth.api.getSession({
    headers:fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

app.get("/device" , async(req,res) => {
  const { user_code } = req.query
  res.redirect(`http://localhost:3000/device?user_code=${user_code}`);
})

app.get('/health', (req, res) => {
  res.send('OK');
})

app.get("/api/me",async(req,res) => {
  const session = await auth.api.getSession({
    headers:fromNodeHeaders(req.headers),
  })
  return res.json(session);
})
// Simple request logger to help debug Better Auth routing
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});


app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

