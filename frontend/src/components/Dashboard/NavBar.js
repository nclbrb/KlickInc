import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Button, Modal, ListGroup } from 'react-bootstrap';
import api from '../../api';

const NavBar = ({ user, onLogout }) => {
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path || 
                    (path !== '/' && location.pathname.startsWith(path));
    return `nav-link text-white mb-2 d-flex align-items-center ${isActive ? 'active bg-primary rounded' : ''}`;
  };

  const roleText =
    user?.role === 'project_manager'
      ? 'Project Manager'
      : user?.role === 'team_member'
      ? 'Team Member'
      : '';

  const displayName = user?.username;
  const roleAndName = roleText && displayName ? `${roleText}: ${displayName}` : '';

  // Notifications feature flag - set to true when implementing notifications
  const notificationsEnabled = false;

  // Only fetch notifications if the feature is enabled
  useEffect(() => {
    if (!notificationsEnabled) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        if (response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <>
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

            <Nav.Link
              onClick={() => setShowNotifModal(true)}
              className="nav-link text-white mb-2 d-flex align-items-center"
            >
              <i className="material-icons me-2">notifications</i> Notifications
            </Nav.Link>

            {/* Activity Feed Link (Navigate to a separate page) */}
            <Nav.Link as={NavLink} to="/activity-feed" className={getLinkClass}>
              <i className="material-icons me-2">feed</i> Activity Feed
            </Nav.Link>

            <Nav.Link as={NavLink} to="/projects" className={getLinkClass}>
              <i className="material-icons me-2">folder</i> Projects
            </Nav.Link>

            <Nav.Link as={NavLink} to="/tasks" className={getLinkClass}>
              <i className="material-icons me-2">assignment</i> Tasks
            </Nav.Link>

            <Nav.Link as={NavLink} to="/files" className={getLinkClass}>
              <i className="material-icons me-2">cloud</i> Files
            </Nav.Link>
          </Nav>
        </div>
        <div>
          <Button
            variant="outline-light"
            onClick={() => {
              onLogout();
              navigate('/login'); // Use navigate to programmatically navigate to login
            }}
            className="d-flex align-items-center"
          >
            <i className="material-icons me-2">logout</i> Logout
          </Button>
        </div>
      </div>

      {/* Notifications Modal */}
      <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ListGroup variant="flush">
            {notifications.length === 0 ? (
              <div className="text-muted text-center py-2">No notifications</div>
            ) : (
              notifications.map((note, idx) => (
                <ListGroup.Item key={idx} className="border-0">
                  {note}
                </ListGroup.Item>
              ))
          )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotifModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavBar;
