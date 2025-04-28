import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import * as d3 from 'd3';
import './GanttChartModal.css';

const GanttChartModal = ({ show, handleClose, tasks, projectName }) => {
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  const [chartData, setChartData] = useState([]);
  const [timeScale, setTimeScale] = useState('weeks');

  useEffect(() => {
    // Apply filters
    let taskList = [...tasks];
    
    if (filters.status !== 'all') {
      taskList = taskList.filter(task => task.status === filters.status);
    }
    
    if (filters.priority !== 'all') {
      taskList = taskList.filter(task => task.priority === filters.priority);
    }
    
    setFilteredTasks(taskList);
    
    // Process tasks data for Gantt chart
    processTasksForGantt(taskList);
  }, [tasks, filters]);

  const processTasksForGantt = (taskList) => {
    if (!taskList.length) {
      setChartData([]);
      return;
    }

    // Calculate dates for tasks that are missing them
    const processed = taskList.map(task => {
      // Set default dates if not present
      const startDate = task.start_time ? new Date(task.start_time) : 
                        (task.start_date ? new Date(task.start_date) : new Date(task.created_at));
      
      // For tasks not completed yet, use current date as end
      let endDate;
      if (task.end_time) {
        endDate = new Date(task.end_time);
      } else if (task.end_date) {
        endDate = new Date(task.end_date);
      } else if (task.deadline) {
        endDate = new Date(task.deadline);
      } else {
        // Default end date: start date + 1 day
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
      }
      
      // Calculate duration in days
      const durationMs = endDate - startDate;
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      
      // Calculate percent complete based on status
      let percentComplete = 0;
      if (task.status === 'completed') {
        percentComplete = 100;
      } else if (task.status === 'in_progress') {
        percentComplete = 50;
      }
      
      return {
        ...task,
        startDate,
        endDate,
        durationDays,
        percentComplete
      };
    });
    
    // Sort by start date
    processed.sort((a, b) => a.startDate - b.startDate);
    
    setChartData(processed);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeScaleChange = (scale) => {
    setTimeScale(scale);
  };
  
  // Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };
  
  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  // Render Gantt chart using D3
  const renderGanttChart = () => {
    if (!chartData.length) {
      return <div className="text-center p-5">No tasks to display</div>;
    }

    // Find earliest and latest dates for scaling
    const minDate = d3.min(chartData, d => d.startDate);
    const maxDate = d3.max(chartData, d => d.endDate);
    
    // Add padding to date range
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - 2);
    
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + 2);
    
    const chartWidth = 800;
    const barHeight = 40;
    const chartHeight = chartData.length * (barHeight + 10);
    
    // Create time scale
    const timeScaleMap = {
      days: d3.timeDay,
      weeks: d3.timeWeek,
      months: d3.timeMonth
    };
    
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, chartWidth - 200]);
    
    const ticks = timeScaleMap[timeScale].range(startDate, endDate);
    
    return (
      <div className="gantt-chart-container">
        <div className="gantt-header">
          <div className="gantt-task-labels">
            <div className="gantt-label-cell">Task</div>
            <div className="gantt-label-cell">Status</div>
            <div className="gantt-label-cell">Priority</div>
          </div>
          <div className="gantt-timeline">
            {ticks.map((tick, i) => (
              <div 
                key={i} 
                className="gantt-time-marker"
                style={{ 
                  left: `${xScale(tick)}px`,
                  width: `${xScale(timeScaleMap[timeScale].offset(tick, 1)) - xScale(tick)}px`
                }}
              >
                <div className="gantt-time-label">
                  {timeScale === 'days' 
                    ? tick.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : timeScale === 'weeks'
                      ? `W${d3.timeFormat("%U")(tick)}`
                      : d3.timeFormat("%b %Y")(tick)
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="gantt-body">
          {chartData.map((task, index) => {
            const taskStart = xScale(task.startDate);
            const taskWidth = Math.max(5, xScale(task.endDate) - taskStart);
            
            return (
              <div key={task.id} className="gantt-task-row">
                <div className="gantt-task-labels">
                  <div className="gantt-label-cell" title={task.title}>
                    {task.title.length > 20 ? `${task.title.substring(0, 20)}...` : task.title}
                  </div>
                  <div className="gantt-label-cell">
                    <Badge bg={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="gantt-label-cell">
                    <Badge bg={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <div className="gantt-timeline">
                  <div 
                    className={`gantt-bar gantt-bar-${task.status}`}
                    style={{
                      left: `${taskStart}px`,
                      width: `${taskWidth}px`,
                    }}
                  >
                    <div 
                      className="gantt-progress"
                      style={{ width: `${task.percentComplete}%` }}
                    ></div>
                    <div className="gantt-task-info">
                      <span className="task-dates">
                        {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" dialogClassName="gantt-modal">
      <Modal.Header closeButton>
        <Modal.Title>Project Timeline: {projectName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filter by Priority</Form.Label>
              <Form.Select 
                value={filters.priority} 
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Time Scale</Form.Label>
              <Form.Select 
                value={timeScale} 
                onChange={(e) => handleTimeScaleChange(e.target.value)}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <div className="gantt-wrapper">
          {renderGanttChart()}
        </div>
        
        {filteredTasks.length === 0 && (
          <div className="alert alert-info mt-3">
            No tasks match the selected filters.
          </div>
        )}
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