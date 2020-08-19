import React, { Component } from 'react'
const ReactMarkdown = require('react-markdown')

class ContentPage extends Component {
  constructor(props) {
    super(props)

    this.state = { text: null }
  }

  componentWillMount() {
    const path = this.props.data
    fetch(path).then((response) => response.text()).then((text) => {
      this.setState({ text: text })
    })
  }

  render() {
    return (
      <div className="container-md page">
        <div className="row">
          <div className="col-8 text-left">
            <ReactMarkdown source={this.state.text} escapeHtml={false} />
          </div>
        </div>
      </div>
    )
  }
}

export default ContentPage