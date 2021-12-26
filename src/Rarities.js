import React, { Component } from 'react'
import UploadButton from './UploadButton'
import { Table } from 'react-bootstrap'
import ebird from './ebird-ext/index.js'
import MyDatepickerComponent from './DatePicker.js';

// CSS Modules, react-datepicker-cssmodules.css
import 'react-datepicker/dist/react-datepicker-cssmodules.css';



class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      species: '',
      town: '',
      date: '',
      startDate: new Date()
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const value = event.target.value;
    this.setState({
      ...this.state,
      [event.target.name]: value
    });
  }

  async handleSubmit(event) {
    function changeDateFormat (date) {
      const offset = date.getTimezoneOffset()
      date = new Date(date.getTime() - (offset*60*1000))
      return date.toISOString().split('T')[0]
    }

    const opts = {
      'species': this.state.species,
      'date': changeDateFormat(this.state.startDate),
      'town': this.state.town
    }
    let result = await ebird.isSpeciesSightingRare(opts)
    this.props.rerenderParentCallback(result)
    // TODO Send result to props
    // alert('A name was submitted: ' + result);
    // event.preventDefault()
  }

  // TODO Figure out how to style placeholder better
  render() {
    return (
      <form onSubmit={this.handleSubmit} className="col-md-10">
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Species:</label>
            <input type="text" name="species" value={this.state.species} onChange={this.handleChange} className="form-control"/>
          </div>
          <div className="form-group col-md-6">
            <label>Town:</label>
            <input type="text" name="town" value={this.state.town} onChange={this.handleChange} className="form-control"/>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Date:</label>
            <MyDatepickerComponent type="text" name="date" value={this.state.startDate} />
          </div>
        </div>
        <input type="button" onClick={this.handleSubmit} value="Submit" />
      </form>
    );
  }
}


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
      <td><a target="_blank" rel="noopener noreferrer" href={`https://ebird.org/checklist/${species['Submission ID']}`} >{species['Submission ID']}</a></td>
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
      <td><a target="_blank" rel="noopener noreferrer" href={`https://ebird.org/checklist/${species['Submission ID']}`} >{species['Submission ID']}</a></td>
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
        <TableRow title={"Vermont Firsts"} data={rarities.Unknown} text={"These species were not on the VBRC \"Vermont Bird Checklist\" previously; please submit them to the VBRC."} />
        <TableRow title={"Vermont Records"} data={rarities.Vermont} text={"Please submit records of these birds if they are seen anywhere in Vermont."}/>
        <TableRow title={"Nesting Records"} data={rarities.Breeding} text={"Please submit these records if you have noted nesting behavior. This checker looks for any breeding code used for a particular sighting; use your discretion as to which ones are relevant."} />
        <TableRow title={"Outside of Burlington"} data={rarities.Burlington} text={"Please submit records for Fish Crows if seen outside of Burlington, South Burlington, Essex, Colchester, Winooski, or Shelburne."} />
        <TableRow title={"Outside of the Champlain Valley"} data={rarities.Champlain} text={"Please submit records for these birds if seen outside of the Champlain Valley bioregion, used in the Vermont Breeding Birds Atlas."} />
        <TableRow title={"Outside of the NEK"} data={rarities.NEK} text={"Please submit records for these birds if seen outside of the Caledonia, Essex, or Orleans counties."} />
        <TableRow title={"Outside of expected dates"} data={rarities.OutsideExpectedDates} text={"Please submit reocrds for these birds as they were seen outside of their expected date ranges in Vermont. Some older records in this list might have been in the expected date range at the time of the observation, but now would not be. These do not have to be submitted.  Contact your eBird reviewer if you are uncertain."} />
        <TableRow title={"Subspecies"} data={rarities.Subspecies} text={["These subspecies are of note; please submit them to VBRC, after consulting ", <a href={"https://vtecostudies.org/wildlife/wildlife-watching/vbrc/races/"}>the VBRC Subspecies list</a>, "."]} />
      </div>
    )
  } else {
    return (
      <div>
        <hr />
        <h2>You're all set!</h2>
        <p>We couldn't find any Vermont rarities in your eBird data, so there's nothing that VBRC suggests you report this year. If this is disappointing, you're in luck: the way to fix this is to go bird more. Get out there!</p>
      </div>
    )
  }
}

class Rarities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rarities: this.props.data.rarities
    }
    this.rerenderParentCallback = this.rerenderParentCallback.bind(this);
  }

  rerenderParentCallback(props) {
    this.setState({
      rarities: props
    })
    this.forceUpdate();
  }

  render() {
    let rarities = this.state.rarities
    return (
      <div id="rarities" className="container-md">
        <div className="row">
          <h1>Vermont Bird Records Checker</h1>
          <p>This tool will check your eBird checklists for this year for any birds which ought to be reported to the VBRC. You can find out more on <a href="https://vtecostudies.org/wildlife/wildlife-watching/vbrc/" target="_blank" rel="noopener noreferrer" >the VBRC site</a>. This will only check submissions to your eBird account. It checks for Vermont-wide rare birds, breeding birds of note, birds outside of the Burlington Area, Lake Champlain, or the NEK, extreme rarities, subspecies of note, and birds which took a left turn at Albuquerque and ended up here out of season. It only shows sections for which you have records which VBRC recommends that you submit to them.</p>
          <p>It may be that some of the items listed here do not need to be submitted, such as when the observation is a 'continuing' bird for which the initial observer made the required submission and/or certain shared checklists within eBird.  Contact your eBird reviewer if you are uncertain.</p>
          <p>First, <a href="https://ebird.org/downloadMyData" target="_blank" rel="noopener noreferrer" >download your data from eBird.</a> Then, load the unzipped .csv file here. Your data is not stored on this site in any way. Both VCE and the VBRC curate and provide these lists publicly, for which I am grateful. This site is not directly affiliated with VCE, and I will strive to keep the reference data up to date.</p>
          <NameForm className="col-md-10" rerenderParentCallback={this.rerenderParentCallback} />
          {rarities !== '' ?
            <AllRows data={rarities} /> :
            <UploadButton handleChange={this.props.handleChange} data={this.props.data} label={"Or, upload your MyEbirdData.csv file."}/>
          }
        </div>
      </div>
    )
  }
}

export default Rarities