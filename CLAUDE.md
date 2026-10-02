# CLAUDE.md

Guidance for working in this repo.

## Project

React web app for birding in Vermont. Provides maps and tools for bird sightings by town, county, and biophysical region, plus a VBRC rarity checker and Project 251 tracking. Live at https://birdinginvermont.com.

## Commands

```bash
npm start        # dev server on localhost:3000
npm test         # run tests (Jest + React Testing Library)
npm run build    # production build
npm run deploy   # deploy to GitHub Pages
```

## Architecture

- **src/App.js** — root component, routing, top-level state. `handleChange(e)` is the main data-loading callback; `e` is the eBird CSV file input.
- **src/Map.js** — D3/Leaflet map. Re-renders on prop change via `componentDidUpdate`.
- **src/Rarities.js** — VBRC checker with single-bird form and batch upload.
- **src/ebird-ext/** — git submodule ([github.com/RichardLitt/ebird-ext](https://github.com/RichardLitt/ebird-ext)). Contains all data-processing logic, GeoJSON boundaries, and JSON data files. Do not commit changes to this directory here; changes go in the submodule's own repo. After an ebird-ext merge, Dependabot opens a PR within a day that moves the pointer to ebird-ext `main`; merge it once CI passes. `npm run update-ebird-ext` is only needed to point a site branch at an unmerged ebird-ext ref (pass the ref; `--push` to push).

## Conventions

- **No co-author lines in commits.** Do not add `Co-Authored-By:` trailers to commit messages.
- The build tool is Craco (wraps Create React App 5). `craco.config.js` lets the build bundle ebird-ext's ESM sources. It adds the import-attributes Babel syntax for its JSON imports, empty fallbacks for Node built-ins, and Buffer/process polyfills. Netlify and CI build on Node 22 with npm 10 (`netlify.toml`, `.nvmrc`); `package.json` `engines` with `engine-strict` in `.npmrc` makes npm refuse other versions, because npm 11 writes a lockfile CI's `npm ci` rejects. Run `nvm use` first.
- Pure JavaScript (no TypeScript).
- Styling: SCSS + Bootstrap 4. Component-level `.scss` files alongside their `.js` files.
