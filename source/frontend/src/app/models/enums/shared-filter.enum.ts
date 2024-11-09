import { EnumNames, ExtendedEnumStab, InjectEnumNames } from "./enums-base";

export { SharedFilterOptions }

enum SharedFilterOptions {
  No = 0,
  Yes = 1
}

const enumNames: EnumNames<typeof SharedFilterOptions> = {
  No: 'No',
  Yes: 'Yes'
}

InjectEnumNames(SharedFilterOptions, enumNames);

declare namespace SharedFilterOptions {
  export let getAll: ExtendedEnumStab.getAll
}
