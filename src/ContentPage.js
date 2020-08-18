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
        <div className="row" style={{'display': 'block'}} >
          <ReactMarkdown source={this.state.text} />
        </div>
      </div>
    )
  }
}

export default ContentPage