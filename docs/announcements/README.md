# Announcements

Announcements allow the product team to show messages to users without changing application code for every message. The backend stores announcement content as HTML, and the frontend renders it either as a popup modal or as a top-of-page alert.

## Announcement types

| Type | TypeId | UI surface | Typical use | Dismissal |
| --- | ---: | --- | --- | --- |
| `PopUp` | `1` | Modal dialog opened after user load | Release notes, one-time important messages | Automatically dismissed for the user after the modal is closed |
| `Alert` | `2` | Warning banner at the top of the app | Ongoing warnings, maintenance notices, operational alerts | Dismissible unless explicitly marked non-dismissible |

Only one active announcement of each type can exist at a time. This is enforced by a partial unique index on `Announcements(TypeId, Active) WHERE Active = TRUE`.

## Data model

### `AnnouncementTypes`

Seeded lookup table:

| Id | Name |
| ---: | --- |
| `1` | `PopUp` |
| `2` | `Alert` |

### `Announcements`

| Column | Type | Required | Purpose |
| --- | --- | ---: | --- |
| `Id` | `integer` | Yes | Primary key |
| `Title` | `text` | No | Operational title. The current UI does not render it separately, but it is useful for identification and future admin tooling |
| `HTML` | `text` | Yes | HTML fragment rendered by the frontend |
| `TimeStamp` | `timestamp with time zone` | Yes | Ordering timestamp. Newest announcement of a type is returned first |
| `TypeId` | `integer` | Yes | Foreign key to `AnnouncementTypes.Id` |
| `Dismissible` | `boolean` | No | Dismissal flag. Only enforced for `Alert` announcements |
| `Active` | `boolean` | Yes | Visibility flag. Only active announcements are returned |

### `DismissedAnnouncements`

Join table tracking per-user dismissal state:

| Column | Purpose |
| --- | --- |
| `AnnouncementId` | Announcement that was dismissed |
| `PersonId` | User who dismissed it |

Dismissal is per user and per announcement row. If an announcement is replaced by a new row, users who dismissed the old row will still see the new row.

## Runtime behavior

1. After a user is loaded, the frontend calls endpoint to get announcements.
2. The backend returns active announcements that have not been dismissed by the current user.
3. At most one announcement per type is returned, ordered by `TimeStamp` descending.
4. If an `Alert` is present, `app-alert` renders it as a top banner.
5. If a `PopUp` is present, the navbar opens the notice dialog and renders the announcement HTML in the modal body.
6. When the popup modal is hidden, the frontend calls the dismiss endpoint for that announcement.

Announcements are fetched when the user session is initialized. They are not continuously polled.

## API

- `GET /announcements`
  Returns the current user’s active announcements.
- `POST /announcements/{announcementId}/dismiss`
  Marks an announcement as dismissed for the current user.

The dismiss endpoint rejects attempts to dismiss a non-dismissible `Alert` announcement.

## HTML content rules

Announcement `HTML` should contain only the markup that should be rendered inside the existing UI surface.

Recommended rules:

- Use an HTML fragment, not a full HTML document.
- Do not include scripts or inline event handlers.
- Do not rely on inline styles.
- Use shared frontend styles for announcement-specific layout.
- Reference static assets with app-relative paths, for example `assets/img/announcements/file.svg`.
- Deploy any new frontend assets or styles before activating an announcement that depends on them.

## Related Documentation

- [Adding New Announcements](adding-new-announcements.md) — current process for creating and activating announcements
- [Version Update Announcement Template](version-update-template.md) — reusable template for release announcement popups
