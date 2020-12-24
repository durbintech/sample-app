import express from "express";
import hooks from "@durbintech/app-webhooks";

const main = async () => {
  hooks.use("typeorm", {
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

  app.listen(4000, () => console.log("App listening on port 4000 ⚡"));
};

main().catch(console.error);
