// Smoke tests: render the whole site at each kind of page, so a dependency
// update that breaks rendering (React, the router, react-bootstrap,
// react-select, react-datepicker, Leaflet, d3, react-markdown) fails here,
// not in production.

// Each test loads the whole app afresh, data files and all, which takes
// several seconds on CI's runners: more than Jest's default 5
jest.setTimeout(30000)

beforeEach(() => {
  // Pages load their text from markdown files at runtime
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    text: () => Promise.resolve('# Test page\n\nSome *markdown* text.'),
    json: () => Promise.resolve({})
  }))
})

// App.js creates its browser history when it is first imported, so load a
// fresh copy (with its own React) after moving to the page under test. Pages
// load lazily, after this returns, so reset the module registry rather than
// isolating it: the pages then get the same React and router as App. The pure
// build of Testing Library doesn't register its own cleanup hook, which can't
// be added from inside a test; this file cleans up instead.
let cleanup
afterEach(() => cleanup && cleanup())

function renderAt (path) {
  window.history.pushState({}, '', path)
  jest.resetModules()
  const lib = {
    React: require('react'),
    App: require('./App').default,
    ...require('@testing-library/react/pure')
  }
  cleanup = lib.cleanup
  return { ...lib, ...lib.render(lib.React.createElement(lib.App)) }
}

test('renders the home page, with the navigation bar and its markdown', async () => {
  const { screen } = renderAt('/')
  expect(screen.getByRole('link', { name: 'VBRC Checker' })).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Test page' })).toBeInTheDocument()
})

