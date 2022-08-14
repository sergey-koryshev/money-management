export interface BaseApiResponse {
    status: number,
    message: string,
    data: any
}

export type ObjectKey = keyof typeof Object;