FROM node:18-alpine as build
WORKDIR /usr/local/app
COPY . .
RUN npm ci
RUN npm run build

FROM nginx:latest
COPY --from=build /usr/local/app/dist/money-management /usr/share/nginx/html
EXPOSE 80
