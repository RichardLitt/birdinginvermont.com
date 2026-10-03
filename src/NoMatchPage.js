import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'

const input = `
# Fly away, little bird

This isn't a page! It's probably not your fault. Try a different link?

`

class NoMatchPage extends Component {
  render() {
    return (
      <div className="container-md page">
        <div className="row">
          <div className="col-md-8 col-sm-12 text-left">
            <ReactMarkdown>{input}</ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }
}

export default NoMatchPage