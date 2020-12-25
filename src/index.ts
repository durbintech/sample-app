import express from "express";
import hooks from "@durbintech/app-webhooks";

import {
  APP_PORT,
  DATABASE_HOST,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} from "./config";

const main = async () => {
  hooks.use("typeorm", {
    type: "postgres",
    host: DATABASE_HOST,
    port: 5432,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: ["src/entity/**/*.ts"],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  const app = express();

  hooks.set("express-app", app);
  hooks.set("billable-units", [
    {
      name: "test-unit",
      description: "An unit born to be tested",
    },
  ]);

  hooks.set("client-id", "CLIENT_ID");
  hooks.set("client-secret", "CLIENT_SECRET");

  await hooks.arm();

  app.get("/hello", (_, res) => {
    res.send("Hello world");
  });

  app.get("/check-authenticated", hooks.authenticated(), (req, res) => {
    if (req.authenticated) {
      const can = hooks.addTransaction(req.authenticated, "test-unit", 10);
      res.status(200).json({ as: req.authenticated, can });
    } else {
      res.sendStatus(400);
    }
  });

  app.get(
    "/transact",
    hooks.authenticated(),
    hooks.limitOrUse("test-unit", 5),
    (req, res) => {
      if (req.authenticated) {
        res.status(200).json({ as: req.authenticated });
      } else {
        res.sendStatus(400);
      }
    }
  );

  app.listen(APP_PORT, "0.0.0.0", () =>
    console.log(`App listening on port ${APP_PORT} ⚡`)
  );
};

main().catch(console.error);
