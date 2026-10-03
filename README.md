# Birding in Vermont

[![Netlify Status](https://api.netlify.com/api/v1/badges/31311bd3-9f06-4054-978f-84c0143e3fc6/deploy-status)](https://app.netlify.com/sites/birdinginvermont/deploys)

The code for [birdinginvermont.com](https://birdinginvermont.com): maps and tools for birding in Vermont.

- **Towns, Counties, Bioregions**: every species recorded in each area, from the eBird Basic Dataset. Upload your own eBird data to see your lists instead.
- **Project 251**: which towns have had a complete checklist this year, and which still need one.
- **Unbirded Hotspots**: eBird hotspots with no checklists.
- **VBRC Checker**: whether a sighting, your eBird data, or an EBD download has records the Vermont Bird Records Committee wants reported.
- **NFCs, Subspecies, Female Birdsong**: reference pages written in markdown.

The data and the code that works it out live in [ebird-ext](https://github.com/RichardLitt/ebird-ext), included here as a git submodule at `src/ebird-ext`.

## Setup

```sh
git clone --recurse-submodules https://github.com/RichardLitt/birdinginvermont.com
cd birdinginvermont.com
nvm use          # Node 22 (.nvmrc)
npm install
npm start        # http://localhost:3000
```

The site needs **Node 22 with npm 10**, the same as CI and Netlify. `npm install` refuses other versions (`engines` in `package.json`, `engine-strict` in `.npmrc`): npm 11 writes a lockfile that CI's `npm ci` rejects. If your Node 22 came with npm 11, run `npm install -g npm@10` once after `nvm use`.

If you cloned without `--recurse-submodules`, run `git submodule update --init`.

## Commands

| Command | Does |
|---|---|
| `npm start` | Development server on http://localhost:3000 |
| `npm test` | Smoke tests (Jest and Testing Library): renders each kind of page, and checks the species lists' numbering and sorting |
| `npm run build` | Production build in `build/` |
| `npm run update-ebird-ext` | Points `src/ebird-ext` at ebird-ext `main`, or at a ref you pass, and commits that |

Netlify builds and deploys `main`, and builds a preview for every pull request.

## How it fits together

- `src/App.js`: routes. Every page except the home page loads its code when first visited (`React.lazy`), and ebird-ext loads only when someone uploads data.
- `src/Map.js`: the maps (d3). They draw simplified boundaries from `src/ebird-ext/geojson/display/`; the precise boundaries, which decide which town a checklist is in, load only when needed.
- `src/Rarities.js`: the VBRC checker. `src/Project251.js`, `src/Norwich.js`: those pages.
- `src/ContentPage.js`: pages written in markdown, fetched from `public/`: `terms.md`, `female-birdsong.md`, `nfc-species/*.md`, `subspecies/*.md`, plus `project251.md` for the Project 251 page.
- The build uses Craco, which wraps Create React App 5 (`craco.config.js`), so that it can bundle ebird-ext's ES modules and JSON imports.

## The ebird-ext submodule

Changes to the data or the code that works it out go to [ebird-ext](https://github.com/RichardLitt/ebird-ext), not to `src/ebird-ext` here. After an ebird-ext pull request is merged, Dependabot opens a pull request here, within a day, that moves the submodule pointer; merge it once its checks pass. Run `npm run update-ebird-ext <ref>` yourself only when a branch here needs an ebird-ext change that isn't merged yet.

## Updating the data

The town, region and county lists, Project 251 and the hotspot dates are refreshed about every three months from a new eBird Basic Dataset download. The steps are in ebird-ext's [scripts/README.md](https://github.com/RichardLitt/ebird-ext/blob/main/scripts/README.md) and [docs/project-251.md](https://github.com/RichardLitt/ebird-ext/blob/main/docs/project-251.md). `scripts/data-update-reminder.sh` can email a reminder from cron; its header explains how.
