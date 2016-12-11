FROM node:6.9.2-alpine

WORKDIR app

COPY package.json package.json

RUN npm install --prod

ADD bin bin
ADD config config
ADD helpers helpers
ADD public public
ADD routes routes
ADD views views

COPY app.js app.js

EXPOSE 3000

CMD ["bin/www"]
