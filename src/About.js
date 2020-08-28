import React, { Component } from 'react'
import aboutPath from './About.md'
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