test('the menu marks the current page', async () => {
  let { screen } = renderAt('/towns')
  expect(screen.getByRole('link', { name: 'Towns' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Counties' })).not.toHaveAttribute('aria-current')
  cleanup()
  ;({ screen } = renderAt('/'))
  // About is the home page
  expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
  await screen.findByRole('heading', { name: 'Test page' })
})

test('renders the VBRC checker with its forms', async () => {
  const { screen } = renderAt('/vbrc-checker')
  expect(await screen.findByRole('heading', { name: 'Vermont Bird Records Checker' })).toBeInTheDocument()
  expect(screen.getByLabelText('County:')).toBeInTheDocument()
  expect(screen.getByLabelText('eBird Basic Dataset file:')).toBeInTheDocument()
})

test('renders the towns map page', async () => {
  const { container, wait } = renderAt('/towns')
  // #map: the footer's icons are SVGs too
  await wait(() => expect(container.querySelector('#map svg, .leaflet-container, canvas')).not.toBeNull())
})

test('drawing the map leaves the footer\'s icons alone', async () => {
  const { container, wait } = renderAt('/towns')
  await wait(() => expect(container.querySelectorAll('#map svg path').length).toBeGreaterThan(200))
  const icons = container.querySelectorAll('.footer svg')
  expect(icons).toHaveLength(3)
  icons.forEach(icon => expect(icon.querySelector('path')).not.toBeNull())
})

test('the towns list ranks every town until a town is hovered', async () => {
  const { container, wait, fireEvent } = renderAt('/towns')
  await wait(() => expect(container.querySelectorAll('#map svg path').length).toBeGreaterThan(200))
  const list = container.querySelector('#list')
  const counts = () => [...list.querySelectorAll('.towns-list li')].map(li => Number(li.textContent.match(/\((\d+)\)$/)[1]))
  // Every town in Vermont: the map's paths, less the state outline and the lake
  expect(counts()).toHaveLength(container.querySelectorAll('#map svg path').length - 2)
  expect(counts()[0]).toBeGreaterThanOrEqual(counts()[counts().length - 1])
  const button = () => list.querySelector('.list-sort button')
  expect(list.querySelectorAll('.list-sort button')).toHaveLength(1)
  expect(button().textContent).toBe('Most ↓')
  fireEvent.click(button())
  expect(button().textContent).toBe('Least ↑')
  expect(counts()[0]).toBeLessThanOrEqual(counts()[counts().length - 1])
  fireEvent.click(button())
  expect(button().textContent).toBe('Most ↓')

  const town = [...container.querySelectorAll('#map svg path')].find(p => p.__data__ && p.__data__.properties && p.__data__.properties.town === 'BURLINGTON')
  fireEvent.mouseOver(town)
  expect(list.querySelector('.towns-list')).toBeNull()
  fireEvent.mouseOut(town)
  expect(list.querySelector('.towns-list')).not.toBeNull()
})

test('a town\'s species are numbered by when first seen, and the sort buttons reorder and reverse them', async () => {
  window.localStorage.clear()
  const { container, wait, fireEvent } = renderAt('/towns')
  await wait(() => expect(container.querySelectorAll('#map svg path').length).toBeGreaterThan(200))
  // Burlington: a long list, ending with sensitive species carried forward undated
  const town = [...container.querySelectorAll('#map svg path')].find(p => p.__data__ && p.__data__.properties && p.__data__.properties.town === 'BURLINGTON')
  fireEvent.mouseOver(town)
  const items = () => [...container.querySelectorAll('#list .species-list li')].map(li => li.textContent)
  const numbers = () => items().map(t => Number(t.split('.')[0]))
  const button = label => [...container.querySelectorAll('.list-sort button')].find(b => b.textContent.startsWith(label))
  const click = label => fireEvent.click(button(label))

  // Order seen: 1, 2, 3, ... with an up arrow on the active button
  expect(numbers().slice(0, 3)).toEqual([1, 2, 3])
  expect(button('Order seen').textContent).toBe('Order seen ↑')
  const count = items().length
  // Undated species come last, numbered, and say so
  expect(items().at(-1)).toMatch(new RegExp(`^${count}\\. .* \\(undated\\)$`))
  const undatedCount = items().filter(t => t.endsWith('(undated)')).length
  expect(undatedCount).toBeGreaterThan(0)

  // Clicking it again reverses it: newest first
  click('Order seen')
  expect(button('Order seen').textContent).toBe('Order seen ↓')
  // Newest dated species first; the undated ones stay at the bottom
  expect(numbers()[0]).toBe(count - undatedCount)
  expect(items().slice(-undatedCount).every(t => t.endsWith('(undated)'))).toBe(true)

  // A-Z starts the right way up, without numbers
  click('A–Z')
  expect(button('A–Z').textContent).toBe('A–Z ↑')
  expect(button('Order seen').textContent).toBe('Order seen')
  expect(container.querySelector('#list .seen-number')).toBeNull()
  expect(container.querySelector('#list .undated')).toBeNull()
  const az = items()
  expect(az).toEqual([...az].sort((a, b) => a.localeCompare(b)))

  // and reverses to Z-A
  click('A–Z')
  expect(button('A–Z').textContent).toBe('A–Z ↓')
  expect(items()).toEqual([...az].reverse())

  // Taxonomic: no numbers either
  click('Taxonomic')
  expect(container.querySelector('#list .seen-number')).toBeNull()
})

test('a county\'s species are listed by name, one per code in its list', async () => {
  window.localStorage.clear()
  const { container, wait, fireEvent } = renderAt('/counties')
  const counties = () => [...container.querySelectorAll('#map svg path')].filter(p => p.__data__ && p.__data__.properties && p.__data__.properties.CNTYNAME)
  await wait(() => expect(counties().length).toBe(14))
  fireEvent.mouseOver(counties().find(p => p.__data__.properties.name === 'Washington'))
  const items = [...container.querySelectorAll('#list .species-list li')].map(li => li.textContent)
  expect(items).toHaveLength(require('./ebird-ext/data/countysightings.json').Washington.length)
  expect(items.some(t => t.includes('Black-capped Chickadee'))).toBe(true)
  // Names, not banding codes
  expect(items.filter(t => /\b[A-Z]{4}\b/.test(t))).toEqual([])
})

test('an upload with a bird new to Vermont asks for a VBRC report, without an error', async () => {
  // Steller's Sea-Eagle has a banding code, but not in the site's Vermont-only
  // table; the Testbird, a stand-in for a future eBird split, has none at all.
  // Neither is on the VBRC list.
  const csv = [
    'Submission ID,Common Name,Scientific Name,Count,State/Province,County,Location,Latitude,Longitude,Date,Time,Protocol,Duration (Min),All Obs Reported,Breeding Code',
    'S900000001,Black-capped Chickadee,Poecile atricapillus,2,US-VT,Washington,Fake Hubbard Park,44.2668,-72.5833,2026-05-01,08:00 AM,Stationary,30,1,',
    'S900000001,Steller\'s Sea-Eagle,Haliaeetus pelagicus,1,US-VT,Washington,Fake Hubbard Park,44.2668,-72.5833,2026-05-01,08:00 AM,Stationary,30,1,',
    'S900000001,Vermont Testbird,Testornis vermontensis,1,US-VT,Washington,Fake Hubbard Park,44.2668,-72.5833,2026-05-01,08:00 AM,Stationary,30,1,'
  ].join('\n')
  const consoleError = jest.spyOn(console, 'error')
  const { container, screen, fireEvent, wait } = renderAt('/vbrc-checker')
  // Jest uses the site's table, as the build does: no Highland Tinamou
  expect(require('./ebird-ext/bandingCodes.js').isBandingCode('HITI')).toBeFalsy()
  expect(require('./ebird-ext/bandingCodes.js').isBandingCode('BCCH')).toBeTruthy()
  await wait(() => expect(container.querySelector('.csv-container input[type=file]')).not.toBeNull())
  fireEvent.change(container.querySelector('.csv-container input[type=file]'), {
    target: { files: [new File([csv], 'MyEBirdData.csv', { type: 'text/csv' })] }
  })
  await wait(() => expect(screen.getByText('Vermont Firsts')).toBeTruthy(), { timeout: 20000 })
  const firsts = screen.getByText('Vermont Firsts').closest('.table-row').textContent
  expect(firsts).toContain('Steller\'s Sea-Eagle')
  expect(firsts).toContain('Vermont Testbird')
  expect(firsts).not.toContain('Black-capped Chickadee')
  expect(consoleError.mock.calls.filter(([message]) => !/Warning:/.test(String(message)))).toEqual([])
  consoleError.mockRestore()
})

test('the radius page lists the species within 5 miles of typed coordinates', async () => {
  const { container, screen, fireEvent } = renderAt('/radius')
  const input = await screen.findByLabelText('Latitude, longitude')
  fireEvent.change(input, { target: { value: '44.2601, -72.5754' } })
  // Text queries: role queries on this page are slow in jsdom
  fireEvent.click(screen.getByText('Show'))
  expect(await screen.findByText(/^\d+ species within 5 miles$/, {}, { timeout: 15000 })).toBeInTheDocument()
  expect(container.querySelectorAll('.species-list li').length).toBeGreaterThan(100)
})

// Draws every town; takes 4s locally and over 12s on GitHub's runners
test('renders the Project 251 page and its markdown', async () => {
  const { screen } = renderAt('/251')
  expect(await screen.findByRole('heading', { name: 'Test page' }, { timeout: 20000 })).toBeInTheDocument()
})

// Over 8s on GitHub's runners, right after the Project 251 page
test('renders a markdown content page', async () => {
  const { screen } = renderAt('/terms')
  expect(await screen.findByRole('heading', { name: 'Test page' }, { timeout: 20000 })).toBeInTheDocument()
}, 30000)
