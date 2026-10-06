# Photos

Drop images in this folder and the **Photos** channel appears on the home screen automatically. With no images here the channel is hidden.

- **Formats:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`
- **Size:** keep them around 1600px on the long edge (and ideally under ~400 KB each). Everything is bundled into the site as-is, so very large files slow the page down. Re-export them smaller before adding.
- **Order:** sorted by filename with numbers compared naturally, so prefix with `01-`, `02-`, ... to control the order.
- **Captions and alt text (optional):** add entries to `captions.json`, keyed by exact filename:

  ```json
  {
    "01-benchy.jpg": { "caption": "First print on the new printer", "alt": "A small teal boat printed in PLA" },
    "02-desk.jpg": { "caption": "Current desk setup" }
  }
  ```

  `alt` falls back to `caption`, then to a tidied-up filename. Add `alt` text for anything that isn't obvious from the caption.
- **Page count:** the home screen holds 12 channels per page. The Photos channel brings the total to 13, so the home screen gets a second page (dots and arrows appear in the footer).
