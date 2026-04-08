/**
 * Visual Query Builder Controller
 * Drag-drop interface for building queries visually
 */

class VisualQueryBuilder {
  constructor() {
    this.conditions = [];
    this.draggedColumn = null;
    this.currentQuery = null;
    this.operators = ['=', '!=', '<>', '<', '>', '<=', '>=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN'];
    this.logicalOps = ['AND', 'OR'];
    
    this.initializeContainer();
  }

  /**
   * Initialize container
   */
  initializeContainer() {
    const container = document.getElementById('conditionBuilder');
    container.ondrop = (e) => this.drop(e);
    container.ondragover = (e) => this.allowDrop(e);
    container.ondragleave = (e) => this.dragLeave(e);
  }

  /**
   * Start drag operation
   */
  startDrag(event, column) {
    this.draggedColumn = column;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('column', column);
  }

  /**
   * Allow drop
   */
  allowDrop(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    const container = document.getElementById('conditionBuilder');
    container.style.background = 'rgba(0, 212, 255, 0.1)';
    container.style.borderColor = '#00d4ff';
  }

  /**
   * Drag leave
   */
  dragLeave(event) {
    if (event.target.id === 'conditionBuilder') {
      const container = document.getElementById('conditionBuilder');
      container.style.background = 'rgba(0, 212, 255, 0.02)';
      container.style.borderColor = 'rgba(0, 212, 255, 0.2)';
    }
  }

  /**
   * Handle drop
   */
  drop(event) {
    event.preventDefault();
    const column = event.dataTransfer.getData('column');
    
    const container = document.getElementById('conditionBuilder');
    container.style.background = 'rgba(0, 212, 255, 0.02)';
    container.style.borderColor = 'rgba(0, 212, 255, 0.2)';

    if (column) {
      this.addCondition(column);
    }
  }

  /**
   * Add a new condition
   */
  addCondition(column) {
    const id = this.generateId();
    const condition = {
      id,
      column,
      operator: '=',
      value: '',
      logicalOp: 'AND'
    };

    this.conditions.push(condition);
    this.renderConditions();
    this.updateQueryPreview();
  }

