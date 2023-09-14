import express, { Express } from 'express';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesRouter } from './routers/categories.router';
import { Config } from './models/config.model';
import { CurrenciesController } from './controllers/currencies.controller';
import { CurrenciesRouter as CurrenciesRouter } from './routers/currencies.router';
import { DataContext } from './data/data-context';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesRouter } from './routers/expenses.router';
import cors from 'cors';
import { join } from 'path';
import { readFileSync } from 'fs';

const config: Config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'))
const server: Express = express();
const dataContext = new DataContext();

const currenciesRouter = new CurrenciesRouter(CurrenciesController, dataContext);
const expensesRouter = new ExpensesRouter(ExpensesController, dataContext);
const categoriesRouter = new CategoriesRouter(CategoriesController, dataContext);

server.use(cors());
server.use(express.json());
server.use(express.text());
server.disable('etag');

server.use('/currencies', currenciesRouter.router);
server.use('/expenses', expensesRouter.router);
server.use('/categories', categoriesRouter.router);

server.listen(config.port, () => {
  console.log(`⚡️ Server is running at http://localhost:${config.port}`);
});
