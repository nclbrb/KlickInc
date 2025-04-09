import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import NavBar from './NavBar';

function DashboardTeamMember({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = () => {
    api
      .get('/tasks')
      .then((response) => {
        // Filter tasks assigned to the current team member
        const myTasks = response.data.filter((task) => task.assigned_to === user.id);
        // Sort tasks by updated_at descending
        myTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setTasks(myTasks);

        // Extract unique projects from these tasks
        const projectsMap = {};
        myTasks.forEach((task) => {
          if (task.project) {
            // Check if project exists; update if task's project is more recent
            if (!projectsMap[task.project.id]) {
              projectsMap[task.project.id] = task.project;
            } else if (
              new Date(task.project.updated_at) >
              new Date(projectsMap[task.project.id].updated_at)
            ) {
              projectsMap[task.project.id] = task.project;
            }
          }
        });
        const projectsArray = Object.values(projectsMap);
        projectsArray.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setAssignedProjects(projectsArray);
      })
      .catch((error) => {
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
        {icon}
        {priority.toUpperCase()}
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
        <Col className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Welcome, {user.email}!</h2>
          <h3 style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>Dashboard</h3>
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
                        {assignedProjects.map((project) => (
                          <tr key={project.id}>
                            <td>{project.project_name}</td>
                            <td>{project.project_code}</td>
                            <td>
                              <span className="badge bg-secondary">{project.status}</span>
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
                        {tasks.map((task) => (
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
