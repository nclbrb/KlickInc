import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';
import axios from 'axios';

function DashboardProjectManager({ user, onLogout }) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects when the component mounts
  useEffect(() => {
    refreshProjects(); // Fetch initial list of projects
  }, []);

  // Fetch projects from the API
  const refreshProjects = () => {
    axios.get('/api/projects') // Assuming your API endpoint for projects is '/api/projects'
      .then(response => {
        setProjects(response.data); // Update state with fetched projects
      })
      .catch(error => {
        console.error('There was an error fetching projects!', error);
      });
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleCreateProject = () => {
    setSelectedProject(null); // Clear selected project to create a new one
    setShowModal(true); // Open the modal for creating a new project
  };

  const handleEditProject = (project) => {
    setSelectedProject(project); // Set selected project for editing
    setShowModal(true); // Open the modal for editing an existing project
  };

  const handleDeleteProject = (id) => {
    axios.delete(`/api/projects/${id}`) // Delete the project from the backend
      .then(() => {
        refreshProjects(); // Refresh the list after deletion
      })
      .catch(error => {
        console.error('There was an error deleting the project!', error);
      });
  };

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
            {/* Create New Project Section */}
            <Col xs={12} md={6} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Card className="shadow-sm rounded" style={{ width: '600px' }}>
                <Card.Header className="bg-primary text-white">Create New Project</Card.Header>
                <Card.Body>
                  <p>Welcome, Project Manager {user.username}! Do you want to create a new project?</p>
                  <Button variant="primary" onClick={handleCreateProject}>Create New Project</Button>
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
                        <span>{project.project_name}</span>
                        <Button variant="link" className="p-0 ms-2" onClick={() => handleEditProject(project)}>
                          Edit
                        </Button>
                        <Button variant="link" className="p-0 ms-2" onClick={() => handleDeleteProject(project.id)}>
                          Delete
                        </Button>
                        <Button variant="link" className="p-0 ms-2" onClick={() => alert(JSON.stringify(project))}>
                          View Details
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Project Modal */}
          <ProjectModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            project={selectedProject}
            refreshProjects={refreshProjects}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardProjectManager;
