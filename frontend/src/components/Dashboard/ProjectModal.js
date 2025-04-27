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
    budget: '',  // Added budget field
    actual_expenditure: '',  // Optional: you can handle actual_expenditure as needed
  };

  const [formData, setFormData] = useState(emptyForm);
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    if (show) {
      if (project) {
        setFormData({
          project_name: project.project_name || '',
          project_code: project.project_code || '',
          description: project.description || '',
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          status: project.status || 'To Do',
          budget: project.budget || '',  // Populate budget when editing
          actual_expenditure: project.actual_expenditure || '',  // Optional: handle actual_expenditure if needed
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [show, project]);

  const onClose = () => {
    setFormData(emptyForm);
    setBudgetError(''); // Reset any errors on close
    handleClose();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Ensure budget is a valid number and greater than 0
    const budgetValue = parseFloat(formData.budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setBudgetError('Please enter a valid budget greater than 0.');
      return false;
    }
    setBudgetError('');  // Clear error if valid
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form before submitting
    if (!validateForm()) {
      return;
    }

    const projectData = {
      ...formData,
      budget: parseFloat(formData.budget) || 0, // Ensure budget is a number
      actual_expenditure: parseFloat(formData.actual_expenditure) || 0, // Optional: Ensure actual_expenditure is a number if provided
    };

    if (readOnly) {
      onClose();
      return;
    }

    try {
      if (project) {
        // Update existing project
        await api.put(`/projects/${project.id}`, projectData);
      } else {
        // Create new project
        await api.post('/projects', projectData);
      }
      refreshProjects && refreshProjects();
      onClose();
      alert(project ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('An error occurred while saving the project. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    let badgeClass = 'secondary';
    if (status === 'In Progress') {
      badgeClass = 'warning';
    } else if (status === 'Done') {
      badgeClass = 'success';
    }
    return <span className={`badge bg-${badgeClass}`}>{status}</span>;
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{readOnly ? 'View Project' : project ? 'Edit Project' : 'Create Project'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
          <Form.Group controlId="budget" className="mb-3">
            <Form.Label>Budget</Form.Label>
            <Form.Control
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required={!readOnly}
              disabled={readOnly}
              min="0"
              step="0.01"
            />
            {budgetError && <div className="text-danger mt-2">{budgetError}</div>}
          </Form.Group>
          <Form.Group controlId="actual_expenditure" className="mb-3">
            <Form.Label>Actual Expenditure</Form.Label>
            <Form.Control
              type="number"
              name="actual_expenditure"
              value={formData.actual_expenditure}
              onChange={handleChange}
              disabled={readOnly}
              min="0"
              step="0.01"
            />
          </Form.Group>
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Status</Form.Label>
            {readOnly ? (
              <div>{getStatusBadge(formData.status)}</div>
            ) : (
              <Form.Control as="select" name="status" value={formData.status} onChange={handleChange}>
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
