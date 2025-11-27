import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "pass_jwt_secret";

export const verifyToken = (req, res, next) => {
  let token = null;

  if (req.headers?.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
 
  token = token || req.body.token || req.query.token || req.session?.token;

  if (!token && req.session?.user) {
    return next();
  }

  if (!token) {
    req.flash("error", "Se requiere login para esta acción");
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    req.flash("error", "Token inválido o expirado");
    return res.redirect("/login");
  }
};

