import React, { Component } from 'react'
import bawwPath from './baww.md'
const ReactMarkdown = require('react-markdown')

// TODO Take input from files and display it dynamically for each file

class NFC extends Component {
  constructor(props) {
    super(props)

    this.state = { text: null }
  }

  componentWillMount() {
    fetch(bawwPath).then((response) => response.text()).then((text) => {
      this.setState({ text: text })
    })
  }

  render() {
    return (
      <div className="container-md page">
        <div className="row" style={{'display': 'block'}} >
          <ReactMarkdown source={this.state.text} />
        </div>
      </div>
    )
  }
}

export default NFC