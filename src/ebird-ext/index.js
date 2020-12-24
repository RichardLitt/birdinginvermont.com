const Town_boundaries = require('./VT_Data__Town_Boundaries.json')
const Vermont_regions = require('./Polygon_VT_Biophysical_Regions.json')
const VermontRecords = require('./vermont_records.json')
const CountyBarcharts = require('./countyBarcharts.json')
const VermontSubspecies = require('./vermont_records_subspecies.json')
const GeoJsonGeometriesLookup = require('geojson-geometries-lookup')
const vermontTowns = new GeoJsonGeometriesLookup(Town_boundaries)
const vermontRegions = new GeoJsonGeometriesLookup(Vermont_regions)
const fs = require('fs').promises
const _ = require('lodash')
const Papa = require('papaparse')
const moment = require('moment')
const difference = require('compare-latlong')
const appearsDuringExpectedDates = require('./appearsDuringExpectedDates.js')
// Note: this breaks on the server-side, thanks to leaflet needing window.
// Just comment these out if you're running cli.js
const L = require('leaflet')
const leafletKnn = require('leaflet-knn')

function removeSpuh (arr) {
  const newArr = []
  for (var i in arr) {
    if (arr[i]['Scientific Name'] &&
      !arr[i]['Scientific Name'].includes('sp.') &&
      !arr[i]['Scientific Name'].includes(' x ') && // Get rid of hybrids
      !arr[i]['Scientific Name'].includes('Domestic type') && // Get rid of Domestic types
      !arr[i]['Scientific Name'].split(' ').slice(0, 2).join(' ').includes('/') // No Genus-level splits
      // !arr[i]['Scientific Name'].includes('[') &&
      // !arr[i]['Scientific Name'].match(/.* .* .*/g) &&
      // !arr[i]['Scientific Name'].includes('/')
    ) {
      // Remove subspecies only entries
      // For some reason, simply copying over the field before redefining it doesn't work.
      // Probably due to JavaScript reference errors.
      const specie = arr[i]
      if (specie['Scientific Name'].split(' ').slice(2).length !== 0) {
        arr[i]['Subspecies'] = _.clone(arr[i]['Scientific Name'])
      }
      specie['Scientific Name'] = specie['Scientific Name'].split(' ').slice(0, 2).join(' ')
      newArr.push(specie)
      // } else {
      // Use this to find excluded entries
      // console.log(arr[i]['Scientific Name'])
    }
  }
  return _.uniq(newArr)
}

function removeSpuhFromCounties (countyBarcharts) {
  const newObj = {}
  Object.keys(CountyBarcharts).forEach(county => {
    newObj[county] = removeSpuh(Object.keys(CountyBarcharts[county].species).map(s => {
      const species = CountyBarcharts[county].species[s]
      // ES6 probably has a better way of doing this.
      species.name = s
      return species
    })).map(s => s.name)
  })
  return newObj
}

// Useful for when Rock Pigeon is being compared against other lists, or for times when a single sighting contains only subspecies
function cleanCommonName (arr) {
  return arr.map(s => s.split('(')[0].trim())
}

async function getData (input) {
  if (fs) {
    input = await fs.readFile(input, 'utf8')
    input = Papa.parse(input, { header: true })
    return removeSpuh(input.data)
  }

  return removeSpuh(input)
}

function parseDateformat (timespan) {
  let dateFormat
  if (timespan === 'year') {
    dateFormat = 'YYYY'
  } else if (timespan === 'month') {
    dateFormat = 'YYYY-MM'
  } else if (timespan === 'day') {
    dateFormat = 'YYYY-MM-DD'
  } else if (timespan) {
    throw new Error('Unable to parse timespan. Must be: year, month, or day.')
  }
  return dateFormat
}

function momentFormat (dateStr) {
  if (dateStr.includes('-')) {
    return 'YYYY-MM-DD'
  } else if (dateStr.includes('/')) {
    return 'MM/DD/YYYY'
  } else {
    throw new Error('Invalid Date String')
  }
}

function createPeriodArray (data) {
  const periodArray = []
  for (const period in data) {
    periodArray.push({
      Date: period,
      SpeciesTotal: removeSpuh(_.uniqBy(data[period], 'Scientific Name')).length,
      Species: removeSpuh(_.uniqBy(data[period], 'Scientific Name'))
    })
  }
  return _.sortBy(periodArray, 'SpeciesTotal').reverse()
}

