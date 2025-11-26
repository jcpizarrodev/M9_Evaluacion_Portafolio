import { getLibros, saveLibros, findLibroById } from "../models/libros.model.js";
import { saveVenta } from "../models/ventas.model.js";

/**
 * Lógica reutilizable para comprar un libro
 */
export const comprarLibroLogic = (id, cantidad, comprador) => {
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) return { ok: false, mensaje: "Libro no encontrado" };
  if (libro.cantidad_disponible < cantidad) return { ok: false, mensaje: "Stock insuficiente" };
  libro.cantidad_disponible -= cantidad;
  saveLibros(libros);
  saveVenta({ id, nombre: libro.nombre, cantidad, comprador, fecha: new Date().toISOString() });
  return { ok: true, mensaje: `Compra exitosa: ${cantidad} x "${libro.nombre}"` };
};

/**
 * Endpoint usado por la ruta POST /libros/:id/comprar
 * (exportado con este nombre para que las rutas lo importen)
 */
export const comprarLibro = (req, res) => {
  const id = Number(req.params.id);
  const cantidad = Number(req.body.cantidad) || 1;
  if (!id) return res.status(400).send("ID inválido");

  const comprador = req.session && req.session.user ? req.session.user.username : (req.body.comprador || "invitado");

  const result = comprarLibroLogic(id, cantidad, comprador);
  if (!result.ok) {
    if (req.headers.accept && req.headers.accept.includes("application/json")) return res.status(400).json({ mensaje: result.mensaje });
    req.flash("error", result.mensaje);
    return res.redirect("/libros");
  }

  if (req.headers.accept && req.headers.accept.includes("application/json")) return res.json({ mensaje: result.mensaje });
  req.flash("success", result.mensaje);
  return res.redirect("/libros");
};

/**
 * Listar libros (view) y API
 */
export const listarLibros = (req, res) => {
  const libros = getLibros();
  res.render("libros", { libros });
};

export const listarLibrosAPI = (req, res) => {
  const libros = getLibros();
  res.json(libros);
};

/**
 * Procesar carrito: usa comprarLibroLogic para cada item, limpia carrito y quita token de sesión
 */
export const procesarCarrito = (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    req.flash("error", "Carrito vacío");
    return res.redirect("/carrito");
  }
  const resultados = [];
  for (const item of cart) {
    const r = comprarLibroLogic(Number(item.id), Number(item.cantidad), req.session.user ? req.session.user.username : "invitado");
    resultados.push(r);
  }
  // limpiar carrito si al menos una compra fue exitosa
  if (resultados.some(r => r.ok)) req.session.cart = [];
  // quitar token después de compra (solicitud del usuario)
  if (req.session && req.session.token) delete req.session.token;
  req.flash("success", "Checkout procesado. Revisa los mensajes.");
  return res.render("carrito_result", { resultados });
};
