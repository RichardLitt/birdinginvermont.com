import React, { Component } from 'react'
import './App.scss'
import { Route, Switch, Redirect, Router } from 'react-router-dom'
import { createBrowserHistory } from "history"
import About from './About'
import Map from './Map'
import NavBar from './NavBar'
import Footer from './Footer'
import ContentPage from './ContentPage'
import Rarities from './Rarities'
import NoMatchPage from './NoMatchPage'
import vt251data from './ebird-ext/vt_town_counts.json'
import vt2100data from './ebird-ext/2100.json'
// import {Helmet} from "react-helmet"

// import RadialView from './RadialView'
import ebird from './ebird-ext/index.js'

const history = createBrowserHistory()

function randomGen () {
  return Math.random()
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        towns: '',
        regions: '',
        rarities: '',
        counties: '',
        vt251data,
        vt2100data,
        loaded: false,
        width: 520,
        height: 800
      }
    }
    this.handleChange = this.handleChange.bind(this)
  }

  async handleChange(e) {
    let rarities = await ebird.rare({input: e}) // Input?
    let towns = await ebird.towns({all: true, input: e})
    let regions = await ebird.regions({all: true, input: e})
    let counties = await ebird.counties({all: true, input: e})
    // let radial = await ebird.radialSearch({input: e, coordinates: [44.259548, -72.575882]})
    this.setState((prevState, props) => ({
      data: {
        ...prevState.data,
        towns,
        regions,
        rarities,
        counties,
        loaded: true,
        input: e
      }
    }))
  }

  render() {
    return (
      <div className="App">
        <Router history={history}>
          <NavBar />
          <Switch>
            <Route exact path='/' component={About} />
            <Route exact path='/about' component={About} />
            <Route exact path='/towns' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/counties' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/regions' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/251' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/2100' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/female-birdsong' render={(props) => (<ContentPage {...props} key={randomGen()} />)} />
            <Route exact path="/nfc-species/:code?" render={(props) => <ContentPage {...props} key={randomGen()} />} />
            <Route exact path="/subspecies/:code?" render={(props) => <ContentPage {...props} key={randomGen()} />} />
            <Route exact path='/vbrc-checker' render={(props) =>(<Rarities {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/terms' render={(props) =>(<ContentPage {...props} key={randomGen()}/>)} />
            {/* <Route exact path='/10-mile' component={RadialView} data={this.state.data.radial} /> */}
            <Route component={NoMatchPage} />
            <Redirect from="/nfc" to="/nfc-species" />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App
