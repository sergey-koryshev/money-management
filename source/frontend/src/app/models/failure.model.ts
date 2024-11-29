import { FailureType } from "./enums/failure-type.enum"

export interface Failure {
  type: FailureType
  message: string
}
