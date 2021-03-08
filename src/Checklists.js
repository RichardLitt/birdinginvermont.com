import React, { Component } from 'react'
import { Table } from 'react-bootstrap'

function SpeciesRow (props) {
  let checklist = props.data
  let index = props.index
  return (
    <tr key={index}>
      <td>{index+1}</td>
      <td><a target="_blank" rel="noopener noreferrer" href={`https://ebird.org/checklist/${checklist['Submission ID']}`} >{checklist['Submission ID']}</a></td>
      <td>{checklist.Date}</td>
      <td>{checklist.Location}</td>
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
          <th colSpan="1">Checklist</th>
          <th colSpan="1">Date</th>
          <th colSpan="4">Location</th>
        </tr>
      </thead>
      <tbody>
        {data.map((data, index) => {
          return (
            <SpeciesRow data={data} index={index} key={index} />
          )
        })}
      </tbody>
    </Table>
  )
}

class ChecklistTableRow extends Component {
  render() {
    let data = this.props.data
    if (data.length !== 0) {
      return (
        <div className="row table-row">
          <div className="col">
            <h2>{this.props.title}</h2>
            <p>{this.props.text}</p>
            <SpeciesTable data={data} />
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}


export default ChecklistTableRow