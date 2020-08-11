import React, { Component } from 'react'

class NFC extends Component {
  render() {
    return (
      <div className="container-md">
        <div className="row" style={{'display': 'block'}} >
          <h1>Nocturnal Flight Calls</h1>
          <p>Nocturnal Flight Calls (NFCs) are a fascinating new area of research. In the past few decades, we've learned that many birds call during the night while flying over in migration. By using microphones that record these calls while we sleep, and computer software to analyze them and speed up the identification process, we can say with some certainty what kinds of birds are flying overhead. However, the field is still nascent.</p>
          <p>Here in Vermont, we have a few hobbyists recording NFCs. In order to collect our knowledge in one location, Larry Clarfeld and I have recently set up <a href="https://list.uvm.edu/cgi-bin/wa?A0=NFC">the NFC-VT email listserv</a>. If you're interested in learning more about NFCs, get in touch.</p>
          <p>My goal for this website is to showcase what birds we've seen, what birds we have clear identificaitons for, and what birds we don't. Hopefully, this site will become a resource for NFC stations and researchers here in Vermont and on the east coast.</p>
        </div>
      </div>
    )
  }
}

export default NFC