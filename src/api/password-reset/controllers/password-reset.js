"use strict";

module.exports = {
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest("กรุณาระบุ email");
    }

    const user = await strapi
      .service("api::password-reset.password-reset")
      .findUserByEmail(email);

    if (!user) {
      return ctx.send({
        message: "หาก email ของคุณมีอยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่าน",
      });
    }

    const { token } = await strapi
      .service("api::password-reset.password-reset")
      .createToken(email);

    try {
      await strapi
        .service("api::password-reset.password-reset")
        .sendResetEmail(email, token);
    } catch (err) {
      strapi.log.error("Failed to send reset email", err);
      return ctx.badRequest("ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่ภายหลัง");
    }

    return ctx.send({
      message: "หาก email ของคุณมีอยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่าน",
    });
  },

  async confirmPage(ctx) {
    const { token } = ctx.query;

    if (!token) {
      return ctx.badRequest("ไม่มี token");
    }

    const { valid, error } = await strapi
      .service("api::password-reset.password-reset")
      .validateToken(token);

    if (!valid) {
      return ctx.badRequest(error);
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>รีเซ็ตรหัสผ่าน</title></head>
      <body>
        <h2>ตั้งรหัสผ่านใหม่</h2>
        <form id="resetForm">
          <input type="hidden" name="token" value="${token}" />
          <label>รหัสผ่านใหม่:</label><br/>
          <input type="password" name="password" required minlength="6" /><br/><br/>
          <label>ยืนยันรหัสผ่าน:</label><br/>
          <input type="password" name="confirmPassword" required minlength="6" /><br/><br/>
          <button type="submit">รีเซ็ตรหัสผ่าน</button>
        </form>
        <div id="result" style="margin-top:10px;color:red;"></div>
        <script>
          document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData(e.target);
            const password = form.get('password');
            const confirmPassword = form.get('confirmPassword');
            const token = form.get('token');

            if (password !== confirmPassword) {
              document.getElementById('result').textContent = 'รหัสผ่านไม่ตรงกัน';
              return;
            }

            const res = await fetch('/api/password-reset/reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (res.ok) {
              document.getElementById('result').style.color = 'green';
              document.getElementById('result').textContent = data.message;
              e.target.reset();
            } else {
              document.getElementById('result').textContent = data.error || data.message || 'เกิดข้อผิดพลาด';
            }
          });
        </script>
      </body>
      </html>
    `;

    ctx.type = "html";
    ctx.send(html);
  },

  async resetPassword(ctx) {
    const { token, password } = ctx.request.body;

    if (!token || !password) {
      return ctx.badRequest("กรุณาระบุ token และ password");
    }

    if (password.length < 6) {
      return ctx.badRequest("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    }

    const passwordResetService = strapi.service("api::password-reset.password-reset");

    const { valid, record, error } = await passwordResetService.validateToken(token);

    if (!valid) {
      return ctx.badRequest(error);
    }

    const user = await passwordResetService.findUserByEmail(record.email);

    if (!user) {
      return ctx.badRequest("ไม่พบผู้ใช้ในระบบ");
    }

    await passwordResetService.setPasswordForUser(user.id, password);

    await passwordResetService.markAsUsed(record.id);

    return ctx.send({
      message: "รีเซ็ตรหัสผ่านสำเร็จ สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย",
    });
  },
};