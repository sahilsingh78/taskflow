const requireRole = (role) => {
  return (req, res, next) => {
    try {
      // Check if user exists (set by authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found",
        });
      }

      //Check if role matches
      if (req.user.role !== role) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Access denied",
        });
      }

      // Allow access
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};

module.exports = requireRole;