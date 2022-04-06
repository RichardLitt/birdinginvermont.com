import React, { Component } from 'react'
import aboutPath from './About.md'
import { Helmet } from 'react-helmet'
const ReactMarkdown = require('react-markdown')

class About extends Component {
  constructor(props) {
    super(props)

    this.state = { text: null }
  }

  componentWillMount() {
    const path = aboutPath
    fetch(path).then((response) => response.text()).then((text) => {
      this.setState({ text: text })
    })
  }

  render() {
    return (
      <div id="about" className="container-md">
        <Helmet>
          <meta charSet="utf-8" />
          <title>About | Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/" />
          <meta name="description" content="Helping birders in Vermont by providing tools and resources on how to bird, better, in Vermont." />
        </Helmet>
        <div className="row">
          <div className="col-md-8 col-sm-12 text-left">
            <img className="banner-image" src="rbgr.png" alt="Rose-breasted Grosbeak. © 2020 Richard Littauer"/>
            <ReactMarkdown source={this.state.text} escapeHtml={false} />
          </div>
        </div>
      </div>
    )
  }
}

export default About