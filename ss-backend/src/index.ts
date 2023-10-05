import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initializeSocketServer } from "./SocketServer/index";

const app = express();
const whitelist = [
  "https://admin.socket.io/",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

if (process.env.HOSTNAME) {
  whitelist.push(process.env.HOSTNAME);
}

const corsOptions: cors.CorsOptions = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
  ],
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: (origin: any, callback: any) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  preflightContinue: false,
  credentials: true,
};

app.use(cors(corsOptions));

import path from "path";
app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

const server = createServer(app);
initializeSocketServer(server, corsOptions);

server.listen(process.env.PORT || 3000, () => {
  console.log("Server listening on port 3000");
});
