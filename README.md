# Money Management

Money Management is a web application which helps to manage personal finances. The project is in `POC` state

## Main Features of POC

- managing incomes/outcomes: adding, editing, deleting
- displaying incomes/outcomes for selected month
- specifying expenses with any currency
- ability to convert all expenses in one currency automatically

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

To serve the application locally you need to start `Mock Server` firstly

```bash
cd mock-server
npm run start
```

And then start `Money Management` application

```bash
npm run start
```

Application will be available under `http://localhost:4200/`
