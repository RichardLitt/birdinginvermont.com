import React, { Component } from "react";
const ReactMarkdown = require("react-markdown");

class ContentPage extends Component {
  constructor(props) {
    super(props);

    this.state = { text: null };
  }

  componentWillMount() {
    // const path = this.props.data;
    console.log("this", this.props.match);
    const code = this.props.match?.params.code ?? "index";
    const type = this.props.match?.params.type;
    const path = `/${type}/${code}.md`;
    fetch(path)
      .then((response) => response.text())
      .then((text) => {
        this.setState({ text });
      });
  }

  render() {
    return (
      <div className="container-md page">
        <div className="row">
          <div className="col-md-8 col-sm-12 text-left">
            <ReactMarkdown source={this.state.text} escapeHtml={false} />
          </div>
        </div>
      </div>
    );
  }
}

export default ContentPage;
