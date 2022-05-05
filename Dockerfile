# syntax=docker/dockerfile:1

# Autor Krzysztof Zarębski

FROM node:latest

WORKDIR /app
COPY index.js package.json package-lock.json ./
RUN npm install --production

ENTRYPOINT [ "node" ]
CMD [ "index.js" ]
