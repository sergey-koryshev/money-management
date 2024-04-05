# Money Management

Money Management is a web application which helps to manage personal finances. The project is in `POC` state

## Main Features of POC

- managing expenses: add, edit, delete
- displaying expenses for selected month
- support for different currencies
- ability to convert all expenses' currencies to one currency
- displaying total amount of spent money for selected month
- searching through expenses
- connecting with another users
- sharing expenses with connected users

## POC structure

Frontend of `POC` version is developed on `Angular 14` framework relying on `Bootstrap`. To emulate backend, simple server based on `Express.js` is used.

Folders description:

- `build` - contains infrastructure scripts and tools
- `mock-server` - contains source of mock server
- `src` - contains source of the `Money Management` web-application

## Development

### Versioning

Semantic versioning is used in both `MM` application and `Mock Server`. Follow rules are applied for both projects:

- Major version is always `0` for `POC`
- Any non-infrastructure pull request increases `patch` number
- Release process increases `minor` number and zeroes `patch` version

Changing version directly in code is not allowed. It happens automatically during `CI` based on label set in related `PR`.

### Contribution

All changes must be submitted via `PR` with all checks passed. Every `PR` must contains at least one label from following:

- `breaking changes` - increments major number
- `enchantment` - increments patch number
- `minor enchantment` - increments patch number
- `bug` - increments patch number
- `misc` - increments patch number

### Build

#### Money Management app

To build `Money Management` app, follow commands must be run:

```bash
npm ci
npm run build
```

Result build can be found under `dist/money-management`

#### Mock Server

To build `Mock Server`, follow commands must be run:

```bash
cd mock-server
npm ci
npm run build
```

Result build can be found under `mock-server/build`

### Local Deployment

To serve the application locally you need to start `Mock Server` firstly.
Make sure there is `.env` file in mock-server's folder or your environment has following values:

```
ORIGIN=http://localhost:4200
PORT=3000
AUTH_TOKEN_SECRET=...
```

Then you can start mock server by following (in mock-server folder):

```bash
npm run start
```

And after that you can start `Money Management` application by this command (in root folder):

```bash
npm run start
```

Application will be available under `http://localhost:4200/`

#### Docker

Dockerfiles are available for both mock-server and angular application. You can run them separately:

```
docker build -t money-management .
docker run money-management:latest
```

```
docker build -t mock-server .
docker run --env-file .env mock-server:latest
```

Or as alternative, you can run whole project via `docker-compose`:

```
docker-compose --env-file ./mock-server/.env build
docker-compose --env-file ./mock-server/.env up
```
