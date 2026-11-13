/* Two Notebooks — a tiny, dependency-free blog engine.
 *
 * Content lives in /content:
 *   content/site.json        site title, tagline and the two authors
 *   content/posts.json       the list of posts (newest first is not required; we sort)
 *   content/posts/<slug>.md  each post, written in Markdown
 *
 * Pages are addressed with simple hashes: #home, #travel, #science, #about, #post-<slug>
 */
(function () {
  "use strict";

  const app = document.getElementById("app");
  let SITE = null;
  let POSTS = [];
  const postCache = {};

  /* ---------------- Helpers ---------------- */
  const esc = (s) => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const fmtDate = (iso) => {
    const d = new Date(iso + "T12:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };

  const author = (id) => (SITE.authors.find((a) => a.id === id) || { name: id, color: "#888", initials: "?" });

  const slugify = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }

  /* Generated cover art, so posts look good before you add real photos. */
  function coverSVG(post) {
    if (post.cover) return `<img src="${esc(post.cover)}" alt="" loading="lazy">`;
    const r = hashSeed(post.slug);
    if (post.section === "travel") {
      const skies = [["#f7c59f", "#f08a5d"], ["#a8d8ea", "#f6d5b8"], ["#ffd6a5", "#e07a5f"], ["#cde7f0", "#fbe3c9"]];
      const [a, b] = skies[Math.floor(r() * skies.length)];
      const sunX = 80 + r() * 240, sunY = 50 + r() * 40;
      const ridge = (base, amp, n) => {
        let d = `M0 ${base}`;
        for (let i = 0; i <= n; i++) d += ` L${(400 / n) * i} ${base - r() * amp}`;
        return d + " L400 225 L0 225 Z";
      };
      return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id="g${post.slug}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
        <rect width="400" height="225" fill="url(#g${post.slug})"/>
        <circle cx="${sunX}" cy="${sunY}" r="${22 + r() * 14}" fill="#fff6e8" opacity=".9"/>
        <path d="${ridge(150, 60, 7)}" fill="#c2552d" opacity=".35"/>
        <path d="${ridge(175, 45, 9)}" fill="#8f3b20" opacity=".45"/>
        <path d="${ridge(205, 25, 12)}" fill="#4a2416" opacity=".55"/>
      </svg>`;
    }
    const cx = 120 + r() * 160, cy = 90 + r() * 50;
    let rings = "";
    for (let i = 1; i <= 6; i++) {
      rings += `<ellipse cx="${cx}" cy="${cy}" rx="${i * 34}" ry="${i * 14}" transform="rotate(${-20 + r() * 40} ${cx} ${cy})" fill="none" stroke="#9fd3d8" stroke-opacity="${0.9 - i * 0.12}" stroke-width="1.2"/>`;
    }
    let dots = "";
    for (let i = 0; i < 40; i++) dots += `<circle cx="${r() * 400}" cy="${r() * 225}" r="${r() * 1.6 + 0.3}" fill="#e8f6f7" opacity="${0.3 + r() * 0.6}"/>`;
    let wave = "M0 190";
    const f = 0.03 + r() * 0.03;
    for (let x = 0; x <= 400; x += 5) wave += ` L${x} ${190 + Math.sin(x * f) * 12 * Math.cos(x * 0.008)}`;
    return `<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="225" fill="#123c42"/>
      ${dots}${rings}
      <circle cx="${cx}" cy="${cy}" r="9" fill="#f2b880"/>
      <path d="${wave}" fill="none" stroke="#5fb6bf" stroke-width="2"/>
    </svg>`;
  }

  /* ---------------- Markdown ----------------
   * Supports: # headings, paragraphs, **bold**, *italic*, `code`, ```code blocks```,
   * [links](url), ![images](path), lists, > quotes, --- rules, tables,
   * footnotes ([^1] and [^1]: text) and ::: note callouts.
   */
  function inline(text, ctx) {
    const codes = [];
    let s = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    s = esc(s);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`);
    s = s.replace(/\[\^([^\]]+)\]/g, (_, id) => {
      if (!ctx.fnOrder.includes(id)) ctx.fnOrder.push(id);
      const n = ctx.fnOrder.indexOf(id) + 1;
      return `<sup id="fnref-${esc(id)}"><a href="#" data-jump="fn-${esc(id)}">[${n}]</a></sup>`;
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const ext = /^https?:/.test(href);
      return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
    return s;
  }

  function markdown(src) {
    const ctx = { fnOrder: [], fnText: {}, headings: [] };
    const lines = src.replace(/\r\n?/g, "\n").split("\n");

    // Pull out footnote definitions first.
    const body = [];
    for (const line of lines) {
      const m = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
      if (m) ctx.fnText[m[1]] = m[2]; else body.push(line);
    }

    let html = "";
    let i = 0;
    const isBlockStart = (l) => /^(#{1,4}\s|```|>|\s*[-*]\s|\s*\d+\.\s|---\s*$|\||:::)/.test(l);

    while (i < body.length) {
      const line = body[i];
      if (!line.trim()) { i++; continue; }

      if (line.startsWith("```")) {
        const lang = line.slice(3).trim();
        const buf = [];
        i++;
        while (i < body.length && !body[i].startsWith("```")) buf.push(body[i++]);
        i++;
        html += `<pre><code${lang ? ` data-lang="${esc(lang)}"` : ""}>${esc(buf.join("\n"))}</code></pre>`;
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        const level = Math.min(h[1].length + 1, 4); // "#" in a post becomes <h2>; the title is the <h1>
        const content = inline(h[2], ctx);
        const id = slugify(h[2]);
        if (level === 2) ctx.headings.push({ id, text: content });
        html += `<h${level} id="${id}">${content}</h${level}>`;
        i++; continue;
      }
      if (/^---\s*$/.test(line)) { html += "<hr>"; i++; continue; }
      const oneLine = line.match(/^:::\s*(.+?)\s*:::\s*$/);
      if (oneLine) { html += `<div class="callout">${inline(oneLine[1], ctx)}</div>`; i++; continue; }
      if (line.startsWith(":::")) {
        const buf = [];
        i++;
        while (i < body.length && !body[i].startsWith(":::")) buf.push(body[i++]);
        i++;
        html += `<div class="callout">${inline(buf.join(" "), ctx)}</div>`;
        continue;
      }
      if (line.startsWith(">")) {
        const buf = [];
        while (i < body.length && body[i].startsWith(">")) buf.push(body[i++].replace(/^>\s?/, ""));
        html += `<blockquote><p>${inline(buf.join(" "), ctx)}</p></blockquote>`;
        continue;
      }
      if (/^\s*[-*]\s/.test(line) || /^\s*\d+\.\s/.test(line)) {
        const ordered = /^\s*\d+\.\s/.test(line);
        const re = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
        const items = [];
        while (i < body.length && re.test(body[i])) items.push(body[i++].replace(re, ""));
        const tag = ordered ? "ol" : "ul";
        html += `<${tag}>${items.map((t) => `<li>${inline(t, ctx)}</li>`).join("")}</${tag}>`;
        continue;
      }
      if (line.startsWith("|")) {
        const rows = [];
        while (i < body.length && body[i].startsWith("|")) rows.push(body[i++]);
        const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        const head = cells(rows[0]);
        const rest = rows.slice(1).filter((r) => !/^\|[\s:|-]+\|?$/.test(r));
        html += `<table><thead><tr>${head.map((c) => `<th>${inline(c, ctx)}</th>`).join("")}</tr></thead><tbody>${rest
          .map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c, ctx)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        continue;
      }
      const buf = [];
      while (i < body.length && body[i].trim() && !isBlockStart(body[i])) buf.push(body[i++]);
      html += `<p>${inline(buf.join(" "), ctx)}</p>`;
    }

    if (ctx.fnOrder.length) {
      html += `<section class="footnotes"><strong>Notes</strong><ol>${ctx.fnOrder
        .map((id) => `<li id="fn-${esc(id)}">${inline(ctx.fnText[id] || "", ctx)} <a href="#" data-jump="fnref-${esc(id)}" aria-label="Back to text">↩</a></li>`)
        .join("")}</ol></section>`;
    }
    return { html, headings: ctx.headings };
  }

  /* ---------------- Views ---------------- */
  function card(p) {
    const a = author(p.author);
    const label = p.section === "travel" ? "Travel" : "Science";
    return `<a class="card" href="#post-${p.slug}">
      <span class="cover">${coverSVG(p)}</span>
      <span class="card-body">
        <span class="meta"><span class="pill ${p.section}">${label}</span>${p.location ? `<span>📍 ${esc(p.location)}</span>` : ""}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        <span class="meta">${esc(a.name)} · ${fmtDate(p.date)}</span>
      </span>
    </a>`;
  }

  function viewHome() {
    const [t, s] = ["travel", "science"].map((k) => SITE.sections[k]);
    app.innerHTML = `
      <section class="hero">
        <h1>Two people, two notebooks: <span class="t">places</span> and <span class="s">ideas</span>.</h1>
        <p>${esc(SITE.tagline)}</p>
        <div class="section-cards">
          <a class="section-card travel" href="#travel"><h2>${esc(t.title)}</h2><p>${esc(t.blurb)}</p></a>
          <a class="section-card science" href="#science"><h2>${esc(s.title)}</h2><p>${esc(s.blurb)}</p></a>
        </div>
      </section>
      <div class="list-head"><h2>Latest from both notebooks</h2></div>
      <div class="grid">${POSTS.slice(0, 6).map(card).join("")}</div>`;
  }

  function viewSection(section) {
    const info = SITE.sections[section];
    const posts = POSTS.filter((p) => p.section === section);
    const tags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
    let active = null;
    const render = () => {
      const list = active ? posts.filter((p) => (p.tags || []).includes(active)) : posts;
      app.querySelector(".grid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty">No posts here yet.</p>`;
      app.querySelectorAll(".tag-btn").forEach((b) => b.classList.toggle("on", (b.dataset.tag || null) === active));
    };
    app.innerHTML = `
      <section class="page-title ${section}">
        <h1>${esc(info.title)}</h1>
        <p>${esc(info.blurb)}</p>
        ${tags.length ? `<div class="tags"><button class="tag-btn on" data-tag="">All</button>${tags
          .map((t) => `<button class="tag-btn" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div>` : ""}
      </section>
      <div class="grid" style="margin-top:22px"></div>`;
    app.querySelectorAll(".tag-btn").forEach((b) => b.addEventListener("click", () => { active = b.dataset.tag || null; render(); }));
    render();
  }

  async function viewPost(slug) {
    const p = POSTS.find((x) => x.slug === slug);
    if (!p) return viewNotFound();
    let src = postCache[slug];
    if (src == null) {
      try {
        const res = await fetch(`content/posts/${slug}.md`);
        if (!res.ok) throw new Error(res.status);
        src = postCache[slug] = await res.text();
      } catch (e) {
        app.innerHTML = `<p class="empty">Couldn't load this post (${esc(e.message)}).</p>`;
        return;
      }
    }
    const { html, headings } = markdown(src);
    const a = author(p.author);
    const words = src.split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 230));
    const label = p.section === "travel" ? "Travel" : "Science";
    const toc = p.section === "science" && headings.length >= 3
      ? `<nav class="toc" aria-label="Contents"><strong>In this post</strong><ol>${headings
          .map((h) => `<li><a href="#" data-jump="${h.id}">${h.text}</a></li>`).join("")}</ol></nav>` : "";
    app.innerHTML = `
      <article class="post ${p.section}">
        <a class="back" href="#${p.section}">← All ${label.toLowerCase()} posts</a>
        <h1 class="title">${esc(p.title)}</h1>
        <p class="lede">${esc(p.summary)}</p>
        <div class="byline">
          <span class="avatar" style="background:${esc(a.color)}">${esc(a.initials)}</span>
          <span>${esc(a.name)} · ${fmtDate(p.date)} · ${mins} min read${p.location ? ` · 📍 ${esc(p.location)}` : ""}</span>
        </div>
        <div class="cover">${coverSVG(p)}</div>
        ${toc}
        <div class="prose">${html}</div>
      </article>
      <aside class="post-foot">
        <span class="avatar" style="background:${esc(a.color)};width:44px;height:44px">${esc(a.initials)}</span>
        <p><strong>${esc(a.name)}</strong> — ${esc(a.bio)}</p>
      </aside>`;
  }

  function viewAbout() {
    app.innerHTML = `
      <section class="page-title"><h1>About</h1><p>${esc(SITE.about)}</p></section>
      <div class="authors">${SITE.authors.map((a) => `
        <div class="author-card">
          <span class="avatar" style="background:${esc(a.color)};width:52px;height:52px;font-size:1.1rem">${esc(a.initials)}</span>
          <h2>${esc(a.name)}</h2>
          <p>${esc(a.bio)}</p>
          <span class="pill ${a.section}">Writes ${a.section === "travel" ? "Travel" : "Science"}</span>
        </div>`).join("")}
      </div>`;
  }

  function viewNotFound() {
    app.innerHTML = `<section class="page-title"><h1>Page not found</h1><p><a href="#home">Back to the home page</a></p></section>`;
  }

  /* ---------------- Router ---------------- */
  function route() {
    const h = (location.hash || "#home").slice(1);
    document.querySelectorAll(".nav a").forEach((a) => {
      const k = a.dataset.nav;
      const on = h === k || (h.startsWith("post-") && POSTS.find((p) => "post-" + p.slug === h)?.section === k);
      a.classList.toggle("active", !!on);
    });
    if (h === "home" || h === "") viewHome();
    else if (h === "travel" || h === "science") viewSection(h);
    else if (h === "about") viewAbout();
    else if (h.startsWith("post-")) viewPost(h.slice(5));
    else viewNotFound();
    window.scrollTo(0, 0);
    const p = POSTS.find((x) => "post-" + x.slug === h);
    document.title = p ? `${p.title} · ${SITE.title}` : SITE.title;
  }

  // In-page jumps (contents, footnotes) without changing the page hash.
  app.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-jump]");
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.jump);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  async function init() {
    try {
      const [site, posts] = await Promise.all([
        fetch("content/site.json").then((r) => r.json()),
        fetch("content/posts.json").then((r) => r.json()),
      ]);
      SITE = site;
      POSTS = posts.sort((a, b) => (a.date < b.date ? 1 : -1));
      document.querySelector(".brand-name").textContent = SITE.title;
      window.addEventListener("hashchange", route);
      route();
    } catch (e) {
      app.innerHTML = `<p class="empty">The blog couldn't load its content (${esc(e.message)}).</p>`;
    }
  }
  init();
})();
