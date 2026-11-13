# Two Notebooks

A shared blog with two sections: **Travel** and **Science**. It's plain HTML, CSS and JavaScript, with no build step, no dependencies and nothing loaded from other websites. It runs as-is on GitHub Pages for free.

## Folder layout

```
index.html                 the page shell (header, nav, footer)
assets/style.css           colours, fonts, layout
assets/app.js              the small engine that reads posts and draws pages
content/site.json          blog title, tagline, section blurbs, the two authors
content/posts.json         the list of posts
content/posts/<slug>.md    one Markdown file per post
images/                    put your photos here (create the folder when you need it)
.nojekyll                  tells GitHub Pages to serve the files exactly as they are
```

## Writing a new post

1. Create `content/posts/my-new-post.md` and write the post in Markdown.
2. Add an entry to `content/posts.json`:

```json
{
  "slug": "my-new-post",
  "title": "My new post",
  "section": "travel",
  "author": "alex",
  "date": "2026-12-01",
  "location": "Porto, Portugal",
  "summary": "One or two sentences shown on the post card.",
  "tags": ["Europe"],
  "cover": "images/porto.jpg"
}
```

- `section` is `travel` or `science`.
- `author` must match an `id` in `content/site.json`.
- `location` and `cover` are optional. Without a cover image, the site draws a generated illustration.
- The `slug` must match the file name and use only lowercase letters, numbers and hyphens.

## What you can write in a post

- `# Heading` makes a section heading. Science posts with three or more headings get an automatic table of contents.
- `**bold**`, `*italic*`, `` `code` ``, and fenced code blocks with ```.
- Links: `[text](https://example.com)`. Images: `![description](images/photo.jpg)`.
- Lists, `> quotes`, `---` dividers and simple `| tables |`.
- Footnotes: put `[^1]` in the text, and `[^1]: The note.` at the bottom.
- Callout boxes: `::: Your highlighted note :::`.

## Changing names, colours and text

- Names, bios, tagline and section blurbs: `content/site.json`.
- Colours: the variables at the top of `assets/style.css` (`--travel` and `--science`).

## Putting it on GitHub Pages (free)

1. Create a free account at github.com, if you don't have one.
2. Create a new **public** repository, for example `two-notebooks`.
3. Upload every file and folder in this project (the **Add file → Upload files** button accepts drag and drop of folders).
4. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, and save.
5. After a minute or two, the site is live at `https://<your-username>.github.io/two-notebooks/`.

A custom domain is optional and is the only part that costs money.

## Previewing on your own computer

Because the site loads its posts with `fetch`, opening `index.html` directly from disk won't work in most browsers. From this folder, run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
