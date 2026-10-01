import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import VermontHotspots from './ebird-ext/data/hotspots.json'

const unvisitedCount = VermontHotspots.filter(x => !x['Last visited']).length
// The data has no download date; the latest visit to any hotspot is within a day of it
const lastVisit = VermontHotspots.map(x => x['Last visited'] || '').reduce((a, b) => (a > b ? a : b), '').slice(0, 10)
const asOf = lastVisit
  ? new Date(lastVisit + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : ''

class Hotspots extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data
    }
  }

  render() {
    return (
        <div className="row">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Unvisited Hotspots | Birding In Vermont</title>
            <link rel="canonical" href="https://birdinginvermont.com/" />
            <meta name="description" content="Showing hotspots in Vermont" />
          </Helmet>
          <div className="col-md-10 col-sm-12 text-left">
            <h1>Unvisited Hotspots</h1>
            <p>This map shows hotspots which have no records of birds{asOf ? `, as of ${asOf}` : ''}. Currently there are {unvisitedCount} unvisited hotspots out of {VermontHotspots.length.toLocaleString()} in Vermont.</p>
          </div>
        </div>
    )
  }
}

export default Hotspots