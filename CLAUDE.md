# Two Notebooks: notes for Claude

A shared blog for two people. One writes **Travel** posts, the other writes **Science** deep dives.
Live at https://chandranakshay.github.io/two-notebooks/ (GitHub Pages, deployed from `main`, root folder).

## Ground rules from the owner

- **Ask for explicit permission before visiting any website, or opening any file or folder** outside what you were asked to work on.
- **Never spend money or collect money** from anyone.
- Commit as `chandranakshay` <chandranakshay@users.noreply.github.com> (already set in this repo's git config). Never use the owner's personal email.
- Only commit or push when asked.

## How the site works

Plain HTML, CSS and JavaScript. No build step, no dependencies, and **nothing loaded from other websites** (no CDNs, web fonts or trackers). Keep it that way unless the owner agrees otherwise.

```
index.html                 page shell: header, nav, footer
assets/style.css           theme variables at the top (--travel terracotta, --science teal), light and dark mode
assets/app.js              hash router, tiny Markdown renderer, generated SVG cover art
content/site.json          title, tagline, about text, section blurbs, authors
content/posts.json         list of posts (metadata)
content/posts/<slug>.md    post bodies in Markdown
.nojekyll                  makes GitHub Pages serve files as-is
```

- Routes are hashes: `#home`, `#travel`, `#science`, `#about`, `#post-<slug>`.
- Posts are fetched with `fetch()`, so preview locally with `python3 -m http.server 8000`, not by opening the file directly.
- In-page links (table of contents, footnotes) use `data-jump` so they don't change the hash.

## Adding a post

1. Create `content/posts/<slug>.md` (slug: lowercase letters, numbers and hyphens).
2. Add an entry to `content/posts.json` with `slug`, `title`, `section` (`travel` or `science`), `author` (an id from `site.json`), `date` (YYYY-MM-DD), `summary`, `tags`, and optional `location` and `cover` (e.g. `images/photo.jpg`).

Markdown supported by the renderer: `#` headings (rendered as h2; science posts with 3+ get a table of contents), bold, italic, inline and fenced code, links, images, lists, `>` quotes, `---`, pipe tables, footnotes (`[^1]` and `[^1]: text`), and one-line callouts (`::: text :::`).

## Current state and open ideas

- Author names (Alex, Sam), the title "Two Notebooks" and the four posts are **placeholders** waiting to be replaced.
- Equations (KaTeX) were deliberately left out because they load from a CDN. Ask before adding.
- Discussed but not built: a browser-based editor at `/admin` (Sveltia CMS or Decap CMS). It would need posts to move their metadata into front matter, plus a GitHub Action to rebuild `posts.json`.
