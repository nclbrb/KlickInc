import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';

const NavBar = ({ user, onLogout, navigate }) => {
  const getLinkClass = ({ isActive }) =>
    isActive
      ? 'nav-link active text-white mb-2 d-flex align-items-center'
      : 'nav-link text-white mb-2 d-flex align-items-center';

  // Determine role label based on the user role
  const roleText =
    user?.role === 'project_manager'
      ? 'Project Manager'
      : user?.role === 'team_member'
      ? 'Team Member'
      : '';

  const displayName = user?.username;
  const roleAndName = roleText && displayName ? `${roleText}: ${displayName}` : '';

  return (
    <div
      className="sidebar bg-purp text-white"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
      }}
    >
      <div>
        <h3 className="mb-1 text-center">My App</h3>
        {roleAndName && <p className="mb-4 text-center small">{roleAndName}</p>}
        <Nav className="flex-column">
          <Nav.Link as={NavLink} to="/dashboard" end className={getLinkClass}>
            <i className="material-icons me-2">dashboard</i> Dashboard
          </Nav.Link>
          <Nav.Link as={NavLink} to="/projects" className={getLinkClass}>
            <i className="material-icons me-2">folder</i> Projects
          </Nav.Link>
          <Nav.Link as={NavLink} to="/tasks" className={getLinkClass}>
            <i className="material-icons me-2">assignment</i> Tasks
          </Nav.Link>
        </Nav>
      </div>
      <div>
        <Button
          variant="outline-light"
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          className="d-flex align-items-center"
        >
          <i className="material-icons me-2">logout</i> Logout
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
