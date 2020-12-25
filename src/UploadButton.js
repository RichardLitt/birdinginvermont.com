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
    if (!this.props.data.counties) {
      return (
        <div className="container-md">
          <div className="row">
            <div className="col text-center">
              <CSVReader
                onFileLoaded={this.props.handleChange}
                label="Select your MyEbirdData.csv file"
                parserOptions={papaparseOptions}
              />
            </div>
          </div>
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