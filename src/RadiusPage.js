import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router'
import VermontTowns from './ebird-ext/geojson/display/vt_towns.json'
import Lake from './ebird-ext/geojson/display/lake.json'
import areaMeta from './ebird-ext/data/area_sightings_meta.json'
import * as banding from './ebird-ext/bandingCodes.js'
import UploadButton from './UploadButton'
import SpeciesList from './SpeciesList'
const d3 = require('d3')
const d3Geo = require('d3-geo')

const WIDTH = 520
const HEIGHT = 800
// The same projection as the other maps
const projection = d3Geo.geoTransverseMercator().rotate([72.57, -44.20]).translate([250, 300]).scale([18000])
const path = d3Geo.geoPath().projection(projection)
// Miles in one degree of a great circle
const MILES_PER_DEGREE = 69.055
// Roughly Vermont, to catch typos in typed coordinates
const BOUNDS = { south: 42.6, north: 45.1, west: -73.5, east: -71.4 }

function milesBetween ([lat1, lng1], [lat2, lng2]) {
  const rad = x => x * Math.PI / 180
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(a))
}

// Every species anyone has recorded in a grid square (about 2 km across) whose
// centre is within the radius. Each square is a bitmap over grid.species.
function speciesNear (grid, centre, miles) {
  const found = new Set()
  for (const [square, bitmap] of Object.entries(grid.squares)) {
    const [i, j] = square.split(',').map(Number)
    if (milesBetween(centre, [(i + 0.5) * grid.lat, (j + 0.5) * grid.lng]) > miles) continue
    const bits = window.atob(bitmap)
    grid.species.forEach((code, n) => {
      if ((bits.charCodeAt(n >> 3) >> (n & 7)) & 1) found.add(code)
    })
  }
  return [...found].map(code => banding.codeToCommonName(code))
}

// "Dark-eyed Junco (Slate-colored)" -> "Dark-eyed Junco", keeping the order
// first seen
function speciesOnly (names) {
  return [...new Set(names.map(name => name.split(' (')[0]))]
}

class RadiusPage extends Component {
  constructor (props) {
    super(props)
    this.state = { centre: null, miles: 5, coordinates: '', error: '', everyone: null, yours: null, sortVersion: 0 }
  }

