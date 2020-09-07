import React, { Component } from 'react'

class Subspecies extends Component {
  render() {
    return (
      <div className="container-md">
        <div className="row" style={{'display': 'block'}} >
          <h1>Subspecies in Vermont</h1>
          <p>A page for each subspecies is forthcoming, as is better styling.</p>
          <ul>
            <li><a href="/subspecies/bwha">Broad-winged Hawk (BWHA)</a></li>
            <li><a href="/subspecies/wbnu">White-breasted Nuthatch (WBNU)</a></li>
            <li><a href="/subspecies/carw">Carolina Wren (CARW)</a></li>
            <li><a href="/subspecies/amro">American Robin (AMRO)</a></li>
          </ul>
          <p><a href="/subspecies/list">The List of Subspecies</a></p>
        </div>
      </div>
    )
  }
}

export default Subspecies