function locationFilter (list, opts) {
  // TODO Make State and Country and County and Town work
  if (opts.state && !opts.county) {
    return list.filter((x) => {
      // TODO Add a mapping from Vermont to US-VT, for all states and provinces
      if (x["State/Province"] === 'US-VT') {
        x.State = 'Vermont'
      }
      return (x.State) ? x.State === opts.state : false;
    })
  } else if (opts.county && opts.state) {
    return list.filter(x => {
        if (x["State/Province"] === 'US-VT') {
          x.State = 'Vermont'
        }
        return (x.State && x.County) ? ((x.State === opts.state) && (x.County === opts.county)) : false;
    })
  } else {
    return list
  }
}

function dateFilter (list, opts) {
  // TODO Make month and day work
  if (!opts.year) {
    return list
  }
  return list.filter(x => {
    return moment(x.Date, momentFormat(x.Date)).format('YYYY') === opts.year
  })
}

function orderByDate (arr) {
  return _.orderBy(arr, (e) => moment(e.Date, momentFormat(e.Date)).format())
}

async function biggestTime (timespan, opts) {
  const dateFormat = parseDateformat(timespan)
  const data = await getData(opts.input)
  const dataByDate = {}

  // Sort by the amount of unique entries per day
  data.forEach((e) => {
    const period = moment(e.Date, momentFormat(e.Date)).format(dateFormat)
    if (!dataByDate[period]) {
      dataByDate[period] = [e]
    } else {
      dataByDate[period].push(e)
    }
  })

  return createPeriodArray(dataByDate)[0]
}

async function firstTimes (timespan, opts) {
  const dateFormat = parseDateformat(timespan)
  const data = orderByDate(await getData(opts.input)) // Sort by the date, instead
  const dataByDate = {}
  const speciesIndex = {}

  // Sort by the amount of unique entries per day
  data.forEach((e) => {
    const period = moment(e.Date, momentFormat(e.Date)).format(dateFormat)
    if (!speciesIndex[e['Scientific Name']]) {
      if (!dataByDate[period]) {
        dataByDate[period] = [e]
      } else {
        dataByDate[period].push(e)
      }
      // TODO Use scientific name
      speciesIndex[e['Scientific Name']] = e.Date
    }
  })

  return createPeriodArray(dataByDate)[0]
}

async function firstTimeList (opts) {
  // TODO Fix
  // const dateFormat = parseDateformat('day')
  // const data = orderByDate(dateFilter(locationFilter(await getData(opts.input), opts), opts))
  // const dataByDate = {}
  // const speciesIndex = {}
  //
  // data = countUniqueSpecies(data)
  //
  // let i = 1
  // // TODO Doesn't work for MyEBirdData for some reason
  // _.sortBy(createPeriodArray(dataByDate), 'Date').forEach((e) => {
  //   e.Species.forEach((specie) => {
  //     console.log(`${i} | ${specie['Common Name']} - ${specie['Scientific Name']} | ${(specie.County) ? specie.County + ', ' : ''}${specie['State/Province']} | ${e.Date}`)
  //     i++
  //   })
  // })
}

// Sort by the amount of unique entries per day
function countUniqueSpecies (data, dateFormat) {
  const speciesIndex = {}
  const dataByDate = {}
  data.forEach((e) => {
    const period = moment(e.Date, momentFormat(e.Date)).format(dateFormat)
    const specie = e['Scientific Name']
    if (!speciesIndex[specie]) {
      if (!dataByDate[period]) {
        dataByDate[period] = [e]
      } else {
        dataByDate[period].push(e)
      }
      speciesIndex[specie] = e.Date
    }
  })

  return dataByDate
}

function getAllTowns (geojson) {
  const towns = []
  geojson.features.forEach((t) => {
    towns.push({
      town: t.properties.name
    })
  })
  return towns
}

