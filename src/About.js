import React, { Component } from 'react'

class About extends Component {
  render() {
    return (
      <div className="container-md">
        <div className="row">
          <div className="col-8 text-left">
            <p style={{backgroundColor:"#FFFF00"}}><b>Notice:</b> This site is a work in construction. Eventually, we'll have a nice landing page.</p>
            <p>For now, there are a few things we have here. First, <b>the map below</b> can be populated with <a href="https://ebird.org/downloadMyData">your eBird data</a> to show you what species you've seen in each town in Vermont. You can also upload your data regarding your photo or audio submissions to the Macaulay library. The <b>Biophysical Regions</b> tabs shows you what you've sene in each region of Vermont. Clicking and unclicking on a town once you've loaded your data allows you to move your mouse and look around some more.</p>
            <p>The <b>Subspecies</b> tab is in active development, too, but will eventually show you information on the birds in Vermont that have interesting subspecies. For now, they'll likely be updated frequently one at a time.</p>
          </div>
        </div>
      </div>
    )
  }
}

export default About