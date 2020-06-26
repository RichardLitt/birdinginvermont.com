import React, { Component } from 'react';
import './App.scss';
import NavBar from './NavBar'
import Map from './Map'
import RadialView from './RadialView'
import Footer from './Footer'
import CSVReader from 'react-csv-reader'
const ebird =  require('./ebird-ext/index.js')

const papaparseOptions = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
}

class App extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.changeActiveView = this.changeActiveView.bind(this)
    this.state = {
      data: '',
      active: 'towns'
    }
  }

  changeActiveView (changeState) {
    this.setState({
      data: '',
      active: changeState
    })
  }

  async handleChange(e) {
    let res
    if (this.state.active === 'towns') {
      res = await ebird.towns({all: true, input: e})
    } else if (this.state.active === 'regions') {
      res = await ebird.regions({all: true, input: e})
    } else if (this.state.active === 'radial') {
      res = await ebird.radialSearch({input: e, coordinates: [44.259548, -72.575882]})
    }
    console.log(res)
    this.setState({
      data: res
    })
  }

  render() {
    const data = this.state.data
    const active = this.state.active
    return (
      <div className="App">
        <NavBar changeActiveView={this.changeActiveView} active={active} />
        <div className="container-md">
          <div className="row">
            <div classname="col-8 text-left">
              <p style={{backgroundColor:"#FFFF00"}}><b>Notice:</b> This site is a work in construction. Eventually, we'll have a nice landing page.</p>
              <p>For now, there are a few things we have here. First, <b>the map below</b> can be populated with <a href="https://ebird.org/downloadMyData">your eBird data</a> to show you what species you've seen in each town in Vermont. You can also upload your data regarding your photo or audio submissions to the Macaulay library. The <b>Biophysical Regions</b> tabs shows you what you've sene in each region of Vermont. Clicking and unclicking on a town once you've loaded your data allows you to move your mouse and look around some more.</p>
              <p>The <b>Subspecies</b> tab is in active development, too, but will eventually show you information on the birds in Vermont that have interesting subspecies. For now, they'll likely be updated frequently one at a time.</p>
              <hr />
            </div>
          </div>
        </div>
        <div className="container-md">
          <div className="row">
            <div className="col text-center">
              <CSVReader
                onFileLoaded={this.handleChange}
                label="Select your MyEbirdData.csv file"
                parserOptions={papaparseOptions}
              />
            </div>
          </div>
        </div>
        {active === 'radial'
          ? <RadialView data={data} active={active} />
          : <Map data={data} active={active} size={[750,750]} />}
        <Footer />
      </div>
    );
  }
}

export default App;
