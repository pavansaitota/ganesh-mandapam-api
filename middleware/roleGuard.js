// middleware/roleGuard.js

export const allowRoles = (...allowed) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const ok = userRoles.some(r => allowed.includes(r));

    if (!ok) {
      return res.status(403).json({
        message: "Access denied",
        required: allowed,
        user_roles: userRoles
      });
    }

    next();
  };
};
