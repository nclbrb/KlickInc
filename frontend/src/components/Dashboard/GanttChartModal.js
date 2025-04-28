import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Chart } from "react-google-charts";

const GanttChartModal = ({ show, handleClose, tasks, projectName }) => {
  const data = [
    [
      { type: "string", label: "Task ID" },
      { type: "string", label: "Task Name" },
      { type: "string", label: "Resource" },
      { type: "date", label: "Start Date" },
      { type: "date", label: "End Date" },
      { type: "number", label: "Duration" },
      { type: "number", label: "Percent Complete" },
      { type: "string", label: "Dependencies" },
    ],
    ...tasks.map(task => [
      task.id.toString(),
      task.title,
      task.status,
      new Date(task.start_date || task.created_at),
      new Date(task.end_date || task.updated_at),
      null,
      task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
      null
    ])
  ];

  const options = {
    height: 400,
    gantt: {
      trackHeight: 30,
    },
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Project Timeline: {projectName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Chart
          chartType="Gantt"
          width="100%"
          height="400px"
          data={data}
          options={options}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GanttChartModal;
