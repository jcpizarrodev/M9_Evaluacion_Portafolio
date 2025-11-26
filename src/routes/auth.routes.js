import { Router } from "express";
import { registerView, register, loginView, login, logout, apiLogin } from "../controllers/auth.controller.js";

const router = Router();

router.get("/register", registerView);
router.post("/register", register);

router.get("/login", loginView);
router.post("/login", login);

// API login for Postman
router.post("/api/login", apiLogin);

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/libros"));
});

// route to clear token from session (UI button)
router.post("/token/clear", (req, res) => {
  if (req.session) delete req.session.token;
  const back = req.get("Referer") || "/";
  res.redirect(back);
});

export default router;


