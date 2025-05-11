import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import NavBar from './NavBar';
import NotificationBell from '../Notifications/NotificationBell';

function DashboardTeamMember({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [assignedProjects, setAssignedProjects] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    api
      .get('/tasks')
      .then((response) => {
        const myTasks = response.data.filter((task) => task.assigned_to === user.id);
        myTasks.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setTasks(myTasks);

        // Extract unique projects from these tasks
        const projectsMap = {};
        myTasks.forEach((task) => {
          if (task.project) {
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

  // Helper to format the budget
  const formatBudget = (budget) => {
    if (budget === null || budget === undefined || budget === '') {
      return 'N/A';
    }
    
    const parsedBudget = parseFloat(budget);
    if (isNaN(parsedBudget)) {
      return 'Invalid Budget';  
    }

    return `₱${parsedBudget.toFixed(2)}`;
  };


  return (
    <div className="dashboard-container" style={{ position: 'relative' }}>
      {/* Notification Bell at top right */}
      <div style={{ position: 'absolute', top: 24, right: 40, zIndex: 1050 }}>
        <NotificationBell />
      </div>
      <Row>
        <Col xs={12} md={3} lg={2} className="p-0">
          <NavBar user={user} onLogout={onLogout} />
        </Col>
        <Col xs={12} md={9} lg={10} className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
          <h2>Welcome, {user.username}!</h2>
          <h3 className="mt-4 mb-4">Dashboard</h3>
          <Row className="mb-5">
            {/* Project Section */}
            <Col md={6} className="d-flex mb-4">
              <Card className="shadow-sm flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Assigned Projects</h5>
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
                        </tr>
                      </thead>
                      <tbody>
                        {assignedProjects.map((project) => (
                          <tr key={project.id}>
                            <td>{project.project_name}</td>
                            <td>{project.project_code}</td>
                            <td>{formatBudget(project.budget)}</td>
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
            {/* Task Section */}
            <Col md={6} className="d-flex mb-4">
              <Card className="shadow-sm flex-fill">
                <Card.Header className="bg-purp">
                  <h5 className="mb-0 text-white">Assigned Tasks</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="scrollable-list" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Table hover className="table-striped">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Deadline</th>
                          <th>Budget</th>
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
                            <td>{formatBudget(task.budget)}</td> 
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
    </div>
  );
}

export default DashboardTeamMember;
