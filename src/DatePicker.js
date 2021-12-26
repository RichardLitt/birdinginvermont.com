// ~src/components/mydatepicker.component.js
import React, { Component } from "react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class MyDatepickerComponent extends Component {

    constructor(props) {
      super(props);
      this.state = {
        startDate: ''
      };

      this.handleChange = this.handleChange.bind(this);
    }

    state = {
        startDate: new Date()
    };

    handleChange = date => {
        this.setState({
            startDate: date
        });
    };

    // TODO Figure out how to style placeholder better

    render() {
        return (
            <div>
                <DatePicker
                    className="form-control"
                    selected={this.state.startDate}
                    onChange={this.handleChange}
                />
            </div>
        )
    };
}

export default MyDatepickerComponent;