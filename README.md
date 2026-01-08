# Digital Flea Market – Database-Driven Marketplace Platform
## Overview  
A full-stack web application designed to digitize the traditional flea market experience. The platform empowers vendors to manage inventory, schedule booth slots, and showcase products, while enabling customers to browse merchandise and plan visits efficiently.

##Problem Solved  
Traditional flea markets often lack digital infrastructure, making it hard for vendors to track sales or for customers to discover products. This project bridges that gap by offering a centralized, vendor-friendly digital marketplace.


##Setup & Requirements
This project uses Docker for containerized deployment and Node.js with npm for backend and frontend package management. To run the application locally, ensure you have Docker and npm installed. Start by launching the MySQL database using docker-compose up, then install dependencies in both the backend and frontend directories using npm install. The backend server is built with Node.js  + Express, and the frontend uses React 18 with Tailwind CSS. API testing is supported via Postman, and source control is managed through GitLab.
## Getting started

- Starting the mysql docker: `docker compose up --build`
- Starting the server: `npm run dev` for dev mode or `npm run start`

To make sure changes to the init.sql file are updated or to remove the current data in the db, make sure to remove the docker volume. You can use `docker compose down -v` to accomplish this.

To execute sql statements on the db after running the docker, use `docker exec -it mysql-container mysql -u root -p`.
Or to just execute bash commands on the container itself, use `docker exec -it mysql-container bash`.

Endpoints are available at localhost:3000/api/\[routing\]
(i.e. localhost:3000/api/vendor/4)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

