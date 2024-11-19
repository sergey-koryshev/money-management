import { Currency } from "./currency.model";
import { Failure } from "./failure.model";

export interface Price {
    amount: number
    currency: Currency
    exchangeRate?: number
    exchangeRateDate?: Date
    exchangeFailure?: Failure
}
