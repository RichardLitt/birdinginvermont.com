import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Nav, Navbar} from 'react-bootstrap';

class NavBar extends Component {
  render() {
    return (
      <Navbar collapseOnSelect expand="lg" className="navbar navbar-expand-lg navbar-light">
        <Link className="navbar-brand" to="/">
          Birding in Vermont
        </Link>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto mb-2 mb-lg-0">
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/about">
                About
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/towns">
              Towns
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/counties">
              Counties
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/regions">
              Bioregions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/nfc-species">
              NFCs
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/subspecies">
              Subspecies
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/vbrc-checker">
              VBRC Checker
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/female-birdsong">
                Female Birdsong
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/251">
                Project 251
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2" as={Link} to="/hotspots">
                Unbirded Hotspots
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default NavBar
