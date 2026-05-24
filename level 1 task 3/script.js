/* ============================================
   Premium Calculator — JavaScript Logic
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentInput: '0',
    previousInput: '',
    operator: null,
    shouldResetScreen: false,
    history: [],         // stores expression string for display
  };

  // --- DOM References ---
  const displayCurrent = document.getElementById('display-current');
  const displayExpression = document.getElementById('display-expression');
  const buttons = document.querySelectorAll('.btn');

  // --- Formatting ---
  function formatNumber(numStr) {
    if (numStr === 'Error') return 'Error';
    // Preserve trailing decimal or trailing decimal zeros during input
    const num = parseFloat(numStr);
    if (isNaN(num)) return '0';
    if (numStr.includes('.') && numStr.endsWith('.')) {
      return num.toLocaleString('en-US') + '.';
    }
    if (numStr.includes('.')) {
      const parts = numStr.split('.');
      return parseFloat(parts[0]).toLocaleString('en-US') + '.' + parts[1];
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
  }

  // --- Update Display ---
  function updateDisplay() {
    const formatted = formatNumber(state.currentInput);
    displayCurrent.textContent = formatted;

    // Shrink text if too long
    if (formatted.length > 12) {
      displayCurrent.classList.add('shrink');
    } else {
      displayCurrent.classList.remove('shrink');
    }

    // Build expression string
    if (state.history.length > 0) {
      displayExpression.textContent = state.history.join(' ');
    } else {
      displayExpression.textContent = '';
    }
  }

  // --- Operator Symbol Map ---
  const operatorSymbols = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
  };

  // --- Perform Calculation ---
  function calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) return 'Error';

    let result;

    // Using if-else statements as required
    if (op === 'add') {
      result = numA + numB;
    } else if (op === 'subtract') {
      result = numA - numB;
    } else if (op === 'multiply') {
      result = numA * numB;
    } else if (op === 'divide') {
      if (numB === 0) {
        return 'Error';
      }
      result = numA / numB;
    } else {
      return 'Error';
    }

    // Handle floating-point precision
    result = Math.round(result * 1e10) / 1e10;
    return result.toString();
  }

  // --- Handle Number Input ---
  function handleNumber(num) {
    if (state.currentInput === 'Error') {
      state.currentInput = '0';
    }

    if (state.shouldResetScreen) {
      state.currentInput = '0';
      state.shouldResetScreen = false;
    }

    // Limit input length
    if (state.currentInput.replace(/[^0-9]/g, '').length >= 15) return;

    if (num === '.') {
      if (state.currentInput.includes('.')) return;
      state.currentInput += '.';
    } else {
      if (state.currentInput === '0') {
        state.currentInput = num;
      } else {
        state.currentInput += num;
      }
    }

    updateDisplay();
  }

  // --- Handle Operator ---
  function handleOperator(op) {
    if (state.currentInput === 'Error') return;

    // If there's a pending operation, calculate first (chaining)
    if (state.operator && !state.shouldResetScreen) {
      const result = calculate(state.previousInput, state.currentInput, state.operator);
      state.currentInput = result;
      state.history = [formatNumber(result), operatorSymbols[op]];
    } else {
      state.history = [formatNumber(state.currentInput), operatorSymbols[op]];
    }

    state.previousInput = state.currentInput;
    state.operator = op;
    state.shouldResetScreen = true;

    // Highlight active operator
    highlightOperator(op);
    updateDisplay();
  }

  // --- Handle Equals ---
  function handleEquals() {
    if (!state.operator || state.currentInput === 'Error') return;

    const result = calculate(state.previousInput, state.currentInput, state.operator);

    // Show full expression
    state.history = [
      formatNumber(state.previousInput),
      operatorSymbols[state.operator],
      formatNumber(state.currentInput),
      '=',
    ];

    state.currentInput = result;
    state.previousInput = '';
    state.operator = null;
    state.shouldResetScreen = true;

    clearOperatorHighlight();
    updateDisplay();
  }

  // --- Handle Clear ---
  function handleClear() {
    state.currentInput = '0';
    state.previousInput = '';
    state.operator = null;
    state.shouldResetScreen = false;
    state.history = [];
    clearOperatorHighlight();
    updateDisplay();
  }

  // --- Handle Sign Toggle ---
  function handleSign() {
    if (state.currentInput === '0' || state.currentInput === 'Error') return;

    if (state.currentInput.startsWith('-')) {
      state.currentInput = state.currentInput.slice(1);
    } else {
      state.currentInput = '-' + state.currentInput;
    }

    updateDisplay();
  }

  // --- Handle Percent ---
  function handlePercent() {
    if (state.currentInput === 'Error') return;

    const num = parseFloat(state.currentInput);
    if (isNaN(num)) return;

    state.currentInput = (num / 100).toString();
    updateDisplay();
  }

  // --- Operator Highlight ---
  function highlightOperator(op) {
    clearOperatorHighlight();
    const actionMap = {
      add: 'btn-add',
      subtract: 'btn-subtract',
      multiply: 'btn-multiply',
      divide: 'btn-divide',
    };
    const btnId = actionMap[op];
    if (btnId) {
      document.getElementById(btnId).classList.add('active');
    }
  }

  function clearOperatorHighlight() {
    document.querySelectorAll('.btn-operator').forEach(function (btn) {
      btn.classList.remove('active');
    });
  }

  // --- Button Ripple Effect ---
  function addRippleEffect(e, btn) {
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--x', x + '%');
    btn.style.setProperty('--y', y + '%');
  }

  // --- Event Listeners using loop ---
  // Loop through all buttons and attach event listeners
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];

    btn.addEventListener('click', function (e) {
      addRippleEffect(e, btn);

      const number = btn.getAttribute('data-number');
      const action = btn.getAttribute('data-action');

      if (number !== null) {
        handleNumber(number);
        clearOperatorHighlight();
      } else if (action) {
        // Use if-else to route actions
        if (action === 'clear') {
          handleClear();
        } else if (action === 'sign') {
          handleSign();
        } else if (action === 'percent') {
          handlePercent();
        } else if (action === 'equals') {
          handleEquals();
        } else if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide') {
          handleOperator(action);
        }
      }
    });

    // Hover sound-like feedback via subtle scale
    btn.addEventListener('mousedown', function () {
      btn.style.transform = 'scale(0.95)';
    });

    btn.addEventListener('mouseup', function () {
      btn.style.transform = '';
    });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  }

  // --- Keyboard Support ---
  document.addEventListener('keydown', function (e) {
    const key = e.key;

    // Number keys 0-9
    if (key >= '0' && key <= '9') {
      handleNumber(key);
      clearOperatorHighlight();
      animateButton('btn-' + key);
    } else if (key === '.') {
      handleNumber('.');
      animateButton('btn-decimal');
    } else if (key === '+') {
      handleOperator('add');
      animateButton('btn-add');
    } else if (key === '-') {
      handleOperator('subtract');
      animateButton('btn-subtract');
    } else if (key === '*') {
      handleOperator('multiply');
      animateButton('btn-multiply');
    } else if (key === '/') {
      e.preventDefault();
      handleOperator('divide');
      animateButton('btn-divide');
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleEquals();
      animateButton('btn-equals');
    } else if (key === 'Escape' || key === 'Delete') {
      handleClear();
      animateButton('btn-clear');
    } else if (key === 'Backspace') {
      handleBackspace();
    } else if (key === '%') {
      handlePercent();
      animateButton('btn-percent');
    }
  });

  // --- Backspace ---
  function handleBackspace() {
    if (state.shouldResetScreen || state.currentInput === 'Error') {
      state.currentInput = '0';
      state.shouldResetScreen = false;
    } else if (state.currentInput.length > 1) {
      state.currentInput = state.currentInput.slice(0, -1);
    } else {
      state.currentInput = '0';
    }
    updateDisplay();
  }

  // --- Animate button press via keyboard ---
  function animateButton(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add('active-press');
    btn.style.transform = 'scale(0.93)';
    setTimeout(function () {
      btn.classList.remove('active-press');
      btn.style.transform = '';
    }, 120);
  }

  // --- Initial render ---
  updateDisplay();
})();
