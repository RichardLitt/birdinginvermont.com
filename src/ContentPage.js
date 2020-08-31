import React, { Component } from 'react'
const ReactMarkdown = require('react-markdown')

class ContentPage extends Component {
  constructor(props) {
    super(props)

    this.state = { text: null }
  }

  componentWillMount() {
    const path = this.props.data
    const img = this.props.img
    this.setState({img})
    fetch(path).then((response) => response.text()).then((text) => {
      this.setState({text})
    })
  }

  render() {
    return (
      <div className="container-md page">
        <div className="row">
          <div className="col-md-8 col-sm-12 text-left">
            <ReactMarkdown source={this.state.text} escapeHtml={false} transformImageUri={() => this.state.img}/>
          </div>
        </div>
      </div>
    )
  }
}

export default ContentPage