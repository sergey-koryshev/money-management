export interface BaseApiResponse<T> {
    status: number,
    message: string,
    data: T
}

export type ObjectKey = keyof typeof Object;