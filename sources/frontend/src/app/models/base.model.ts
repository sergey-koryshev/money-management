export interface BaseApiResponse<T> {
    code: number,
    message: string,
    data: T
}

export type ObjectKey = keyof typeof Object;
