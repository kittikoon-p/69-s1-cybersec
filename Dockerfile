FROM kittikoon2/strapi5
RUN npm install @strapi/provider-email-nodemailer@^5.52.2
COPY config/plugins.js /opt/app/config/plugins.js
