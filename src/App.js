import React, { Component, Suspense, lazy } from 'react'
import './App.scss'
import { Route, Switch, Redirect, Router } from 'react-router-dom'
import { createBrowserHistory } from "history"
import About from './About'
import NavBar from './NavBar'
import Footer from './Footer'

// Every page but the home page loads when first visited, so the home page
// doesn't download the maps' boundaries, data and libraries
const Map = lazy(() => import('./Map'))
const ContentPage = lazy(() => import('./ContentPage'))
const Project251 = lazy(() => import('./Project251'))
const Rarities = lazy(() => import('./Rarities'))
const Norwich = lazy(() => import('./Norwich'))
const NoMatchPage = lazy(() => import('./NoMatchPage'))
const RadiusPage = lazy(() => import('./RadiusPage'))

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
        checklists: '',
        loaded: false,
        width: 520,
        height: 800
      }
    }
    this.handleChange = this.handleChange.bind(this)
  }

  async handleChange(e) {
    await new Promise(resolve => {
      this.setState(prevState => ({ data: { ...prevState.data, loading: true } }), resolve)
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    // Only needed once someone uploads their data
    const { default: ebird } = await import('./ebird-ext/index.js')
    let rarities = await ebird.rare({input: e}) // Input?
    let towns = await ebird.towns({all: true, input: e})
    let regions = await ebird.regions({all: true, input: e})
    let counties = await ebird.counties({all: true, input: e})
    const currentYear = String(new Date().getFullYear())
    let checklists = {
      vermont: await ebird.checklists({state: 'Vermont', year: currentYear, input: e, complete: true}),
      norwich: await ebird.checklists({town: 'Norwich', year: currentYear, input: e})
    }
    this.setState((prevState, props) => ({
      data: {
        ...prevState.data,
        towns,
        regions,
        rarities,
        counties,
        checklists,
        loaded: true,
        loading: false,
        input: e,
        singleBirdForm: false // Toggles various forms on the Rarities pages
      }
    }))
  }

  render() {
    return (
      <div className="App">
        <Router history={history}>
          <NavBar />
          <Suspense fallback={<div className="container-md page">Loading…</div>}>
          <Switch>
            <Route exact path='/' component={About} />
            <Route exact path='/about' component={About} />
            <Route exact path='/towns' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/counties' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/regions' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/hotspots' render={(props) => (<Map {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/251' render={(props) => (<Project251 {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/2100' component={About} />
            <Route exact path='/female-birdsong' render={(props) => (<ContentPage {...props} key={randomGen()} />)} />
            <Route exact path="/nfc-species/:code?" render={(props) => <ContentPage {...props} key={randomGen()} />} />
            <Route exact path="/subspecies/:code?" render={(props) => <ContentPage {...props} key={randomGen()} />} />
            <Route exact path='/vbrc-checker' render={(props) =>(<Rarities {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/radius' render={(props) => (<RadiusPage {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/norwich' render={(props) =>(<Norwich {...props} data={this.state.data} handleChange={this.handleChange} />)} />
            <Route exact path='/terms' render={(props) =>(<ContentPage {...props} key={randomGen()}/>)} />
            <Route component={NoMatchPage} />
            <Redirect from="/nfc" to="/nfc-species" />
          </Switch>
          </Suspense>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App