  componentDidMount () {
    this.drawMap()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.data.input !== this.props.data.input && this.state.centre) this.update()
  }

  drawMap () {
    const svg = d3.select(this.svg)
    svg.selectAll('*').remove()
    svg.append('g').selectAll('path').data(VermontTowns.features).enter().append('path')
      .attr('d', path).attr('fill', '#fdd49e').attr('stroke', '#fff').attr('stroke-width', 0.5)
    svg.append('path').datum(Lake).attr('d', path).attr('fill', '#b3d1f7')
    this.circle = svg.append('path').attr('class', 'radius-circle')
      .attr('fill', 'rgba(31, 78, 107, 0.15)').attr('stroke', '#1f4e6b').attr('stroke-width', 2)
    this.marker = svg.append('circle').attr('r', 4).attr('fill', '#1f4e6b').style('display', 'none')
    const page = this
    svg.on('click', function () {
      const [lng, lat] = projection.invert(d3.mouse(this))
      page.setCentre(lat, lng)
    })
  }

  setCentre (lat, lng) {
    if (!(lat >= BOUNDS.south && lat <= BOUNDS.north && lng >= BOUNDS.west && lng <= BOUNDS.east)) {
      this.setState({ error: 'That point isn’t in Vermont. Enter a latitude and longitude, e.g. 44.2601, -72.5754.' })
      return
    }
    this.setState({ centre: [lat, lng], coordinates: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, error: '' }, () => this.update())
  }

  setMiles (miles) {
    this.setState({ miles }, () => this.state.centre && this.update())
  }

  handleCoordinates = (event) => {
    event.preventDefault()
    const [lat, lng] = this.state.coordinates.split(/[,\s]+/).filter(Boolean).map(Number)
    this.setCentre(lat, lng)
  }

  async update () {
    const { centre, miles } = this.state
    const [lat, lng] = centre
    this.circle.datum(d3Geo.geoCircle().center([lng, lat]).radius(miles / MILES_PER_DEGREE)()).attr('d', path)
    this.marker.attr('cx', projection([lng, lat])[0]).attr('cy', projection([lng, lat])[1]).style('display', null)

    // Loads only on this page
    if (!this.grid) this.grid = (await import('./ebird-ext/data/grid_sightings.json')).default
    const everyone = speciesNear(this.grid, centre, miles)

    let yours = null
    if (this.props.data.input) {
      const { default: ebird } = await import('./ebird-ext/index.js')
      const result = await ebird.radialSearch({ input: this.props.data.input, coordinates: centre, distance: miles })
      yours = speciesOnly(result.species)
    }
    // Ignore a result for a centre or radius that has since changed
    if (this.state.centre === centre && this.state.miles === miles) this.setState({ everyone, yours })
  }

  render () {
    const { miles, everyone, yours, error } = this.state
    const redraw = () => this.setState(s => ({ sortVersion: s.sortVersion + 1 }))
    const notYours = everyone && yours && everyone.filter(name => !yours.includes(name))
    return (
      <div className="container-md page">
        <Helmet>
          <meta charSet="utf-8" />
          <title>5- and 10-Mile Radius | Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/radius" />
          <meta name="description" content="Every bird recorded within 5 or 10 miles of a spot in Vermont, and which of them you've seen there." />
        </Helmet>
        <div className="row">
          <div className="col-md-10 text-left">
            <h1>5- and 10-Mile Radius</h1>
            <p>Many birders keep a list of the birds they've seen within 5 miles of home (a "5MR"). Click the map, or enter a latitude and longitude, to see every species anyone has recorded within 5 or 10 miles of that spot. Upload your eBird data to see which of them you've seen there, and which you haven't.</p>
            <p className="text-muted">Everyone's records come from the {areaMeta.release} eBird Basic Dataset, grouped into squares about 2 km across, so the edge of the circle is approximate. eBird leaves sensitive species out of the dataset. Your own list is exact.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 radius-map">
            <svg ref={node => { this.svg = node }} width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              preserveAspectRatio="xMidYMin meet" role="img" aria-label="Map of Vermont: click to choose the centre" />
          </div>
          <div className="col-md-6">
            <div className="btn-group btn-group-sm mb-2" role="group" aria-label="Radius">
              {[5, 10].map(m => (
                <button key={m} type="button" className={`btn btn-outline-secondary${m === miles ? ' active' : ''}`}
                  aria-pressed={m === miles} onClick={() => this.setMiles(m)}>{m} miles</button>
              ))}
            </div>
            <form className="form-inline mb-2" onSubmit={this.handleCoordinates}>
              <label htmlFor="radius-coordinates" className="mr-2">Latitude, longitude</label>
              <input id="radius-coordinates" className="form-control form-control-sm mr-2" placeholder="44.2601, -72.5754"
                value={this.state.coordinates} onChange={e => this.setState({ coordinates: e.target.value })} />
              <button type="submit" className="btn btn-sm btn-secondary">Show</button>
            </form>
            {error && <p className="text-danger" role="alert">{error}</p>}
            <UploadButton handleChange={this.props.handleChange} data={this.props.data} />
            {everyone && !yours && (
              <div>
                <h4>{everyone.length} species within {miles} miles</h4>
                <SpeciesList names={everyone} onSort={redraw} />
              </div>
            )}
            {everyone && yours && (
              <div>
                <h4>You've seen {yours.length} species within {miles} miles</h4>
                <p className="text-muted">Anyone: {everyone.length}</p>
                <SpeciesList names={yours} numbered onSort={redraw} />
                <hr />
                <details>
                  <summary><b>Recorded here, not by you ({notYours.length})</b></summary>
                  <SpeciesList names={notYours} onSort={redraw} />
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(RadiusPage)
