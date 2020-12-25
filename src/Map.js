import React, { Component } from 'react'
import VermontTowns from './ebird-ext/vermont.json'
import Counties from './ebird-ext/VT_Data_-_County_Boundaries.json'
import CountyBarcharts from './ebird-ext/countyBarcharts.json'
import BiophysicalRegions from './ebird-ext/Polygon_VT_Biophysical_Regions.json'
import { select } from 'd3-selection'
import { withRouter } from 'react-router'
import UploadButton from './UploadButton'
import CountyButton from './CountyButton'
import rewind from "@turf/rewind"
import ebirdExt from './ebird-ext/index.js'
// const d3ScaleChromatic = require('d3-scale-chromatic')
const d3 = require('d3')
const d3Geo = require('d3-geo')
const topojson = require('topojson')
const taxonomicSort = require('./ebird-ext/taxonomicSort.js')

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

  createMap() {
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
    const shimTownNames = {
      'Newport Town': 'Newport',
      'Newport City': 'Newport',
      "St. Albans Town": "St. Albans",
      "St. Albans City": "St. Albans",
      "Warren Gore": "Warren's Gore",
      "Warners Grant": "Warner's Grant"
    }

    let domainMin = 0
    let domainMax = 0

    if (this.props.location.pathname === '/towns') {
      vermont = topojson.feature(VermontTowns, VermontTowns.objects.vt_towns)


      for (i = 0; i < data.towns.length; i++) {
        let dataTown = data.towns[i].town
        // console.log((data.towns[i].town.includes('lbans')) ? data.towns[i].town : false)
        if (shimTownNames[dataTown]) {
          dataTown = shimTownNames[dataTown]
        }
        speciesTotals = parseFloat(data.towns[i].speciesTotal)
        // Calculate the highest town, for use in coloring
        if (speciesTotals > domainMax) {
          domainMax = speciesTotals
        }

        for (j = 0; j < VermontTowns.objects.vt_towns.geometries.length; j++) {
          var jsonTown = VermontTowns.objects.vt_towns.geometries[j].properties.town

          if (dataTown.toUpperCase() === jsonTown) {
            VermontTowns.objects.vt_towns.geometries[j].properties.speciesTotal = speciesTotals
            VermontTowns.objects.vt_towns.geometries[j].properties.species = data.towns[i].species
            VermontTowns.objects.vt_towns.geometries[j].properties.notSeen = data.towns[i].notSeen
            // TODO Add together St. Albans Town and St. Albans City
            if (dataTown[2] === '.') { console.log(VermontTowns.objects.vt_towns.geometries[j].properties) }
            break
          }
        }
      }
    } else if (this.props.location.pathname === '/counties') {
      Counties.features = Counties.features.map(feature => rewind(feature, {reverse: true}))
      vermont = Counties

      speciesTotals = ebirdExt.removeSpuhFromCounties(CountyBarcharts)

      function getJanuaryNeeds (county, needsArr) {
        return needsArr.filter(species => {
          return CountyBarcharts[county].species[species].occurence.slice(0,4).filter(rate => rate !== '0.0').length !== 0
        })
      }

      vermont.features.forEach(feature => {
        feature.properties.name = capitalizeFirstLetters(feature.properties.CNTYNAME)
        feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
      })

      // This solution is more elegant than the ones applied in /towns or /regions
      if (data.counties) {
        Object.keys(data.counties).forEach(county => {
          const index = vermont.features.map(x => x.properties.CNTYNAME).indexOf(county.toUpperCase())
          data.counties[county].january = getJanuaryNeeds(county, data.counties[county].notSeen)
          Object.assign(vermont.features[index].properties, data.counties[county])
        })
      }

      if (data.counties && this.state.mapView === '2') {
        speciesView = Object.keys(data.counties).map(c => data.counties[c].speciesTotal)
      } else if (data.counties && this.state.mapView === '3') {
        // TODO Change colors to show targets
        // Sort needs by taxonomy, alphabetic, habitat, and, most importantly, occurrence
        speciesView = Object.keys(data.counties).map(c => data.counties[c].january.length)
        vermont.features.forEach(feature => {
          feature.properties.speciesTotal = data.counties[feature.properties.name].january.length
        })
      } else {
        speciesView = Object.keys(speciesTotals).map(c => speciesTotals[c].length)
        vermont.features.forEach(feature => {
          feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
        })
      }

      domainMax = Math.max(...speciesView)
      domainMin = Math.min(...speciesView)
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
      .translate([200, 300])
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
    //   color = d3
    //   .scaleQuantize()
    //   .domain([domainMin, domainMax])
    //   .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])
    // }
    color = d3.scaleSequential(d3.interpolatePiYG).domain([domainMin, domainMax])

    svg.append('path')
      .datum(vermont)
      .attr('d', path)
      .style('stroke', '#777')
      .style('stroke-width', '1')

    // Color lakes
    svg.append('path')
      .datum(topojson.feature(VermontTowns, VermontTowns.objects.lake))
      .attr('d', path)
      .style('stroke', '#89b6ef')
      .style('stroke-width', '1px')
      .style('fill', '#b6d2f5')

    let townSelected = false

    svg.selectAll('.subunit')
      .data(vermont.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#fff')
      .style('stroke-width', '1')
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

          d3.select(this)
            .style('fill', '#509e2f')

          if (pathname === '/towns') {
            d3.select('#locale')
              .text([capitalizeFirstLetters(d.properties.town) + ` (${d.properties.speciesTotal})`])
          } else {
            d3.select('#locale')
              .text([`Region: ` + capitalizeFirstLetters(d.properties.name)])
          }

          let noSpeciesText = `You haven't logged any species here.`
          if (pathname === '/counties' && !data.counties) {
            noSpeciesText = `This map shows the total number of species seen in these counties. Upload your data for your personal map.`
          }

          d3.select('#list')
            .html((d.properties.species && d.properties.species.length > 0) ? `<b>Seen:</b> <li>${taxonomicSort(d.properties.species).join('</li><li>')}</li>` : noSpeciesText)


          console.log('props', d.properties)
          // The functionality is here, but the UI is overwhelming
          d3.select('#notSeen')
            .html((d.properties.january && d.properties.january.length > 0) ? `<b>You have not seen these species, which have been present in January before:</b> ${taxonomicSort(d.properties.january).join(', ')}` : '')
        }
      })
      .on('mouseout', function (d) {
        if (!townSelected) {
          d3.select('#tooltip')
            .remove()

          d3.select(this)
            .transition()
            .duration(250)
            .style('fill', (d) => (d.properties.speciesTotal) ? color(d.properties.speciesTotal) : '#ddd')

          d3.select('#locale')
            .text()

          d3.select('#list')
            .text()
        }
      })

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
          <UploadButton handleChange={this.props.handleChange} data={this.props.data} />
          <div id="map" className="col-sm">
            <svg ref={node => this.node = node} width={this.props.data.width} height={this.props.data.height}></svg>
          </div>
          <div className="col-sm" id="list-container">
            {this.props.location.pathname === '/counties' && this.props.data.counties && <CountyButton
              data={this.state.mapView}
              handleToggleVisibility={this.handleToggleVisibility}
            />}
            <h4 id="locale">{/* empty h4 */}</h4>
            <ul id="list"></ul>
            <p id="notSeen"></p>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Map)