FROM node:13.2-alpine

RUN apk add -U tzdata

WORKDIR app

COPY package.json package.json

RUN yarn install --frozen

ADD bin bin
ADD src src
ADD settings settings

RUN mv settings /settings ; ln -s /settings settings

VOLUME /settings

ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

EXPOSE 3000

CMD ["yarn","start"]