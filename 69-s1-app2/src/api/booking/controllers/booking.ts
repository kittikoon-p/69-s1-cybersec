export default {
  async find(ctx: any) {
    const rows = await strapi.service('api::booking.booking').findAll();
    ctx.send({ data: rows });
  },

  async create(ctx: any) {
    const { customer_name, phone, national_id, car_plate, booking_date } = ctx.request.body;
    if (!customer_name || !phone || !national_id || !car_plate || !booking_date) {
      return ctx.badRequest('กรุณาระบุ customer_name, phone, national_id, car_plate, booking_date');
    }
    const row = await strapi.service('api::booking.booking').create({ customer_name, phone, national_id, car_plate, booking_date });
    ctx.send({ data: row });
  },

  async integrityHash(ctx: any) {
    const id = Number(ctx.params.id);
    const result = await strapi.service('api::booking.booking').verifyIntegrity(id);
    if (!result) return ctx.notFound('ไม่พบข้อมูล');
    ctx.send({ data: result });
  },
};
