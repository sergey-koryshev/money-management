# Adding New Announcements

This guide describes the current process for adding announcements. 
Announcements are stored as database rows. Do not add routine announcement content through EF Core migrations.

## Choose an announcement type

Use `PopUp` when:

- The message is one-time or release-related.
- The user should see it immediately after loading the app.
- Closing the modal should mark it as dismissed for that user.

Use `Alert` when:

- The message should remain visible while it is active.
- It represents an ongoing warning or operational notice.
- It may need to stay on screen until the user explicitly dismisses it or until it is deactivated.

Only one active announcement per type is allowed.

## Prepare the frontend

If the announcement uses custom styles or images:

1. Add styles to the appropriate frontend stylesheet, e.g. `source/frontend/src/styles/partials/announcement.scss`.
2. Add static assets under `source/frontend/src/assets/img/announcements/`.
3. Deploy the frontend before activating the announcement.

The announcement HTML can reference assets only if those assets are already available in the deployed frontend.

## Compose the HTML

Store only the HTML fragment that should be rendered inside the popup or alert.

General rules:

- Do not include a full HTML document.
- Do not include scripts or inline event handlers.
- Do not use one-off inline styles.
- Use existing shared classes when possible.
- For release popups, use [Version Update Announcement Template](version-update-template.md).
- For alerts, keep the markup simple, usually one or more paragraphs or a short list.
- Popup has close button styled through `.notice-dialog .btn-close` with absolute positioning. Ensure your HTML fragment doesn't interfere with it.


Example alert HTML:

```html
<p>Maintenance is scheduled for Saturday from 02:00 to 04:00 UTC.</p>
```

## Insert a new announcement

Run the database changes against the target environment. Use a transaction so the previous active announcement is deactivated at the same moment the new one is activated.

### Pre-check

Check the currently active announcement for the target type:

```sql
SELECT *
FROM "Announcements"
WHERE "TypeId" = 1
  AND "Active" = TRUE;
```

Use `TypeId = 2` when checking for an active `Alert`.

### Popup announcement example

Replace the title, HTML, and timestamp as needed.

```sql
BEGIN;

UPDATE "Announcements"
SET "Active" = FALSE
WHERE "TypeId" = 1
  AND "Active" = TRUE;

INSERT INTO "Announcements"
(
  "Title",
  "HTML",
  "TimeStamp",
  "TypeId",
  "Dismissible",
  "Active"
)
VALUES
(
  'Version 0.5 is here!',
  $$
  <div class="version-update-card">
    <!-- Use the version update template markup here. -->
  </div>
  $$,
  now(),
  1,
  NULL,
  TRUE
);

COMMIT;
```

For popup announcements, `Dismissible` can usually be left as `NULL`. Popup dismissal is handled by closing the modal.

### Alert announcement example

```sql
BEGIN;

UPDATE "Announcements"
SET "Active" = FALSE
WHERE "TypeId" = 2
  AND "Active" = TRUE;

INSERT INTO "Announcements"
(
  "Title",
  "HTML",
  "TimeStamp",
  "TypeId",
  "Dismissible",
  "Active"
)
VALUES
(
  'Maintenance notice',
  $$
  <p>Maintenance is scheduled for Saturday from 02:00 to 04:00 UTC.</p>
  $$,
  now(),
  2,
  TRUE,
  TRUE
);

COMMIT;
```

Use `Dismissible = FALSE` only when users must not be able to dismiss the alert. Non-dismissible alerts remain visible to each user until the announcement is deactivated or replaced.

## Update an existing announcement

If you edit the `HTML` of an existing active announcement, users who already dismissed that announcement will not see it again, because dismissal is tracked per announcement row.

If changed content should be shown again to users who dismissed the previous version:

1. Deactivate the old announcement.
2. Insert a new announcement row with the updated content.
3. Activate the new row.

Do not delete rows from `DismissedAnnouncements` unless you specifically want to clear dismissal history for an existing announcement.

## Deactivate an announcement

To stop showing an announcement:

```sql
UPDATE "Announcements"
SET "Active" = FALSE
WHERE "Id" = :announcementId;
```

Use the announcement `Id`, not the title, when deactivating a specific row.
