import React, { Component } from 'react'
import UploadButton from './UploadButton'
import ChecklistTableRow from './Checklists'

function AllRows (props) {
  let checklists = props.data
  if (checklists.norwich.length !== 0) {
    return (
      <div>
        <ChecklistTableRow title={"Your checklists"} data={checklists.norwich} text={"Here are all of your checklists from 2022 in Norwich, VT."} />
      </div>
    )
  } else {
    return (
      <div>
        <hr />
        <h2>You're all set!</h2>
        <p>You haven't submitted any checklists from Norwich! Get out there and bird!</p>
      </div>
    )
  }
}

class Norwich extends Component {
  render() {
    const checklists = this.props.data.checklists
    return (
      <div id="rarities" className="container-md">
        <div className="row">
          <h1>Norwich Checklists</h1>
          <p>This tool will tell you what checklists you've submitted in Norwich. This is useful for the <a href="https://vtecostudies.org/wildlife/wildlife-watching/vermont-county-bird-quest/norwich-quest-2022/">Norwich Quest</a>, which accepts any checklists from Norwich, Vermont. While this tool won't tell you if you've already shared these checklists, it should help you find out which ones you should share.</p>
          <p>First, <a href="https://ebird.org/downloadMyData" target="_blank" rel="noopener noreferrer" >download your data from eBird.</a> Then, load the unzipped .csv file here. Your data is not stored on this site in any way.</p>
          {checklists !== '' ?
            <AllRows data={checklists} /> :
            <UploadButton handleChange={this.props.handleChange} data={this.props.data} />
          }
        </div>
      </div>
    )
  }
}

export default Norwich