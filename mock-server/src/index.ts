import express, { Express } from 'express';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesRouter } from './routers/categories.router';
import { CurrenciesController } from './controllers/currencies.controller';
import { CurrenciesRouter as CurrenciesRouter } from './routers/currencies.router';
import { DataContext } from './data/data-context';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesRouter } from './routers/expenses.router';
import { LoginController } from './controllers/login.controller';
import { LoginRouter } from './routers/login.router';
import { UserConnectionRouter } from './routers/user-connections.router';
import { UserConnectionsController } from './controllers/user-connections.controller';
import { config } from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors';

config();

const server: Express = express();
const dataContext = new DataContext();

const currenciesRouter = new CurrenciesRouter(CurrenciesController, dataContext);
const expensesRouter = new ExpensesRouter(ExpensesController, dataContext);
const categoriesRouter = new CategoriesRouter(CategoriesController, dataContext);
const loginRouter = new LoginRouter(LoginController, dataContext);
const userConnectionsRouter = new UserConnectionRouter(UserConnectionsController, dataContext);

server.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}));
server.use(express.json());
server.use(express.text());
server.use(cookieParser());
server.disable('etag');

server.use('/currencies', currenciesRouter.router);
server.use('/expenses', expensesRouter.router);
server.use('/categories', categoriesRouter.router);
server.use('/auth', loginRouter.router);
server.use('/userConnections', userConnectionsRouter.router);

server.listen(process.env.PORT, () => {
  console.log(`⚡️ Server is running at http://localhost:${process.env.PORT}`);
});
