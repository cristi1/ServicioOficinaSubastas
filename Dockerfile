FROM node:10.0.0 
COPY Servicio/api api/
WORKDIR /api
RUN apt-get update -y
RUN apt-get install nano -y
# RUN apt-get install inetutils-ping -y
RUN apt-get install unzip -y
RUN npm install gulp -g
RUN npm install
CMD ["npm", "start"]
