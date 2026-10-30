# annabelle-website

Personal website for Annabelle Yao. Plain static HTML/CSS/JS, no build step.

## Files

- `index.html` — the single page (hero, about, experience, research, projects, awards, contact)
- `styles.css` — design tokens (light + dark), layout, responsive rules
- `script.js` — theme toggle, active-nav highlighting, scroll reveal
- `assets/Annabelle_Yao_CV.pdf` — the CV linked from the hero
- `assets/annabelle.jpg` — hero portrait

## Preview locally

```sh
cd annabelle-website
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages

1. Create a repo named `Maplesyxy.github.io` (user site) or any repo name (project site).
2. Push these files to the `main` branch.
3. In the repo: Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site goes live at `https://maplesyxy.github.io/` (or `https://maplesyxy.github.io/<repo>/`).

## Editing content

Everything is in `index.html`. Publications, projects and awards are plain lists, so add or
remove `<li>` / `<a class="card">` blocks as needed. The hero portrait is `assets/annabelle.jpg`.
