import { getLibros, saveLibros } from "../models/libros.model.js";
import { getVentas } from "../models/ventas.model.js";

export const dashboard = (req, res) => {
  const libros = getLibros();
  const ventas = getVentas();
  const totalLibros = libros.length;
  const totalVentas = ventas.length;
  const sinStock = libros.filter(l => l.cantidad_disponible === 0).length;
  res.render("admin/dashboard", { totalLibros, totalVentas, sinStock, libros, ventas });
};

export const newForm = (req, res) => {
  res.render("admin/new");
};

export const createLibro = (req, res) => {
  const libros = getLibros();
  const { nombre, precio, cantidad } = req.body;
  const id = libros.length ? libros[libros.length - 1].id + 1 : 1;
  libros.push({ id, nombre, precio: Number(precio), cantidad_disponible: Number(cantidad) });
  saveLibros(libros);
  req.flash("success", "Libro creado exitósamente");
  res.redirect("/admin");
};

export const editForm = (req, res) => {
  const id = Number(req.params.id);
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) {
    req.flash("error", "No encontrado");
    return res.redirect("/admin");
  }
  res.render("admin/edit", { libro });
};

export const updateLibro = (req, res) => {
  const id = Number(req.params.id);
  const libros = getLibros();
  const libro = libros.find(l => l.id === id);
  if (!libro) {
    req.flash("error", "No encontrado");
    return res.redirect("/admin");
  }
  libro.nombre = req.body.nombre;
  libro.precio = Number(req.body.precio);
  libro.cantidad_disponible = Number(req.body.cantidad);
  saveLibros(libros);
  req.flash("success", "Libro actualizado exitósamente");
  res.redirect("/admin");
};

export const deleteLibro = (req, res) => {
  const id = Number(req.params.id);
  let libros = getLibros();
  libros = libros.filter(l => l.id !== id);
  saveLibros(libros);
  req.flash("success", "Libro eliminado exitósamente");
  res.redirect("/admin");
};
