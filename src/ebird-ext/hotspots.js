const VermontHotspots = require('./data/hotspots.json')
const Town_boundaries = require('./geojson/vt_towns.json')
const _ = require('lodash')
const fs = require('fs').promises
const moment = require('moment')
const Papa = require('papaparse')
const main = require('./index')
const helpers = require('./helpers')

async function csvToJsonHotspots (opts) {
  let input
  if (fs) {
    input = await fs.readFile(opts.input, 'utf8')
    input = input.split('\n')
    input.unshift('ID,Country,State/Province,Region,Latitude,Longitude,Name,Last visited,Species')
    input = input.join('\n').trim()
    input = Papa.parse(input, { header: true })
  }
  await fs.writeFile('data/hotspots.json', JSON.stringify(input.data))
  await fs.writeFile('data/novisits-hotspots.json', JSON.stringify(input.data.filter(x => !x["Last visited"])))
  let list = input.data.map(x => x.Name).join('\n')
  await fs.writeFile('data/hotspotsList.md', list)
}

// Show which hotspots you haven't birded in
async function unbirdedHotspots(opts) {
  let data
  if (!opts.state) { opts.state = 'Vermont'}
  if (opts.input) {
    data = await main.getData(opts.input)
  }

  let hotspots = JSON.parse(await fs.readFile('data/hotspots.json', 'utf8'))

  // If the opts are not this year
  if (opts.currentYear) {
    let year = moment().year()
    // Return all of the ones we haven't gone to
    hotspots = hotspots.filter(x => {
      if (x['Last visited']) {
        let visitedthisYear = moment(x['Last visited'], helpers.momentFormat(x['Last visited'])).format('YYYY') === year.toString()
        return !visitedthisYear
      } else {
        return true
      }
   })
  }

  // If the opts are not this year
  if (opts.sinceYear) {
    let year = opts.sinceYear
    // Return all of the ones we haven't gone to
    hotspots = hotspots.filter(x => {
      if (x['Last visited']) {
        let visitedthisYear = moment(x['Last visited'], helpers.momentFormat(x['Last visited'])).format('YYYY') > year
        return !visitedthisYear
      } else {
        return false
      }
   })
  }

  if (data) {
    hotspots = hotspots.filter(hotspot => {
      return !data.find(checklist => checklist['Location ID'] === hotspot.ID)
    })
  }

  // console.log(result.map(x => `${x.Name}, ${x['Last visited']}`))

  // .filter(x => x.Region === 'US-VT-023')
  // Print out the most unrecent in your county, basically
  console.log(hotspots.sort((a,b) => {
    if (a['Last visited'] && b['Last visited']) {
      let check = moment(a['Last visited']).diff(moment(b['Last visited']))
      return check
    } else {
      // Not really sure how to deal with this, doesn't seem to work well.
      return 0
    }
  }).map(x => `${x.Name}, ${x['Last visited']}`))

  // TODO Add to the map
  // TODO Find closest to you
}

