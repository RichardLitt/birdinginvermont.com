import React from 'react'
import { SORTS, sortState, chooseSort, sortSpecies } from './speciesSort'

// A list of species names with the sort buttons the maps use. names are in
// the order first seen; with numbered, Order seen numbers them (1 is the
// oldest). Without it there's no Order seen, and that sort shows them
// taxonomically. onSort lets the page redraw every list, since the sort is
// shared.
export default function SpeciesList ({ names, numbered, onSort }) {
  const sorts = numbered ? SORTS : SORTS.filter(d => d[0] !== 'seen')
  const sort = !numbered && sortState.sort === 'seen' ? 'taxonomic' : sortState.sort
  const items = sortSpecies(names.map((name, i) => ({ name, n: i + 1 })), sort, sortState.reverse)
  return (
    <div>
      <div className="list-sort btn-group btn-group-sm" role="group" aria-label="Sort the species">
        {sorts.map(d => {
          const active = d[0] === sort
          return (
            <button
              key={d[0]}
              type="button"
              className={`btn btn-outline-secondary${active ? ' active' : ''}`}
              aria-pressed={active}
              aria-label={`${d[1]}${active ? `, ${sortState.reverse ? d[3] : d[2]}` : ''}`}
              title={active ? 'Click again to reverse' : undefined}
              onClick={() => {
                chooseSort(d[0], sort)
                onSort()
              }}
            >
              {d[1]}{active ? (sortState.reverse ? ' ↓' : ' ↑') : ''}
            </button>
          )
        })}
      </div>
      <ul className="species-list">
        {items.map(x => (
          <li key={x.name}>
            {numbered && sort === 'seen' && <span className="seen-number">{x.n}. </span>}
            {x.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
