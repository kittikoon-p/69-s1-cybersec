FROM prawee/strapi
RUN npm install @strapi/provider-email-nodemailer@4.16.2
COPY src/ /opt/app/src/
COPY config/plugins.js /opt/app/config/plugins.js