/* node cli.js count -i=MyEBirdData.csv --town="Fayston" --state=Vermont
As this is set up, it will currently return only the first time I saw species in each town provided, in Vermont */
async function towns (opts) {
  opts.state = 'Vermont'
  const dateFormat = parseDateformat('day')
  let data = orderByDate(locationFilter(await getData(opts.input), opts), opts)
  data.forEach(d => {
    d.Town = opts.checklistLocations[d['Submission ID']]['Town']
  })
  var speciesSeenInVermont = []
  _.forEach(countUniqueSpecies(data, dateFormat), (o) => {
    var mapped = _.map(o, 'Common Name')
    speciesSeenInVermont.push(mapped)
  })
  speciesSeenInVermont = _.flatten(speciesSeenInVermont)
  if (opts.all) {
    const towns = getAllTowns(Town_boundaries)
    towns.forEach(t => {
      let i = 0
      t.species = []
      t.speciesByDate = countUniqueSpecies(data.filter(x => x.Town === t.town), dateFormat)
      _.sortBy(createPeriodArray(t.speciesByDate), 'Date').forEach((e) => {
        e.Species.forEach((species) => {
          t.species.push(species['Common Name'])
          i++
        })
      })
      t.speciesTotal = i
      t.notSeen = _.difference(speciesSeenInVermont, cleanCommonName(t.species))
    })

    return towns
    // fs.writeFile('vt_town_counts.json', JSON.stringify(towns), 'utf8')

  } else if (opts.town) {
    data = countUniqueSpecies(data.filter(x => x.Town === opts.town), dateFormat)

    let i = 1
    // TODO Doesn't work for MyEBirdData for some reason
    _.sortBy(createPeriodArray(data), 'Date').forEach((e) => {
      e.Species.forEach((specie) => {
        console.log(`${i} | ${specie['Common Name']} - ${specie['Scientific Name']} | ${opts.town}, ${(specie.County) ? specie.County + ', ' : ''}${specie['State']} | ${e.Date}`)
        i++
      })
    })
  }
}

/* node cli.js counties -i=MyEBirdData.csv
As this is set up, it will currently return only the first time I saw species in each town provided, in Vermont */
async function counties (opts) {
  opts.state = 'Vermont'
  const dateFormat = parseDateformat('day')
  let data = orderByDate(locationFilter(await getData(opts.input), opts), opts)

  const countySpecies = removeSpuhFromCounties(CountyBarcharts)

  const counties = Object.keys(CountyBarcharts).map(county => {
    const speciesByDate = countUniqueSpecies(data.filter(x => x.County === county), dateFormat)
    const species = _.sortBy(createPeriodArray(speciesByDate), 'Date').map(period => {
        return period.Species.map(species => species['Common Name'])
      }).flat()
    return {
      county,
      collectiveTotal: countySpecies[county].length,
      species,
      speciesByDate,
      speciesTotal: species.length,
      notSeen: _.difference(countySpecies[county], cleanCommonName(species))
    }
  })

  // Again, as above es6 probably has a better way of doing this.
  const newObj = {}
  counties.forEach(c => newObj[c.county] = c)

  if (opts.county) {
    console.log(newObj[opts.county])
    return newObj[opts.county]
  }
  return newObj
}

/* node cli.js count -i=MyEBirdData.csv --town="Fayston" --state=Vermont
As this is set up, it will currently return only the first time I saw species in each town provided, in Vermont */
async function regions (opts) {
  opts.state = 'Vermont'
  const dateFormat = parseDateformat('day')
  let data = orderByDate(locationFilter(await getData(opts.input), opts), opts)
  data.forEach(d => {
    d.Region = opts.checklistLocations[d['Submission ID']].Region
  })

  function getRegions (geojson) {
    const regions = []
    geojson.features.forEach((r) => regions.push({ region: r.properties.name }))
    return regions
  }

  const regions = getRegions(Vermont_regions)
  regions.forEach(r => {
    let i = 0
    r.species = []
    r.speciesByDate = countUniqueSpecies(data.filter(x => x.Region === r.region), dateFormat)
    _.sortBy(createPeriodArray(r.speciesByDate), 'Date').forEach((e) => {
      e.Species.forEach((specie) => {
        r.species.push(specie['Common Name'])
        i++
      })
    })
    r.speciesTotal = i
    // console.log(`Region: ${r.region}. Species count: ${r.speciesTotal}.`)
  })

  return regions
  // fs.writeFile('vt_region_counts.json', JSON.stringify(regions), 'utf8')
}

