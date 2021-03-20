const fs = require('fs')
const readline = require('readline')
const csv = require('csv-parse')
const Town_boundaries = require('./vt_towns.json')
const Vermont_regions = require('./Polygon_VT_Biophysical_Regions.json')
const VermontSubspecies = require('./vermont_records_subspecies.json')
const GeoJsonGeometriesLookup = require('geojson-geometries-lookup')
const vermontTowns = new GeoJsonGeometriesLookup(Town_boundaries)
const vermontRegions = new GeoJsonGeometriesLookup(Vermont_regions)
const eBird = require('./')
const parser = csv({
  delimiter: '\t',
  record_delimiter: '\n',
  skip_empty_lines: true,
  relax_column_count: true, // this will cause a blow up if removed
  relax: true, // this should allow for the double quotes in individual columns, specifically field notes
  from: 2, // ?
  quote: '"',// this also helps to prevent errors on quotes
  ltrim: true,
  rtrim: true,
  columns: [
    'GLOBAL UNIQUE IDENTIFIER',
    'LAST EDITED DATE',
    'TAXONOMIC ORDER',
    'CATEGORY',
    'COMMON NAME',
    'SCIENTIFIC NAME',
    'SUBSPECIES COMMON NAME',
    'SUBSPECIES SCIENTIFIC NAME',
    'OBSERVATION COUNT',
    'BREEDING BIRD ATLAS CODE',
    'BREEDING BIRD ATLAS CATEGORY',
    'AGE/SEX',
    'COUNTRY',
    'COUNTRY CODE',
    'STATE',
    'STATE CODE',
    'COUNTY',
    'COUNTY CODE',
    'IBA CODE',
    'BCR CODEUSFWS CODE',
    'ATLAS BLOCK',
    'LOCALITY',
    'LOCALITY ID',
    'LOCALITY TYPE',
    'WTF IS P',
    'LATITUDE',
    'LONGITUDE',
    'OBSERVATION DATE',
    'TIME OBSERVATIONS STARTED',
    'OBSERVER ID',
    'SAMPLING EVENT IDENTIFIER',
    'PROTOCOL TYPE',
    'PROTOCOL CODE',
    'PROJECT CODE',
    'DURATION MINUTES',
    'EFFORT DISTANCE KM',
    'EFFORT AREA HANUMBER OBSERVERS',
    'ALL SPECIES REPORTED',
    'GROUP IDENTIFIER',
    'HAS MEDIA',
    'APPROVED',
    'REVIEWED',
    'REASON',
    'TRIP COMMENTS',
    'SPECIES COMMENTS'
  ]
})

const filepath = '/Users/benacker/src/birdinginvermont.com/private-data/ebd_US-VT_relNov-2020_sample.txt'
let counties = {}
let towns = {}
let townChecklists = {}
let townIds = {}

// Goal: We want to be able to read the database of .csv files and automatically identify
// for a given town or county, what birds were seen. This will require using geojson and other
// algorithms in src/ebird-ext...
// our first pass will text-match county, outputting a file of $COUNTY_NAME.json with an array of birds
// second pass will do a town via Lat/Long and output a $TOWN.json with the data
// each of the above files will also have the record GUIDs from the CSV file to avoid future re-import when we jam this :poop: in a DB

// Point Lookup - this is the thing we should be able to do

// Ideally, we would have an object for each town which shows what species were seen in that town.
// This should match the result of: node cli.js towns --input=MyEBirdData.csv

/*****************************/
/******STREAMS EXAMPLE********/
/*****************************/
fs.createReadStream(filepath)
  .pipe(parser)
  .on('data', (row) => { // this is directly on the file's readstream
    if(row['WTF IS P'] !== 'P') {
      // console.log(row['LOCALITY ID'])
      row.LOCALITY = row['LOCALITY ID']
      row['LOCALITY ID'] = row['LOCALITY TYPE']
      row['LOCALITY TYPE'] = row['WTF IS P']
      delete row['WTF IS P']
    }

    // make a point lookup friender
    let data = {
      Longitude: row["LONGITUDE"],
      Latitude: row["LATITUDE"]
    }

    // data.Longitude, data.Latitude

    let town = eBird.pointLookup(Town_boundaries, vermontTowns, data)
    // console.log(eBird.pointLookup(Vermont_regions, vermontRegions, data))

    // sort by county
    if(!(row['COUNTY'] in counties)) {
      counties[row['COUNTY']] = [row['COMMON NAME']]
    } else {
      if(counties[row['COUNTY']].indexOf(row['COMMON NAME']) < 0){
        counties[row['COUNTY']].push(row['COMMON NAME'])
      }
    }

    if(!(town in towns)) {
      towns[town] = [row['COMMON NAME']]
    } else {
      if(towns[town].indexOf(row['COMMON NAME']) < 0){
        towns[town].push(row['COMMON NAME'])
      }
    }
    let year = row['OBSERVATION DATE'].split('-')[0]
    if(!(town in townIds)) {
      townIds[town] = {
        observers: {}
      }
      // console.log(row)
    }
    if (!townIds[town].years) {
      townIds[town].years = [year]
    } else if (townIds[town].years.indexOf(year) < 0) {
      townIds[town].years.push(year)
    }
    if (Object.keys(townIds[town].observers).indexOf(row['OBSERVER ID']) < 0) {
      townIds[town].observers[row['OBSERVER ID']] = [row['SAMPLING EVENT IDENTIFIER']]
    } else {
      if (townIds[town].observers[row['OBSERVER ID']].indexOf(row['SAMPLING EVENT IDENTIFIER']) <0) {
        townIds[town].observers[row['OBSERVER ID']].push(row['SAMPLING EVENT IDENTIFIER'])
      }
    }
    // sort by Lat/Long

    // Delete everything between county code and latitude
    // Match1: US-VT-\d\d\d
    // Match 2: ^(.*)\t^[\t]*\tL\d+.*
  })
  .on('error', (e) => {
    console.log('BONK', e)
  })
  .on('end', () => {
    // console.log(townIds)
    Object.keys(townIds).forEach(t => {
      townIds[t].checklists = 0
      townIds[t].observersCount = 0
      Object.keys(townIds[t].observers).forEach(v => {
        if (v.startsWith('obsr')) {
          townIds[t].checklists += townIds[t].observers[v].length
          townIds[t].observersCount += 1
          // No need to keep the checklists, as this just adds rows
          townIds[t].observers[v] = townIds[t].observers[v].length
        }
      })
      townIds[t].speciesCount = towns[t].length
      townIds[t].species = towns[t]
      townIds[t].averageChecklistsPerBirder = townIds[t].checklists/townIds[t].observersCount
      townIds[t].averageBirdsOverBirders = townIds[t].speciesCount/townIds[t].observersCount
      townIds[t].averageChecklistsToBirds = townIds[t].checklists/townIds[t].speciesCount
    })
    console.log('CSV file successfully processed')
    fs.writeFile(`townStatsList.json`, JSON.stringify(townIds), 'utf8', (err) => {
      if (err)
        console.log(err);
      else {
        console.log("File written successfully.");
      }
    })
    // console.log(JSON.stringify(counties))
    // console.log(townIds)
  });
