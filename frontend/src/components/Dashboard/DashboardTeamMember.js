import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api'; // Uses your shared Axios instance with the Authorization header set

function DashboardTeamMember({ user, onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Fetch projects and tasks when the component mounts
  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  // Fetch projects assigned to the team member
  const fetchProjects = () => {
    api.get('/projects')
      .then(response => {
        setProjects(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching projects!', error);
      });
  };

  // Fetch tasks assigned to the team member
  const fetchTasks = () => {
    api.get('/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching tasks!', error);
      });
  };

  // Handle logout and navigate to login
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
          <h2 className="mb-4">Team Member Dashboard</h2>
          <p className="lead">Welcome, {user.email}!</p>
          
          <Row className="mb-4">
            {/* Assigned Projects */}
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-primary text-white">Assigned Projects</Card.Header>
                <Card.Body>
                  {projects.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {projects.map((project) => (
                        <li key={project.id} className="py-1 border-bottom">
                          {project.project_name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No projects assigned.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Assigned Tasks */}
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-success text-white">Assigned Tasks</Card.Header>
                <Card.Body>
                  {tasks.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {tasks.map((task) => (
                        <li key={task.id} className="py-1 border-bottom">
                          {task.title}
                          <small className="text-muted"> (Project ID: {task.project_id})</small>
                          <div className="mt-2">
                            <strong>Status:</strong> {task.status}
                          </div>
                          {task.deadline && (
                            <div className="mt-2">
                              <strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No tasks assigned.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Additional main content for Team Member could go here */}
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardTeamMember;
