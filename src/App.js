import React, { Component } from 'react';
import './App.scss';
import { Route } from 'react-router-dom';
import { withRouter } from 'react-router'
import About from './About'
import Map from './Map'
import NavBar from './NavBar'
import Footer from './Footer'
import ContentPage from './ContentPage'
import Rarities from './Rarities'
import Subspecies from './Subspecies'
import NFC from './NFC'

// Specific NFC species
import bawwPath from './nfc-species/baww.md'
import cawaPath from './nfc-species/cawa.md'

// Specific Subspecies
import amroPath from './subspecies/amro.md'
import wbnuPath from './subspecies/wbnu.md'

// import RadialView from './RadialView'
const ebird = require('./ebird-ext/index.js')

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        towns: '',
        regions: '',
        rarities: ''
        // radial: '',
      }
    }
    this.handleChange = this.handleChange.bind(this);
  }

  async handleChange(e) {
    let towns = await ebird.towns({all: true, input: e})
    let regions = await ebird.regions({all: true, input: e})
    let rarities = await ebird.rare({input: e}) // Input?
    // let radial = await ebird.radialSearch({input: e, coordinates: [44.259548, -72.575882]})
    this.setState({
      data: {
        towns: towns,
        regions: regions,
        rarities: rarities
        // radial: radial
      }
    })
  }

  render() {
    return (
      <div className="App">
        <NavBar />
        <Route exact path='/' component={About} />
        <Route exact path='/about' component={About} />
        <Route exact path='/towns' render={(props) => (<Map {...props} component={Map} data={this.state.data} handleChange={this.handleChange} />)} />
        <Route exact path='/regions' render={(props) => (<Map {...props} component={Map} data={this.state.data} handleChange={this.handleChange} />)} />
        <Route exact path='/nfc' component={NFC} />
        <Route exact path='/nfc-species/baww' render={(props) => (<ContentPage {...props} component={ContentPage} data={bawwPath} />)} />
        <Route exact path='/nfc-species/cawa' render={(props) => (<ContentPage {...props} component={ContentPage} data={cawaPath} />)} />
        <Route exact path='/subspecies' component={Subspecies} />
        <Route exact path='/subspecies/amro' render={(props) => (<ContentPage {...props} component={ContentPage} data={amroPath} />)} />
        <Route exact path='/subspecies/wbnu' render={(props) => (<ContentPage {...props} component={ContentPage} data={wbnuPath} />)} />
        <Route exact path='/rarities' render={(props) =>(<Rarities {...props} component={Rarities} data={this.state.data} handleChange={this.handleChange} />)} />
        {/* <Route exact path='/10-mile' component={RadialView} data={this.state.data.radial} /> */}
        <Footer />
      </div>
    );
  }
}

export default withRouter(App)
