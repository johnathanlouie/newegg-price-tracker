FROM node:7-alpine

WORKDIR /app/
COPY ./batch/ /app/batch/
COPY ./domain/ /app/domain/
COPY ./web/ /app/web/
COPY ./package.json /app/package.json
RUN npm install

EXPOSE 3000
ENTRYPOINT [ "npm" ]
CMD [ "start" ]
