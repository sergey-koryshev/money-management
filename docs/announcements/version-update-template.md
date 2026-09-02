# Version Update Announcement Template

The version update announcement is a `PopUp` announcement used to present a new product version and its main changes. The visual template is stored as HTML in the announcement row and styled by shared frontend styles.

## HTML template

```html
<div class="version-update-card">
  <span class="version-update-badge">
    <img src="assets/img/announcements/version-badge.svg" alt="" width="11" height="11" />
    NEW VERSION
  </span>

  <h1 class="version-update-heading">
    We've upgraded to version <span class="version-update-accent">X.Y</span>!
  </h1>

  <p class="version-update-intro">Here's what's new:</p>

  <div class="version-update-feature">
    <div class="version-update-icon">
      <img src="assets/img/announcements/feature-icon.svg" alt="" width="56" height="56" />
    </div>
    <div>
      <h2 class="version-update-feature-title">Feature title</h2>
      <p class="version-update-feature-description">Short description of the feature.</p>
    </div>
  </div>

  <!-- Repeat .version-update-feature for each major feature. -->

  <p class="version-update-footer">Other improvements and fixes.</p>
</div>
```

## CSS Class reference

| Selector | Purpose |
| --- | --- |
| `.version-update-card` | Root wrapper for the announcement card. |
| `.version-update-badge` | Small “NEW VERSION” badge at the top of the card. |
| `.version-update-heading` | Main heading for the version update. |
| `.version-update-accent` | Accent styling for the version number inside the heading. |
| `.version-update-intro` | Intro line before the feature list. |
| `.version-update-feature` | One row per major feature. Repeat as needed. |
| `.version-update-icon` | Container for the feature icon. |
| `.version-update-feature-title` | Feature title. |
| `.version-update-feature-description` | Short feature description. |
| `.version-update-footer` | Optional footer for secondary improvements and fixes. |

## Assets

- Badge icon: `assets/img/announcements/version-badge.svg`
- Feature icons: place static SVG files under `source/frontend/src/assets/img/announcements/`
- Reference assets using relative paths: `assets/img/announcements/<file>.svg`
- Feature icons should be square and rendered at `56x56`.
- The badge icon is rendered at `11x11`.

## Styling rules

- Keep version-update card styles inside `.version-update-card` in `source/frontend/src/styles/partials/announcement.scss`.
- Do not add one-off inline styles to announcement HTML.
- If the template needs a new visual element, add a reusable `.version-update-*` class and style it in the shared SCSS file.
