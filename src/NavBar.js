import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class NavBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light">
        <Link className="navbar-brand" to="/">
          Birding in Vermont
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className={(this.props.active === 'towns') ? 'nav-item active' : 'nav-item' }>
              <Link
                className="nav-link"
                to="/about"
              >
                About
              </Link>
            </li>
            <li className={(this.props.active === 'towns') ? 'nav-item active' : 'nav-item' }>
              <Link
                className="nav-link"
                to="/towns"
              >
                Towns
              </Link>
            </li>
            <li className={(this.props.active === 'counties') ? 'nav-item active' : 'nav-item' }>
              <Link
                className="nav-link"
                to="/counties"
              >
                Counties
              </Link>
            </li>
            <li className={(this.props.active === 'regions') ? 'nav-item active' : 'nav-item' }>
              <Link
                className="nav-link"
                to="/regions"
              >
                Biophysical Regions
              </Link>
            </li>
            <li className={(this.props.active === 'nfc') ? 'nav-item active' : 'nav-item' }>
              <Link
                className="nav-link"
                to="/nfc-species"
              >
                NFCs
              </Link>
            </li>
            {/* <li className={(this.props.active === 'needs') ? 'nav-item active' : 'nav-item' }>
              <span className="nav-link"
              onClick={() => this.props.changeActiveView('needs')}>
                Wash Co. Needs
              </span>
            </li>
            <li className={(this.props.active === 'radial') ? 'nav-item active' : 'nav-item' }>
              <Link
                className="nav-link"
                to="/radial"
              >
                10 Mile Search
              </Link>
            </li> */}
            <li className='nav-item'>
              <Link className="nav-link" to="/subspecies">Subspecies</Link>
            </li>
            <li className='nav-item'>
              <Link className="nav-link" to="/vbrc-checker">VBRC Checker</Link>
            </li>
            <li className='nav-item'>
              <Link className="nav-link" to="/female-birdsong">Female Birdsong</Link>
            </li>
            <li className='nav-item'>
              <Link className="nav-link" to="/251">Project 251</Link>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
}

export default NavBar
