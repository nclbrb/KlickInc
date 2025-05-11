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
    deadline: '',
    budget: '' // Added task budget field
  };

  const [formData, setFormData] = useState(emptyForm);
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [budgetError, setBudgetError] = useState(''); // State to hold the budget error

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
          deadline: task.deadline ? task.deadline.split('T')[0] : '',
          budget: task.budget || '' // Populate budget when editing
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

  // Handle form field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent changing status for new tasks
    if (name === 'status' && !task) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'project_id' || name === 'assigned_to'
          ? parseInt(value, 10) || ''
          : value
    }));
  };

  // Close the modal and reset the form
  const onClose = () => {
    setFormData(emptyForm);
    setBudgetError(''); // Reset budget error
    handleClose();
  };

  // Validate the task budget
  const validateBudget = () => {
    const project = projects.find(p => p.id === formData.project_id);
    const taskBudget = parseFloat(formData.budget);

    if (project && taskBudget > parseFloat(project.budget)) {
      setBudgetError('Task budget cannot exceed project budget.');
      return false;
    }

    setBudgetError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate budget before submitting
    if (!validateBudget()) {
      return; // If validation fails, stop the form submission
    }
  
    try {
      const token = localStorage.getItem('access_token');
      const taskData = {
        title: formData.title, // Use formData for title
        description: formData.description, // Use formData for description
        project_id: formData.project_id, // Use formData for project_id
        assigned_to: formData.assigned_to, // Use formData for assigned_to
        priority: formData.priority, // Use formData for priority
        status: formData.status, // Use formData for status
        budget: parseFloat(formData.budget), // Ensure the budget is a number
        deadline: formData.deadline, // Use formData for deadline
      };
  
      if (task) {
        // Update task
        await axios.put(`http://127.0.0.1:8000/api/tasks/${task.id}`, taskData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Create new task
        await axios.post('http://127.0.0.1:8000/api/tasks', taskData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
  
      refreshTasks(); // Refresh task list
      handleClose(); // Close modal
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task');
    }
  };
  
  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="md" 
      dialogClassName="custom-task-modal"
    >
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>{task ? 'Edit Task' : 'Create New Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit} className="mt-3">
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
              disabled={!task} // Disable for new tasks
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </Form.Select>
            {!task && <Form.Text className="text-muted">Status can be updated after creating the task.</Form.Text>}
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

          {/* Task Budget Field */}
          <Form.Group className="mb-3" controlId="budget">
            <Form.Label>Task Budget</Form.Label>
            <Form.Control
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
            {budgetError && <div className="text-danger mt-2">{budgetError}</div>}
          </Form.Group>

              <div className="mt-3 d-flex justify-content-end">
                <Button variant="secondary" onClick={onClose} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {task ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TaskModal;
