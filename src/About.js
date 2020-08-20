import React, { Component } from 'react'

class About extends Component {
  render() {
    return (
      <div className="container-md">
        <div className="row">
          <div className="col-md-8 col-sm-12 text-left">
            <img class="banner-image" src="rbgr.png" alt="Rose-breasted Grosbeak. © 2020 Richard Littauer"/>
            <p style={{backgroundColor:"#FFFF00"}}><b>Notice:</b> This site is a work in construction. Eventually, we'll have a nice landing page.</p>
            <p>For now, there are a few things we have here. First, <b>the map below</b> can be populated with <a href="https://ebird.org/downloadMyData">your eBird data</a> to show you what species you've seen in each town in Vermont. You can also upload your data regarding your photo or audio submissions to the Macaulay library. The <b>Biophysical Regions</b> tabs shows you what you've sene in each region of Vermont. Clicking and unclicking on a town once you've loaded your data allows you to move your mouse and look around some more.</p>
            <p>The <b>Subspecies</b> page is in active development, too, but will eventually show you information on the birds in Vermont that have interesting subspecies. For now, they'll likely be updated frequently one at a time.</p>
            <p>The <b>NFCs</b> page is for information related to Nocturnal Flight Calls, and species research there.</p>
            <p>The <b>Rarities</b> page will check your eBird records from 2020 for rare birds that should be submitted to the Vermont Birds Records Committee.</p>
            <h2>Updates</h2>
            <ul>
              <li><b>August 18th:</b> Added the <a href="/rarities">VBRC Records checker</a>.</li>
              <li><b>August 18th:</b> Added the <a href="/subspecies/wbnu">White-breasted Nuthatch</a> subspecies page.</li>
              <li><b>August 19th:</b> Added the <a href="/nfc-species/cawa">Canada Warbler</a> NFC page.</li>
              <li><b>August 20th:</b> Added the <a href="/nfc-species/upsa">Upland Sandpiper</a> NFC page.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default About