async function radialSearch (opts) {
  const dateFormat = parseDateformat('day')
  let radius = opts.distance || 10 // miles
  let lat = opts.coordinates[0]
  let long = opts.coordinates[1]
  console.log(dateFormat, lat, long)
  let data = await getData(opts.input)

  // Get a total list of species that you have seen in Vermont
  // TODO Get a list of all species ever seen in Vermont, here.
  var speciesSeenInVermont = []
  opts.state = 'Vermont'
  _.forEach(countUniqueSpecies(locationFilter(data, opts), dateFormat), (o) => {
    var mapped = _.map(o, 'Common Name')
    speciesSeenInVermont.push(mapped)
  })
  speciesSeenInVermont = _.flatten(speciesSeenInVermont)

  data = orderByDate(data, opts).filter((d) => {
    let distance = difference.distance(lat, long, d.Latitude, d.Longitude, 'M')
    return distance <= radius
  })
  let i = 0
  let areaResults = {}

  areaResults.species = []
  areaResults.speciesByDate = countUniqueSpecies(data, dateFormat)
  _.sortBy(createPeriodArray(areaResults.speciesByDate), 'Date').forEach((e) => {
    e.Species.forEach((specie) => {
      areaResults.species.push(specie['Common Name'])
      i++
    })
  })
  areaResults.speciesTotal = i
  areaResults.notSeen = _.difference(speciesSeenInVermont, cleanCommonName(areaResults.species))

  return areaResults
}

async function quadBirds (opts) {
  if (!opts.year) {
    opts.year = moment().format('YYYY')
  }
  // opts.countyCode = 'US-VT-023'
  // opts.county = 'Washington'
  // opts.state = 'Vermont'
  const files = opts.input.split(',')
  let data = []
  await Promise.all(files.map(async (file) => {
    const contents = await getData(file)
    data = data.concat(contents)
  }))
  data = orderByDate(dateFilter(locationFilter(data, opts), opts))
  const speciesIndex = {}
  let completionDates = []

  // Sort by the amount of unique entries per day
  data.forEach((e) => {
    const specie = e['Scientific Name']
    if (!speciesIndex[specie]) {
      speciesIndex[specie] = {
        seen: undefined,
        audio: undefined,
        photo: undefined,
        species: e
      }
    }
    if (e['Submission ID'] && !speciesIndex[specie].seen) {
      if (moment(e.Date, momentFormat(e.Date)).format('YYYY') === opts.year) {
        speciesIndex[specie].seen = moment(e.Date, momentFormat(e.Date)).format('YYYY-MM-DD')
      }
    }
    if (e.Format === 'Photo' && !speciesIndex[specie].photo) {
      speciesIndex[specie].photo = moment(e.Date, momentFormat(e.Date)).format('YYYY-MM-DD')
    }
    if (e.Format === 'Audio' && !speciesIndex[specie].audio) {
      speciesIndex[specie].audio = moment(e.Date, momentFormat(e.Date)).format('YYYY-MM-DD')
    }
    if (!speciesIndex[specie].completed &&
      speciesIndex[specie].audio &&
      speciesIndex[specie].photo &&
      speciesIndex[specie].seen) {
      if (moment(speciesIndex[specie].audio, momentFormat(speciesIndex[specie].audio)).isBefore(speciesIndex[specie].photo, momentFormat(speciesIndex[specie].audio))) {
        speciesIndex[specie].completed = speciesIndex[specie].photo
      } else {
        speciesIndex[specie].completed = speciesIndex[specie].audio
      }
      completionDates.push({ Date: speciesIndex[specie].completed, species: speciesIndex[specie].species })
    }
  })

  completionDates = orderByDate(completionDates)

  if (opts.list) {
    for (const species in completionDates) {
      console.log(`${completionDates[species].Date}: ${completionDates[species].species['Common Name']}.`)
    }
  }
  console.log(`You saw, photographed, and recorded audio for a total of ${completionDates.length} species in ${opts.year}.`)
}

function pointLookup(geojson, geojsonLookup, data) {
  let point = {type: "Point", coordinates: [data.Longitude, data.Latitude]}
  let containerArea = geojsonLookup.getContainers(point)
  let gj, nearestLayer
  if (!containerArea.features[0]) {
    gj = L.geoJson(geojson);
    nearestLayer = leafletKnn(gj).nearestLayer([data.Longitude, data.Latitude], 1);
    return nearestLayer[0].layer.feature.properties.name
  }
  return containerArea.features[0].properties.name
}

