//DashboardProjectManager.js
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
import NotificationBell from '../Notifications/NotificationBell';

function DashboardProjectManager({ user, onLogout }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showViewProjectModal, setShowViewProjectModal] = useState(false);
  const [projectToView, setProjectToView] = useState(null);

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
        const sorted = response.data.sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
        );
        setProjects(sorted);
        console.log("Fetched Projects:", sorted);
      })
      .catch((error) => console.error('Error fetching projects:', error));
  };

  const fetchTasks = () => {
    const token = localStorage.getItem('access_token');
    
    // Show a loading state if needed
    // setLoading(true);
    
    axios
      .get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          const sorted = response.data.sort(
            (a, b) => new Date(b.updated_at || Date.now()) - new Date(a.updated_at || Date.now())
          );
          setTasks(sorted);
          console.log(`Successfully loaded ${sorted.length} tasks`);
        } else {
          console.warn('Unexpected response format for tasks:', response.data);
          setTasks([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        
        // Handle different error types
        if (error.response) {
          // Server responded with an error status
          console.error('Server error response:', {
            status: error.response.status,
            data: error.response.data
          });
          
          if (error.response.status === 401) {
            // Handle unauthorized - likely token expired
            console.log('Authentication token expired, redirecting to login');
            localStorage.removeItem('access_token');
            // Redirect to login or show auth error
          }
        } else if (error.request) {
          // Request made but no response received
          console.error('No response received from server');
        }
        
        // Keep the UI working with empty state
        setTasks([]);
      })
      .finally(() => {
        // setLoading(false);
      });
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleViewProject = (project) => {
    setProjectToView(project);
    setShowViewProjectModal(true);
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

  const getProjectStatusBadge = (status) => {
    const statusMap = {
      'In Progress': 'warning',
      'Done': 'success',
      'Not Started': 'secondary',
    };
    const badgeClass = statusMap[status] || 'secondary';
    return <span className={`badge bg-${badgeClass}`}>{status}</span>;
  };

  const getTaskStatusBadge = (status) => {
    // Handle missing or invalid status
    if (!status) {
      return <span className="badge bg-secondary">UNKNOWN</span>;
    }
    
    const statusMap = {
      in_progress: 'warning',
      completed: 'success',
      not_started: 'secondary',
    };
    const badgeClass = statusMap[status] || 'secondary';
    
    try {
      return (
        <span className={`badge bg-${badgeClass}`}>
          {String(status).replace(/_/g, ' ').toUpperCase()}
        </span>
      );
    } catch (error) {
      console.error('Error rendering status badge:', error);
      return <span className="badge bg-secondary">UNKNOWN</span>;
    }
  };

  const getTaskPriorityBadge = (priority) => {
    // Handle missing or invalid priority
    if (!priority) {
      return <span className="badge bg-secondary">⚪ NONE</span>;
    }
    
    const priorityMap = {
      high: 'bg-danger',
      medium: 'bg-warning text-dark',
      low: 'bg-info text-dark',
    };
    const badgeClass = priorityMap[priority] || 'bg-info text-dark';
    
    try {
      // Default icon is blue for low/unknown
      const icon = priority === 'high' ? '🔴 ' : priority === 'medium' ? '🟡 ' : '🔵 ';
      return (
        <span className={`badge ${badgeClass}`}>
          {icon}{String(priority).toUpperCase()}
        </span>
      );
    } catch (error) {
      console.error('Error rendering priority badge:', error);
      return <span className="badge bg-secondary">⚪ NONE</span>;
    }
  };

  return (
    <Container fluid className="dashboard-container" style={{ position: 'relative' }}>
      {/* Notification Bell at top right */}
      <div style={{ position: 'absolute', top: 24, right: 40, zIndex: 1050 }}>
        <NotificationBell />
      </div>
      <Row>
        {/* Sidebar using NavBar */}
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} navigate={navigate} />
        </Col>
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Welcome, {user.username}!</h2>
          <h3 className="mt-4 mb-4">Dashboard</h3>
          <Row className="mb-5">
            {/* Project Section */}
            <Col md={6} className="d-flex mb-4">
              <Card className="shadow-sm flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Recent Projects</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover className="table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Budget</th>
                          <th>Status</th>
                          <th style={{ width: '200px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">No Projects Available</td>
                          </tr>
                        ) : (
                          projects.map((project) => (
                            <tr key={project.id}>
                              <td>{project.project_name}</td>
                              <td>{project.project_code}</td>
                              <td>
                                {project.budget !== null && project.budget !== undefined
                                  ? !isNaN(parseFloat(project.budget))
                                    ? `₱${parseFloat(project.budget).toFixed(2)}`
                                    : 'Invalid Budget'
                                  : 'N/A'}
                              </td>
                              <td>{getProjectStatusBadge(project.status)}</td>
                              <td>
                                <div>
                                  <Button className="btn-view-outline me-2 mb-2" onClick={() => handleViewProject(project)}>View</Button>
                                  <Button className="btn-edit-outline me-2 mb-2" onClick={() => handleEditProject(project)}>Edit</Button>
                                  <Button className="btn-delete-outline mb-2" onClick={() => handleDeleteProject(project.id)}>Delete</Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-3 text-end">
                    <Button variant="link" onClick={() => navigate('/projects')}>
                      View All Projects
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            {/* Task Section */}
            <Col md={6} className="d-flex mb-4">
              <Card className="shadow-sm flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Recent Tasks</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover className="table-striped">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Budget</th>
                          <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">No Tasks Available</td>
                          </tr>
                        ) : (
                          tasks.map((task) => {
                            // Safety check to ensure task has an id
                            if (!task || !task.id) {
                              console.warn('Task missing ID:', task);
                              return null;
                            }
                            
                            // Safely format budget
                            let budgetDisplay = 'N/A';
                            if (task.budget !== null && task.budget !== undefined) {
                              try {
                                const budgetValue = parseFloat(task.budget);
                                if (!isNaN(budgetValue)) {
                                  budgetDisplay = `₱${budgetValue.toFixed(2)}`;
                                }
                              } catch (error) {
                                console.error('Error parsing budget:', error);
                              }
                            }
                            
                            return (
                              <tr key={task.id}>
                                <td>{task.title || 'Untitled Task'}</td>
                                <td>{getTaskStatusBadge(task.status)}</td>
                                <td>{getTaskPriorityBadge(task.priority)}</td>
                                <td>{budgetDisplay}</td>
                                <td>
                                  <div className="d-flex flex-row align-items-center">
                                    <Button className="btn-edit-outline me-2" onClick={() => handleEditTask(task)}>Edit</Button>
                                    <Button className="btn-delete-outline" onClick={() => handleDeleteTask(task.id)}>Delete</Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>
                  <div className="mt-3 text-end">
                    <Button variant="link" onClick={() => navigate('/tasks')}>
                      View All Tasks
                    </Button>
                  </div>
                </Card.Body>
              </Card>
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
          {/* View Project Modal - Read Only */}
          <ProjectModal 
            show={showViewProjectModal} 
            handleClose={() => setShowViewProjectModal(false)} 
            project={projectToView} 
            readOnly={true}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardProjectManager;
