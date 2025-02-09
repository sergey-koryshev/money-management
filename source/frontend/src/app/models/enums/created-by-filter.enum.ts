import { EnumNames, ExtendedEnumStab, InjectEnumNames } from "./enums-base";

export { CreatedByFilterOptions }

enum CreatedByFilterOptions {
  Me = 0,
  NotMe = -1
}

const enumNames: EnumNames<typeof CreatedByFilterOptions> = {
  Me: 'Me',
  NotMe: 'Not Me'
}

InjectEnumNames(CreatedByFilterOptions, enumNames);

declare namespace CreatedByFilterOptions {
  export let getAll: ExtendedEnumStab.getAll
  export let get: ExtendedEnumStab.get
}
