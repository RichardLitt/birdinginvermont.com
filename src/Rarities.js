import React, { Component } from 'react'
import UploadButton from './UploadButton'
import { Table } from 'react-bootstrap'
import DatePicker from "react-datepicker";
import Select from 'react-select';
import ebird from './ebird-ext/index.js'

// CSS Modules, react-datepicker-cssmodules.css
import "react-datepicker/dist/react-datepicker.css";
import 'react-datepicker/dist/react-datepicker-cssmodules.css';

const VermontRecords = require('./ebird-ext/data/vermont_records.json')

// TODO Figure out how to style placeholder text better

function capitalizeFirstLetters(string) {
  return string.toLowerCase().split(' ').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')
}

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      species: '',
      town: '',
      date: new Date()
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleDate = (date) => {
    this.setState({ date })
  }

  handleTown = (town) => {
    this.setState({ town })
  }

  handleSpecies = (species) => {
    this.setState({ species })
  }

  async handleSubmit(event) {
    function changeDateFormat (date) {
      const offset = date.getTimezoneOffset()
      date = new Date(date.getTime() - (offset*60*1000))
      return date.toISOString().split('T')[0]
    }

    const opts = {
      'species': this.state.species.value,
      'date': changeDateFormat(this.state.date),
      'town': this.state.town.value
    }

    if (opts.species && opts.date && opts.town) {
      let result = await ebird.isSpeciesSightingRare(opts)
      this.props.rerenderParentCallback(result)
    }
  }

  createSpeciesList () {
    return VermontRecords.map((x) => {
      return {
        value: x.Species,
        label: x.Species
      }
    }).sort()
  }

  createTownList () {
    const towns = ["CANAAN","FRANKLIN","BERKSHIRE","HIGHGATE","RICHFORD","ALBURGH","NORTON","AVERILL","HOLLAND","JAY","TROY","LEMINGTON","ISLE LA MOTTE","AVERYS GORE","WARREN'S GORE","WARNER'S GRANT","SHELDON","MORGAN","LEWIS","SWANTON","NORTH HERO","ENOSBURGH","WESTFIELD","CHARLESTON","ST. ALBANS TOWN","ST. ALBANS CITY","BROWNINGTON","FAIRFIELD","BLOOMFIELD","BRIGHTON","IRASBURG","LOWELL","BAKERSFIELD","WESTMORE","FERDINAND","BRUNSWICK","BELVIDERE","GEORGIA","ALBANY","GRAND ISLE","WATERVILLE","FAIRFAX","NEWARK","FLETCHER","BARTON","SUTTON","GLOVER","MILTON","EAST HAVEN","CRAFTSBURY","CAMBRIDGE","SHEFFIELD","SOUTH HERO","GRANBY","GREENSBORO","BURKE","WESTFORD","JOHNSON","WOLCOTT","UNDERHILL","WHEELOCK","GUILDHALL","VICTORY","HYDE PARK","MORRISTOWN","HARDWICK","STANNARD","KIRBY","STOWE","ELMORE","LYNDON","WALDEN","LUNENBURG","JERICHO","ST. JOHNSBURY","CONCORD","WOODBURY","WORCESTER","BOLTON","WATERFORD","CALAIS","ST. GEORGE","BARNET","MIDDLESEX","PEACHAM","DUXBURY","CHARLOTTE","HUNTINGTON","WATERBURY","MARSHFIELD","EAST MONTPELIER","MORETOWN","MONTPELIER","STARKSBORO","GROTON","PLAINFIELD","MONKTON","FAYSTON","BERLIN","FERRISBURGH","BARRE CITY","BARRE TOWN","BUELS GORE","ORANGE","BRISTOL","TOPSHAM","VERGENNES","NEW HAVEN","PANTON","WALTHAM","LINCOLN","WASHINGTON","ADDISON","CORINTH","WEYBRIDGE","CHELSEA","MIDDLEBURY","RIPTON","BRIDPORT","CORNWALL","VERSHIRE","WEST FAIRLEE","FAIRLEE","HANCOCK","TUNBRIDGE","SALISBURY","ROCHESTER","SHOREHAM","STRAFFORD","BETHEL","THETFORD","ROYALTON","ORWELL","PITTSFIELD","SHARON","STOCKBRIDGE","NORWICH","BARNARD","BENSON","HARTFORD","KILLINGTON","BRIDGEWATER","WEST HAVEN","FAIR HAVEN","HARTLAND","PLYMOUTH","SHREWSBURY","READING","WINDSOR","WALLINGFORD","MOUNT HOLLY","PAWLET","LUDLOW","DANBY","MOUNT TABOR","WESTON","ANDOVER","SPRINGFIELD","RUPERT","DORSET","PERU","LANDGROVE","LONDONDERRY","GRAFTON","WINDHAM","SANDGATE","WINHALL","MANCHESTER","JAMAICA","TOWNSHEND","WESTMINSTER","ARLINGTON","SUNDERLAND","STRATTON","BROOKLINE","WARDSBORO","SHAFTSBURY","GLASTENBURY","SOMERSET","PUTNEY","NEWFANE","DOVER","DUMMERSTON","BENNINGTON","WOODFORD","SEARSBURG","WILMINGTON","MARLBORO","BRATTLEBORO","READSBORO","POWNAL","STAMFORD","WHITINGHAM","HALIFAX","GUILFORD","VERNON","MONTGOMERY","EDEN","MAIDSTONE","COLCHESTER","DANVILLE","WINOOSKI","CABOT","SHELBURNE","RICHMOND","HINESBURG","POMFRET","WOODSTOCK","BURLINGTON","BRAINTREE","RANDOLPH","ESSEX","RYEGATE","NEWBURY","SOUTH BURLINGTON","WILLISTON","WILLIAMSTOWN","BROOKFIELD","BRADFORD","POULTNEY","TINMOUTH","WELLS","MIDDLETOWN SPRINGS","WEST WINDSOR","CHESTER","CAVENDISH","BALTIMORE","WEATHERSFIELD","NEWPORT TOWN","NEWPORT CITY","DERBY","COVENTRY","NORTHFIELD","WAITSFIELD","ROCKINGHAM","ATHENS","GRANVILLE","ROXBURY","WARREN","GOSHEN","WHITING","LEICESTER","CHITTENDEN","SUDBURY","HUBBARDTON","CASTLETON","IRA","BRANDON","PITTSFORD","WEST RUTLAND","PROCTOR","RUTLAND","RUTLAND CITY","MENDON","CLARENDON"]
    return towns.sort().map((town) => {
      return {
        value: town,
        label: capitalizeFirstLetters(town)
      }
    })
  }f

  render() {
    return (
      <form className="col-md-10">
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Species:</label>
            <Select
              name="form-field-species"
              value={this.state.species}
              onChange={this.handleSpecies}
              options={this.createSpeciesList()}
            />
          </div>
          <div className="form-group col-md-6">
            <label>Town:</label>
            <Select
              name="form-field-town"
              value={this.state.town}
              onChange={this.handleTown}
              options={this.createTownList()}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Date:</label>
            <DatePicker
                name="date"
                className="form-control"
                selected={this.state.date}
                onChange={this.handleDate}
            />
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
      {(props.sbf) ? undefined : <td>{index+1}</td>}
      <td>{species['Common Name']}</td>
      <td><i>{species['Scientific Name']}</i></td>
      <td>{species.Location}</td>
      <td>{species.Date}</td>
      {(props.sbf) ? undefined : <td><a target="_blank" rel="noopener noreferrer" href={`https://ebird.org/checklist/${species['Submission ID']}`} >{species['Submission ID']}</a></td>}
    </tr>
  )
}

