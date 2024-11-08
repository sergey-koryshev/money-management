// needs to be sure that types are the same across namespaces
export namespace ExtendedEnumStab {
  export type getAll = <T extends ExtendedEnum>(this: T) => ReadonlyArray<ExtendedEnumItem<T>> ;
}

interface ExtendedEnum {
  getAll: ExtendedEnumStab.getAll
}

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type EnumNames<T> = { [K in NonFunctionPropertyNames<T>]: string}

export interface ExtendedEnumItem<T> {
  readonly name: string
  readonly value: T[NonFunctionPropertyNames<T>]
}

export function InjectEnumNames<T extends ExtendedEnum>(enumType: T, enumNames: EnumNames<T>) {
  enumType.getAll = ((): ExtendedEnumItem<T>[] => {
    const allKeys = Object.keys(enumType).filter((k) => !isNaN(Number(enumType[k as NonFunctionPropertyNames<T>])));

    return allKeys.map((k) => ({
      value: enumType[k as NonFunctionPropertyNames<T>],
      name: enumNames[k as NonFunctionPropertyNames<T>]
    } as ExtendedEnumItem<T>))
  }) as ExtendedEnumStab.getAll
}
