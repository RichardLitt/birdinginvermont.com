import React, { Component } from 'react';
import './App.scss';
import { Route, Switch, Redirect } from 'react-router-dom';
import { withRouter } from 'react-router'
import About from './About'
import Map from './Map'
import NavBar from './NavBar'
import Footer from './Footer'
import ContentPage from './ContentPage'
import Rarities from './Rarities'
import NoMatchPage from './NoMatchPage'

import termsPath from './terms.md'
import fbsPath from './female-birdsong.md'

// Specific NFC species
import nfcPath from './nfc-species/index.md'
import upsaPath from './nfc-species/upsa.md'
import spsaPath from './nfc-species/spsa.md'
import sosaPath from './nfc-species/sosa.md'
import bawwPath from './nfc-species/baww.md'
import cmwaPath from './nfc-species/cmwa.md'
import cmwaImg from './assets/CMWA.png'
import bbwaPath from './nfc-species/bbwa.md'
import wiwaPath from './nfc-species/wiwa.md'
import cawaPath from './nfc-species/cawa.md'
import ovenPath from './nfc-species/oven.md'
import wtspPath from './nfc-species/wtsp.md'
import ampiPath from './nfc-species/ampi.md'
import dunlPath from './nfc-species/dunl.md'
import pisiPath from './nfc-species/pisi.md'

// Specific Subspecies
import subspeciesPath from './subspecies/index.md'
import amroPath from './subspecies/amro.md'
import wbnuPath from './subspecies/wbnu.md'
import carwPath from './subspecies/carw.md'
import bwhaPath from './subspecies/bwha.md'
import gbhePath from './subspecies/gbhe.md'
import nocaPath from './subspecies/noca.md'
import nswoPath from './subspecies/nswo.md'
import pisiSspPath from './subspecies/pisi.md'
import hofiSspPath from './subspecies/hofi.md'

// import RadialView from './RadialView'
const ebird = require('./ebird-ext/index.js')

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        checklistLocations: '',
        towns: '',
        regions: '',
        rarities: '',
        counties: ''
      }
    }
    this.handleChange = this.handleChange.bind(this);
  }

  async handleChange(e) {
    let checklistLocations = await ebird.checklistLocations({all: true, input: e})
    let rarities = await ebird.rare({input: e, checklistLocations}) // Input?
    let towns = await ebird.towns({all: true, input: e, checklistLocations})
    let regions = await ebird.regions({all: true, input: e, checklistLocations})
    let counties = await ebird.counties({all: true, input: e, checklistLocations})
    // let radial = await ebird.radialSearch({input: e, coordinates: [44.259548, -72.575882]})
    this.setState({
      data: {
        checklistLocations,
        towns,
        regions,
        rarities,
        counties
      }
    })
  }

  render() {
    return (
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path='/' component={About} />
          <Route exact path='/about' component={About} />
          <Route exact path='/towns' render={(props) => (<Map {...props} component={Map} data={this.state.data} handleChange={this.handleChange} />)} />
          <Route exact path='/counties' render={(props) => (<Map {...props} component={Map} data={this.state.data} handleChange={this.handleChange} />)} />
          <Route exact path='/regions' render={(props) => (<Map {...props} component={Map} data={this.state.data} handleChange={this.handleChange} />)} />
          <Route exact path='/female-birdsong' render={(props) => (<ContentPage {...props} component={ContentPage} data={fbsPath} />)} />
          <Route exact path="/nfc"><Redirect to="/nfc-species" /></Route>
          <Route exact path='/nfc-species' render={(props) => (<ContentPage {...props} component={ContentPage} data={nfcPath} />)}  />
          <Route exact path='/nfc-species/upsa' render={(props) => (<ContentPage {...props} component={ContentPage} data={upsaPath} />)} />
          <Route exact path='/nfc-species/spsa' render={(props) => (<ContentPage {...props} component={ContentPage} data={spsaPath} />)} />
          <Route exact path='/nfc-species/sosa' render={(props) => (<ContentPage {...props} component={ContentPage} data={sosaPath} />)} />
          <Route exact path='/nfc-species/baww' render={(props) => (<ContentPage {...props} component={ContentPage} data={bawwPath} />)} />
          <Route exact path='/nfc-species/cmwa' render={(props) => (<ContentPage {...props} component={ContentPage} data={cmwaPath} img={cmwaImg}/ >)} />
          <Route exact path='/nfc-species/bbwa' render={(props) => (<ContentPage {...props} component={ContentPage} data={bbwaPath} />)} />
          <Route exact path='/nfc-species/cawa' render={(props) => (<ContentPage {...props} component={ContentPage} data={cawaPath} />)} />
          <Route exact path='/nfc-species/wiwa' render={(props) => (<ContentPage {...props} component={ContentPage} data={wiwaPath} />)} />
          <Route exact path='/nfc-species/oven' render={(props) => (<ContentPage {...props} component={ContentPage} data={ovenPath} />)} />
          <Route exact path='/nfc-species/wtsp' render={(props) => (<ContentPage {...props} component={ContentPage} data={wtspPath} />)} />
          <Route exact path='/nfc-species/ampi' render={(props) => (<ContentPage {...props} component={ContentPage} data={ampiPath} />)} />
          <Route exact path='/nfc-species/dunl' render={(props) => (<ContentPage {...props} component={ContentPage} data={dunlPath} />)} />
          <Route exact path='/nfc-species/pisi' render={(props) => (<ContentPage {...props} component={ContentPage} data={pisiPath} />)} />
          <Route exact path='/subspecies' render={(props) => (<ContentPage {...props} component={ContentPage} data={subspeciesPath} />)} />
          <Route exact path='/subspecies/amro' render={(props) => (<ContentPage {...props} component={ContentPage} data={amroPath} />)} />
          <Route exact path='/subspecies/nswo' render={(props) => (<ContentPage {...props} component={ContentPage} data={nswoPath} />)} />
          <Route exact path='/subspecies/wbnu' render={(props) => (<ContentPage {...props} component={ContentPage} data={wbnuPath} />)} />
          <Route exact path='/subspecies/carw' render={(props) => (<ContentPage {...props} component={ContentPage} data={carwPath} />)} />
          <Route exact path='/subspecies/bwha' render={(props) => (<ContentPage {...props} component={ContentPage} data={bwhaPath} />)} />
          <Route exact path='/subspecies/gbhe' render={(props) => (<ContentPage {...props} component={ContentPage} data={gbhePath} />)} />
          <Route exact path='/subspecies/noca' render={(props) => (<ContentPage {...props} component={ContentPage} data={nocaPath} />)} />
          <Route exact path='/subspecies/pisi' render={(props) => (<ContentPage {...props} component={ContentPage} data={pisiSspPath} />)} />
          <Route exact path='/subspecies/hofi' render={(props) => (<ContentPage {...props} component={ContentPage} data={hofiSspPath} />)} />
          <Route exact path='/vbrc-checker' render={(props) =>(<Rarities {...props} component={Rarities} data={this.state.data} handleChange={this.handleChange} />)} />
          <Route exact path='/vbrc-checker' render={(props) =>(<Rarities {...props} component={Rarities} data={this.state.data} handleChange={this.handleChange} />)} />
          <Route exact path='/terms' render={(props) =>(<ContentPage {...props} component={ContentPage} data={termsPath} />)} />
          {/* <Route exact path='/10-mile' component={RadialView} data={this.state.data.radial} /> */}
          <Route component={NoMatchPage} />
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default withRouter(App)
