import crypto from 'crypto';

const UID = 'api::booking.booking' as any;

const getKey = (): Buffer => {
  const key = process.env.AES_KEY;
  if (!key) throw new Error('AES_KEY is not set');
  return Buffer.from(key, 'base64');
};

const encrypt = (plain: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decrypt = (payload: string): string => {
  const [ivB64, tagB64, dataB64] = payload.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
};

const computeHash = (fields: { customer_name: string; phone: string; national_id: string; car_plate: string; booking_date: string }): string => {
  const raw = [fields.customer_name, fields.phone, fields.national_id, fields.car_plate, fields.booking_date].join('|');
  return crypto.createHash('md5').update(raw).digest('hex');
};

export default () => ({
  async create(data: any) {
    const bookingDate = new Date(data.booking_date).toISOString();
    const integrity_hash = computeHash({
      customer_name: data.customer_name,
      phone: data.phone,
      national_id: data.national_id,
      car_plate: data.car_plate,
      booking_date: bookingDate,
    });
    return strapi.entityService.create(UID, {
      data: {
        customer_name: data.customer_name,
        phone: encrypt(data.phone),
        national_id: encrypt(data.national_id),
        car_plate: data.car_plate,
        booking_date: bookingDate,
        integrity_hash,
      },
    });
  },

  async findAll() {
    const rows: any = await strapi.entityService.findMany(UID, { sort: { id: 'asc' } });
    return rows.map((row: any) => ({
      id: row.id,
      customer_name: row.customer_name,
      phone: decrypt(row.phone),
      national_id: decrypt(row.national_id),
      car_plate: row.car_plate,
      booking_date: row.booking_date,
      integrity_hash: row.integrity_hash,
    }));
  },

  async verifyIntegrity(id: number) {
    const row: any = await strapi.entityService.findOne(UID, id);
    if (!row) return null;
    const recomputed = computeHash({
      customer_name: row.customer_name,
      phone: decrypt(row.phone),
      national_id: decrypt(row.national_id),
      car_plate: row.car_plate,
      booking_date: new Date(row.booking_date).toISOString(),
    });
    return {
      id: row.id,
      stored_hash: row.integrity_hash,
      recomputed_hash: recomputed,
      status: recomputed === row.integrity_hash ? 'OK - ไม่มีการแก้ไข' : 'TAMPERED - ข้อมูลถูกแก้ไข!',
    };
  },
});
