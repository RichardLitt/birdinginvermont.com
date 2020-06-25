import React, { Component } from 'react'
import { Table } from 'react-bootstrap'

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
        </tr>
      </thead>
      <tbody>
        {data.map((species, index) => {
          return (
            <tr key={index}>
              <td>{index+1}</td>
              <td>{species['Common Name']}</td>
              <td><i>{species['Scientific Name']}</i></td>
              <td>{species.Location}</td>
              <td>{species.Date}</td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

function TargetsTable (props) {
  let data = props.data
  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th colSpan="1">Species</th>
        </tr>
      </thead>
      <tbody>
        {data.map((species, i) => {
          return (
            <tr key={i}>
              <td>{i+1}</td>
              <td>{species}</td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

class RadialView extends Component {
  arrangeData (data) {
    let newArr = []
    for (let value of Object.values(data.speciesByDate)) {
      value.forEach((entry) => newArr.push(entry))
    }
    return newArr
  }

  render() {
    if (this.props.data) {
      let notSeen = this.props.data.notSeen
      let data = this.arrangeData(this.props.data)

      return (
        <div className="container-md">
          <div className="row">
            <div className="col">
              <SpeciesTable data={data} />
              <TargetsTable data={notSeen} />
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="row">
            <div className="col text-center">
              <p>Please import your data first. Note: at the moment, this is judged from a 10 mile radius of Montpelier. Allowing you to put your own address in is coming.</p>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default RadialView