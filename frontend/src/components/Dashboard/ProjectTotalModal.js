import { useState, useEffect } from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import axios from 'axios';

const ProjectTotalModal = ({ show, handleClose, projectId }) => {
  const [tasks, setTasks] = useState([]);

  const fetchProjectTotals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/projects/${projectId}/totals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = response.data;

      let taskList = [];
      if (Array.isArray(data.tasks)) {
        taskList = data.tasks;
      } else if (Array.isArray(data.totals)) {
        taskList = data.totals;
      } else if (Array.isArray(data.data)) {
        taskList = data.data;
      } else if (Array.isArray(data)) {
        taskList = data;
      } else if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
          if (Array.isArray(data[key])) {
            taskList = data[key];
            break;
          }
        }
      }
      setTasks(taskList);
    } catch (error) {
      console.error('Error fetching project totals:', error);
    }
  };

  useEffect(() => {
    if (show && projectId) {
      fetchProjectTotals();
    }
  }, [show, projectId]);

  const formatBudget = (value) => {
    if (value == null) return '₱0.00';
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? '₱0.00' : `₱${parsedValue.toFixed(2)}`;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" top>
      <Modal.Header closeButton>
        <Modal.Title>Total Project Budget Overview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table hover responsive className="table-spaced"> 
          <thead>
            <tr>
              <th className="px-4">Task Title</th>
              <th className="px-4">Total Budget</th>
              <th className="px-4">Total Spent</th>
              <th className="px-4">Leftover Funds</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task.task_id ?? task.id}>
                  <td className="px-4">{task.title ?? '–'}</td>
                  <td className="px-4">{formatBudget(task.budget ?? task.total_budget)}</td>
                  <td className="px-4">{formatBudget(task.amount_used ?? task.spent)}</td>
                  <td className="px-4">{formatBudget(task.leftover ?? task.remaining)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No data available for this project.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectTotalModal;
