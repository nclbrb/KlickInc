import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

function TaskModal({ show, handleClose, task, refreshTasks, projects }) {
  const emptyForm = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    project_id: '',
    assigned_to: '',
    deadline: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [users, setUsers] = useState([]); // State to hold the list of users

  useEffect(() => {
    if (show) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          project_id: task.project_id || '',
          assigned_to: task.assigned_to || '',
          deadline: task.deadline ? task.deadline.split('T')[0] : ''
        });
      } else {
        setFormData(emptyForm);
      }

      // Fetch users when the modal is shown
      fetchUsers();
    }
  }, [show, task]);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Filter out users who are not team members
      const teamMembers = response.data.filter(user => user.role === 'team_member');
      setUsers(teamMembers); // Set only team members
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'project_id' || name === 'assigned_to'
          ? parseInt(value, 10) || ''
          : value
    }));
  };

  const onClose = () => {
    setFormData(emptyForm);
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const data = {
        ...formData,
        project_id: parseInt(formData.project_id, 10),
        assigned_to: parseInt(formData.assigned_to, 10),
        deadline: formData.deadline
      };

      if (task) {
        await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        await axios.post('http://127.0.0.1:8000/api/tasks', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      refreshTasks && refreshTasks();
      onClose();
      alert(task ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.assigned_to?.[0] ||
        'Error saving task';
      alert(errorMessage);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>{task ? 'Edit Task' : 'Create New Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="project">
            <Form.Label>Project</Form.Label>
            <Form.Select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name} ({project.project_code})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="priority">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="low">🔵 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="assigned_to">
            <Form.Label>Assign To</Form.Label>
            <Form.Select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              required
            >
              <option value="">Select Team Member</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="deadline">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="purp" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="purp" type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TaskModal;