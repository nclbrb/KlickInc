// src/components/Dashboard/Dashboard.js
import React from 'react';
import { Container, Row, Col, Card, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  // Dummy data for projects and tasks
  const projects = [
    { id: 1, name: "Project Alpha" },
    { id: 2, name: "Project Beta" }
  ];
  const tasks = [
    { id: 1, name: "Task One", projectId: 1 },
    { id: 2, name: "Task Two", projectId: 2 }
  ];

  // Handle Logout and navigate to login
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Sidebar style: fixed width, full height, flex layout with logout at bottom
  const sidebarStyle = {
    minHeight: '100vh',
    width: '250px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px'
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row noGutters="true">
        {/* Sidebar */}
        <Col md="auto" className="bg-dark text-white" style={sidebarStyle}>
          <div>
            <h3 className="mb-4">My App</h3>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/dashboard" className="text-white mb-2 d-flex align-items-center">
                <i className="material-icons me-2">dashboard</i> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/projects" className="text-white mb-2 d-flex align-items-center">
                <i className="material-icons me-2">folder</i> Projects
              </Nav.Link>
              <Nav.Link as={Link} to="/tasks" className="text-white mb-2 d-flex align-items-center">
                <i className="material-icons me-2">assignment</i> Tasks
              </Nav.Link>
            </Nav>
          </div>
          <div>
            <Button variant="outline-light" onClick={handleLogout} className="d-flex align-items-center">
              <i className="material-icons me-2">logout</i> Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2 className="mb-4">Dashboard</h2>
          <p className="lead">Welcome, {user.email}!</p>
          
          <Row className="mb-4">
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-primary text-white">Assigned Projects</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled mb-0">
                    {projects.map((project) => (
                      <li key={project.id} className="py-1 border-bottom">
                        {project.name}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-success text-white">Assigned Tasks</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled mb-0">
                    {tasks.map((task) => (
                      <li key={task.id} className="py-1 border-bottom">
                        {task.name} <small className="text-muted">(Project ID: {task.projectId})</small>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Additional main content can go here */}
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
