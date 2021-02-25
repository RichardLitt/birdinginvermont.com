import React, { Component } from 'react'
import VermontTowns from './ebird-ext/vt_towns.json'
import Lake from './ebird-ext/lake.json'
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

    var vermont, i, j, color, speciesTotals, speciesView, jsonTown
    let totalTowns = 0

    let domainMin = 0
    let domainMax = 0

    if (this.props.location.pathname === '/towns') {
      vermont = VermontTowns

      if (data.towns.length === 0) {
        totalTowns = undefined
        VermontTowns.features.forEach((t) => {
          t.properties.speciesTotal = 0
          t.properties.species = []
        })
      }

      for (i = 0; i < data.towns.length; i++) {
        let dataTown = data.towns[i].town

        speciesTotals = parseFloat(data.towns[i].speciesTotal)
        if (speciesTotals > 0) {
          totalTowns += 1
        }
        // Calculate the highest town, for use in coloring
        if (speciesTotals > domainMax) {
          domainMax = speciesTotals
        }

        for (j = 0; j < VermontTowns.features.length; j++) {
          jsonTown = VermontTowns.features[j].properties.town

          if (dataTown === jsonTown) {
            VermontTowns.features[j].properties.speciesTotal = speciesTotals
            VermontTowns.features[j].properties.species = data.towns[i].species
            break
          }
        }
      }
    } else if (this.props.location.pathname === '/251') {
      vermont = VermontTowns

      for (i = 0; i < data.vt251data.length; i++) {
        let dataTown = data.vt251data[i].town

        speciesTotals = parseFloat(data.vt251data[i].speciesTotal)
        if (speciesTotals > 0) {
          totalTowns += 1
        }
        // Calculate{} the highest town, for use in coloring
        if (speciesTotals > domainMax) {
          domainMax = speciesTotals
        }

        for (j = 0; j < VermontTowns.features.length; j++) {
          jsonTown = VermontTowns.features[j].properties.town

          if (dataTown.toUpperCase() === jsonTown) {
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

      // Needs a refactor
      // function getJanuaryNeeds (county, needsArr) {
      //   return needsArr.filter(species => {
      //     return CountyBarcharts[county].species[species].occurence.slice(0,4).filter(rate => rate !== '0.0').length !== 0
      //   })
      // }

      vermont.features.forEach(feature => {
        feature.properties.name = capitalizeFirstLetters(feature.properties.CNTYNAME)
        feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
      })

      // This solution is more elegant than the ones applied in /towns or /regions
      if (data.counties) {
        Object.keys(data.counties).forEach(county => {
          const index = vermont.features.map(x => x.properties.CNTYNAME).indexOf(county.toUpperCase())
          // data.counties[county].january = getJanuaryNeeds(county, data.counties[county].notSeen)
          Object.assign(vermont.features[index].properties, data.counties[county])
        })
      }

      if (data.counties && this.state.mapView === '2') {
        speciesView = Object.keys(data.counties).map(c => data.counties[c].speciesTotal)
      // } else if (data.counties && this.state.mapView === '4') {
      //   // TODO Enable
      //   // TODO Change colors to show targets
      //   // Sort needs by taxonomy, alphabetic, habitat, and, most importantly, occurrence
      //   speciesView = Object.keys(data.counties).map(c => data.counties[c].january.length)
      //   vermont.features.forEach(feature => {
      //     feature.properties.speciesTotal = data.counties[feature.properties.name].january.length
      //   })
      } else if (data.counties && this.state.mapView === '3') {
        const dataThisYear = await ebirdExt.counties({all: true, year: 2021, input: data.input})
        speciesView = Object.keys(dataThisYear).map(c => dataThisYear[c].speciesTotal)
        vermont.features.forEach(feature => {
          feature.properties.species = dataThisYear[feature.properties.name].species
          feature.properties.speciesTotal = dataThisYear[feature.properties.name].speciesTotal
        })
      } else {
        speciesView = Object.keys(speciesTotals).map(c => speciesTotals[c].length)
        vermont.features.forEach(feature => {
          feature.properties.species = speciesTotals[feature.properties.name]
          feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
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

    d3.select('#locale').text(totalTowns ? `Towns birded: ${totalTowns}` : '')

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
            d3.select('#locale')
              .text([capitalizeFirstLetters(d.properties.town) + ` (${d.properties.speciesTotal})`])
          } else if (['/counties', '/2100'].includes(pathname)) {
            d3.select('#locale')
            .text([capitalizeFirstLetters(d.properties.name) + ` (${d.properties.speciesTotal})`])
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

          d3.select('#locale').text(totalTowns ? `Towns birded: ${totalTowns}` : '')
          d3.select('#list').text('')
        }
      })

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
          {!['/251', '/2100'].includes(this.props.location.pathname) &&
          <UploadButton handleChange={this.props.handleChange} data={this.props.data} />}
          {this.props.location.pathname === '/251' && <div>
            <h1>Project 251</h1>
            <p>This year, I am challenging Vermonters to collaboratively bird in each of our 251 towns.</p>
<p>To join in, simply share any <a href="https://support.ebird.org/en/support/solutions/articles/48000967748">complete checklist</a> from any town with the eBird account <b>vermont251</b>.
I will update this map every week, to show what new towns should be added. Note: You don't need to add towns that are already here, but feel free to. Email me to opt out of being added as a collaborator.</p>
<p>Contributors: <a href="https://ebird.org/vt/profile/Mjg0MTUx/US-VT">Richard Littauer</a>, <a href="https://ebird.org/profile/NDIwNDA1/US-VT">Zac Cota</a>, <a href="https://ebird.org/vt/profile/MjAwNjI/world">Kent McFarland</a>, Rich Kelley, <a href="https://ebird.org/vt/profile/MTgxNDYz/US-VT">Nathaniel Sharp</a>, <a href="https://ebird.org/profile/NjQ1MjQy/US-VT-021">Chelsea Carroll</a>, <a href="https://ebird.org/profile/Mjc3NzU/US-VT-017">Chris Rimmer</a>, and <a href="https://ebird.org/profile/NDM2MDU1/US-VT">Cedar Stanistreet</a>.</p>
<p>Last updated: <i>February 25, 2021</i>.</p>
          </div>}
          {this.props.location.pathname === '/2100' && <div>
            <h1>Project 2100</h1>
            <p>This year, I am attempting to see 150 species in each and every county in Vermont - 2100 birds in total.</p>
            <p>The far more experienced Fred Pratt and Craig Provost have shown it is possible to do this over years of effort. I wonder if it is possible to do it on a shorter timeline, using eBird data, code, nocturnal flight calls, and help on the ground to make searching as efficient as possible.</p>
<p>Obviously, this is quite difficult, and involves a lot of weekends driving around looking for specific birds. Below is a map of what I've seen so far, and where. I would love help with this project: tips on where to find good birds, driveways I can sleep in my car in on Saturday nights, and, mainly, partners to go birding with! I can't hear Golden-crowned Kinglets or Blackpoll Warblers, so people with good ears would be especially great to go birding with. Get in touch.</p>
<p>Suggestions on how to make this page more useful are most welcome.</p>
<p>This is not a solo effort. Friends who have helped so far: <a href="https://ebird.org/profile/NDIwNDA1/US-VT">Zac Cota</a>, <a href="https://ebird.org/vt/profile/MTgxNDYz/US-VT">Nathaniel Sharp</a>, and <a href="https://ebird.org/profile/NDM2MDU1/US-VT">Cedar Stanistreet</a>.</p>
<p>Total county tick count so far: {this.props.data.vt2100data.map(x => x.speciesTotal).reduce((a, b) => a + b, 0)}.</p>
<p>Last updated: <i>February 25, 2021</i>.</p>
          </div>}
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
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Map)
