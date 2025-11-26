import fs from "fs";
import path from "path";
const file = path.resolve("src/db/usuarios.json");

export const getUsuarios = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
};

export const saveUsuarios = (usuarios) => {
  fs.writeFileSync(file, JSON.stringify(usuarios, null, 2));
};

