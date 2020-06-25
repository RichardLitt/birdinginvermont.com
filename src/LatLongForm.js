import React, {Component} from 'react'

class LatLongForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({coordinates: event.target.value})
  }

  handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.coordinates);
    this.setState({coordinates: this.state.coordinates})
    console.log(this.state)
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input type="text" value={this.state.coordinates} onChange={this.handleChange}/>        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default LatLongForm