import React, { useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function DashboardTeamManager({ user, onLogout }) {
  const navigate = useNavigate();

  // Dummy data for projects and tasks relevant to a manager
  const projects = [
    { id: 1, name: "Project Alpha" },
    { id: 2, name: "Project Beta" }
  ];
  const tasks = [
    { id: 1, name: "Task One", projectId: 1, status: "in_progress" },
    { id: 2, name: "Task Two", projectId: 2, status: "pending" },
    { id: 3, name: "Task Three", projectId: 1, status: "completed" }
  ];

  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleCreateProject = () => {
    // Logic to create a new project
    alert(`Creating new project: ${newProjectName}`);
    setNewProjectName('');
    setNewProjectDescription('');
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
          <h2>Welcome, {user.email}!</h2>
          <p>You're logged in as a Project Manager.</p>

          <Row className="mb-4">
            {/* Create New Project Box */}
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-primary text-white">Create New Project</Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group controlId="formProjectName">
                      <Form.Label>Project Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter project name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group controlId="formProjectDescription" className="mt-3">
                      <Form.Label>Project Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Enter project description"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                      />
                    </Form.Group>

                    <Button variant="primary" className="mt-3" onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* My Projects Box */}
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-success text-white">My Projects</Card.Header>
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
          </Row>

          <Row className="mb-4">
            {/* Assigned Tasks */}
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-info text-white">Assigned Tasks</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled mb-0">
                    {tasks.map((task) => (
                      <li key={task.id} className="py-1 border-bottom">
                        {task.name} 
                        <small className="text-muted"> (Project ID: {task.projectId})</small>
                        <div className="mt-2">
                          <strong>Status:</strong> {task.status}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardTeamManager;