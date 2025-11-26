import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import flash from "connect-flash";
import exphbs from "express-handlebars";

import authRoutes from "./src/routes/auth.routes.js";
import librosRoutes from "./src/routes/libros.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "pass_session_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));
app.use(flash());

app.engine("hbs", exphbs.engine({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "src", "views", "layouts"),
  helpers: {
    eq: (a, b) => a === b,
    gt: (a, b) => Number(a) > Number(b)
  }
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src", "views"));

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  next();
});

app.use("/", authRoutes);
app.use("/", librosRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`El Servidor esta escuchando http://localhost:${PORT}`);
});
