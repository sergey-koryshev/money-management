import { AnnouncementType } from "./enums/announcement-type.enum"

export interface Announcement {
  id: number
  title?: string
  html: string
  type: AnnouncementType
  dismissible?: boolean
}
