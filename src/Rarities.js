import React, { Component } from 'react'
import UploadButton from './UploadButton'

class Rarities extends Component {
  render() {
    if (this.props.data) {
      return (
        'Yippee!'
      )
    } else {
      return (
        <div className="container-md">
          <div className="row" style={{'display': 'block'}} >
            <UploadButton handleChange={this.props.handleChange} data={this.props.data} />
          </div>
        </div>
      )
    }
  }
}

export default Rarities