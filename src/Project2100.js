import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import Map from './Map'

class Project2100 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data
    }
  }

  render() {
    return (
      <div className="container-md page">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Project 2100 | Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/" />
          <meta name="description" content="Attempting to see 150 birds in every county of Vermont, in one year." />
        </Helmet>
        <div className="row">
          <div className="col-md-10 col-sm-12 text-left">
            <h1>Project 2100</h1>
            <p>This year, I am attempting to see 150 species in each and every county in Vermont - 2100 birds in total.</p>
            <p>The far more experienced birders Fred Pratt and Craig Provost have shown it is possible to do this over years of effort. I wonder if it is possible to do it on a shorter timeline, using eBird data, code, nocturnal flight calls, and help on the ground. As far as I know, this is a ridiculous enough goal that it has never been attempted.</p>
            <p>Obviously, this is quite difficult, and involves a lot of weekends driving around looking for specific birds. Below is a map of what I've seen so far, and where. I would love help with this project: tips on where to find good birds, driveways I can sleep in my car in on Saturday nights, and, mainly, partners to go birding with! I can't hear Golden-crowned Kinglets or Blackpoll Warblers, so people with good ears would be especially great to go birding with. Get in touch.</p>
            <p>Suggestions on how to make this page more useful are most welcome.</p>
            <p>This is not a solo effort. Friends who have helped so far: <a href="https://ebird.org/profile/MTA5MzA2Nw">Ben Acker</a>, <a href="https://ebird.org/profile/NDIwNDA1/US-VT">Zac Cota</a>, <a href="https://ebird.org/vt/profile/MTgxNDYz/US-VT">Nathaniel Sharp</a>, <a href="https://ebird.org/profile/NDM2MDU1/US-VT">Cedar Stanistreet</a>, Kyle Tansley, Jim Mead, Jan Thouron, Larry Clarfeld, Kyle Jones, David Guertin, Avery Fish, Sean Beckett, Chip and Charles and Sam Darmstadt, Dick Mansfield, and the entire WaCo Twitchers Crew, among others.</p>
            <p>Total county ticks count so far: {this.state.data.vt2100data.map(x => x.speciesTotal).reduce((a, b) => a + b, 0)}. The percentages below indicate how close I am to hitting 150 species in each county.</p>
            <p>Last updated: <i>March 4th, 2021</i>.</p>
            <Map data={this.state.data} handleChange={this.handleChange} />
          </div>
        </div>
      </div>
    )
  }
}

export default Project2100