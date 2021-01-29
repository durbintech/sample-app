import hooks from "@durbintech/app-webhooks";
import express from "express";
import path from "path";
import { CLIENT_ID, CLIENT_SECRET } from "./config";

const main = async () => {
  hooks.use("typeorm", {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "app",
    logging: false,
    synchronize: false,
  });

  const app = express();

  app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
  });

  hooks.use("company");

  hooks.set("roles", [
    { name: "driver", description: "For those riding the wheels" },
    { name: "manager", description: "Relaxing on the chair" },
  ]);

  hooks.set("express-app", app);
  hooks.set("billable-units", [
    {
      name: "unit-1",
      description: "Unit 🔥",
    },
    {
      name: "unit-2",
      description: "Unit ✅",
    },
  ]);

  hooks.set("client-id", CLIENT_ID);
  hooks.set("client-secret", CLIENT_SECRET);

  await hooks.arm();

  app.get("/hello", (_, res) => {
    res.send("Hello world");
  });

  app.get("/check-authenticated", hooks.authenticated(), async (req, res) => {
    if (req.authenticated) {
      const can = await hooks.addTransaction(req.authenticated, "unit-2", 1);
      res.status(200).json({ as: req.authenticated, can });
    } else {
      res.sendStatus(400);
    }
  });

  app.get(
    "/transact",
    hooks.authenticated(),
    hooks.limitOrUse("unit-1", 1),
    (req, res) => {
      if (req.authenticated) {
        res.status(200).json({ as: req.authenticated });
      } else {
        res.sendStatus(400);
      }
    }
  );

  app.get(
    "/empl-auth-check",
    hooks.authenticated("driver"),
    async (req, res) => {
      if (req.authenticated) {
        // this should use the company data
        const can = await hooks.addTransaction(req.authenticated, "unit-2", 1);
        res.status(200).json({
          as: req.authenticated,
          can,
          employee_id: req.employee_id,
          roles: req.roles,
        });
      } else {
        res.sendStatus(400);
      }
    }
  );

  app.listen(5000, "0.0.0.0", () =>
    console.log(`App listening on port 5000 ⚡`)
  );
};

main().catch(console.error);
