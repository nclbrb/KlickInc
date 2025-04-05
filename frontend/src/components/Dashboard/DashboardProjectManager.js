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

  // Simulating sample projects for visualization
  const sampleProjects = [
    { id: 1, project_name: 'Project Alpha', description: 'A sample project' },
    { id: 2, project_name: 'Project Beta', description: 'Another sample project' },
  ];

  // Fetch projects when the component mounts
  useEffect(() => {
    setProjects(sampleProjects); // Use sample projects
    // If you had an API, you would call the API here, for example:
    // refreshProjects(); 
  }, []);

  // Fetch projects from the API (if not using sample projects)
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

  const handleViewTasks = (projectId) => {
    // Simulating tasks fetching
    const projectTasks = [
      { taskId: 1, taskName: `Task for ${projectId} - 1` },
      { taskId: 2, taskName: `Task for ${projectId} - 2` },
    ];
    setTasks(projectTasks);
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
                  <Button variant="primary" onClick={handleCreateProject}>Create New Project</Button>
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
