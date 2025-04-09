import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../../api';

function ProjectModal({ show, handleClose, project, refreshProjects, readOnly }) {
  const emptyForm = {
    project_name: '',
    project_code: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'To Do',
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (show) {
      // If editing, load the project data; if creating, clear the form.
      if (project) {
        setFormData({
          project_name: project.project_name || '',
          project_code: project.project_code || '',
          description: project.description || '',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          status: project.status || 'To Do',
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [show, project]); // This will initialize formData when the modal is shown

  // Clear form state on close
  const onClose = () => {
    setFormData(emptyForm);
    handleClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) {
      onClose();
      return;
    }
    try {
      if (project) {
        await api.put(`/projects/${project.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      refreshProjects && refreshProjects();
      onClose();
      alert(project ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('An error occurred while saving the project. Please try again.');
    }
  };

  // Helper function to render project status as a badge
  const getStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'In Progress') {
      badgeClass = 'warning';
    } else if (status === 'Done') {
      badgeClass = 'success';
    } else if (status === 'To Do') {
      badgeClass = 'secondary';
    }
    return <span className={`badge bg-${badgeClass}`}>{status}</span>;
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>
          {readOnly ? 'View Project' : project ? 'Edit Project' : 'Create Project'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="project_name" className="mb-3">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="project_code" className="mb-3">
            <Form.Label>Project Code</Form.Label>
            <Form.Control
              type="text"
              name="project_code"
              value={formData.project_code}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="start_date" className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="end_date" className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              disabled={readOnly}
            />
          </Form.Group>
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Status</Form.Label>
            {readOnly ? (
              <div>{getStatusBadge(formData.status)}</div>
            ) : (
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
            )}
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-3">
            {!readOnly ? (
              <Button variant="primary" type="submit">
                {project ? 'Update Project' : 'Create Project'}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ProjectModal;
