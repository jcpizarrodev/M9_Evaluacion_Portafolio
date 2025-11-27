import { Router } from "express";
import { listarLibros, listarLibrosAPI, comprarLibro, procesarCarrito } from "../controllers/libros.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getLibros } from "../models/libros.model.js";

const router = Router();

router.get("/", (req, res) => res.redirect("/libros"));

router.get("/libros", listarLibros);
router.get("/api/libros", listarLibrosAPI);
router.get("/api/libros/:id", (req,res) => {
  const id = Number(req.params.id);
  const libro = getLibros().find(l => l.id === id);
  if (!libro) return res.status(404).json({ error: "No encontrado" });
  res.json(libro);
});

router.post("/libros/:id/comprar", (req, res, next) => {
  if (req.session && req.session.token && !req.body.token) req.body.token = req.session.token;
  next();
}, verifyToken, comprarLibro);

router.post("/carrito/add", (req, res) => {
  const { id, cantidad } = req.body;
  const qty = Number(cantidad || 1);
  const libros = getLibros();
  const libro = libros.find(l => l.id === Number(id));
  if (!libro) {
    req.flash("error", "Libro no encontrado");
    return res.redirect("/libros");
  }

  if (libro.cantidad_disponible <= 0) {
    req.flash("error", "No hay stock disponible");
    return res.redirect("/libros");
  }

  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find(i => i.id === Number(id));
  const currentInCart = existing ? Number(existing.cantidad) : 0;
  const availableToAdd = libro.cantidad_disponible - currentInCart;

  if (availableToAdd <= 0) {
    req.flash("error", "Ya tienes la cantidad máxima disponible en el carrito");
    return res.redirect("/libros");
  }

  if (qty > availableToAdd) {
    req.flash("error", `Solo quedan ${availableToAdd} unidades disponibles`);
    return res.redirect("/libros");
  }

  if (existing) existing.cantidad = currentInCart + qty;
  else req.session.cart.push({ id: Number(id), cantidad: qty });

  req.flash("success", "Artículo agregado al carrito");
  res.redirect("/libros");
});

router.get("/carrito", (req, res) => {
  const libros = getLibros();
  const cart = (req.session.cart || []).map(item => {
    const libro = libros.find(l => l.id === item.id);
    return {
      id: item.id,
      cantidad: Number(item.cantidad),
      nombre: libro ? libro.nombre : "No encontrado",
      precio: libro ? Number(libro.precio) : 0,
      subtotal: libro ? Number(libro.precio) * Number(item.cantidad) : 0,
      disponible: libro ? Number(libro.cantidad_disponible) : 0
    };
  });

  const total = cart.reduce((s, it) => s + it.subtotal, 0);

  res.render("carrito", { cart, total });
});

router.get("/api/carrito", (req, res) => {
  const libros = getLibros();
  const cart = (req.session.cart || []).map(item => {
    const libro = libros.find(l => l.id === item.id);
    return {
      id: item.id,
      cantidad: Number(item.cantidad),
      nombre: libro ? libro.nombre : "No encontrado",
      precio: libro ? Number(libro.precio) : 0,
      subtotal: libro ? Number(libro.precio) * Number(item.cantidad) : 0,
      disponible: libro ? Number(libro.cantidad_disponible) : 0
    };
  });

  const total = cart.reduce((s, it) => s + it.subtotal, 0);
  res.json({ cart, total });
});

router.post("/carrito/checkout", (req, res, next) => {
  if (req.session && req.session.token && !req.body.token) req.body.token = req.session.token;
  next();
}, verifyToken, procesarCarrito);

router.post("/carrito/add-and-checkout", (req, res) => {
  const { id, cantidad } = req.body;
  const qty = Number(cantidad || 1);
  const libros = getLibros();
  const libro = libros.find(l => l.id === Number(id));

  if (!libro) {
    req.flash("error", "Libro no encontrado");
    return res.redirect("/libros");
  }

  if (libro.cantidad_disponible <= 0) {
    req.flash("error", "No hay stock disponible");
    return res.redirect("/libros");
  }

  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find(i => i.id === Number(id));

  if (existing) existing.cantidad += qty;
  else req.session.cart.push({ id: Number(id), cantidad: qty });

  return res.redirect("/carrito");
});


export default router;
