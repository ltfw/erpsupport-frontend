# ---------- build stage ----------
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# satu perintah saja — npm install <pkg> sudah sekaligus install seluruh tree
RUN npm install flag-icons --legacy-peer-deps

COPY . .

RUN npm run build

# ---------- serve stage ----------
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]