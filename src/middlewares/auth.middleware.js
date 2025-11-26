import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "pass_jwt_secret";

export const verifyToken = (req, res, next) => {
  let token = null;
  // Token por API (header)
  if (req.headers?.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Token por body / query / session
  token = token || req.body.token || req.query.token || req.session?.token;
  // ➤ Si NO hay token pero SÍ hay sesión normal → permitir
  if (!token && req.session?.user) {
    return next();
  }
  // Si no hay token y tampoco sesión → error
  if (!token) {
    req.flash("error", "Se requiere login para esta acción");
    return res.redirect("/login");
  }
  // Validación de token
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    req.flash("error", "Token inválido o expirado");
    return res.redirect("/login");
  }
};

