import React, { Component } from 'react'
import VermontTowns from './ebird-ext/vermont.json'
import Counties from './ebird-ext/VT_Data_-_County_Boundaries.json'
import CountyBarcharts from './ebird-ext/countyBarcharts.json'
import BiophysicalRegions from './ebird-ext/Polygon_VT_Biophysical_Regions.json'
import { select } from 'd3-selection'
import { withRouter } from 'react-router'
import UploadButton from './UploadButton'
import rewind from "@turf/rewind"
import ebirdExt from './ebird-ext/index.js'
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
    this.createMap = this.createMap.bind(this)
  }

  componentDidMount() {
    this.createMap()
  }

  componentDidUpdate(prevProps) {
    this.createMap()
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    this.setState({data: ''})
  }

  createMap() {
    function colorArea (speciesTotal) {
      return (speciesTotal) ? color(speciesTotal) : '#ddd'
    }

    const data = this.props.data
    const node = this.node
    const width = 450
    const height = 800
    const pathname = this.props.location.pathname

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

    // Legend Stuff

    // var y = d3.scaleSqrt()
    //     .domain([0, 119])
    //     .range([200, 200])

    // var yAxis = d3.axisLeft(y)
    //     .tickValues(color.domain())

    var vermont, i, j, color, speciesTotals
    let highestTotalSpeciesTowns = 0
    let highestTotalSpeciesRegions = 0
    const shimTownNames = {
      'Newport Town': 'Newport',
      'Newport City': 'Newport',
      "St. Albans Town": "St. Albans",
      "St. Albans City": "St. Albans",
      "Warren Gore": "Warren's Gore",
      "Warners Grant": "Warner's Grant"
    }

    // Load TopoJSON
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
        if (speciesTotals > highestTotalSpeciesTowns) {
          highestTotalSpeciesTowns = speciesTotals
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

      // Set the color after you've calculated the highest total species
      color = d3
        .scaleQuantize()
        .domain([0, highestTotalSpeciesTowns])
        .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])
    } else if (this.props.location.pathname === '/counties') {
      Counties.features = Counties.features.map(feature => rewind(feature, {reverse: true}))
      vermont = Counties

      speciesTotals = ebirdExt.removeSpuhFromCounties(CountyBarcharts)

      vermont.features.forEach(feature => {
        feature.properties.name = capitalizeFirstLetters(feature.properties.CNTYNAME)
        feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
      })

      // This solution is more elegant than the ones applied in /towns or /regions
      Object.keys(data.counties).forEach(county => {
        const index = vermont.features.map(x => x.properties.CNTYNAME).indexOf(county.toUpperCase())
        Object.assign(vermont.features[index].properties, data.counties[county])
      })

      if (data.counties) {
        // TODO Toggle color based on all time or personal (or percentage of 150)
        speciesTotals = Object.keys(data.counties).map(c => data.counties[c].speciesTotal)
        color = d3
          .scaleQuantize()
          .domain([Math.min(...speciesTotals), Math.max(...speciesTotals)])
          .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])
      } else {
        speciesTotals = Object.keys(speciesTotals).map(c => speciesTotals[c].length)
        color = d3
          .scaleQuantize()
          .domain([Math.min(...speciesTotals), Math.max(...speciesTotals)])
          .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])
      }

    } else if (this.props.location.pathname === '/regions') {
      vermont = BiophysicalRegions

      // Add region counts to regions
      for (i = 0; i < data.regions.length; i++) {
        var dataRegion = data.regions[i].region
        speciesTotals = parseFloat(data.regions[i].speciesTotal)
        if (speciesTotals > highestTotalSpeciesRegions) {
          highestTotalSpeciesRegions = speciesTotals
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

      // Set the color after you've calculated the highest total species
      color = d3
        .scaleQuantize()
        .domain([0, highestTotalSpeciesRegions])
        .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])

    }

    svg.append('path')
      .datum(vermont)
      .attr('d', path)
      .style('stroke', '#777')
      .style('stroke-width', '1')

    // var g = svg.append('g')
    //         .attr('class', 'key')
    //         .attr('transform', 'translate(320, 165)')
    //         // .call(yAxis)

    // g.selectAll('rect')
    //         .data(color.range().map(function (d, i) {
    //           return {
    //             y0: i ? y(color.domain()[i - 1]) : y.range()[0],
    //             y1: i < color.domain().length ? y(color.domain()[i]) : y.range()[1],
    //             z: d
    //           }
    //         }))
    //         .enter().append('rect')
    //             .attr('width', 8)
    //             .attr('y', function (d) { return d.y0 })
    //             .attr('height', function (d) { return d.y1 - d.y0 })
    //             .style('fill', function (d) { return d.z })

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
      // .style('fill', '#198298')
      // .style('opacity', 0.25)
    //
    // svg.append("circle")
    //    .attr("cx", coordinates[1])
    //    .attr("cy", coordinates[0])
    //    .attr("r", "30px")
    //    .style("fill", "green");


    // Color lakes
    svg.append('path')
      .datum(topojson.feature(VermontTowns, VermontTowns.objects.lake))
      .attr('d', path)
      .style('stroke', '#89b6ef')
      .style('stroke-width', '1px')
      .style('fill', '#b6d2f5')
  }

  render() {
    return (
      <div className="container-md">
        <div className="row">
          <UploadButton handleChange={this.props.handleChange} data={this.props.data} />
          <div id="map" className="col-sm">
            <svg ref={node => this.node = node} width={450} height={800}></svg>
          </div>
          <div className="col-sm" id="list-container">
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