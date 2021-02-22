import React, { Component } from "react";
import "./App.scss";
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import Papa from "papaparse";
import About from "./About";
import Map from "./Map";
import NavBar from "./NavBar";
import Footer from "./Footer";
import ContentPage from "./ContentPage";
import Rarities from "./Rarities";
import NoMatchPage from "./NoMatchPage";

import termsPath from "./terms.md";
import fbsPath from "./female-birdsong.md";

// import RadialView from './RadialView'
import ebird from "./ebird-ext/index.js";

// console.log("path", nfcPath);
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        towns: "",
        regions: "",
        rarities: "",
        counties: "",
        vt251data: "",
        loaded: false,
        width: 520,
        height: 800,
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.getData = this.getData.bind(this);
  }

  componentWillMount() {
    this.getCsvData();
  }

  async fetchCsv() {
    return fetch("/data/251.csv").then(function (response) {
      let reader = response.body.getReader();
      let decoder = new TextDecoder("utf-8");

      return reader.read().then(function (result) {
        return decoder.decode(result.value);
      });
    });
  }

  async getData(result) {
    result = await ebird.vt251(result.data);
    this.setState((prevState, props) => ({
      data: {
        ...prevState.data,
        vt251data: result,
      },
    }));
  }

  async getCsvData() {
    let csvData = await this.fetchCsv();

    Papa.parse(csvData, {
      header: true,
      complete: this.getData,
    });
  }

  async handleChange(e) {
    let rarities = await ebird.rare({ input: e }); // Input?
    let towns = await ebird.towns({ all: true, input: e });
    let regions = await ebird.regions({ all: true, input: e });
    let counties = await ebird.counties({ all: true, input: e });
    // let radial = await ebird.radialSearch({input: e, coordinates: [44.259548, -72.575882]})
    this.setState((prevState, props) => ({
      data: {
        ...prevState.data,
        towns,
        regions,
        rarities,
        counties,
        loaded: true,
        input: e,
      },
    }));
  }

  render() {
    return (
      <div className="App">
        <NavBar />
        <Switch>
          <Route exact path="/" component={About} />
          <Route exact path="/about" component={About} />
          <Route
            exact
            path="/towns"
            render={(props) => (
              <Map
                {...props}
                data={this.state.data}
                handleChange={this.handleChange}
              />
            )}
          />
          <Route
            exact
            path="/counties"
            render={(props) => (
              <Map
                {...props}
                data={this.state.data}
                handleChange={this.handleChange}
              />
            )}
          />
          <Route
            exact
            path="/regions"
            render={(props) => (
              <Map
                {...props}
                data={this.state.data}
                handleChange={this.handleChange}
              />
            )}
          />
          <Route
            exact
            path="/251"
            render={(props) => (
              <Map
                {...props}
                data={this.state.data}
                handleChange={this.handleChange}
              />
            )}
          />
          <Route
            exact
            path="/female-birdsong"
            render={(props) => <ContentPage {...props} data={fbsPath} />}
          />
          <Route exact path="/nfc">
            <Redirect to="/library/nfc-species" />
          </Route>
          <Route
            exact
            path="/library/:type/:code?"
            render={(props) => {
              console.log("library");
              return <ContentPage {...props} />;
            }}
          />
          <Route
            exact
            path="/vbrc-checker"
            render={(props) => (
              <Rarities
                {...props}
                data={this.state.data}
                handleChange={this.handleChange}
              />
            )}
          />
          <Route
            exact
            path="/terms"
            render={(props) => <ContentPage {...props} data={termsPath} />}
          />
          {/* <Route exact path='/10-mile' component={RadialView} data={this.state.data.radial} /> */}
          <Route component={NoMatchPage} />
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default withRouter(App);
