FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

# Clean npm cache and force esbuild to rebuild
RUN npm install --force

# Set up environment variable to prevent version mismatch
ENV ESBUILD_BINARY_PATH=/app/node_modules/esbuild/bin/esbuild

COPY . .

# Force rebuild esbuild with expected version
RUN rm -rf node_modules/esbuild/bin/* && npm rebuild esbuild && npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
