// Smoke tests: render the whole site at each kind of page, so a dependency
// update that breaks rendering (React, the router, react-bootstrap,
// react-select, react-datepicker, Leaflet, d3, react-markdown) fails here,
// not in production.

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

test('a town\'s species are numbered by when first seen, and the sort buttons reorder and reverse them', async () => {
  window.localStorage.clear()
  const { container, wait, fireEvent } = renderAt('/towns')
  await wait(() => expect(container.querySelectorAll('#map svg path').length).toBeGreaterThan(200))
  // Any town with a long list will do
  const town = [...container.querySelectorAll('#map svg path')].find(p => {
    fireEvent.mouseOver(p)
    return container.querySelectorAll('#list .species-list li').length > 50
  })
  expect(town).toBeTruthy()
  const items = () => [...container.querySelectorAll('#list .species-list li')].map(li => li.textContent)
  const numbers = () => items().map(t => Number(t.split('.')[0]))
  const button = label => [...container.querySelectorAll('.list-sort button')].find(b => b.textContent.startsWith(label))
  const click = label => fireEvent.click(button(label))

  // Order seen: 1, 2, 3, ... with an up arrow on the active button
  expect(numbers().slice(0, 3)).toEqual([1, 2, 3])
  expect(button('Order seen').textContent).toBe('Order seen ↑')
  const count = items().length

  // Clicking it again reverses it: newest first
  click('Order seen')
  expect(button('Order seen').textContent).toBe('Order seen ↓')
  expect(numbers().slice(0, 2)).toEqual([count, count - 1])

  // A-Z starts the right way up, without numbers
  click('A–Z')
  expect(button('A–Z').textContent).toBe('A–Z ↑')
  expect(button('Order seen').textContent).toBe('Order seen')
  expect(container.querySelector('#list .seen-number')).toBeNull()
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

// Draws every town; takes 4s locally and over 12s on GitHub's runners
test('renders the Project 251 page and its markdown', async () => {
  const { screen } = renderAt('/251')
  expect(await screen.findByRole('heading', { name: 'Test page' }, { timeout: 20000 })).toBeInTheDocument()
}, 30000)

test('renders a markdown content page', async () => {
  const { screen } = renderAt('/terms')
  expect(await screen.findByRole('heading', { name: 'Test page' })).toBeInTheDocument()
})
