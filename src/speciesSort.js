// How species lists are sorted, shared by the maps and the radius page: in the
// order the species were first seen, taxonomically, or alphabetically.
// Choosing the current sort again reverses it. Both are remembered between
// visits.
import taxonomicSort from './ebird-ext/taxonomicSort.js'

// [key, label, what the normal (up arrow) and reversed (down arrow) orders are]
export const SORTS = [
  ['seen', 'Order seen', 'oldest first', 'newest first'],
  ['taxonomic', 'Taxonomic', 'in taxonomic order', 'in reverse taxonomic order'],
  ['alpha', 'A–Z', 'A to Z', 'Z to A']
]

export const sortState = { sort: 'seen', reverse: false }
try {
  sortState.sort = window.localStorage.getItem('speciesListSort') || 'seen'
  sortState.reverse = window.localStorage.getItem('speciesListReverse') === 'true'
} catch (e) {}

// The current sort again: reverse it. Another sort: start the right way up.
// shown is the sort a list is showing, if not the stored one (a list without
// Order seen shows it taxonomically).
export function chooseSort (key, shown = sortState.sort) {
  sortState.reverse = key === shown ? !sortState.reverse : false
  sortState.sort = key
  try {
    window.localStorage.setItem('speciesListSort', sortState.sort)
    window.localStorage.setItem('speciesListReverse', String(sortState.reverse))
  } catch (e) {}
}

// items: [{ name, n }], in the order first seen
export function sortSpecies (items, sort, reverse) {
  let sorted = items
  if (sort === 'alpha') sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'taxonomic') {
    const rank = new window.Map(taxonomicSort(items.map(x => x.name)).map((name, i) => [name, i]))
    sorted = [...items].sort((a, b) => rank.get(a.name) - rank.get(b.name))
  }
  return reverse ? [...sorted].reverse() : sorted
}

// The button label for a sort: an arrow on the current one
export function sortLabel (d) {
  return `${d[1]}${d[0] === sortState.sort ? (sortState.reverse ? ' ↓' : ' ↑') : ''}`
}

export function sortAriaLabel (d) {
  return `${d[1]}${d[0] === sortState.sort ? `, ${sortState.reverse ? d[3] : d[2]}` : ''}`
}
