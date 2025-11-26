import fs from "fs";
import path from "path";
const file = path.resolve("src/db/ventas.json");

export const getVentas = () => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
};

export const saveVenta = (venta) => {
  const arr = getVentas();
  arr.push(venta);
  fs.writeFileSync(file, JSON.stringify(arr, null, 2));
};
