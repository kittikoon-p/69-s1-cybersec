"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/password-reset/forgot",
      handler: "password-reset.forgotPassword",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/password-reset/confirm",
      handler: "password-reset.confirmPage",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/password-reset/reset",
      handler: "password-reset.resetPassword",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};