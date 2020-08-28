import React, { Component } from 'react'
import UploadButton from './UploadButton'
import { Table } from 'react-bootstrap'

function SpeciesRow (props) {
  let species = props.data
  let index = props.index
  return (
    <tr key={index}>
      <td>{index+1}</td>
      <td>{species['Common Name']}</td>
      <td><i>{species['Scientific Name']}</i></td>
      <td>{species.Location}</td>
      <td>{species.Date}</td>
      <td><a href={`https://ebird.org/checklist/${species['Submission ID']}`} >{species['Submission ID']}</a></td>
    </tr>
  )
}

function SubspeciesRow (props) {
  let species = props.data
  let index = props.index
  return (
    <tr key={index}>
      <td>{index+1}</td>
      <td>{species['Common Name']}</td>
      <td><i>{species['Subspecies']}</i></td>
      <td>{species.Location}</td>
      <td>{species.Date}</td>
      <td><a href={`https://ebird.org/checklist/${species['Submission ID']}`} >{species['Submission ID']}</a></td>
    </tr>
  )
}

function SpeciesTable (props) {
  let data = props.data
  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th colSpan="2">Species</th>
          <th colSpan="1">Location</th>
          <th colSpan="1">Date</th>
          <th colSpan="1">Checklist</th>
        </tr>
      </thead>
      <tbody>
        {data.map((data, index) => {
          if (data['Subspecies Notes']) {
            return (
              <SubspeciesRow data={data} index={index}  key={index} />
            )
          } else {
            return (
              <SpeciesRow data={data} index={index} key={index} />
            )
          }
        })}
      </tbody>
    </Table>
  )
}

function TableRow (props) {
  let data = props.data
  if (data.length !== 0) {
    return (
      <div className="row table-row">
        <div className="col">
          <h2>{props.title}</h2>
          <p>{props.text}</p>
          <SpeciesTable data={data} />
        </div>
      </div>
    )
  } else {
    return null
  }
}

function AllRows (props) {
  let rarities = props.data
  if (!Object.keys(rarities).every(key => {
    return rarities[key].length === 0
  })) {
    return (
      <div>
        <TableRow title={"Vermont Firsts"} data={rarities.Unknown} text={"Theses birds were not on the lists of birds seen in Vermont before, and should also probably be submitted."} />
        <TableRow title={"Vermont Records"} data={rarities.Vermont} text={"These birds should be submitted to the VBRC if seen anywhere in Vermont."}/>
        <TableRow title={"Breeding Records"} data={rarities.Breeding} text={"These records should be submitted if you haved noted breeding behavior. This checker looks for any breeding code used for a particular sighting. Use your discretion as to which are relevant to submit."} />
        <TableRow title={"Outside of Burlington"} data={rarities.Burlington} text={"These birds should be submitted if seen outside of Burlington. Basically, this is for the Fish Crow. This checks for birds outside of Burlington, South Burlington, Essex, Colchester, Winooski, and Shelburne."} />
        <TableRow title={"Outside of the Champlain Valley"} data={rarities.Champlain} text={"These birds shoud be submitted if seen outside of the Champlain Valley. This checks against the Champlain Valley bioregion, used in the Vermont Breeding Birds Atlas."} />
        <TableRow title={"Outside of the NEK"} data={rarities.NEK} text={"Theses birds should be submitted if seen outside of the Caledonia, Essex, or Orleans counties."} />
        <TableRow title={"Outside of expected dates"} data={rarities.OutsideExpectedDates} text={"Theses birds should be submitted as they were seen outside of their expected date ranges for Vermont."} />
        <TableRow title={"Subspecies"} data={rarities.Subspecies} text={["These subspecies are of note, and may also need to be submitted. Consult with ", <a href={"https://vtecostudies.org/wildlife/wildlife-watching/vbrc/races/"}>the VBRC Subspecies list</a>, "."]} />
      </div>
    )
  } else {
    return (
      <div>
        <hr />
        <h2>You're all set!</h2>
        <p>We couldn't find any Vermont rarities in your eBird data, so you don't need to report anything this year. If this is disappointing, you're in luck: the way to see some is to go bird more. Get out there!</p>
      </div>
    )
  }
}

class Rarities extends Component {
  render() {
    const rarities = this.props.data.rarities
    return (
      <div id="rarities" className="container-md">
        <div className="row">
          <h1>Vermont Bird Records Checker</h1>
          <p>This tool will check your eBird checklists for this year for any birds which ought to be reported to the VBRC. You can find out more on <a href="https://vtecostudies.org/wildlife/wildlife-watching/vbrc/">the VBRC site</a>. This will only check submissions to your eBird account. It checks for Vermont-wide rare birds, breeding birds of note, birds outside of the Burlington Area, Lake Champlain, or the NEK, extreme rarities, subspecies of note, and birds which took a left turn at Albuquerque and ended up here out of season.</p>
          <p>First, <a href="https://ebird.org/downloadMyData">download your data from eBird.</a> Then, load the unzipped .csv file here. Your data is not stored on this site in any way. Both VCE and the VBRC curate and provide these lists publicly, for which I am grateful. This site is not directly affiliated with VCE, and I will strive to keep the reference data up to date.</p>
          {rarities !== '' ?
            <AllRows data={rarities} /> :
            <UploadButton handleChange={this.props.handleChange} data={this.props.data} />
          }
        </div>
      </div>
    )
  }
}

export default Rarities