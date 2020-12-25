import React, { Component } from 'react'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

export default class Button extends Component {
  render() {
    const radioValue = this.props.data
    const radios = [
      { name: 'All Birds', value: '1' },
      { name: 'Seen', value: '2' },
      { name: 'Needs', value: '3'}
      // TODO { name: 'Ratio', value: '3' },
    ];

    return (
      <ButtonGroup toggle>
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            type="radio"
            variant="secondary"
            name="radio"
            value={radio.value}
            checked={radioValue === radio.value}
            onChange={this.props.handleToggleVisibility}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ButtonGroup>
    )
  }
}
