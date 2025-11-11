# DB Market Project

## Getting started

- Starting the mysql docker: `docker compose up --build`
- Starting the server: `npm run dev` for dev mode or `npm run start`

To make sure changes to the init.sql file are updated or to remove the current data in the db, make sure to remove the docker volume. You can use `docker compose down -v` to accomplish this.