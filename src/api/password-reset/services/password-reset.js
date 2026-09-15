"use strict";

const crypto = require("crypto");

const TOKEN_UID = "api::password-reset.password-reset-token";
const USER_UID = "plugin::users-permissions.user";

module.exports = {
  generateToken() {
    return crypto.randomBytes(32).toString("hex");
  },

  getExpiryDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now;
  },

  async createToken(email) {
    const token = this.generateToken();
    const expiresAt = this.getExpiryDate();

    const existingTokens = await strapi.entityService.findMany(TOKEN_UID, {
      filters: { email, used: false },
    });

    for (const t of existingTokens) {
      await strapi.entityService.update(TOKEN_UID, t.id, {
        data: { used: true },
      });
    }

    const record = await strapi.entityService.create(TOKEN_UID, {
      data: { token, email, used: false, expiresAt },
    });

    return { token: record.token, expiresAt: record.expiresAt };
  },

  async validateToken(token) {
    const records = await strapi.entityService.findMany(TOKEN_UID, {
      filters: { token, used: false },
    });

    const record = records[0];

    if (!record) {
      return { valid: false, error: "Token ไม่ถูกต้องหรือถูกใช้ไปแล้ว" };
    }

    if (new Date(record.expiresAt) < new Date()) {
      return { valid: false, error: "Token หมดอายุแล้ว" };
    }

    return { valid: true, record };
  },

  async markAsUsed(id) {
    await strapi.entityService.update(TOKEN_UID, id, {
      data: { used: true },
    });
  },

  setPasswordForUser(id, password) {
    return strapi
      .plugin("users-permissions")
      .service("user")
      .edit(id, { password });
  },

  async findUserByEmail(email) {
    return strapi.query(USER_UID).findOne({ where: { email } });
  },

  async sendResetEmail(email, token) {
    const baseUrl =
      process.env.APP_PUBLIC_URL ||
      `http://localhost:${process.env.APP_PORT || "9091"}`;
    const resetLink = `${baseUrl}/api/password-reset/confirm?token=${token}`;

    await strapi.plugin("email").service("email").send({
      to: email,
      subject: "Reset Password - 69 Cybersec",
      html: `
        <h2>คำขอรีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>ลิงก์จะหมดอายุใน 15 นาที</p>
        <p><strong>หมายเหตุ:</strong> Token สามารถใช้ได้เพียงครั้งเดียว</p>
        <hr>
        <p style="color: gray; font-size: 12px;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
      `,
    });
  },
};