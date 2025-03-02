FROM node:16-alpine AS build
ENV BASE_API_URL="/api"
WORKDIR /usr/local/app
COPY . .
RUN npm ci
RUN npm run build:dev

FROM nginx:latest
COPY /build/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/local/app/dist/money-management /usr/share/nginx/html
EXPOSE 80
