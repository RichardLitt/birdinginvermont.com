import React, { Component } from 'react'

class NavBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <span
          className="navbar-brand"
        >
          Vermont eBird Extensions
        </span>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className={(this.props.active === 'towns') ? 'nav-item active' : 'nav-item' }>
              <span
                className="nav-link"
                onClick={() => this.props.changeActiveView('towns')}
              >
                Towns <span className="sr-only">(current)</span>
              </span>
            </li>
            <li className={(this.props.active === 'regions') ? 'nav-item active' : 'nav-item' }>
              <span
                className="nav-link"
                onClick={() => this.props.changeActiveView('regions')}
              >
                Biophsyical Regions
              </span>
            </li>
            <li className={(this.props.active === 'needs') ? 'nav-item active' : 'nav-item' }>
              <span className="nav-link"
              onClick={() => this.props.changeActiveView('needs')}>
                Wash Co. Needs
              </span>
            </li>
            <li className={(this.props.active === 'radial') ? 'nav-item active' : 'nav-item' }>
              <span
                className="nav-link"
                onClick={() => this.props.changeActiveView('radial')}
              >
                Radial Search
              </span>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
}

export default NavBar
