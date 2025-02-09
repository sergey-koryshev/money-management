import { EnumNames, ExtendedEnumStab, InjectEnumNames } from "./enums-base";

export { ExpensesStickyFilterType }

enum ExpensesStickyFilterType {
  createdBy = 'createdBy',
  shared = 'shared'
}

const enumNames: EnumNames<typeof ExpensesStickyFilterType> = {
  createdBy: 'Created By',
  shared: 'Shared'
}

InjectEnumNames(ExpensesStickyFilterType, enumNames);

declare namespace ExpensesStickyFilterType {
  export let getAll: ExtendedEnumStab.getAll;
  export let get: ExtendedEnumStab.get;
}
