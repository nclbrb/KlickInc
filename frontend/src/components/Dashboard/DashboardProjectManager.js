import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, ButtonGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';
import axios from 'axios';

function DashboardProjectManager({ user, onLogout }) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Fetch projects from the API when the component mounts
  useEffect(() => {
    refreshProjects();
  }, []);

  // Fetch projects from the API with Authorization header
  const refreshProjects = () => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        setProjects(response.data);
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
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = (id) => {
    const token = localStorage.getItem('access_token');
    axios
      .delete(`http://127.0.0.1:8000/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(() => {
        refreshProjects();
      })
      .catch(error => {
        console.error('There was an error deleting the project!', error);
      });
  };

  const handleViewTasks = (projectId) => {
    // Here you can implement a call to fetch tasks for a specific project.
    alert(`Viewing tasks for Project ${projectId}`);
    // Optionally, navigate to a tasks page:
    // navigate(`/tasks/${projectId}`);
  };

  const sidebarStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row noGutters="true">
        {/* Sidebar */}
        <Col xs={12} md={3} lg={2} className="bg-dark text-white d-flex flex-column" style={sidebarStyle}>
          <div>
            <h3 className="mb-4 text-center">My App</h3>
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
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Welcome, {user.email}!</h2>
          <p>You're logged in as a Project Manager.</p>

          <Row className="mb-4">
            {/* Create New Project Section */}
            <Col xs={12} sm={6} lg={6} className="mb-3">
              <Card className="shadow-sm rounded">
                <Card.Header className="bg-primary text-white">Create New Project</Card.Header>
                <Card.Body>
                  <p>Welcome, Project Manager {user.username}! Do you want to create a new project?</p>
                  <Button variant="primary" onClick={handleCreateProject}>
                    Create New Project
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* My Projects Box */}
            <Col xs={12} sm={6} lg={6} className="mb-3">
              <Card className="shadow-sm rounded">
                <Card.Header className="bg-success text-white">My Projects</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled mb-0">
                    {projects.map((project) => (
                      <li key={project.id} className="py-1 border-bottom d-flex justify-content-between align-items-center">
                        <div>
                          <span>{project.project_name}</span>
                        </div>
                        <div className="d-flex">
                          <ButtonGroup>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewTasks(project.id)}
                            >
                              View Tasks
                            </Button>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleEditProject(project)}
                            >
                              Update
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="ms-2"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              Delete
                            </Button>
                          </ButtonGroup>
                        </div>
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
