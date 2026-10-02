import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import Map from './Map'
import { withRouter } from 'react-router'
const ReactMarkdown = require('react-markdown')
const matter = require('gray-matter')


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
    const meta = this.props.data.vt251meta
    return (
      <div className="container-md page">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Project 251 | Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/251" />
          <meta name="description" content="Can Vermont birders submit a complete checklist in every town in one year? See which towns still need a visit." />
        </Helmet>
        <div className="row">
          <div className="col-md-10 text-left">
            <h1>Project 251</h1>
            <ReactMarkdown source={this.state.text} escapeHtml={false} />
            {meta && <p className="text-muted">
              Checklists from {meta.year}, from the {meta.release} <a href="https://ebird.org/data/download" target="_blank" rel="noopener noreferrer">eBird Basic Dataset</a>. Last updated {meta.updated}.
              {' '}Data: eBird Basic Dataset. Version: EBD_rel{meta.release && meta.release.replace(' ', '-')}. Cornell Lab of Ornithology, Ithaca, New York.
            </p>}
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