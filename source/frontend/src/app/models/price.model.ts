import { Currency } from "./currency.model";
import { Failure } from "./failure.model";

export interface Price {
    amount: number
    currency: Currency
    exchangeRateDate?: Date
    exchangeFailure?: Failure
}
