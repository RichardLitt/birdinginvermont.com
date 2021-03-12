const fs = require('fs')
const readline = require('readline')
const csv = require('csv-parse')
const parser = csv({
  delimiter: '\t',
  record_delimiter: '\n',
  skip_empty_lines: true,
  relax_column_count: true,
  relax: true, // this should allow for the double quotes in individual columns, specifically field notes
  from: 2,
  quote: '"',
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

// Goal: We want to be able to read the database of .csv files and automatically identify
// for a given town or county, what birds were seen. This will require using geojson and other
// algorithms in src/ebird-ext...
// Ideally, we would have an object for each town which shows what species were seen in that town.
// This should match the result of: node cli.js towns --input=MyEBirdData.csv

/*****************************/
/******STREAMS EXAMPLE********/
/*****************************/

fs.createReadStream(filepath)
  .pipe(parser)
  .on('data', (row) => {
    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
