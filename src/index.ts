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
import { notFound } from "./middleware/not-found.js";
import { error } from "./middleware/error.js";

import { logRequestMethod, logHostname } from "./middleware/logMiddleware.js";

import eventsRoutes from "./routes/events.route.js";
// import mailsRoutes from "@/routes/mails.route.js";
// import paymentsRoutes from "@/routes/payments.route.js";
// import ticketsRoutes from "@/routes/tickets.route.js";

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

app.get("/", (request: Request, response: Response) => {
  response.send("Hello World!!!!");
});

app.use("/api/v1/events", eventsRoutes);
// app.use("/api/v1/mail", mailsRoutes);
// app.use("/api/v1/payments", paymentsRoutes);
// app.use("/api/v1/payments", ticketsRoutes);

app.use(notFound);
app.use(error);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
