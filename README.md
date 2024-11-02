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
- feature for converting prices uses real data

## Folder structure

Frontend is developing on `Angular 14` framework relying on `Bootstrap`. Backend is developing on `dotnet` platform using `.NET WebApi`.

Folders description:

- `build` - contains infrastructure scripts and tools
- `source\frontend` - contains source of the frontend part
- `source\backend` - contains source of the backend part

## Development

### Versioning

Semantic versioning is used in both frontend and backend. The following rules are applied for both projects:

- Major version is always `0` for `POC` and `MVP`
- Any pull request increases `patch` number
- Release process increases `minor` number and zeroes `patch` version

Changing version directly in code is not allowed. It happens automatically during `CI` based on label set in related `PR`.

### Contribution

All changes must be submitted via `PR` with all checks passed. Every `PR` must contains one label from the following:

- `breaking changes` - increments minor number
- `enchantment` - increments patch number
- `minor enchantment` - increments patch number
- `bug` - increments patch number
- `misc` - increments patch number

### Build

#### Frontend

To build frontend part, the following commands must be run:

```bash
cd source/frontend
npm ci
npm run build
```

Result build can be found under `source/frontend/dist/money-management`

#### Backend

To build `Backend`, the following commands must be run:

```bash
cd source/backend
dotnet build "Backend.sln" -c Debug
```

Result build can be found under `source/backend/Backend.WebApi/bin`

### Local Deployment

To correct work, you need to deploy each parts of the app.

#### Database

You need to have `PostgreSQL` run locally under `localhost:5432` or the URL must be changed in corresponding `appsettings` file. Currently backend uses `Postgres 16.2`.

To apply DB migrations, you need to run the following command: 

```bash
dotnet-ef database update --project Backend.Infrastructure --startup-project Backend.WebApi
```

#### Backend

To start backend, you can use the commands below:

```bash
cd source/backend
dotnet run Backend.sln -c Development
```

Backend server will be available under `http://localhost:5161`.

#### Frontend

Frontend can be started by the following commands:

```bash
cd source/frontend
npm run start
```

#### Docker

As alternative way to deploy the app, there are docker files for each part of the app, you can deploy them separately or  deploy whole project via `docker-compose`:

```
docker-compose --env-file ./source/mock-server/.env build
docker-compose --env-file ./source/mock-server/.env up
```
