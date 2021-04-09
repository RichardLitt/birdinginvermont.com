import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import Map from './Map'
const ReactMarkdown = require('react-markdown')
const matter = require('gray-matter')

class Project2100 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data
    }

    fetch('./project2100.md')
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
          <title>Project 2100 | Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/" />
          <meta name="description" content="Attempting to see 150 birds in every county of Vermont, in one year." />
        </Helmet>
        <div className="row">
          <div className="col-md-10 col-sm-12 text-left">
            <ReactMarkdown source={this.state.text} escapeHtml={false} />
            <p>Total county ticks count so far: {this.state.data.vt2100data.map(x => x.speciesTotal).reduce((a, b) => a + b, 0)}. The percentages below indicate how close I am to hitting 150 species in each county.</p>
            <Map data={this.state.data} handleChange={this.handleChange} />
          </div>
        </div>
      </div>
    )
  }
}

export default Project2100