  /**
   * Render all conditions
   */
  renderConditions() {
    const container = document.getElementById('conditionBuilder');

    if (this.conditions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">➕</div>
          <div class="empty-state-text">Drag columns from the palette to add conditions</div>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    this.conditions.forEach((condition, idx) => {
      // Add logical operator if not first
      if (idx > 0) {
        const connectorDiv = document.createElement('div');
        connectorDiv.className = 'logical-connector';

        const opClass = condition.logicalOp === 'AND' ? 'and' : 'or';
        connectorDiv.innerHTML = `
          <select class="logical-op-selector ${opClass}" onchange="window.visualBuilder.updateLogicalOp('${condition.id}', this.value)">
            <option value="AND" ${condition.logicalOp === 'AND' ? 'selected' : ''}>AND</option>
            <option value="OR" ${condition.logicalOp === 'OR' ? 'selected' : ''}>OR</option>
          </select>
        `;

        container.appendChild(connectorDiv);
      }

      // Create condition card
      const card = document.createElement('div');
      card.className = 'condition-card';
      card.id = `cond-${condition.id}`;
      card.draggable = true;
      card.ondragstart = (e) => this.dragCondition(e, condition.id);

      const operatorLabel = this.getOperatorDisplay(condition.operator);

      card.innerHTML = `
        <div class="condition-content">
          <div class="condition-title">${condition.column}</div>
          <div class="condition-details">${operatorLabel} <span style="color: #00d4ff;">"${condition.value || 'value'}"</span></div>
        </div>
        <div class="condition-actions">
          <button class="condition-btn" onclick="window.visualBuilder.editCondition('${condition.id}')">✏️ Edit</button>
          <button class="condition-btn delete" onclick="window.visualBuilder.removeCondition('${condition.id}')">✕</button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  /**
   * Get operator display name
   */
  getOperatorDisplay(op) {
    const display = {
      '=': 'equals',
      '!=': 'not equals',
      '<>': 'not equal',
      '<': 'less than',
      '>': 'greater than',
      '<=': 'less or equal',
      '>=': 'greater or equal',
      'IN': 'in list',
      'NOT IN': 'not in list',
      'LIKE': 'contains',
      'BETWEEN': 'between'
    };
    return display[op] || op;
  }

  /**
   * Edit condition
   */
  editCondition(id) {
    const condition = this.conditions.find(c => c.id === id);
    if (!condition) return;

    const value = prompt(`Edit value for ${condition.column}:`, condition.value);
    if (value !== null) {
      condition.value = value;
      this.renderConditions();
      this.updateQueryPreview();
    }
  }

  /**
   * Remove condition
   */
  removeCondition(id) {
    this.conditions = this.conditions.filter(c => c.id !== id);
    this.renderConditions();
    this.updateQueryPreview();
  }

  /**
   * Update logical operator
   */
  updateLogicalOp(id, op) {
    const condition = this.conditions.find(c => c.id === id);
    if (condition) {
      condition.logicalOp = op;
      this.renderConditions();
      this.updateQueryPreview();
    }
  }

  /**
   * Drag condition
   */
  dragCondition(event, id) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('conditionId', id);
  }

  /**
   * Update query preview
   */
  updateQueryPreview() {
    const preview = document.getElementById('queryPreview');

    if (this.conditions.length === 0) {
      preview.textContent = 'Your query will appear here...';
      preview.classList.add('empty');
      return;
    }

    preview.classList.remove('empty');

    let query = 'SELECT *\nFROM contacts\nWHERE ';
    const parts = [];

    this.conditions.forEach((cond, idx) => {
      let value = cond.value;
      
      // Format value based on operator
      if (!['IN', 'NOT IN', 'BETWEEN'].includes(cond.operator)) {
        if (isNaN(value)) {
          value = `'${value}'`;
        }
      }

      const part = `${cond.column} ${cond.operator} ${value}`;
      parts.push(part);
    });

    // Join with logical operators
    let whereClause = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const logicalOp = this.conditions[i].logicalOp;
      whereClause += ` ${logicalOp} ${parts[i]}`;
    }

    query += whereClause + ';';
    this.currentQuery = query;
    preview.textContent = query;
  }

  /**
   * Generate query
   */
  generateQuery() {
    if (this.conditions.length === 0) {
      this.showToast('⚠️ Add at least one condition');
      return;
    }

    this.updateQueryPreview();
    this.showToast('✓ Query generated successfully');
  }

  /**
   * Clear builder
   */
  clearBuilder() {
    if (confirm('Clear all conditions?')) {
      this.conditions = [];
      this.renderConditions();
      document.getElementById('queryPreview').textContent = 'Your query will appear here...';
      document.getElementById('queryPreview').classList.add('empty');
      this.showToast('Query builder cleared');
    }
  }

  /**
   * Copy query
   */
  copyQuery() {
    if (!this.currentQuery) {
      this.showToast('⚠️ Generate a query first');
      return;
    }

    navigator.clipboard.writeText(this.currentQuery).then(() => {
      this.showToast('✓ Query copied to clipboard');
    }).catch(() => {
      this.showToast('✗ Failed to copy query');
    });
  }

  /**
   * Execute query
   */
  executeQuery() {
    if (!this.currentQuery) {
      this.showToast('⚠️ Generate a query first');
      return;
    }

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<div style="text-align: center;"><span>⏳ Executing...</span></div>';

    // Simulate execution
    setTimeout(() => {
      const results = `
Query executed successfully!
Execution Time: 234ms
Records Found: 87

Sample Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID | First Name   | Last Name    | Phone        | City
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1  | John         | Smith        | 555-123-4567 | New York
2  | Jane         | Doe          | 555-987-6543 | Los Angeles
3  | Bob          | Johnson      | 555-456-7890 | Chicago
4  | Alice        | Williams     | 555-654-3210 | Houston
5  | Charlie      | Brown        | 555-789-0123 | Phoenix
6  | Diana        | Davis        | 555-321-0987 | Philadelphia
7  | Eve          | Miller       | 555-432-1098 | San Antonio
8  | Frank        | Wilson       | 555-543-2109 | San Diego
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

... and 79 more records

Query: ${this.currentQuery}
      `;
      resultsContainer.textContent = results;
      resultsContainer.style.fontFamily = 'monospace';
      resultsContainer.style.fontSize = '0.8em';
      resultsContainer.style.lineHeight = '1.6';
      this.showToast('✓ Query executed');
    }, 1500);
  }

  /**
   * Show toast notification
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.visualBuilder = new VisualQueryBuilder();
});
