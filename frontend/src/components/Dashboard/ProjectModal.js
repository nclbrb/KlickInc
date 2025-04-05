import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../../api'; // Adjust the path based on your project structure

function ProjectModal({ show, handleClose, project, refreshProjects }) {
  const [formData, setFormData] = useState({
    project_name: '',
    project_code: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'To Do',
  });

  // When editing, populate the form with the project data
  useEffect(() => {
    if (project) {
      setFormData(project);
    } else {
      // Reset form for new project creation
      setFormData({
        project_name: '',
        project_code: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'To Do',
      });
    }
  }, [project]);

  // Update form data on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission to create or update a project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (project) {
        // Update the existing project
        await api.put(`/projects/${project.id}`, formData);
      } else {
        // Create a new project
        await api.post('/projects', formData);
      }
      refreshProjects(); // Refresh the project list in the dashboard
      handleClose();     // Close the modal
      alert(project ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('An error occurred while saving the project. Please try again.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{project ? 'Edit Project' : 'Create Project'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="project_name">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="project_code">
            <Form.Label>Project Code</Form.Label>
            <Form.Control
              type="text"
              name="project_code"
              value={formData.project_code}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="start_date">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="end_date">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </Form.Control>
          </Form.Group>

          <Button variant="primary" className="mt-3" type="submit">
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ProjectModal;
