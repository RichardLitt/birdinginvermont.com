import React, { Component } from 'react';
import './App.scss';
import { Route } from 'react-router-dom';
import About from './About'
import Map from './Map'
import NavBar from './NavBar'
import Subspecies from './Subspecies'
import NFC from './NFC'
import BAWW from './nfc-species/baww'
import Rarities from './Rarities'
// import RadialView from './RadialView'
import Footer from './Footer'
import { withRouter } from 'react-router'
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
        <Route exact path='/nfc-species/baww' component={BAWW} />
        <Route exact path='/subspecies' component={Subspecies} />
        <Route exact path='/rarities' render={(props) =>(<Rarities {...props} component={Rarities} data={this.state.data} handleChange={this.handleChange} />)} />
        {/* <Route exact path='/10-mile' component={RadialView} data={this.state.data.radial} /> */}
        <Footer />
      </div>
    );
  }
}

export default withRouter(App)
