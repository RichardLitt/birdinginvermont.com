import React, { Component } from 'react';
import './footer.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faCodeBranch, faBriefcase } from '@fortawesome/free-solid-svg-icons'

class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <span className="text-muted">Mail <a href="mailto:richard@birdinginvermont.com"><FontAwesomeIcon icon={faEnvelope} /></a> Code <a href="https://github.com/RichardLitt/birdinginvermont.com"><FontAwesomeIcon icon={faCodeBranch} /></a> Terms <a href="/terms"><FontAwesomeIcon icon={faBriefcase} /></a><a data-netlify-identity-button>Login</a></span> </div>
          </div>
        </div>
      </footer>
    )
  }
}

export default Footer