// Show which hotspots are in which towns
async function townHotspots(opts) {
  if (!opts.state) { opts.state = 'Vermont'}

  // LocationFilter really shouldn't be used on these, as they're not checklists, but it works (for now...)
  let data = main.locationFilter(VermontHotspots.map(x => {
    // Otherwise it messes up and writes over the region
    x.County = main.eBirdCountyIds[Number(x.Region.split('US-VT-')[1])]
    return x
  }), opts)

  if (opts.noVisits) {
    if (opts.print) {
      const towns = main.getAllTowns(Town_boundaries).sort((a, b) => a.town.localeCompare(b.town));
      console.log('Towns with unvisited hotspots:')
      towns.forEach(t => {
        let hotspots = data.filter(x => x.Town === t.town)
        let noVisits = hotspots.filter(x => !x["Last visited"])
        if (noVisits.length) {
          console.log(`${helpers.capitalizeFirstLetters(t.town)}: ${noVisits.length}`)
          console.log(`  ${noVisits.map(x => `${x.Name} (https://ebird.org/hotspot/${x.ID})`).join('\n  ')}
            `)
          }
        })
    }
    let noVisits = data.filter(x => !x["Last visited"])
    return noVisits
  }
  if (opts.all) {
    const towns = main.getAllTowns(Town_boundaries).sort((a, b) => a.town.localeCompare(b.town));
    console.log('Town hotspots:')
    towns.forEach(t => {
      let hotspots = data.filter(x => x.Town === t.town)
      console.log(`${helpers.capitalizeFirstLetters(t.town)}: ${hotspots.length}`)
    })
  } else if (opts.town) {
    // Turn on to find checklists in that town console.log(_.uniq(data.map((item, i) => `${item['Submission ID']}`)))
    data = data.filter(x => x.Town === opts.town.toUpperCase())
    console.log(data)
  }
}

async function daysYouveBirdedAtHotspot (opts) {
  if (!opts.id) {
    console.log('Get the ID for this location first, manually. Send it as --id.')
  }

  // Note - this assumes the location is a hotspot
  console.log(`
You have not birded in ${VermontHotspots.find(h => h.ID === opts.id).Name} on:`)

  let data = await main.getData(opts.input)
  let observedDates = {}
  let fullYearChart = {}
  let unbirdedDates = {}

  // Create keys in observedDates for months
  Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2, '0')).forEach(key => observedDates[key] = [])

  // Filter and add all days observed to the chart
  data.filter(x => x['Location ID'] === opts.id).forEach(x => {
    let [month, day] = x.Date.split('-').slice(1)
    if (observedDates[month].indexOf(Number(day)) === -1) {
      observedDates[month].push(Number(day))
    }
  })

  // Create a full year chart, and then find days that weren't in days observed
  Object.keys(observedDates).forEach(month => {
    fullYearChart[month.toString().padStart(2, '0')] = Array.from({length: moment().month(month-1).daysInMonth()}, (_, i) => i + 1)
    unbirdedDates[month] = _.difference(fullYearChart[month], observedDates[month].sort((a,b) => a-b))
  })

  // Print
  Object.keys(unbirdedDates).sort((a,b) => Number(a)-Number(b)).forEach(month => {
    console.log(`${moment().month(Number(month)-1).format('MMMM')}: ${unbirdedDates[month].join(', ')}`)
  })
}

async function weeksYouveBirdedAtHotspot (opts) {
  if (!opts.id) {
    console.log('Get the ID for this location first, manually. Send it as --id.')
  }

  let data = await main.getData(opts.input)
  let observedDates = []
  let unbirdedDates = Array.from({length: 52}, (_, i) => i + 1)

  // Filter and add all days observed to the chart
  data.filter(x => x['Location ID'] === opts.id).forEach(x => {
    let week = moment(x.Date).week()
    if (observedDates.indexOf(week) === -1) {
      observedDates.push(week)
    }
  })

  let unbirdedWeeks = _.difference(unbirdedDates, observedDates.sort((a,b) => Number(a)-Number(b)))

  console.log()

  if (observedDates.length === 52){
    // Note - this assumes the location is a hotspot
    if (VermontHotspots.find(h => h.ID === opts.id).Name) {
      console.log(`
You've birded at ${VermontHotspots.find(h => h.ID === opts.id).Name} every week of the calendar year!`)
    } else {
      console.log(`You've birded at this location every week of the year!`)
    }

  } else {
    console.log(`You've not birded here on weeks: ${unbirdedWeeks.join(', ')}.`)
    console.log(`The next unbirded week (#${unbirdedWeeks[0]}) starts on ${moment().startOf('year').week(unbirdedWeeks[0]).startOf('week').format('dddd, MMMM Do')}.`)
  }
  console.log('Note this only takes into account your bird sightings, not the databases.')
  console.log()
}

module.exports = {
  csvToJsonHotspots,
  unbirdedHotspots,
  townHotspots,
  daysYouveBirdedAtHotspot,
  weeksYouveBirdedAtHotspot
}