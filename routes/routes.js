const express = require("express");
const router = new express.Router();
const controller = require("../controller/controller");

router.route("/api/register").post(controller.register_user);

router.route("/api/login").post(controller.login_user);

router.route("/api/logout").post(controller.logout);

router.route("/api/password-reset-link").post(controller.password_reset_link);

router
  .route("/api/password-reset/:userId/:token")
  .post(controller.password_reset);

module.exports = router;
