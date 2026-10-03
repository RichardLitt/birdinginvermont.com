import React, { Component } from 'react'
// Simplified boundaries, for drawing. The precise ones, which decide which
// town a checklist is in, load with ebird-ext only when someone uploads data.
import VermontTowns from './ebird-ext/geojson/display/vt_towns.json'
import Lake from './ebird-ext/geojson/display/lake.json'
import Counties from './ebird-ext/geojson/display/VT_Data_-_County_Boundaries.json'
import BiophysicalRegions from './ebird-ext/geojson/display/Polygon_VT_Biophysical_Regions.json'
import CountyBarcharts from './ebird-ext/data/countyBarcharts.json'
import TownSightings from './ebird-ext/data/townsightings.json'
import vt251data from './ebird-ext/data/vt_town_counts.json'
import RegionSightings from './ebird-ext/data/regionssightings.json'
import { select } from 'd3-selection'
import { withRouter } from 'react-router'
import UploadButton from './UploadButton'
import CountyButton from './CountyButton'
import TownsText from './Towns'
import HotspotsText from './Hotspots'
import CountiesText from './Counties'
import RegionsText from './Regions'
import seenInVT from './ebird-ext/taxonomies/eBird_Taxonomy_VT.json'
import rewind from "@turf/rewind"
import * as banding from './ebird-ext/bandingCodes.js'
import { removeSpuh, removeSpuhFromCounties } from './ebird-ext/spuh.js'
// const d3ScaleChromatic = require('d3-scale-chromatic')
const d3 = require('d3')
const d3Geo = require('d3-geo')
import taxonomicSort from './ebird-ext/taxonomicSort.js'
import { SORTS, sortState, chooseSort, sortSpecies, sortLabel, sortAriaLabel } from './speciesSort'
const _ = require('lodash')

