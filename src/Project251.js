import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import Map from './Map'
import { withRouter } from 'react-router'
// import UploadButton from './UploadButton'
// import ChecklistTableRow from './Checklists'
import { Link } from 'react-router-dom'
const ReactMarkdown = require('react-markdown')
const matter = require('gray-matter')


/* function AllRows (props) {
  let checklists = props.data
  if (checklists.vermont.length!== 0) {
    return (
      <div>
        <ChecklistTableRow title={"Your checklists"} data={checklists.vermont} text={"Here are all of your complete checklists from 2021 in Vermont."} />
      </div>
    )
  } else {
    return (
      <div>
        <hr />
        <h2>You're all set!</h2>
        <p>You haven't submitted any checklists in Vermont this year! Get out there and bird!</p>
      </div>
    )
  }
}

function Checklists (props) {
  let checklists = props.data.checklists
  return (
    <div id="rarities" className="container-md">
      <div className="row">
        {checklists !== '' ?
          <AllRows data={checklists} /> :
          <>
            <p>If you're interested in contributing, this site can show you what complete checklists you've submitted in Vermont this year.  While it can't tell if you've already shared these checklists, it should help you find out which ones you should share. Open each in a new tab and ensure it has been shared with <b>vermont251</b>.</p>
            <p>First, <a href="https://ebird.org/downloadMyData" target="_blank" rel="noopener noreferrer" >download your data from eBird.</a> Then, load the unzipped .csv file here. Your data is not stored on this site in any way.</p>
            <UploadButton handleChange={props.handleChange} data={props.data} />
          </>
        }
      </div>
    </div>
  )
} */


class Project251 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data,
      title: ''
    }

    fetch('./project251.md')
      .then((response) => response.text())
      .then((text) => {
        const doc = matter(text)
        this.setState({ text: doc.content, title: doc.data.title });
      });
  }

  render() {
    return (
      <div className="container-md page">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Project 251 | Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/251" />
          <meta name="description" content="Attempting to see 150 birds in every county of Vermont, in one year." />
        </Helmet>
        <div className="row">
          <div className="col-md-10 text-left">
            <h1>Project 251</h1>
            <ReactMarkdown source={this.state.text} escapeHtml={false} />
            <p>If you'd like to contribute to the Vermont Center for Ecostudies <a href="https://vtecostudies.org/wildlife/wildlife-watching/vermont-county-bird-quest/norwich-quest-2021/">Norwich Quest</a>, go <Link to="/norwich">here</Link>.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 text-left">
            <Map data={this.props.data} handleChange={this.handleChange} />
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Project251)