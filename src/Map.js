import React, { Component } from 'react'
import VermontTowns from './ebird-ext/geojson/vt_towns.json'
import Lake from './ebird-ext/geojson/lake.json'
import Counties from './ebird-ext/geojson/VT_Data_-_County_Boundaries.json'
import BiophysicalRegions from './ebird-ext/geojson/Polygon_VT_Biophysical_Regions.json'
import CountyBarcharts from './ebird-ext/data/countyBarcharts.json'
import TownSightings from './ebird-ext/data/townsightings.json'
import { select } from 'd3-selection'
import { withRouter } from 'react-router'
import UploadButton from './UploadButton'
import CountyButton from './CountyButton'
import TownsText from './Towns'
import CountiesText from './Counties'
import seenInVT from './ebird-ext/taxonomies/eBird_Taxonomy_2020_VT.json'
import rewind from "@turf/rewind"
import ebirdExt from './ebird-ext/index.js'
// const d3ScaleChromatic = require('d3-scale-chromatic')
const d3 = require('d3')
const d3Geo = require('d3-geo')
const taxonomicSort = require('./ebird-ext/taxonomicSort.js')
const _ = require('lodash')

// To Do - make this a method of the string class
function capitalizeFirstLetters(string) {
  return string.toLowerCase().split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

class Map extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mapView: '2'
    }

    this.createMap = this.createMap.bind(this)
    this.handleToggleVisibility = this.handleToggleVisibility.bind(this);
  }

  componentDidMount() {
    this.createMap()
  }

  componentDidUpdate(prevProps) {
    this.createMap()
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged()
    }
  }

  onRouteChanged() {
    // this.setState({data: ''})
  }

  handleToggleVisibility(e) {
    this.setState({ mapView: e.currentTarget.value })
  }


  async createMap() {
    // Some issue with overlaying if I keep calling createMap
    // This seems to speed it up, but I'm sure there's a loss
    d3.selectAll("svg > *").remove();

    function colorArea (speciesTotal) {
      return (speciesTotal) ? color(speciesTotal) : '#ddd'
    }

    const data = this.props.data
    const node = this.node
    const width = data.width
    const height = data.height
    const pathname = this.props.location.pathname

    var vermont, i, j, color, speciesTotals, speciesView
    let totalTowns = 0

    let domainMin = 0
    let domainMax = 0

    let allSeen = ebirdExt.removeSpuh(seenInVT.map(x => {
      x['Scientific Name'] = x.SCI_NAME
      return x
    })).map(x => x.PRIMARY_COM_NAME)

    if (this.props.location.pathname === '/towns') {
      vermont = VermontTowns //%

      speciesTotals = TownSightings

      if (data.towns) {
        data.towns.forEach(town => {
          const index = vermont.features.map(x => x.properties.town).indexOf(town.town)
          Object.assign(vermont.features[index].properties, town)
        })
      }

      if (data.towns && this.state.mapView === '2') {
        speciesView = Object.keys(data.towns).map(c => data.towns[c].speciesTotal)
        totalTowns = Object.keys(data.towns).filter(c => data.towns[c].speciesTotal !== 0).length
      } else if (data.towns && this.state.mapView === '3') {
        const dataThisYear = await ebirdExt.towns({all: true, year: 2021, input: data.input})
        totalTowns = Object.keys(dataThisYear).filter(c => dataThisYear[c].speciesTotal).length
        speciesView = Object.keys(dataThisYear).map(c => dataThisYear[c].speciesTotal)
        vermont.features.forEach(feature => {
          const index = dataThisYear.map(x => x.town).indexOf(feature.properties.town)
          feature.properties.species = dataThisYear[index].species
          feature.properties.speciesTotal = dataThisYear[index].speciesTotal
          feature.properties.notSeen = _.difference(allSeen, dataThisYear[index].species)
        })
      } else {
        totalTowns = null
        speciesView = Object.keys(speciesTotals).map(t => speciesTotals[t].length)
        vermont.features.forEach(feature => {
          feature.properties.species = speciesTotals[feature.properties.town]
          feature.properties.speciesTotal = speciesTotals[feature.properties.town].length
          feature.properties.notSeen = _.difference(allSeen, speciesTotals[feature.properties.town])
        })
      }

      domainMax = Math.max(...speciesView)
      domainMin = Math.min(...speciesView)
    } else if (this.props.location.pathname === '/251') {
      vermont = VermontTowns
      var emptyTowns = []

      for (i = 0; i < data.vt251data.length; i++) {
        speciesTotals = parseFloat(data.vt251data[i].speciesTotal)
        if (speciesTotals > 0) {
          totalTowns += 1
        } else {
          emptyTowns.push(data.vt251data[i].town)
        }
        // Calculate{} the highest town, for use in coloring
        if (speciesTotals > domainMax) {
          domainMax = speciesTotals
        }

        for (j = 0; j < VermontTowns.features.length; j++) {
          if (data.vt251data[i].town.toUpperCase() === VermontTowns.features[j].properties.town) {
            VermontTowns.features[j].properties.speciesTotal = speciesTotals
            VermontTowns.features[j].properties.species = data.vt251data[i].species
            break
          }
        }
      }
    } else if (this.props.location.pathname === '/counties') {
      Counties.features = Counties.features.map(feature => rewind(feature, {reverse: true}))
      vermont = Counties

      speciesTotals = ebirdExt.removeSpuhFromCounties(CountyBarcharts)

      // This solution is more elegant than the ones applied in /towns or /regions
      if (data.counties) {
        Object.keys(data.counties).forEach(county => {
          const index = vermont.features.map(x => x.properties.CNTYNAME).indexOf(county.toUpperCase())
          Object.assign(vermont.features[index].properties, data.counties[county])
        })
      }

      if (data.counties && this.state.mapView === '2') {
        speciesView = Object.keys(data.counties).map(c => data.counties[c].speciesTotal)
      } else if (data.counties && this.state.mapView === '3') {
        const dataThisYear = await ebirdExt.counties({all: true, year: 2021, input: data.input})
        speciesView = Object.keys(dataThisYear).map(c => dataThisYear[c].speciesTotal)
        vermont.features.forEach(feature => {
          feature.properties.species = dataThisYear[feature.properties.name].species
          feature.properties.speciesTotal = dataThisYear[feature.properties.name].speciesTotal
          feature.properties.notSeen = _.difference(allSeen, dataThisYear[feature.properties.name].species)
        })
      } else {
        speciesView = Object.keys(speciesTotals).map(c => speciesTotals[c].length)
        vermont.features.forEach(feature => {
          feature.properties.name = capitalizeFirstLetters(feature.properties.CNTYNAME)
          feature.properties.species = speciesTotals[feature.properties.name]
          feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
          feature.properties.notSeen = _.difference(allSeen, speciesTotals[feature.properties.name])
        })
      }

      domainMax = Math.max(...speciesView)
      domainMin = Math.min(...speciesView)
    } else if (this.props.location.pathname === '/2100') {
      Counties.features = Counties.features.map(feature => rewind(feature, {reverse: true}))
      vermont = Counties

      Object.keys(data.vt2100data).forEach(county => {
        const index = vermont.features.map(x => x.properties.CNTYNAME).indexOf(data.vt2100data[county].county.toUpperCase())
        data.vt2100data[county].name = data.vt2100data[county].county
        Object.assign(vermont.features[index].properties, data.vt2100data[county])
        // vermont.features[index].name = capitalizeFirstLetters(data.vt2100data[county].county)
        // console.log(vermont.features[index])
      })

      domainMax = Math.max(150)
      domainMin = Math.min(0)
    } else if (this.props.location.pathname === '/regions') {
      vermont = BiophysicalRegions
      // TODO Large feature: Get the eBird data and find all out all of the species seen in each bioregion

      // Add region counts to regions
      for (i = 0; i < data.regions.length; i++) {
        var dataRegion = data.regions[i].region
        speciesTotals = parseFloat(data.regions[i].speciesTotal)
        if (speciesTotals > domainMax) {
          domainMax = speciesTotals
        }

        for (j = 0; j < vermont.features.length; j++) {
          var jsonRegion = vermont.features[j].properties.name
          if (dataRegion === jsonRegion) {
            vermont.features[j].properties.speciesTotal = speciesTotals
            vermont.features[j].properties.species = data.regions[i].species
            break
          }
        }
      }
    }

    // Define map projection
    var projection = d3Geo
      .geoTransverseMercator()
      .rotate([72.57, -44.20])
      .translate([250, 300])
      .scale([18000])

    // Define path generator
    var path = d3Geo.geoPath()
      .projection(projection)

    // Create SVG Element
    var svg = select(node)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // // Set the color after you've calculated the highest total species
    // if (!colorset) {
    color = d3
      .scaleQuantize()
      .domain([domainMin, domainMax])
      .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])
    // }
    // color = d3.scaleSequential(d3.interpolatePiYG).domain([domainMin, domainMax])

    svg.append('path')
      .datum(vermont)
      .attr('d', path)
      .style('stroke', '#777')
      .style('stroke-width', '1')

    let townSelected = false

    function totalTownsText () {
      if (totalTowns) {
        d3.select('#locale').text(`Towns birded: ${totalTowns}`)
        // if (pathname === '/251') {
        //   d3.select('#list').text(`Towns with no checklists:\n` + emptyTowns.map(x => capitalizeFirstLetters(x)).sort().join(', '))
        // }
      } else {
        d3.select('#locale').text('')
      }
    }

    totalTownsText()

    let paths = svg.selectAll('.subunit')
      .data(vermont.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#fff')
      .style('stroke-width', '1')

    // let species = 'Pied-billed Grebe'
    //
    // if (!species) {
    //   townsView()
    // } else {
    //   speciesMaps()
    // }
    //
    // function speciesMaps () {
    //   const townsPresent = []
    //   paths.style('fill', (d) => {
    //     if (d.properties.species.includes(species)) {
    //       townsPresent.push(capitalizeFirstLetters(d.properties.town))
    //       return 'green'
    //     } else {
    //       return '#ddd'
    //     }
    //   })
    //   d3.select('#locale').text(`${species}: ${townsPresent.length}`)
    //
    //   let ul = d3.select('#list')
    //     .html('<b>Seen</b>')
    //     .append('ul')
    //
    //   ul.selectAll('li')
    //     .data(townsPresent)
    //     .enter()
    //     .append('li')
    //     .html(String)
    //     .on('click', function (species) {
    //       species = false
    //       townsView()
    //     })
    // }

    townsView()

    function townsView () {
      paths
        .style('fill', (d) => colorArea(d.properties.speciesTotal))
        .on('click', function (d) {
          if (!townSelected) {
            townSelected = d3.select(this)
            townSelected
              .style('fill', 'yellow')
          } else {
            townSelected
              .style('fill', colorArea(townSelected.data()[0].properties.speciesTotal))

            townSelected = false
          }
        })
        .on('mouseover', function (d) {
          if (!townSelected) {
            var xPosition = d3.mouse(this)[0]
            var yPosition = d3.mouse(this)[1] - 30

            if (pathname !== '/2100') {
              svg.append('text')
                .attr('id', 'tooltip')
                .attr('x', xPosition)
                .attr('y', yPosition)
                .attr('text-anchor', 'middle')
                .attr('font-family', 'sans-serif')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', 'black')
                .text(`${capitalizeFirstLetters(d.properties.town || d.properties.name)}${d.properties.speciesTotal ? ': ' + d.properties.speciesTotal : ''}`)
            }

            d3.select(this)
              .style('fill', '#509e2f')

            if (['/towns', '/251'].includes(pathname)) {
              let townHeading = [capitalizeFirstLetters(d.properties.town) + ` (${d.properties.speciesTotal})`]
              if (d.properties.speciesTotal === 0) {
                townHeading = [capitalizeFirstLetters(d.properties.town)]
              }
              d3.select('#locale')
                .text(townHeading)
            } else if (['/counties', '/2100'].includes(pathname)) {
              d3.select('#locale')
              .text([capitalizeFirstLetters(d.properties.name) + ` (${d.properties.speciesTotal})`])
            } else {
              d3.select('#locale')
                .text([`Region: ` + capitalizeFirstLetters(d.properties.name)])
            }

            if (d.properties.species) {
              if (d.properties.species.length === 0) {
                // Don't present a list for all species to see.
                d.properties.notSeen = null
              }
              let ul = d3.select('#list')
                .html('<b>Seen</b>')
                .append('ul')

              ul.selectAll('li')
                .data(taxonomicSort(d.properties.species))
                .enter()
                .append('li')
                .html(String)
              // .on('click', function (d) {
                //   species = d
                //   speciesMaps()
                // })
            }

            console.log(d.properties)

            if (d.properties.notSeen) {
              d3.select('#list')
                .append('hr')

              d3.select('#list')
                .append('b')
                .text('No records:')

              let notSeenUl = d3.select('#list')
                .append('ul')

              notSeenUl.selectAll('li')
                .data(taxonomicSort(d.properties.notSeen))
                .enter()
                .append('li')
                .html(String)
            } else if (['/regions', '/2100', '/251'].includes(pathname) && d.properties.species) {
              if (d.properties.species.length === 0) {
                if (pathname === '/251') {
                  d3.select('#list')
                    .html(`No one has logged any species here yet this year.`)
                } else {
                 d3.select('#list')
                  .html(`You haven't logged any species here.`)
                }
              }
            } else {
              let noSpeciesText = `You haven't logged any species here.`
              if (pathname === '/counties' && !data.counties) {
                noSpeciesText = `This map shows the total number of species seen in these counties. Upload your data for your personal map.`
              }
              d3.select('#list')
                .html(noSpeciesText)
            }
          }
        })
        .on('mouseout', function (d) {
          if (!townSelected) {
            d3.select('#tooltip').remove()

            d3.select(this)
              .transition()
              .duration(250)
              .style('fill', (d) => (d.properties.speciesTotal) ? color(d.properties.speciesTotal) : '#ddd')

            totalTownsText()
            // if (pathname === '/251') {
            //   d3.select('#list').text(`Towns with no checklists:\n` + emptyTowns.map(x => capitalizeFirstLetters(x)).sort().join(', '))
            // } else {
            d3.select('#list').text('')
            // }
          }
        })
      }

    // Color lakes
    svg.append('path')
      .datum(Lake)
      .attr('d', path)
      .style('stroke', '#89b6ef')
      .style('stroke-width', '1px')
      .style('fill', '#b6d2f5')


    if (this.props.location.pathname === '/2100') {
      svg.selectAll(".place-label")
        .data(vermont.features)
        .enter().append("text")
        .attr("class", "place-label")
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        // .attr("dy", ".35em")
        .text(function(d) { return `${(d.properties.speciesTotal/150*100).toFixed(0)}%` })
        .style('fill', 'blue')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
    }

    // var coordinates = projection([-72.5766799, 44.2581012])

    // svg.append('svg:circle')
    //   .attr("transform", function(d) {
    //       return "translate(" + coordinates + ")";
    //   })
    //   .attr('r', 45)
    //   .style('fill', '#198298')
    //   .style('opacity', 0.25)
    //
    // svg.append("circle")
    //    .attr("cx", coordinates[1])
    //    .attr("cy", coordinates[0])
    //    .attr("r", "30px")
    //    .style("fill", "green");
  }

  render() {
    return (
      <div className="container-md">
        <div className="row">
          {/* TODO Could we move these into their own pages? */}
          {this.props.location.pathname === '/towns' && <TownsText />}
          {this.props.location.pathname === '/counties' && <CountiesText />}
          {!['/251', '/2100'].includes(this.props.location.pathname) &&
          <UploadButton handleChange={this.props.handleChange} data={this.props.data} />}
          <div id="map" className="col-sm">
            <svg ref={node => this.node = node} width={this.props.data.width} height={this.props.data.height}></svg>
          </div>
          <div className="col-sm" id="list-container">
            {['/counties', '/towns'].includes(this.props.location.pathname) && this.props.data.counties && this.props.data.towns && <CountyButton
              data={this.state.mapView}
              handleToggleVisibility={this.handleToggleVisibility}
            />}
            <h4 id="locale">{/* empty h4 */}</h4>
            <div id="list"></div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Map)
