import React, { Component } from 'react'
import CSVReader from 'react-csv-reader'

const papaparseOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
}

class UploadButton extends Component {
  render() {
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
  }
}

export default UploadButton