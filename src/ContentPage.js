import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
const ReactMarkdown = require('react-markdown')
const matter = require('gray-matter')

class ContentPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      text: null,
      title: ''
    }
  }

  componentDidMount() {
    let path
    const code = this.props.match?.params.code;
    if (this.props.match.url === this.props.match.path) {
      path = `${this.props.match.url}.md`
    } else {
      path = `${this.props.match.url}${(!code) ? '/index' : ''}.md`

    }
    fetch(path)
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
          <title>{(this.state.title) ? `${this.state.title} | ` : ''}Birding In Vermont</title>
          <link rel="canonical" href="https://birdinginvermont.com/" />
          <meta name="description" content="Helping birders in Vermont by providing tools and resources on how to bird, better, in Vermont." />
        </Helmet>
        <div className="row">
          <div className="col-md-8 col-sm-12 text-left">
            <ReactMarkdown source={this.state.text} escapeHtml={false}/>
          </div>
        </div>
      </div>
    )
  }
}

export default ContentPage