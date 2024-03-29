import React, { Component } from 'react'
import { Helmet } from 'react-helmet'

class Towns extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: this.props.data
    }
  }

  render() {
    return (
        <div className="row">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Towns | Birding In Vermont</title>
            <link rel="canonical" href="https://birdinginvermont.com/" />
            <meta name="description" content="Showing birds which have been seen in towns in Vermont" />
          </Helmet>
          <div className="col-md-10 col-sm-12 text-left">
            <h1>Towns</h1>
            <p>This map shows all of the birds which have been seen in particular
            towns in Vermont, by anyone, as of January 2022 using the eBird database. You can see what species you've seen
            in any given town by uploading your eBird data.</p>
            <p>First, <a href="https://ebird.org/downloadMyData" target="_blank" rel="noopener noreferrer" >download your data from eBird.</a> Then, load the unzipped .csv file here. Your data is not stored on this site in any way. Depending on the size of your data, it may take a few seconds.</p>
          </div>
        </div>
    )
  }
}

export default Towns