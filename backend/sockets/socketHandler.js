const logger = require("../utils/logger");

module.exports = (io) => {
  io.on("connection", (socket) => {
    logger.info(`New client connected via socket: ${socket.id}`);

    // Join a room based on parking location or user role if needed
    socket.on("join_location", (locationId) => {
      socket.join(`location_${locationId}`);
      logger.info(`Socket ${socket.id} joined location_${locationId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};
