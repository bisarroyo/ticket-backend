import "dotenv/config";

import express, {
  type Request,
  type Response,
  urlencoded,
  json,
} from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

// custom middlewares
import { notFound } from "./middleware/not-found.ts";
import { error } from "./middleware/error.ts";

import { logRequestMethod, logHostname } from "./middleware/logMiddleware.ts";
// import usersRoutes from './routes/auth.js'
// import mailRoutes from './routes/mail.js'
// import clientRoutes from './routes/clients.js'

const app = express();
const port = process.env.PORT;

app.use(urlencoded({ extended: true }));
app.use(json());

// handle cors
app.use(cors());

app.use(logRequestMethod);
app.use(logHostname);

// handle auth
app.use(clerkMiddleware());

app.use(notFound);
app.use(error);

app.get("/", (request: Request, response: Response) => {
  response.send("Hello World!!!!");
});

// app.use('/api/v1/auth', usersRoutes)
// app.use('/api/v1/mail', mailRoutes)
// app.use('/api/v1/clients', clientRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
