FROM node:16.16-alpine

RUN apk add -U tzdata

WORKDIR app

COPY package.json package.json
COPY yarn.lock yarn.lock

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