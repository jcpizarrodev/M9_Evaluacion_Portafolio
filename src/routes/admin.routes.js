import { Router } from "express";
import { dashboard, newForm, createLibro, editForm, updateLibro, deleteLibro } from "../controllers/admin.controller.js";

const router = Router();

router.use((req,res,next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") return next();
  req.flash("error","Acceso admin requerido");
  return res.redirect("/login");
});

router.get("/", dashboard);
router.get("/new", newForm);
router.post("/create", createLibro);
router.get("/edit/:id", editForm);
router.post("/update/:id", updateLibro);
router.post("/delete/:id", deleteLibro);

export default router;