// To Do - make this a method of the string class
function capitalizeFirstLetters(string) {
  return string.toLowerCase().split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

// eBird leaves sensitive species out of its data downloads, so the all-time
// lists carry them forward without dates, at the end
const SENSITIVE = new Set(banding.SENSITIVE_CODES.map(code => banding.codeToCommonName(code)))
function undatedIn (species) {
  return (species || []).filter(name => SENSITIVE.has(name))
}

function sortButtons (container, redraw) {
  const active = d => d[0] === sortState.sort
  container.append('div')
    .attr('class', 'list-sort btn-group btn-group-sm')
    .attr('role', 'group')
    .attr('aria-label', 'Sort the species')
    .selectAll('button')
    .data(SORTS)
    .enter()
    .append('button')
    .attr('type', 'button')
    .attr('class', d => `btn btn-outline-secondary${active(d) ? ' active' : ''}`)
    .attr('aria-pressed', d => String(active(d)))
    .attr('aria-label', sortAriaLabel)
    .attr('title', d => active(d) ? 'Click again to reverse' : null)
    .text(sortLabel)
    .on('click', d => {
      chooseSort(d[0])
      redraw()
    })
}

// On a narrow screen the list is below the map: after a tap, scroll to it if
// it's out of sight
function revealList () {
  if (!window.matchMedia || !window.matchMedia('(max-width: 767.98px)').matches) return
  const list = document.getElementById('list-container')
  if (list && list.getBoundingClientRect().top > window.innerHeight - 80) {
    list.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// The Seen list and the No records list, in the chosen order. In order seen,
// each species is numbered by when it was first seen there (1 is the oldest).
function drawSpeciesLists (props) {
  const list = d3.select('#list')
  const details = list.select('details')
  const wasOpen = !details.empty() && details.property('open')
  list.html('')
  if (props.species) {
    list.append('b').text('Seen')
    sortButtons(list, () => drawSpeciesLists(props))
    const items = props.species.map((name, i) => ({ name, n: i + 1 }))
    let sorted = sortSpecies(items, sortState.sort, sortState.reverse)
    // In order seen, undated species stay at the bottom, whichever way up
    const undated = new Set(props.undated || [])
    if (sortState.sort === 'seen' && undated.size) {
      sorted = [...sorted.filter(x => !undated.has(x.name)), ...items.filter(x => undated.has(x.name))]
    }
    const li = list.append('ul')
      .attr('class', 'species-list')
      .selectAll('li')
      .data(sorted)
      .enter()
      .append('li')
    if (sortState.sort === 'seen') li.append('span').attr('class', 'seen-number').text(x => `${x.n}. `)
    li.append('span').text(x => x.name)
    if (sortState.sort === 'seen') {
      li.filter(x => undated.has(x.name)).append('span').attr('class', 'undated').text(' (undated)')
    }
  }
  if (props.notSeen) {
    list.append('hr')
    // Collapsed by default: it's usually hundreds of species. Click a town to
    // pin it, then open this.
    const notSeen = list.append('details').property('open', wasOpen)
    notSeen.append('summary').append('b').text(`No records (${props.notSeen.length})`)
    notSeen.append('ul')
      .selectAll('li')
      .data(sortSpecies(props.notSeen.map(name => ({ name })), sortState.sort === 'alpha' ? 'alpha' : 'taxonomic', sortState.reverse))
      .enter()
      .append('li')
      .text(x => x.name)
  }
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

  componentDidUpdate(prevProps, prevState) {
    // Towns and regions are different areas: forget the pinned one
    if (this.props.location.pathname !== prevProps.location.pathname) this.pinned = null
    if (
      this.props.data !== prevProps.data ||
      this.props.location.pathname !== prevProps.location.pathname ||
      this.state.mapView !== prevState.mapView
    ) {
      this.createMap()
    }
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
    // Clear the last drawing so redraws don't stack. Only this map's svg:
    // a page-wide "svg > *" also emptied the footer's icons
    select(this.node).selectAll('*').remove()

    function colorArea (speciesTotal, color) {
      return (speciesTotal) ? color(speciesTotal) : '#ddd'
    }

    const page = this
    // The area a path draws, to find it again after a redraw
    const areaKey = d => d.properties.town || d.properties.CNTYNAME || d.properties.name
    const data = this.props.data
    const node = this.node
    const width = data.width
    const height = data.height
    const pathname = this.props.location.pathname

    var vermont, j, color, speciesTotals, speciesView
    let totalTowns = 0
    let unseenTowns
    let unvisitedHotspots

    let domainMin = 0
    let domainMax = 0

    let allSeen = removeSpuh(seenInVT.map(x => {
      x['Scientific Name'] = x.SCI_NAME
      return x
    })).map(x => x.PRIMARY_COM_NAME)

    if (this.props.location.pathname === '/towns') {
      vermont = VermontTowns
      speciesTotals = banding.unfurlObjToSpecies(TownSightings)

      // Your uploaded data: towns() gives banding codes; show common names
      const toNames = codes => codes.map(code => banding.codeToCommonName(code))

      // All towns collectively
      if (data.towns) {
        Object.keys(data.towns).forEach(town => {
          const index = vermont.features.map(x => x.properties.town).indexOf(town)
          const species = toNames(data.towns[town])
          vermont.features[index].properties.town = town
          vermont.features[index].properties.species = species
          vermont.features[index].properties.undated = []
          vermont.features[index].properties.notSeen = _.difference(allSeen, species)
          vermont.features[index].properties.speciesTotal = species.length
        })
      }

      // Your personal sightings
      if (data.towns && this.state.mapView === '2') {
        speciesView = Object.keys(data.towns).map(c => data.towns[c].length)
        totalTowns = Object.keys(data.towns).filter(c => data.towns[c].length !== 0).length
        unseenTowns = Object.keys(data.towns).filter(c => data.towns[c].length === 0)
      // Sightings for the current year
      } else if (data.towns && this.state.mapView === '3') {
        // Add complete: true, duration: 3 to limit this down
        const { default: ebirdExt } = await import('./ebird-ext/index.js')
        const dataThisYear = await ebirdExt.towns({all: true, year: new Date().getFullYear(), input: data.input})
        totalTowns = Object.keys(dataThisYear).filter(c => dataThisYear[c].length !== 0).length
        unseenTowns = Object.keys(dataThisYear).filter(c => dataThisYear[c].length === 0)
        speciesView = Object.keys(dataThisYear).map(c => dataThisYear[c].length)
        vermont.features.forEach(feature => {
          const species = toNames(dataThisYear[feature.properties.town])
          feature.properties.species = species
          feature.properties.undated = []
          feature.properties.speciesTotal = species.length
          feature.properties.notSeen = _.difference(allSeen, species)
        })
      } else {
        totalTowns = null
        speciesView = Object.keys(speciesTotals).map(t => speciesTotals[t].length)
        vermont.features.forEach(feature => {
          feature.properties.species = speciesTotals[feature.properties.town]
          feature.properties.undated = undatedIn(feature.properties.species)
          feature.properties.speciesTotal = speciesTotals[feature.properties.town].length
          feature.properties.notSeen = _.difference(allSeen, speciesTotals[feature.properties.town])
        })
      }

      domainMax = Math.max(...speciesView)
      domainMin = Math.min(...speciesView)
    } else if (this.props.location.pathname === '/251') {
      vermont = VermontTowns
      const allVermontTowns = new Set()

      Object.keys(vt251data).forEach(town => {
        speciesTotals = vt251data[town].length
        if (speciesTotals > 0) {
          totalTowns += 1
        }
        // Calculate{} the highest town, for use in coloring
        if (speciesTotals > domainMax) {
          domainMax = speciesTotals
        }

        for (j = 0; j < VermontTowns.features.length; j++) {
          allVermontTowns.add(VermontTowns.features[j].properties.town)
          if (town.toUpperCase() === VermontTowns.features[j].properties.town) {
            VermontTowns.features[j].properties.speciesTotal = speciesTotals
            VermontTowns.features[j].properties.species = vt251data[town].map(x => banding.codeToCommonName(x))
            VermontTowns.features[j].properties.undated = []

            break
          }
        }
      })

      // Every town is in the data, with an empty list if it has no checklists
      var emptyTowns = [...allVermontTowns].filter(x => !(vt251data[x] || []).length)
      var townCount = allVermontTowns.size
    } else if (this.props.location.pathname === '/counties') {
      Counties.features = Counties.features.map(feature => rewind(feature, {reverse: true}))
      vermont = Counties

      speciesTotals = removeSpuhFromCounties(CountyBarcharts)

      if (data.counties) {
        Object.keys(data.counties).forEach(county => {
          const index = vermont.features.map(x => x.properties.CNTYNAME).indexOf(county.toUpperCase())
          Object.assign(vermont.features[index].properties, data.counties[county])
        })
      }

      if (data.counties && this.state.mapView === '2') {
        speciesView = Object.keys(data.counties).map(c => data.counties[c].speciesTotal)
      } else if (data.counties && this.state.mapView === '3') {
        const { default: ebirdExt } = await import('./ebird-ext/index.js')
        const dataThisYear = await ebirdExt.counties({all: true, year: new Date().getFullYear(), input: data.input})
        speciesView = Object.keys(dataThisYear).map(c => dataThisYear[c].speciesTotal)
        vermont.features.forEach(feature => {
          feature.properties.species = dataThisYear[feature.properties.name].species
          feature.properties.undated = []
          feature.properties.speciesTotal = dataThisYear[feature.properties.name].speciesTotal
          feature.properties.notSeen = _.difference(allSeen, dataThisYear[feature.properties.name].species)
        })
      } else {
        speciesView = Object.keys(speciesTotals).map(c => speciesTotals[c].length)
        vermont.features.forEach(feature => {
          feature.properties.name = capitalizeFirstLetters(feature.properties.CNTYNAME)
          feature.properties.species = speciesTotals[feature.properties.name]
          feature.properties.undated = undatedIn(feature.properties.species)
          feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
          feature.properties.notSeen = _.difference(allSeen, speciesTotals[feature.properties.name])
        })
      }

      domainMax = Math.max(...speciesView)
      domainMin = Math.min(...speciesView)
    } else if (this.props.location.pathname === '/regions') {
      // TODO Add text to top of regions view
      // TODO Find a nicer way of displaying the data, more like eBird's tables
      // TODO Elm by Clever Girl
      vermont = BiophysicalRegions
      speciesTotals = banding.unfurlObjToSpecies(RegionSightings)

      if (data.regions) {
        Object.keys(data.regions).forEach(region => {
          const index = vermont.features.map(x => x.properties.name).indexOf(region)
          Object.assign(vermont.features[index].properties, data.regions[region])
        })
      }

      if (data.regions && this.state.mapView === '2') {
        speciesView = Object.keys(data.regions).map(region => data.regions[region].speciesTotal)
      } else if (data.regions && this.state.mapView === '3') {
        const { default: ebirdExt } = await import('./ebird-ext/index.js')
        const dataThisYear = await ebirdExt.regions({all: true, year: new Date().getFullYear(), input: data.input})
        speciesView = Object.keys(dataThisYear).map(r => dataThisYear[r].speciesTotal)
        vermont.features.forEach(feature => {
          feature.properties.species = dataThisYear[feature.properties.name].species
          feature.properties.undated = []
          feature.properties.speciesTotal = dataThisYear[feature.properties.name].speciesTotal
          feature.properties.notSeen = _.difference(allSeen, dataThisYear[feature.properties.name].species)
        })
      } else {
        speciesView = Object.keys(speciesTotals).map(t => speciesTotals[t].length)
        vermont.features.forEach(feature => {
          feature.properties.species = speciesTotals[feature.properties.name]
          feature.properties.undated = undatedIn(feature.properties.species)
          feature.properties.speciesTotal = speciesTotals[feature.properties.name].length
          feature.properties.notSeen = _.difference(allSeen, speciesTotals[feature.properties.name])
        })
      }

      domainMax = Math.max(...speciesView)
      domainMin = Math.min(...speciesView)
    } else if (this.props.location.pathname === '/hotspots') {
      Counties.features = Counties.features.map(feature => rewind(feature, {reverse: true}))
      vermont = Counties

      const { default: ebirdExtHotspots } = await import('./ebird-ext/hotspots.js')
      unvisitedHotspots = await ebirdExtHotspots.townHotspots({noVisits: true})
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

    // The /251 side panel: where nobody has been yet, the towns that most
    // need a visit, and the towns that already have the most species
    function summary251 () {
      const counts = Object.keys(vt251data)
        .filter(town => vt251data[town].length)
        .map(town => ({ town: capitalizeFirstLetters(town), count: vt251data[town].length }))
        .sort((a, b) => a.count - b.count || a.town.localeCompare(b.town))
      const items = list => list.map(x => `<li>${x.town} (${x.count})</li>`).join('')
      const none = emptyTowns.map(x => capitalizeFirstLetters(x)).sort()
      return (none.length ? `<p><strong>No checklists yet:</strong> ${none.join(', ')}</p>` : '<p>Every town has a checklist!</p>') +
        `<p><strong>Fewest species</strong>:</p><ol>${items(counts.slice(0, 15))}</ol>` +
        `<p><strong>Most species:</strong></p><ol>${items(counts.slice(-5).reverse())}</ol>`
    }

    function totalTownsText () {
      if (totalTowns) {
        if (pathname === '/251') {
          d3.select('#locale').text(`Towns birded: ${totalTowns} of ${townCount}`)
          d3.select('#list').html(summary251())
        } else {
          d3.select('#locale').text(`Towns birded: ${totalTowns}`)
        }
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

    if (this.props.location.pathname === '/hotspots') {
      let selected
      svg.selectAll("circle")
        .data(unvisitedHotspots)
        .enter()
        .append("circle")
        .attr("cx", (d) => projection([d.Longitude, d.Latitude])[0])
        .attr("cy", (d) => projection([d.Longitude, d.Latitude])[1])
        .attr("r", 7)
        .attr("fill", 'green')
        .on('click', function (d) {
          if (!selected) {
            selected = d3.select(this)
            selected.style('fill', 'yellow')
          } else {
            selected.style('fill', 'green')
            selected = false
          }
        })
        .on('mouseover', function (d) {
          if (!selected) {
            d3.select(this)
              .raise()
              .style('fill', 'yellow')

            d3.select('#locale')
              .text([d.Name + ` (${capitalizeFirstLetters(d.County)})`])

            d3.select('#list')
              .append('hr')

            d3.select('#list')
              .append('p')
              .text(`Town: ${capitalizeFirstLetters(d.Town)}`)

            d3.select('#list')
              .append('p')
              .text(`Region: ${d.Region}`)

            d3.select('#list')
              .append('p')
              .append('a')
              .attr('href', 'https://ebird.org/hotspot/' + d.ID)
              .text('eBird')

            d3.select('#list')
              .append('p')
              .append('a')
              .attr('href', 'https://www.google.com/maps/search/?api=1&query=' + d.Latitude + ',' + d.Longitude)
              .text('Directions')

            d3.select('#list')
              .append('p')
              .append('a')
              .attr('href', `https://ebirdhotspots.com/birding-in-vermont/usvt-${d.County.toLowerCase()}-county/`)
              .text('eBirdHotspots.com county page')
          }
        })
        .on('mouseout', function (d) {
          if (!selected) {
            d3.select(this).style('fill', 'green')
            d3.select('#tooltip').remove()
            d3.select('#locale').text('')
            d3.select('#list').text('')
          }
        })

      paths
        .style('fill', '#ddd')
    } else {
      townsView()
    }

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

    function townsView () {

      function colorScale(colorObj) {
        color = d3
          .scaleQuantize()
          .domain([domainMin, domainMax])
          .range(['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'])
        return colorArea(colorObj, color)
      }


      paths
        .style('fill', (d) => {
          return colorScale(d.properties.speciesTotal)
        })
        .on('click', function (d) {
          const same = townSelected && townSelected.node() === this
          if (townSelected) {
            townSelected.style('fill', d => colorScale(d.properties.speciesTotal))
            townSelected = false
          }
          // Clicking the pinned town unpins it; clicking another switches to it
          // (on a phone, each tap is a click)
          page.pinned = null
          if (!same) {
            d3.select(this).dispatch('mouseover')
            townSelected = d3.select(this)
            townSelected.style('fill', 'yellow')
            page.pinned = areaKey(d)
            if (!page.restoring) revealList()
          }
        })
        .on('mouseover', function (d) {

          if (!d.properties.species) {
            d.properties.species = []
            d.properties.speciesTotal = 0
          }

          if (!townSelected) {
            // var xPosition = d3.mouse(this)[0]
            // var yPosition = d3.mouse(this)[1] - 30

            d3.select(this)
              .style('fill', '#509e2f')

            if (['/towns', '/251'].includes(pathname)) {
              let townHeading = [capitalizeFirstLetters(d.properties.town) + ` (${d.properties.speciesTotal})`]
              if (d.properties.speciesTotal === 0) {
                townHeading = [capitalizeFirstLetters(d.properties.town)]
                if (unseenTowns) {
                  d3.select('#list')
                  .text(unseenTowns.map(x => capitalizeFirstLetters(x)).join(', '))
                }
              }
              d3.select('#locale')
                .text(townHeading)

            } else if (['/counties', '/regions'].includes(pathname)) {
              d3.select('#locale')
              .text([capitalizeFirstLetters(d.properties.name) + ` (${d.properties.speciesTotal})`])
            } else {
              d3.select('#locale')
                .text([capitalizeFirstLetters(d.properties.name)])
            }

            if (d.properties.species && d.properties.species.length === 0) {
              // Don't present a list for all species to see.
              d.properties.notSeen = null
            }
            if (d.properties.species || d.properties.notSeen) {
              drawSpeciesLists(d.properties)
            }

            if (d.properties.notSeen) {
              // drawSpeciesLists drew it
            } else if (['/regions', '/251'].includes(pathname) && d.properties.species) {
              if (!d.properties.species || d.properties.species.length === 0) {
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
              .style('fill', (d) => {
                return colorScale(d.properties.speciesTotal)
              })

            totalTownsText()
            if (pathname === '/251') {
              d3.select('#list').html(summary251())
            } else {
              d3.select('#list').text('')
            }
          }
        })
      }

    // Switching views (all birds, personal, this year) redraws the map. Pin the
    // pinned area again, so its list shows the new view's numbers; with
    // nothing pinned, don't leave the old view's hover list up (#163)
    if (pathname !== '/hotspots') {
      const again = page.pinned ? paths.filter(d => areaKey(d) === page.pinned) : null
      if (again && !again.empty()) {
        page.restoring = true
        again.dispatch('click')
        page.restoring = false
      } else if (pathname !== '/251') {
        d3.select('#list').text('')
      }
    }

    // Color lakes
    svg.append('path')
      .datum(Lake)
      .attr('d', path)
      .style('stroke', '#89b6ef')
      .style('stroke-width', '1px')
      .style('fill', '#b6d2f5')

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
          {/* The text components are rows: nest them in a column, or their
              negative margins cancel the page's side padding */}
          {this.props.location.pathname === '/towns' && <div className="col-12"><TownsText /></div>}
          {this.props.location.pathname === '/counties' && <div className="col-12"><CountiesText /></div>}
          {this.props.location.pathname === '/regions' && <div className="col-12"><RegionsText /></div>}
          {this.props.location.pathname === '/hotspots' && <div className="col-12"><HotspotsText /></div>}
          {!['/251', '/hotspots'].includes(this.props.location.pathname) &&
          <UploadButton handleChange={this.props.handleChange} data={this.props.data} />}
          <div id="map" className="col-sm">
            {/* viewBox: the map scales down to fit a narrow screen */}
            <svg ref={node => this.node = node} width={this.props.data.width} height={this.props.data.height}
              viewBox={`0 0 ${this.props.data.width} ${this.props.data.height}`} preserveAspectRatio="xMidYMin meet"></svg>
          </div>
          <div className="col-sm" id="list-container">
            {['/counties', '/towns', '/regions'].includes(this.props.location.pathname)
              // I am not sure why these three checks are necessary, looking at them now.
              && this.props.data.counties && this.props.data.regions && this.props.data.towns && <CountyButton
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
