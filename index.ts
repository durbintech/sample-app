import express from "express";
import { createConnection } from "typeorm";
import hooks from "@durbintech/app-webhooks";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "accounts",
    entities: ["src/entity/**/*.ts"],
    synchronize: true,
    logging: false,
    dropSchema: true,
  });

  hooks.use("typeorm");

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

  app.get("/check-authenticated", hooks.authenticated(), (req, res) => {
    if (req.authenticated) {
      res.status(200).send(req.authenticated);
    } else {
      res.sendStatus(400);
    }
  });

  app.listen(4000, () => console.log("App listening on port 4000 ⚡"));
};

main().catch(console.error);
