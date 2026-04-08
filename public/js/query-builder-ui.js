/**
 * Query Builder UI Controller (Form Mode)
 * Handles condition management, query generation, and execution
 */

class QueryBuilderForm {
  constructor() {
    this.conditions = [];
    this.selectedColumns = [];
    this.currentQuery = null;
    this.savedQueries = this.loadSavedQueries();
    
    this.operators = ['=', '!=', '<>', '<', '>', '<=', '>=', 'IN', 'NOT IN', 'LIKE', 'BETWEEN'];
    this.logicalOps = ['AND', 'OR'];
    
    this.initializeConditions();
    this.updateSavedQueriesDisplay();
  }

  /**
   * Initialize with one empty condition
   */
  initializeConditions() {
    this.addCondition();
  }

  /**
   * Add a new condition
   */
  addCondition(column = '', operator = '=', value = '', logicalOp = 'AND') {
    const id = this.generateId();
    const condition = {
      id,
      column,
      operator,
      value,
      logicalOp
    };

    this.conditions.push(condition);
    this.renderCondition(condition, this.conditions.length === 1);
  }

  /**
   * Render a single condition
   */
  renderCondition(condition, isFirst = false) {
    const container = document.getElementById('conditionsContainer');
    
    // Add logical operator separator if not first
    if (!isFirst) {
      const logicalDiv = document.createElement('div');
      logicalDiv.className = 'logical-op';
      
      const select = document.createElement('select');
      select.style.width = '80px';
      select.style.margin = '0 auto';
      select.style.display = 'block';
      select.style.background = 'rgba(255, 255, 255, 0.05)';
      select.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      select.style.color = '#b0b0b0';
      select.style.cursor = 'pointer';
      
      this.logicalOps.forEach(op => {
        const option = document.createElement('option');
        option.value = op;
        option.textContent = op;
        if (op === condition.logicalOp) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => {
        condition.logicalOp = e.target.value;
      });

      logicalDiv.appendChild(select);
      container.appendChild(logicalDiv);
    }

    // Create condition row
    const row = document.createElement('div');
    row.className = `condition-row ${isFirst ? '' : ''}`;
    row.id = `condition-${condition.id}`;
    row.dataset.id = condition.id;

    // Column selector
    const columnSelect = document.createElement('select');
    const columnOptions = [
      { value: 'first_name', label: 'First Name' },
      { value: 'last_name', label: 'Last Name' },
      { value: 'phone_number', label: 'Phone Number' },
      { value: 'email', label: 'Email' },
      { value: 'city', label: 'City' },
      { value: 'state', label: 'State' },
      { value: 'zip', label: 'ZIP' },
      { value: 'address1', label: 'Ethnic' },
      { value: 'address2', label: 'Gender' },
      { value: 'address3', label: 'Age' },
      { value: 'owner', label: 'Cell (Y/N)' },
      { value: 'vendor_lead_code', label: 'Record ID' }
    ];

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Select Column --';
    columnSelect.appendChild(emptyOption);

    columnOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === condition.column) option.selected = true;
      columnSelect.appendChild(option);
    });

    columnSelect.addEventListener('change', (e) => {
      condition.column = e.target.value;
    });

    // Operator selector
    const operatorSelect = document.createElement('select');
    this.operators.forEach(op => {
      const option = document.createElement('option');
      option.value = op;
      option.textContent = op;
      if (op === condition.operator) option.selected = true;
      operatorSelect.appendChild(option);
    });

    operatorSelect.addEventListener('change', (e) => {
      condition.operator = e.target.value;
      this.updateValueInput(row, condition);
    });

    // Value input
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Value';
    valueInput.value = condition.value;
    valueInput.addEventListener('change', (e) => {
      condition.value = e.target.value;
    });

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '🗑️';
    removeBtn.onclick = () => this.removeCondition(condition.id);

    row.appendChild(columnSelect);
    row.appendChild(operatorSelect);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);

    container.appendChild(row);
  }

  /**
   * Update value input based on operator
   */
  updateValueInput(row, condition) {
    // Could implement special handling for BETWEEN, IN, etc.
    // For now, keep it simple
  }

  /**
   * Remove a condition
   */
  removeCondition(id) {
    this.conditions = this.conditions.filter(c => c.id !== id);
    this.renderAllConditions();
  }

  /**
   * Render all conditions
   */
  renderAllConditions() {
    const container = document.getElementById('conditionsContainer');
    container.innerHTML = '';
    this.conditions.forEach((cond, idx) => {
      this.renderCondition(cond, idx === 0);
    });
  }

  /**
   * Add selected column
   */
  addColumn(columnName) {
    if (columnName && !this.selectedColumns.includes(columnName)) {
      this.selectedColumns.push(columnName);
      this.renderSelectedColumns();
    }
    document.getElementById('allColumnsSelect').value = '';
  }

  /**
   * Remove selected column
   */
  removeColumn(columnName) {
    this.selectedColumns = this.selectedColumns.filter(c => c !== columnName);
    this.renderSelectedColumns();
  }

  /**
   * Render selected columns
   */
  renderSelectedColumns() {
    const container = document.getElementById('selectedColumns');
    container.innerHTML = '';

    this.selectedColumns.forEach(col => {
      const chip = document.createElement('div');
      chip.className = 'column-chip selected';
      chip.innerHTML = `
        ${col}
        <span class="remove" onclick="window.queryBuilder.removeColumn('${col}')">✕</span>
      `;
      container.appendChild(chip);
    });
  }

  /**
   * Generate the MySQL query
   */
  generateQuery() {
    // Validate conditions
    const invalidConditions = this.conditions.filter(c => !c.column || !c.value);
    if (invalidConditions.length > 0) {
      this.showToast('⚠️ Please fill in all condition fields');
      return;
    }

    // Build SELECT clause
    const selectClause = this.selectedColumns.length > 0
      ? `SELECT ${this.selectedColumns.join(', ')}`
      : 'SELECT *';

    // Build WHERE clause
    let whereClause = 'WHERE ';
    const whereParts = this.conditions.map((cond, idx) => {
      let part = `${cond.column} ${cond.operator}`;

      // Format value based on operator
      if (['IN', 'NOT IN'].includes(cond.operator)) {
        part += ` (${cond.value})`;
      } else if (cond.operator === 'BETWEEN') {
        part += ` ${cond.value}`;
      } else if (cond.operator === 'LIKE') {
        part += ` '%${cond.value}%'`;
      } else if (isNaN(cond.value)) {
        part += ` '${cond.value}'`;
      } else {
        part += ` ${cond.value}`;
      }

      return part;
    });

    // Join with logical operators
    let fullWhere = whereParts[0];
    for (let i = 1; i < whereParts.length; i++) {
      const logicalOp = this.conditions[i].logicalOp || 'AND';
      fullWhere += ` ${logicalOp} ${whereParts[i]}`;
    }

    // Combine query
    this.currentQuery = `${selectClause} FROM contacts\n${whereClause}${fullWhere};`;

    // Display query
    const output = document.getElementById('queryOutput');
    output.textContent = this.currentQuery;
    output.classList.remove('empty');

    this.showToast('✓ Query generated successfully');
  }

  /**
   * Reset query builder
   */
  resetQuery() {
    this.conditions = [];
    this.selectedColumns = [];
    this.currentQuery = null;
    document.getElementById('queryOutput').textContent = 'Your query will appear here...';
    document.getElementById('queryOutput').classList.add('empty');
    document.getElementById('selectedColumns').innerHTML = '';
    this.initializeConditions();
    this.showToast('Query builder reset');
  }

  /**
   * Copy query to clipboard
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
   * Execute query (simulate)
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
        Records found: 42
        Execution time: 234ms
        
        Sample results:
        • John Doe | 555-123-4567 | john@example.com
        • Jane Smith | 555-987-6543 | jane@example.com
        • Bob Johnson | 555-555-5555 | bob@example.com
      `;
      resultsContainer.textContent = results;
      this.showToast('✓ Query executed');
    }, 1500);
  }

  /**
   * Save query
   */
  saveQuery() {
    if (!this.currentQuery) {
      this.showToast('⚠️ Generate a query first');
      return;
    }

    const nameInput = document.getElementById('queryName');
    const name = nameInput.value.trim();

    if (!name) {
      this.showToast('⚠️ Enter a query name');
      return;
    }

    const query = {
      id: this.generateId(),
      name,
      query: this.currentQuery,
      savedAt: new Date().toLocaleString()
    };

    this.savedQueries.push(query);
    this.saveSavedQueries();
    this.updateSavedQueriesDisplay();

    nameInput.value = '';
    this.showToast('✓ Query saved');
  }

  /**
   * Update saved queries display
   */
  updateSavedQueriesDisplay() {
    const container = document.getElementById('savedQueriesContainer');
    const list = document.getElementById('savedQueriesList');

    if (this.savedQueries.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = '';

    this.savedQueries.forEach(query => {
      const item = document.createElement('div');
      item.className = 'query-item';
      item.innerHTML = `
        <div class="query-item-name">${query.name}</div>
        <div class="query-item-actions">
          <button class="btn-secondary" onclick="window.queryBuilder.loadQuery('${query.id}')" style="padding: 4px 8px; font-size: 11px;">Load</button>
          <button class="btn-secondary" onclick="window.queryBuilder.deleteQuery('${query.id}')" style="padding: 4px 8px; font-size: 11px;">Delete</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  /**
   * Load saved query
   */
  loadQuery(id) {
    const query = this.savedQueries.find(q => q.id === id);
    if (query) {
      document.getElementById('queryOutput').textContent = query.query;
      document.getElementById('queryOutput').classList.remove('empty');
      this.currentQuery = query.query;
      this.showToast(`✓ Loaded: ${query.name}`);
    }
  }

  /**
   * Delete saved query
   */
  deleteQuery(id) {
    if (confirm('Delete this query?')) {
      this.savedQueries = this.savedQueries.filter(q => q.id !== id);
      this.saveSavedQueries();
      this.updateSavedQueriesDisplay();
      this.showToast('✓ Query deleted');
    }
  }

  /**
   * Save to localStorage
   */
  saveSavedQueries() {
    localStorage.setItem('savedQueries', JSON.stringify(this.savedQueries));
  }

  /**
   * Load from localStorage
   */
  loadSavedQueries() {
    try {
      const saved = localStorage.getItem('savedQueries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.queryBuilder = new QueryBuilderForm();
});

// Global functions
function addCondition() {
  if (window.queryBuilder) {
    window.queryBuilder.addCondition();
  }
}

function resetQuery() {
  if (window.queryBuilder) {
    window.queryBuilder.resetQuery();
  }
}

function generateQuery() {
  if (window.queryBuilder) {
    window.queryBuilder.generateQuery();
  }
}

function copyQuery() {
  if (window.queryBuilder) {
    window.queryBuilder.copyQuery();
  }
}

function executeQuery() {
  if (window.queryBuilder) {
    window.queryBuilder.executeQuery();
  }
}

function saveQuery() {
  if (window.queryBuilder) {
    window.queryBuilder.saveQuery();
  }
}

function addColumn(col) {
  if (window.queryBuilder) {
    window.queryBuilder.addColumn(col);
  }
}

function switchMode(mode) {
  if (mode === 'form') {
    // Stay on form mode
    alert('Currently in form mode. Visual mode coming soon!');
  } else if (mode === 'visual') {
    window.location.href = '/query-builder-visual.html';
  }
}