async function checklistLocations (opts) {
  let obj = {}
  const data = locationFilter(await getData(opts.input), {state: 'Vermont'}) // Don't filter, this is only used for checking
  for (let d of data) {
    if (!obj[d['Submission ID']] && window) {
      let locations = {}
      // For some reason, this takes a second each time.
      locations.Town = pointLookup(Town_boundaries, vermontTowns, d)
      locations.Region = pointLookup(Vermont_regions, vermontRegions, d)
      obj[d['Submission ID']] = locations
    }
  }
  return obj
}

async function rare (opts) {
  // if (!opts.year) {
  //   opts.year = moment().format('YYYY')
  // }
  opts.state = 'Vermont'
  // Use only data from this year, from Vermont
  const data = dateFilter(locationFilter(await getData(opts.input), opts), opts)
  const allSpecies = VermontRecords.map(x => x['Scientific Name'])
  const speciesToReport = VermontRecords.map(x => x['Scientific Name'])
  // TODO Update needs JSON file
  const output = {
    'Breeding': [],
    'Vermont': [],
    'Burlington': [],
    'Champlain': [],
    'NEK': [],
    'Unknown': [],
    'Subspecies': [],
    'OutsideExpectedDates': []
  }
  data.forEach(e => {
    let species = e['Scientific Name']
    if (speciesToReport.includes(species)) {
      let recordEntry = VermontRecords.find(x => x['Scientific Name'] === species)
      // TODO Document this. Could also check Observation Details or Checklist Comments
      if (!appearsDuringExpectedDates(e.Date, recordEntry.Occurrence)) {
        output.OutsideExpectedDates.push(e)
      } else if (recordEntry.Breeding !== '*' && e['Breeding Code']) {
        output.Breeding.push(e)
      } else if (recordEntry.Reporting === 'N' && (e['Breeding Code'])) {
        output.Breeding.push(e)
      } else if (recordEntry.Reporting === 'V') {
        // Anyhwere in Vermont
        output.Vermont.push(e)
      } else if (recordEntry.Reporting === 'B') {
        // Outside of Burlington
        const towns = ['Burlington', 'South Burlington', 'Essex', 'Colchester', 'Winooski', 'Shelburne']
        e.Town = opts.checklistLocations[e['Submission ID']].Town
        if (!towns.includes(e.Town)) {
          output.Burlington.push(e)
        }
      } else if (recordEntry.Reporting === 'C') {
        // Outside of Lake Champlain Basin
        e.Region = opts.checklistLocations[e['Submission ID']].Region
        if (e.Region !== 'Champlain Valley') {
          output.Champlain.push(e)
        }
      } else if (recordEntry.Reporting === 'K') {
        // Outside of the NEK
        const counties = ['Essex', 'Caledonia', 'Orleans']
        if (!counties.includes(e.County)) {
          output.NEK.push(e)
        }
      }
    } else if (!allSpecies.includes(species)) {
      output.Unknown.push(e)
    }

    if (e.Subspecies) {
      let species = VermontSubspecies.find(x => e['Scientific Name'] === x['Scientific Name'])
      if (species && species['Target Subspecies'].includes(e.Subspecies)) {
        e['Subspecies Notes'] = species
        output.Subspecies.push(e)
      } else if (species && !species['Vermont Subspecies'].includes(e.Subspecies)) {
        if (species['Target Subspecies'][0] === "") {
          e['Subspecies Notes'] = species
          output.Subspecies.push(e)
        } else {
          e['Subspecies Notes'] = species
          output.Subspecies.push(e)
        }
      }
    }
  })

  return output
}

// async function today (opts) {
  // I want to know:
  // - Was today a big day?
  // - Did I get new world birds today?
  // - Did I get new country birds today?
  // - Did I get new state birds today?
  // - Did I get new county birds today?
  // - Did I get new photo birds today?
  // - Did I get new audio birds today?
// }

module.exports = {
  biggestTime,
  firstTimeList,
  firstTimes,
  quadBirds,
  radialSearch,
  rare,
  regions,
  removeSpuh,
  removeSpuhFromCounties,
  towns,
  counties,
  checklistLocations
}
