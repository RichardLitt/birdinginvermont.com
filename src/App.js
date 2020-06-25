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
