import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
  const tooltipRef = useRef(null);

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

      // Calculate budget utilization if available
      const budgetUtilization = task.amount_used && task.budget ? 
        Math.round((parseFloat(task.amount_used) / parseFloat(task.budget)) * 100) : null;
      
      return {
        ...task,
        startDate,
        endDate,
        durationDays,
        percentComplete,
        budgetUtilization
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

  // Format date to readable string
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate time elapsed between two dates in readable format
  const calculateTimeElapsed = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    
    const diffMs = new Date(endDate) - new Date(startDate);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
  };

  // Render detailed tooltip content for a task
  const renderTooltipContent = (task) => {
    return (
      <div className="gantt-tooltip">
        <h6 className="tooltip-title">{task.title}</h6>
        <div className="tooltip-content">
          <p className="tooltip-description">{task.description || 'No description'}</p>
          <div className="tooltip-info-grid">
            <div className="tooltip-label">Status:</div>
            <div>
              <Badge bg={getStatusColor(task.status)}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="tooltip-label">Priority:</div>
            <div>
              <Badge bg={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>
            </div>
            
            <div className="tooltip-label">Timeline:</div>
            <div>{formatDate(task.startDate)} - {formatDate(task.endDate)}</div>
            
            <div className="tooltip-label">Duration:</div>
            <div>{task.durationDays} day{task.durationDays !== 1 ? 's' : ''}</div>

            {task.start_time && task.end_time && (
              <>
                <div className="tooltip-label">Time Spent:</div>
                <div>{calculateTimeElapsed(task.start_time, task.end_time)}</div>
              </>
            )}
            
            {task.budget !== null && (
              <>
                <div className="tooltip-label">Budget:</div>
                <div>{formatCurrency(task.budget)}</div>
              </>
            )}
            
            {task.amount_used !== null && (
              <>
                <div className="tooltip-label">Used:</div>
                <div>{formatCurrency(task.amount_used)}</div>
              </>
            )}
            
            {task.budgetUtilization !== null && (
              <>
                <div className="tooltip-label">Budget Utilization:</div>
                <div className="budget-progress">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar ${task.budgetUtilization > 90 ? 'bg-danger' : 'bg-success'}`}
                      style={{ width: `${Math.min(100, task.budgetUtilization)}%` }}
                    ></div>
                  </div>
                  <span>{task.budgetUtilization}%</span>
                </div>
              </>
            )}
            
            <div className="tooltip-label">Progress:</div>
            <div className="task-progress">
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-success"
                  style={{ width: `${task.percentComplete}%` }}
                ></div>
              </div>
              <span>{task.percentComplete}%</span>
            </div>
          </div>
        </div>
      </div>
    );
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
    
    // Increased chart width for better visibility
    const chartWidth = 1200;
    const barHeight = 40;
    const chartHeight = chartData.length * (barHeight + 10);
    
    // Create time scale based on selected timeScale
    const timeScaleMap = {
      days: d3.timeDay,
      weeks: d3.timeWeek,
      months: d3.timeMonth,
      quarters: d3.timeMonth.every(3) // New quarterly view
    };
    
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, chartWidth - 400]); // Increased space for timeline
    
    const ticks = timeScaleMap[timeScale].range(startDate, endDate);
    
    // Format tick labels based on selected timeScale
    const formatTick = (tick) => {
      switch(timeScale) {
        case 'days':
          return tick.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        case 'weeks':
          return `Week ${d3.timeFormat("%U")(tick)}`;
        case 'quarters': {
          const quarter = Math.floor(tick.getMonth() / 3) + 1;
          return `Q${quarter} ${tick.getFullYear()}`;
        }
        case 'months':
        default:
          return d3.timeFormat("%b %Y")(tick);
      }
    };
    
    return (
      <div className="gantt-chart-container">
        <div className="gantt-header">
          <div className="gantt-task-labels">
            <div className="gantt-label-cell task-name">Task</div>
            <div className="gantt-label-cell status">Status</div>
            <div className="gantt-label-cell priority">Priority</div>
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
                  {formatTick(tick)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="gantt-body">
          {chartData.map((task, index) => {
            const taskStart = xScale(task.startDate);
            const taskWidth = Math.max(20, xScale(task.endDate) - taskStart); // Minimum width increased
            
            return (
              <div key={task.id} className="gantt-task-row">
                <div className="gantt-task-labels">
                  <div className="gantt-label-cell task-name" title={task.title}>
                    {task.title}
                  </div>
                  <div className="gantt-label-cell status">
                    <Badge bg={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="gantt-label-cell priority">
                    <Badge bg={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
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
                    data-task-id={task.id}
                    data-tooltip-content={JSON.stringify(task)}
                    onMouseEnter={(e) => showTaskTooltip(e, task)}
                    onMouseLeave={hideTaskTooltip}
                  >
                    <div 
                      className="gantt-progress"
                      style={{ width: `${task.percentComplete}%` }}
                    ></div>
                    <div className="gantt-task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-dates">
                        {formatDate(task.startDate)} - {formatDate(task.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Custom Tooltip */}
        <div 
          ref={tooltipRef} 
          className="gantt-custom-tooltip"
          style={{ display: 'none' }}
        ></div>
      </div>
    );
  };

  // Show detailed tooltip when hovering over a task bar
  const showTaskTooltip = (event, task) => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    
    // Render tooltip content
    tooltip.innerHTML = '';
    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'gantt-tooltip';
    
    // Create tooltip title
    const title = document.createElement('h6');
    title.className = 'tooltip-title';
    title.textContent = task.title;
    tooltipContent.appendChild(title);
    
    // Create tooltip content container
    const content = document.createElement('div');
    content.className = 'tooltip-content';
    
    // Add description
    const description = document.createElement('p');
    description.className = 'tooltip-description';
    description.textContent = task.description || 'No description';
    content.appendChild(description);
    
    // Create info grid
    const infoGrid = document.createElement('div');
    infoGrid.className = 'tooltip-info-grid';
    
    // Add status
    infoGrid.innerHTML += `
      <div class="tooltip-label">Status:</div>
      <div><span class="badge bg-${getStatusColor(task.status)}">${task.status.replace('_', ' ').toUpperCase()}</span></div>
      
      <div class="tooltip-label">Priority:</div>
      <div><span class="badge bg-${getPriorityColor(task.priority)}">${task.priority.toUpperCase()}</span></div>
      
      <div class="tooltip-label">Timeline:</div>
      <div>${formatDate(task.startDate)} - ${formatDate(task.endDate)}</div>
      
      <div class="tooltip-label">Duration:</div>
      <div>${task.durationDays} day${task.durationDays !== 1 ? 's' : ''}</div>
    `;
    
    // Add time spent if available
    if (task.start_time && task.end_time) {
      infoGrid.innerHTML += `
        <div class="tooltip-label">Time Spent:</div>
        <div>${calculateTimeElapsed(task.start_time, task.end_time)}</div>
      `;
    }
    
    // Add budget info if available
    if (task.budget !== null) {
      infoGrid.innerHTML += `
        <div class="tooltip-label">Budget:</div>
        <div>${formatCurrency(task.budget)}</div>
      `;
    }
    
    if (task.amount_used !== null) {
      infoGrid.innerHTML += `
        <div class="tooltip-label">Used:</div>
        <div>${formatCurrency(task.amount_used)}</div>
      `;
    }
    
    if (task.budgetUtilization !== null) {
      const budgetBarColor = task.budgetUtilization > 90 ? 'bg-danger' : 'bg-success';
      infoGrid.innerHTML += `
        <div class="tooltip-label">Budget Utilization:</div>
        <div class="budget-progress">
          <div class="progress" style="height: 8px;">
            <div class="progress-bar ${budgetBarColor}" style="width: ${Math.min(100, task.budgetUtilization)}%;"></div>
          </div>
          <span>${task.budgetUtilization}%</span>
        </div>
      `;
    }
    
    // Add progress bar
    infoGrid.innerHTML += `
      <div class="tooltip-label">Progress:</div>
      <div class="task-progress">
        <div class="progress" style="height: 8px;">
          <div class="progress-bar bg-success" style="width: ${task.percentComplete}%;"></div>
        </div>
        <span>${task.percentComplete}%</span>
      </div>
    `;
    
    content.appendChild(infoGrid);
    tooltipContent.appendChild(content);
    tooltip.appendChild(tooltipContent);
    
    // Position the tooltip
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const modalBody = event.currentTarget.closest('.modal-body');
    const modalBodyRect = modalBody.getBoundingClientRect();
    
    // Calculate tooltip position
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
    left = Math.max(modalBodyRect.left + 10, Math.min(left, modalBodyRect.right - tooltipRect.width - 10));
    
    let top = rect.top - tooltipRect.height - 10;
    if (top < modalBodyRect.top) {
      top = rect.bottom + 10;
    }
    
    // Set tooltip position
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.display = 'block';
  };
  
  // Hide tooltip
  const hideTaskTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" dialogClassName="gantt-modal">
      <Modal.Header closeButton>
        <Modal.Title>Project Timeline: {projectName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={3}>
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
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group>
              <Form.Label>Time Scale</Form.Label>
              <Form.Select 
                value={timeScale} 
                onChange={(e) => handleTimeScaleChange(e.target.value)}
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="quarters">Quarters</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Total Tasks</Form.Label>
              <div className="form-control bg-light">
                <strong>{filteredTasks.length}</strong> task{filteredTasks.length !== 1 ? 's' : ''}
              </div>
            </Form.Group>
          </Col>
        </Row>
        
        <div className="gantt-wrapper">
          {renderGanttChart()}
        </div>
        
        <div className="mt-3">
          <p className="text-muted small">
            <strong>Note:</strong> Scroll horizontally to view the full timeline. Hover over task bars for detailed information.
          </p>
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
        <Button variant="primary" onClick={() => window.print()}>
          Print Chart
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GanttChartModal;