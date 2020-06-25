import React, { Component } from 'react';
import './footer.scss';

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container">
          <span className="text-muted">Email me: <a href="mailto:richard@burntfen.com">richard@burntfen.com</a>. Or <a href="https://github.com/RichardLitt/vtbird">contribute on GitHub</a>.</span>
        </div>
      </footer>
    )
  }
}

export default Footer