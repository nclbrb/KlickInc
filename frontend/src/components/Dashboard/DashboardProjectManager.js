import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectModal from './ProjectModal';
import TaskModal from './TaskModal';
import NavBar from './NavBar';

function DashboardProjectManager({ user, onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

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
        // Sort projects by updated_at (descending)
        const sorted = response.data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setProjects(sorted);
      })
      .catch((error) => console.error('Error fetching projects:', error));
  };

  const fetchTasks = () => {
    const token = localStorage.getItem('access_token');
    axios
      .get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        // Sort tasks by updated_at (descending)
        const sorted = response.data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setTasks(sorted);
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  };

  // Project actions
  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProject = (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    const token = localStorage.getItem('access_token');
    axios
      .delete(`http://127.0.0.1:8000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      .then(() => fetchProjects())
      .catch((error) => console.error('Error deleting project:', error));
  };

  // Task actions
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const token = localStorage.getItem('access_token');
    axios
      .delete(`http://127.0.0.1:8000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      .then(() => fetchTasks())
      .catch((error) => console.error('Error deleting task:', error));
  };

  // Badge helpers for project status
  const getProjectStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'In Progress') {
      badgeClass = 'warning';
    } else if (status === 'Done') {
      badgeClass = 'success';
    }
    return <span className={`badge bg-${badgeClass}`}>{status}</span>;
  };

  // Badge helpers for task status and priority
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
        {icon}{priority.toUpperCase()}
      </span>
    );
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar using NavBar */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>

        {/* Main Content */}
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Welcome, {user.username}!</h2>
          <h3 style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>Dashboard</h3>
          <Row className="mb-4 d-flex align-items-stretch">
            <Col md={6} className="d-flex">
              <Card className="shadow-sm mb-3 flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Recent Projects</h5>
                </Card.Header>
                <Card.Body>
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Status</th>
                          <th style={{ width: '200px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => (
                          <tr key={project.id}>
                            <td>{project.project_name}</td>
                            <td>{project.project_code}</td>
                            <td>{getProjectStatusBadge(project.status)}</td>
                            <td>
                              <div>
                                <Button
                                  className="btn-view-outline me-2 mb-2"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowProjectModal(true);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  className="btn-edit-outline me-2 mb-2"
                                  onClick={() => handleEditProject(project)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  className="btn-delete-outline mb-2"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-2 text-end">
                    <Button variant="link" onClick={() => navigate('/projects')}>
                      View All Projects
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="d-flex">
              <Card className="shadow-sm mb-3 flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Recent Tasks</h5>
                </Card.Header>
                <Card.Body>
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.title}</td>
                            <td>{getTaskStatusBadge(task.status)}</td>
                            <td>{getTaskPriorityBadge(task.priority)}</td>
                            <td>
                              <div className="d-flex flex-row align-items-center mt-0">
                                <Button
                                  className="btn-edit-outline me-2"
                                  onClick={() => handleEditTask(task)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  className="btn-delete-outline"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-2 text-end">
                    <Button variant="link" onClick={() => navigate('/tasks')}>
                      View All Tasks
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Modals */}
      <ProjectModal
        show={showProjectModal}
        handleClose={() => setShowProjectModal(false)}
        project={selectedProject}
        refreshProjects={fetchProjects}
      />
      <TaskModal
        show={showTaskModal}
        handleClose={() => setShowTaskModal(false)}
        task={selectedTask}
        refreshTasks={fetchTasks}
        projects={projects}
        users={[]} 
      />
    </Container>
  );
}

export default DashboardProjectManager;
