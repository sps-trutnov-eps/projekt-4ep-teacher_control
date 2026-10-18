FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
COPY src/TeacherControl.web/package.json src/TeacherControl.web/pnpm-lock.yaml src/TeacherControl.web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY src/TeacherControl.web/ ./
RUN pnpm build

FROM nginx:alpine AS runtime
COPY src/TeacherControl.web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
