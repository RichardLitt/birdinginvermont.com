import React, { Component } from 'react'
// import Spinner from 'react-bootstrap/Spinner'
import CSVReader from 'react-csv-reader'

const papaparseOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
}

class UploadButton extends Component {
  render() {
    let label = (this.props.label) ? this.props.label : "Select your MyEbirdData.csv file"
    if (!this.props.data.counties) {
      return (
        <div className="container-md csv-container">
          <CSVReader
            onFileLoaded={this.props.handleChange}
            label={label}
            parserOptions={papaparseOptions}
            cssClass="react-csv-input"
          />
        </div>
      )
    // } else if (this.loader) {
    //   return (
    //     <Spinner animation="border" role="status">
    //       <span className="sr-only">Loading...</span>
    //     </Spinner>
    //   )
    } else {
      return null
    }
  }
}

export default UploadButton