import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, ButtonGroup, Modal, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';
import TaskModal from './TaskModal';
import axios from 'axios';

function DashboardProjectManager({ user, onLogout }) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch projects from the API when the component mounts
  useEffect(() => {
    refreshProjects();
    // Fetch users for task assignments
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      setUsers(response.data);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
    });
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
    const token = localStorage.getItem('access_token');
    // Fetch tasks for the specific project
    axios.get('http://127.0.0.1:8000/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      // Filter tasks for the specific project
      const projectTasks = response.data.filter(task => task.project_id === projectId);
      setTasks(projectTasks);
      setSelectedProject(projects.find(p => p.id === projectId));
      setShowTasksModal(true);
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
    });
  };

  const refreshTasks = () => {
    if (selectedProject) {
      handleViewTasks(selectedProject.id);
    }
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

          {/* Tasks Modal */}
          <Modal show={showTasksModal} onHide={() => setShowTasksModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                Tasks for {selectedProject?.project_name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge bg-${task.status === 'completed' ? 'success' : 
                          task.status === 'in_progress' ? 'warning' : 'secondary'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        {task.priority === 'high' ? '🔴' : 
                         task.priority === 'medium' ? '🟡' : '🔵'} {task.priority}
                      </td>
                      <td>{task.user?.username || 'Unassigned'}</td>
                      <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Modal.Body>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardProjectManager;
