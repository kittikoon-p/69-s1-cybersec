'use strict';

/**
 * student router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/students',
      handler: 'student.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
