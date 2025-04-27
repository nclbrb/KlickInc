import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectModal from './ProjectModal';
import NavBar from './NavBar';

function ProjectsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchProjects();
    if (user.role === 'team_member') {
      fetchMyTasks();
    }
  }, [user.role]);

  const fetchProjects = () => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  };

  const fetchMyTasks = () => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        // Filter tasks assigned to the current team member
        const myTasks = response.data.filter(
          (task) => task.assigned_to === user.id
        );
        setTasks(myTasks);
      })
      .catch((error) => {
        console.error('Error fetching tasks for filtering projects:', error);
      });
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?'))
      return;
    const token = localStorage.getItem('access_token');
    axios
      .delete(`http://127.0.0.1:8000/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        fetchProjects();
      })
      .catch((error) => {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      });
  };

  // Handle viewing tasks for a project (read-only display)
  const handleViewTasks = (project) => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const tasksForProject = response.data.filter(
          (task) => task.project_id === project.id
        );
        setProjectTasks(tasksForProject);
        setSelectedProjectForTasks(project);
        setShowTasksModal(true);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  };

  // Helper to display project status as a badge
  const getProjectStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'In Progress') {
      badgeClass = 'warning';
    } else if (status === 'Done') {
      badgeClass = 'success';
    }
    return <span className={`badge bg-${badgeClass}`}>{status}</span>;
  };

  // Helper to display task status as a badge
  const getTaskStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'in_progress') {
      badgeClass = 'warning';
    } else if (status === 'completed') {
      badgeClass = 'success';
    }
    return (
      <span className={`badge bg-${badgeClass}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Helper to display task priority as a badge
  const getTaskPriorityBadge = (priority) => {
    let badgeClass = 'bg-info text-dark';
    let icon = '';
    if (priority === 'high') {
      badgeClass = 'bg-danger';
      icon = '🔴 ';
    } else if (priority === 'medium') {
      badgeClass = 'bg-warning text-dark';
      icon = '🟡 ';
    } else if (priority === 'low') {
      badgeClass = 'bg-info text-dark';
      icon = '🔵 ';
    }
    return (
      <span className={`badge ${badgeClass}`}>
        {icon}
        {priority.toUpperCase()}
      </span>
    );
  };

  // For team members, filter projects based on tasks assigned to them
  const filteredProjects =
    user.role === 'team_member'
      ? projects.filter((project) => {
          const myProjectIds = new Set(tasks.map((task) => task.project_id));
          return myProjectIds.has(project.id);
        })
      : projects;

  // Helper to format the budget
  const formatBudget = (budget) => {
    if (budget === null || budget === undefined) {
      return 'N/A';
    }
    const parsedBudget = parseFloat(budget);
    return !isNaN(parsedBudget) ? `₱${parsedBudget.toFixed(2)}` : 'Invalid Budget';
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar using NavBar */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>

        {/* Main Content */}
        <Col
          xs={12}
          md={9}
          lg={10}
          className="p-4"
          style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
        >
          <h2 style={{ marginBottom: user.role === 'team_member' ? '5rem' : '1rem' }}>
            Projects
          </h2>
          {user.role === 'project_manager' && (
            <div className="mb-3 text-end">
              <Button className="btn-purp" onClick={handleCreateProject}>
                + New Project
              </Button>
            </div>
          )}
          <Card className="shadow-sm">
            <Card.Header className="bg-purp text-white">
              <h5 className="mb-0 text-white">My Projects</h5>
            </Card.Header>
            <Card.Body>
              {filteredProjects.length > 0 ? (
                <div
                  className="scrollable-list"
                  style={{ maxHeight: '60vh', overflowY: 'auto' }}
                >
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Project Name</th>
                        <th>Project Code</th>
                        <th>Description</th>
                        <th>Budget</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th style={{ width: '200px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => (
                        <tr key={project.id}>
                          <td>{project.project_name}</td>
                          <td>{project.project_code}</td>
                          <td>
                            {project.description?.substring(0, 50)}
                            {project.description && project.description.length > 50
                              ? '...'
                              : ''}
                          </td>
                          <td>{formatBudget(project.budget)}</td>
                          <td>
                            {new Date(project.start_date).toLocaleDateString()} -{' '}
                            {project.end_date
                              ? new Date(project.end_date).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td>{getProjectStatusBadge(project.status)}</td>
                          <td>
                            <div className="d-flex flex-row align-items-center mt-0 mb-2">
                              <Button
                                className="btn-view-outline me-2"
                                onClick={() => handleViewTasks(project)}
                              >
                                Tasks
                              </Button>
                              {user.role === 'project_manager' && (
                                <>
                                  <Button
                                    className="btn-edit-outline me-2"
                                    onClick={() => handleEditProject(project)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    className="btn-delete-outline"
                                    onClick={() => handleDeleteProject(project.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted p-4">
                  No projects found.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for creating/updating a project (only used by project managers) */}
      {user.role === 'project_manager' && (
        <ProjectModal
          show={showProjectModal}
          handleClose={() => setShowProjectModal(false)}
          project={selectedProject}
          refreshProjects={fetchProjects}
        />
      )}

      {/* Modal for viewing tasks for a project (read-only) */}
      <Modal show={showTasksModal} onHide={() => setShowTasksModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Tasks for {selectedProjectForTasks?.project_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {projectTasks.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {projectTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{getTaskStatusBadge(task.status)}</td>
                    <td>{getTaskPriorityBadge(task.priority)}</td>
                    <td>
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No tasks found for this project.</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProjectsPage;