function SubspeciesRow (props) {
  let species = props.data
  let index = props.index
  return (
    <tr key={index}>
      {(props.sbf) ? undefined : <td>{index+1}</td>}
      <td>{species['Common Name']}</td>
      <td><i>{species['Subspecies']}</i></td>
      <td>{species.Location}</td>
      <td>{species.Date}</td>
      {(props.sbf) ? undefined : <td><a target="_blank" rel="noopener noreferrer" href={`https://ebird.org/checklist/${species['Submission ID']}`} >{species['Submission ID']}</a></td>}
    </tr>
  )
}

function SpeciesTable (props) {
  let data = props.data
  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          {(props.sbf) ? undefined : <th>#</th>}
          <th colSpan="2">Species</th>
          <th colSpan="1">Location</th>
          <th colSpan="1">Date</th>
          {(props.sbf) ? undefined : <th colSpan="1">Checklist</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((data, index) => {
          if (data['Subspecies Notes']) {
            return (
              <SubspeciesRow data={data} index={index} key={index} sbf={props.sbf} />
            )
          } else {
            return (
              <SpeciesRow data={data} index={index} key={index} sbf={props.sbf} />
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
          <h3>{props.title}</h3>
          <p>{props.text}</p>
          <SpeciesTable data={data} sbf={props.sbf} />
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
        <TableRow sbf={props.sbf} title={"Vermont Firsts"} data={rarities.Unknown} text={"These species were not on the VBRC \"Vermont Bird Checklist\" previously; please submit them to the VBRC, if they are birds!"} />
        <TableRow sbf={props.sbf} title={"Vermont Records"} data={rarities.Vermont} text={"Please submit records of these birds if they are seen anywhere in Vermont."}/>
        <TableRow sbf={props.sbf} title={"Nesting Records"} data={rarities.Breeding} text={"Please submit these records if you have noted nesting behavior. This checker looks for any breeding code used for a particular sighting; use your discretion as to which ones are relevant."} />
        <TableRow sbf={props.sbf} title={"Outside of Burlington"} data={rarities.Burlington} text={"Please submit records for Fish Crows if seen outside of the Burlington area."} />
        <TableRow sbf={props.sbf} title={"Outside of the Champlain Valley"} data={rarities.Champlain} text={"Please submit records for these birds if seen outside of the Champlain Valley bioregion, used in the Vermont Breeding Birds Atlas."} />
        <TableRow sbf={props.sbf} title={"Outside of the NEK"} data={rarities.NEK} text={"Please submit records for these birds if seen outside of the Caledonia, Essex, or Orleans counties."} />
        <TableRow sbf={props.sbf} title={"Outside of expected dates"} data={rarities.OutsideExpectedDates} text={"Please submit records for these birds as they were seen outside of their expected date ranges in Vermont. Some older records in this list might have been in the expected date range at the time of the observation, but now would not be. These do not have to be submitted.  Contact your eBird reviewer if you are uncertain."} />
        <TableRow sbf={props.sbf} title={"Subspecies"} data={rarities.Subspecies} text={["These subspecies are of note; please submit them to VBRC, after consulting ", <a href={"https://vtecostudies.org/wildlife/wildlife-watching/vbrc/races/"}>the VBRC Subspecies list</a>, "."]} />
      </div>
    )
  } else {
    if (props.sbf) {
      return (
        <div>
          <h3>You're all set!</h3>
          <p>You don't need to submit a form for this bird. Look outside for more!</p>
        </div>
      )
    } else {
      return (
        <div>
          <h3>You're all set!</h3>
          <p>We couldn't find any Vermont rarities in your eBird data, so there's nothing that VBRC suggests you report this year. If this is disappointing, you're in luck: the way to fix this is to go bird more. Get out there!</p>
        </div>
      )
    }
  }
}

class Rarities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      singleBirdForm: '',
      rarities: this.props.data.rarities
    }
    this.rerenderParentCallback = this.rerenderParentCallback.bind(this);
  }

  rerenderParentCallback(props) {
    this.setState({
      rarities: props,
      singleBirdForm: true
    })
    this.forceUpdate();
  }

  render() {
    let rarities = (this.state.singleBirdForm !== '') ? this.state.rarities : this.props.data.rarities
    return (
      <div id="rarities" className="container-md">
        <div className="row">
          <div className="col-sm-12">
          <h1>Vermont Bird Records Checker</h1>

          <div className="row">
            <div className="col-md-8">
              <p>The <a href="https://vtecostudies.org/wildlife/wildlife-watching/vbrc/" target="_blank" rel="noopener noreferrer" >Vermont Bird Records Committee</a> depends upon birders in the field submitting rare bird reports in the state. Below are some tools to see whether or not your bird sighting warrants a rare bird report.</p>
              <p>Please report bugs to me at <a href="mailto:richard@birdinginvermont.com">richard@birdinginvermont.com</a>.</p>
            </div>
          </div>

          <h3>Check on a single bird sighting</h3>

          <div className="row">
            <div className="col-md-8">
              <p>This form will check a single bird seen in any town in Vermont on any date and let you know if you should report it. It can't tell you if you should report a rare bird form for breeding birds or rare subspecies. If a bird isn't listed here, it likely hasn't been seen in the state and deserves a rare bird report. You can find out more on <a href="https://vtecostudies.org/wildlife/wildlife-watching/vbrc/" target="_blank" rel="noopener noreferrer" >the VBRC site</a>.</p>
            </div>
          </div>

          <NameForm class="col-md-8" rerenderParentCallback={this.rerenderParentCallback} />

          {(rarities !== '' && this.state.singleBirdForm) ?
            <AllRows data={rarities} sbf={this.state.singleBirdForm} /> : '' }

          <hr />

          <h3>Upload and check eBird Data</h3>
          <div className="row">
            <div className="col-md-8">
              <p>To check all of your observations from eBird, you can upload your data file below. This will check your eBird checklists for any birds which ought to be reported to the VBRC. This will only check submissions to your eBird account. It checks for Vermont-wide rare birds, breeding birds of note, birds outside of the Burlington Area, Lake Champlain, or the NEK, extreme rarities, subspecies of note, and birds which are present out of season.</p>

              <p>It may be that some of the items listed here do not need to be submitted, such as when the observation is for a 'continuing' bird for which the initial observer made the required submission and/or certain shared checklists within eBird.  Contact your eBird reviewer or VBRC if you are uncertain. Duplicate submissions are welcomed, however - better more people submit rare bird forms than less!</p>

              <p>To use this, first <a href="https://ebird.org/downloadMyData" target="_blank" rel="noopener noreferrer" >download your data from eBird.</a> Then, load the unzipped .csv file here. Your data is not stored on this site in any way. Both VCE and the VBRC curate and provide these lists publicly, for which I am grateful. This site is not directly affiliated with VCE, and I will strive to keep the reference data up to date. Note that this process can take some time.</p>
            </div>
          </div>

          {(rarities !== '') ? <AllRows data={rarities} /> : ''}

          <UploadButton handleChange={this.props.handleChange} data={this.props.data} />

          </div>
        </div>
      </div>
    )
  }
}

export default Rarities