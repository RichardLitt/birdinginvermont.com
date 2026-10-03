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

test('a town\'s species are numbered by when first seen, and the sort buttons reorder them', async () => {
  const { container, wait, fireEvent } = renderAt('/towns')
  await wait(() => expect(container.querySelectorAll('#map svg path').length).toBeGreaterThan(200))
  // Burlington has hundreds of species; any path with a list will do
  const town = [...container.querySelectorAll('#map svg path')].find(p => {
    fireEvent.mouseOver(p)
    return container.querySelectorAll('#list .species-list li').length > 50
  })
  expect(town).toBeTruthy()
  const items = () => [...container.querySelectorAll('#list .species-list li')].map(li => li.textContent)
  const numbers = () => items().map(t => Number(t.split('.')[0]))
  const names = () => items().map(t => t.replace(/^\d+\. /, ''))
  // Order seen: 1, 2, 3, ...
  expect(numbers().slice(0, 3)).toEqual([1, 2, 3])
  const byNumber = Object.fromEntries(items().map(t => [t.replace(/^\d+\. /, ''), t]))

  fireEvent.click([...container.querySelectorAll('.list-sort button')].find(b => b.textContent === 'A–Z'))
  expect(names()).toEqual([...names()].sort((a, b) => a.localeCompare(b)))
  // Each species keeps its number
  for (const t of items()) expect(byNumber[t.replace(/^\d+\. /, '')]).toBe(t)

  fireEvent.click([...container.querySelectorAll('.list-sort button')].find(b => b.textContent === 'Order seen'))
  expect(numbers().slice(0, 3)).toEqual([1, 2, 3])
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
