export default {
  routes: [
    {
      method: 'GET',
      path: '/bookings',
      handler: 'booking.find',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/bookings',
      handler: 'booking.create',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/bookings/:id/integrity-hash',
      handler: 'booking.integrityHash',
      config: { auth: false },
    },
  ],
};
