import React, { Component } from 'react'
import { Helmet } from 'react-helmet'

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
            <p>This map shows hotspots which have no records of birds, as of January 2nd, 2022. Currently there are 54 unvisited hotspots.</p>
          </div>
        </div>
    )
  }
}

export default Hotspots