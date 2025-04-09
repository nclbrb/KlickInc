// DashboardTeamMember.js

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

function DashboardTeamMember({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    api.get('/tasks')
      .then(response => {
        // Filter tasks assigned to the current team member
        const myTasks = response.data.filter(task => task.assigned_to === user.id);
        // Sort tasks by updated_at descending
        myTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setTasks(myTasks);

        // Extract unique projects from these tasks and sort them by updated_at descending
        const projectsMap = {};
        myTasks.forEach(task => {
          if (task.project) {
            // If the project is already in our map, we compare dates
            if (!projectsMap[task.project.id]) {
              projectsMap[task.project.id] = task.project;
            } else if (new Date(task.project.updated_at) > new Date(projectsMap[task.project.id].updated_at)) {
              projectsMap[task.project.id] = task.project;
            }
          }
        });
        const projectsArray = Object.values(projectsMap);
        projectsArray.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setAssignedProjects(projectsArray);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
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
        {icon}{priority.toUpperCase()}
      </span>
    );
  };

  // Sidebar style
  const sidebarStyle = {
    minHeight: '100vh',
    width: '270px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px'
  };

  return (
    <Container fluid className="p-0" style={{ overflowX: 'hidden' }}>
      <Row>
        {/* Sidebar */}
        <Col md="auto" className="bg-dark text-white" style={sidebarStyle}>
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
            <Button
              variant="outline-light"
              onClick={() => { onLogout(); navigate('/login'); }}
              className="d-flex align-items-center"
            >
              <i className="material-icons me-2">logout</i> Logout
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <h2 style={{ marginBottom: '5rem' }}>Welcome, {user.email}!</h2>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Assigned Projects</h5>
                </Card.Header>
                <Card.Body>
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Code</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedProjects.map(project => (
                          <tr key={project.id}>
                            <td>{project.project_name}</td>
                            <td>{project.project_code}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {project.status}
                              </span>
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
            <Col md={6}>
              <Card className="shadow-sm mb-3">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Assigned Tasks</h5>
                </Card.Header>
                <Card.Body>
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map(task => (
                          <tr key={task.id}>
                            <td>{task.title}</td>
                            <td>{getTaskStatusBadge(task.status)}</td>
                            <td>{getTaskPriorityBadge(task.priority)}</td>
                            <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
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
    </Container>
  );
}

export default DashboardTeamMember;
