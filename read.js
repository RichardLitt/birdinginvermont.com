const fs = require('fs')
const readline = require('readline')
const csv = require('csv-parse')
const parser = csv({
  delimiter: '\t',
  record_delimiter: '\n',
  skip_empty_lines: true,
  relax_column_count: true, // this will cause a blow up if removed
  relax: true, // this should allow for the double quotes in individual columns, specifically field notes
  from: 1, // ?
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

const filepath = 'private-data/ebd_US-VT_relNov-2020_sample.txt'
let counties = {}

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

    // sort by county
    if(!(row['COUNTY'] in counties)) {
      counties[row['COUNTY']] = [row['COMMON NAME']]
    } else {
      if(counties[row['COUNTY']].indexOf(row['COMMON NAME']) < 0){
        counties[row['COUNTY']].push(row['COMMON NAME'])
      }
    }

    // sort by Lat/Long

    // Delete everything between county code and latitude
    // Match1: US-VT-\d\d\d
    // Match 2: ^(.*)\t^[\t]*\tL\d+.*
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    console.log(JSON.stringify(counties))
  });
