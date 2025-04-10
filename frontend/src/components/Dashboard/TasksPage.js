import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, DropdownButton, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from './TaskModal';
import ProjectModal from './ProjectModal';
import NavBar from './NavBar';  // Ensure the path is correct

function TasksPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // For viewing project details in read-only mode
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to view these tasks');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (user.role === 'project_manager') {
        const teamMembers = response.data.filter(u => u.role === 'team_member');
        setUsers(teamMembers);
      } else {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://127.0.0.1:8000/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

  // For team member: updating task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `http://127.0.0.1:8000/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  // View project details in read-only mode
  const handleViewProject = (project) => {
    setSelectedProjectForView(project);
    setShowProjectModal(true);
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    return new Date(deadline).toLocaleDateString();
  };

  // Helper to display task status as a badge
  const getTaskStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'completed') {
      badgeClass = 'success';
    } else if (status === 'in_progress') {
      badgeClass = 'warning';
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
          <h2 style={{ marginBottom: user.role === 'team_member' ? '5rem' : '1rem' }}>Tasks</h2>
          {user.role !== 'team_member' && (
            <div className="mb-3 text-end">
              <Button className="btn-purp" onClick={handleCreateTask}>
                + New Task
              </Button>
            </div>
          )}
          <Card className="shadow-sm">
            <Card.Header className="bg-purp text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-white">My Tasks</h5>
            </Card.Header>
            <Card.Body>
              <div className="scrollable-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      {user.role !== 'team_member' && <th style={{ width: '220px' }}>Actions</th>}
                      {user.role === 'team_member' && <th>Update Status</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                          {task.description && (
                            <div className="text-muted small">
                              {task.description.substring(0, 50)}
                              {task.description.length > 50 ? '...' : ''}
                            </div>
                          )}
                        </td>
                        <td>
                          {task.project?.project_name} ({task.project?.project_code})
                        </td>
                        <td>{getTaskStatusBadge(task.status)}</td>
                        <td>{getTaskPriorityBadge(task.priority)}</td>
                        <td>{formatDeadline(task.deadline)}</td>
                        {user.role !== 'team_member' && (
                          <td>
                            <div className="d-flex flex-row align-items-center mt-0">
                              <Button
                                className="btn-view-outline me-2"
                                onClick={() => handleViewProject(task.project)}
                              >
                                View
                              </Button>
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
                        )}
                        {user.role === 'team_member' && (
                          <td>
                            <DropdownButton
                              variant="outline-secondary"
                              title="Update Status"
                              size="sm"
                              onSelect={(status) => handleStatusChange(task.id, status)}
                            >
                              <Dropdown.Item eventKey="in_progress">In Progress</Dropdown.Item>
                              <Dropdown.Item eventKey="completed">Completed</Dropdown.Item>
                            </DropdownButton>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {tasks.length === 0 && (
                <div className="text-center text-muted p-4">No tasks found.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Task Modal for creating/updating tasks (only for project managers) */}
      {user.role !== 'team_member' && (
        <TaskModal
          show={showTaskModal}
          handleClose={() => setShowTaskModal(false)}
          task={selectedTask}
          refreshTasks={fetchTasks}
          projects={projects}
          users={users}
        />
      )}

      {/* Project Modal for viewing project details (read-only) */}
      <ProjectModal
        show={showProjectModal}
        handleClose={() => setShowProjectModal(false)}
        project={selectedProjectForView}
        readOnly={true}
      />
    </Container>
  );
}

export default TasksPage;
