# Add ability to reorder columns

## 1. Column drag & drop

> Reason: new feature

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | On Expenses page, drag a column header (e.g. `Name`) to another position | Header and its cells move; every cell value stays with its row; no data shift/misalignment |
| ✅ | TC-02 | After TC-01, reload the page | Custom column order is restored (saved under localStorage key `ExpensesTablePreferences`) |
| ✅ | TC-03 | Drop a header onto its own position | Nothing changes, no flicker, order unchanged |
| ✅ | TC-04	| Reorder columns, then click any sortable header | Sorting works on the reordered layout; indicator appears on the right column |

## 2. Sorting & its persistence

> Reason: related code was refactored

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | Click `Date` header repeatedly | Cycles asc → desc → none; direction indicator shown only on active column, removed from others |
| ✅ | TC-02 | Sort by any column (e.g. Category asc), reload page | Sorting is restored from `ExpensesTablePreferences` and applied to data |
| ✅ | TC-03 | Manually set legacy key `expenses-table-sorting` in localStorage to e.g. `{"column":"price","direction":"asc"}`, reload | Legacy key is ignored; default sorting (Date desc) applies |
| ✅ | TC-04 | Click the `Permitted persons` column header (no display name, disableSorting) | No sorting, no indicator |
| ✅ | TC-05 | Sort by `Name` | Alphabetical asc/desc works |
| ✅ | TC-06 | Sort by `Description` having empty values in some rows | Sorting works properly |
| ✅ | TC-07 | Sort by `Name`, then switch month / apply sticky filter so data reloads | Sorting is preserved across data refresh |

## 3. Price sorting semantics

> Reason: `priceComparer` changed

Preconditions:

1. Create expenses with: EUR 10 (Item 1), EUR 50 (Item 2), USD 20 (Item 3), USD 10 (Item 4), RUB 100 (Item 5), RUB 500 (Item 6). All expenses are created for `10/1/2023`.
2. Use exchange server of first version: `https://api.frankfurter.dev`

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | Sort by `Price` asc having default currency unset | Rows grouped by currency name first, then amount: EUR 50, EUR 100, RUB 100, RUB 500, USD 10, USD 20 |
| ✅ | TC-02 | Sort by `Price` desc having default currency unset | Expected order: USD 20, USD 10, RUB 500, RUB 100, EUR 100, EUR 50 |
| ✅ | TC-03 | Set default currency to `EUR` and sort by `Price` asc | Expected order: Item 4, Item 3, Item 2, Item 1, Item 5, Item 6 |
| ✅ | TC-03 | Set default currency to `EUR` and sort by `Price` desc | Expected order: Item 6, Item 5, Item 1, Item 2, Item 3, Item 4 |

## 4. Price cell value

> Reason: column `ExchangeResult` was removed and its content was moved to `Price` column

Preconditions:

1. Use exchange server of first version: `https://api.frankfurter.dev`
2. The following expenses created under: EUR 100 (Item 1, 4/21/2025), RSD 100 (Item 2, 4/21/2025), EUR 100 (Item3, 4/22/2025), USD 100 (Item 4, 4/22/2025)
3. Delete default currency

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | Open Expenses table | No exchanging related icons shown |
| ✅ | TC-02 | Set `USD` as default currency | No separate `ExchangeResult` column exists anymore |
| ✅ | TC-03 | Check `Item 1` value in `Price` column | Exchange icon shown right next to the price, colored yellow (warning) |
| ✅ | TC-04 | Check `Item 2` value in `Price` column | Exchange icon shown right next to the price, colored red (error) |
| ✅ | TC-05 | Check `Item 3` value in `Price` column | Exchange icon shown right next to the price, colored green (success) |
| ✅ | TC-06 | Check `Item 4` value in `Price` column | Exchange icon absent |

## 5. Price popover

> Reason: popovers from `ExchangeResult` and `Price` columns were merged.

Preconditions: same as in `4. Price cell value` section

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | Check popover for price in `Item 1` row | Contains exchange rate, exchange date and warning message |
| ✅ | TC-04 | Check popover for price in `Item 2` row | Contains error message |
| ✅ | TC-05 | Check popover for price in `Item 3` row | Contains original price, exchange rate and exchange date |
| ✅ | TC-06 | Check popover for price in `Item 4` row | Doesn't have popover |


## 6. Preferences robustness

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | Put invalid JSON into ExpensesTablePreferences, reload | Table loads with default order/sorting; console warning logged, no crash |
| ✅ | TC-02 | Manually set columnsOrder containing an unknown name (e.g. "exchangeResult") plus valid names, reload | Unknown entry ignored silently; valid columns keep their relative order |

## 7. Regression on refactored table

> Reason: table related code base was reworked

| Result | ID | Steps | Expected Result |
| - | - | - | - |
| ✅ | TC-01 | Open Expenses table | All columns render: avatars (conditional), Date, Category, Name, Description (stretched to fill width), Price; row floating menu (⋮) opens with Edit / Duplicate / Delete |
| ✅ | TC-02 | Row not editable by current user | Edit item disabled; Duplicate/Delete work |
| ✅ | TC-03 | Empty month / no data | "No data" row spans all columns; loading spinner shows while fetching |
| ✅ | TC-04 | Drag columns while avatars column is hidden (no permitted persons in view), then load a month where it appears | Avatars column reappears at its saved position; visible/all column order stays in sync (no drift) |
| ✅ | TC-05 | Add / edit / delete expenses | Changes reflects in the table |