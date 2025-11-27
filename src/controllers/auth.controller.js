import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUsuarios, saveUsuarios } from "../models/usuarios.model.js";

const SECRET = process.env.JWT_SECRET || "pass_jwt_secret";

export const registerView = (req, res) => {
  res.render("register");
};

export const register = (req, res) => {
  const { username, password } = req.body;
  const usuarios = getUsuarios();

  if (usuarios.find(u => u.username === username)) {
    req.flash("error", "Usuario ya existe");
    return res.redirect("/register");
  }

  const hash = bcrypt.hashSync(password, 10);

  usuarios.push({
    username,
    password: hash,
    role: username === "admin" ? "admin" : "user"
  });

  saveUsuarios(usuarios);

  req.flash("success", "Registro exitoso. Ahora puede ingresar.");
  return res.redirect("/login");
};

export const loginView = (req, res) => {
  res.render("login");
};

export const login = (req, res) => {
  const { username, password } = req.body;

  const usuarios = getUsuarios();
  const user = usuarios.find(u => u.username === username);

  if (!user) {
    req.flash("error", "Credenciales incorrectas");
    return res.redirect("/login");
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    req.flash("error", "Credenciales incorrectas");
    return res.redirect("/login");
  }

  req.session.user = {
    username: user.username,
    role: user.role
  };

  req.session.token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { expiresIn: "2h" }
  );

  req.flash("success", `Bienvenido ${user.username}`);
  res.redirect("/");
};

export const apiLogin = (req, res) => {
  const { username, password } = req.body;

  const usuarios = getUsuarios();
  const user = usuarios.find(u => u.username === username);

  if (!user)
    return res.status(401).json({ error: "Usuario no encontrado" });

  const valid = bcrypt.compareSync(password, user.password);

  if (!valid)
    return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign(
    { username, role: user.role },
    SECRET,
    { expiresIn: "2h" }
  );

  return res.json({ token });
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Error al destruir sesión:", err);
    }
    res.redirect("/libros");
  });
};