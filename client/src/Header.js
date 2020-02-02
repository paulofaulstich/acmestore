import React from "react";

import { Navbar, Nav } from "react-bootstrap";

const Header = props => {
  let renderAccount = "Not Connected";
  if (props.account)
    renderAccount = `Connected to:
    ${props.account}`;
  return (
    <Navbar bg="dark" expand="lg" variant="dark">
      <Navbar.Brand href="#home">ACME STORE</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#home" className="float-right">
            {renderAccount}
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
