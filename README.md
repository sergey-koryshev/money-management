# Money Management

Money Management is a web application which helps to manage personal finances. The project is in `MVP` state

## Main Features of POC

- managing expenses: add, edit, delete
- displaying expenses for selected month
- support for different currencies
- ability to convert all expenses' currencies to one currency
- displaying total amount of spent money for selected month
- searching through expenses
- connecting with another users
- sharing expenses with connected users

## Main features of MVP

- all data is stored in DB
- frontend interacts with real backend, mock-server is not used anymore

## Folder structure

Frontend is developing on `Angular 14` framework relying on `Bootstrap`. To emulate backend, simple server based on `Express.js` is used. Real backend is developing on `dotnet` platform using `.NET WebApi`.

Folders description:

- `build` - contains infrastructure scripts and tools
- `source\mock-server` - contains source of the mock server
- `source\frontend` - contains source of the frontend part
- `source\backend` - contains source of the backend part

## Development

### Versioning

Semantic versioning is used in both `MM` application and `Mock Server`. Follow rules are applied for both projects:

- Major version is always `0` for `POC` and `MVP`
- Any non-infrastructure pull request increases `patch` number
- Release process increases `minor` number and zeroes `patch` version

Changing version directly in code is not allowed. It happens automatically during `CI` based on label set in related `PR`.

### Contribution

All changes must be submitted via `PR` with all checks passed. Every `PR` must contains at least one label from following:

- `breaking changes` - increments minor number
- `enchantment` - increments patch number
- `minor enchantment` - increments patch number
- `bug` - increments patch number
- `misc` - increments patch number

### Build

#### Frontend

To build frontend part, follow commands must be run:

```bash
cd source/frontend
npm ci
npm run build
```

Result build can be found under `source/frontend/dist/money-management`

#### Mock Server

To build `Mock Server`, follow commands must be run:

```bash
cd source/mock-server
npm ci
npm run build
```

Result build can be found under `source/mock-server/build`

#### Backend

To build `Backend`, follow commands must be run:

```bash
cd source/backend
dotnet build "Backend.sln" -c Debug
```

Result build can be found under `source/backend/Backend.WebApi/bin`

### Local Deployment

Since the project separated to three parts, to correct work, you need to deploy each of these parts.

First of all, you need to deploy `Mock Server` and `Backend`.

Make sure there is `.env` file in `Mock server`'s folder or your environment has following variables set:

```
ORIGIN=http://localhost:4200
PORT=3000
AUTH_TOKEN_SECRET=...
```

Then you can start mock server by following commands:

```bash
cd source/mock-server
npm run start
```

And start backend by commands below:

```bash
cd source/backend
dotnet run Backend.sln -c Development
```

They will be available under http://localhost:4200 and http://localhost:5161 respectfully.

Once they are started, you can start `Frontend` by the following commands:

```bash
cd source/frontend
npm run start
```

It will be available under `http://localhost:4200/`

#### Database

You need to have deployed DB locally. Currently backend uses `Postgres 16.2`. To apply DB migrations, you nee to run the following command: 

```bash
dotnet-ef database update --project Backend.Infrastructure --startup-project Backend.WebApi
```

#### Docker

As alternative, you can use docker to deploy the project, following the commands below:

Mock Server:

```
docker build -t mock-server .
docker run -p 3000:3000 --env-file .env mock-server:latest
```

Backend:

```
docker build -t backend .
docker run -p 5161:80 backend:latest
```

Frontend:

```
docker build -t frontend .
docker run frontend:latest
```

Or just deploy whole project via `docker-compose`:

```
docker-compose --env-file ./source/mock-server/.env build
docker-compose --env-file ./source/mock-server/.env up
```
