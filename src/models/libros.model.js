import fs from "fs";
import path from "path";
const file = path.resolve("src/db/libros.json");

export const getLibros = () => {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveLibros = (libros) => {
  fs.writeFileSync(file, JSON.stringify(libros, null, 2));
};

export const findLibroById = (id) => {
  const libros = getLibros();
  return libros.find(l => l.id === id);
};
