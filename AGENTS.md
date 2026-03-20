# TermIntel AI Rig - Agent Guidelines

## Overview
This document provides guidelines for agentic coding agents working on the TermIntel AI Rig project. It covers build/test commands, code style, and development practices.

## Project Structure
```
termintel-ai-rig/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   ├── entities/
│   ├── pages/
│   │   ├── CLIPage.js
│   │   ├── DashboardPage.js
│   │   └── TerminalPage.js
│   ├── styles/
│   │   ├── App.css
│   │   ├── DashboardPage.css
│   │   ├── TerminalPage.css
│   │   └── CLIPage.css
│   ├── utils/
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Development Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Runs the app in development mode at http://localhost:3000

### Production Build
```bash
npm run build
```
Builds the app for production to the `build` folder

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- src/components/__tests__/SpecificComponent.test.js

# Run tests with coverage
npm test -- --coverage
```

### Linting
```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint -- --fix
```

### Type Checking
```bash
npm run typecheck
```

## Code Style Guidelines

### JavaScript/React Standards
- Use ES6+ syntax (arrow functions, destructuring, spread/rest operators)
- Prefer functional components with hooks over class components
- Use const for variables that won't be reassigned, let for those that will
- Use template literals for string concatenation
- Use explicit returns in arrow functions for multiline logic

### Import Organization
1. React imports (react, react-dom, etc.)
2. Third-party libraries (react-router-dom, etc.)
3. Internal components and utilities
4. Styles and assets
5. Group related imports with blank lines

Example:
```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import CLIPage from './pages/CLIPage';
import DashboardPage from './pages/DashboardPage';
import './styles/App.css';
```

### Component Structure
- Functional components with hooks
- Early returns for conditional rendering
- Destructure props in function parameters
- Use meaningful variable names
- Separate concerns: logic vs presentation
- Custom hooks for reusable logic

Example:
```javascript
const DashboardPage = () => {
  const [endpoints, setEndpoints] = useState([]);
  
  // Logic first
  const handleAddEndpoint = () => {
    // implementation
  };
  
  // Then JSX
  return (
    <div className="dashboard-page">
      {/* JSX content */}
    </div>
  );
};
```

### Styling (CSS Modules/CSS)
- Use BEM-like naming conventions: `block__element--modifier`
- Use CSS variables for theme colors
- Mobile-first responsive design
- Keep styles scoped to components
- Use meaningful class names that describe purpose, not appearance

Example:
```css
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge--connected {
  background-color: #00ff88;
}
```

### State Management
- Use useState for local component state
- Consider useContext or state lifting for shared state
- Keep state minimal and normalized
- Use useEffect for side effects with proper cleanup
- Avoid mutating state directly

Example:
```javascript
useEffect(() => {
  const subscription = subscribeToData();
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, [dependency]);
```

### Error Handling
- Use try/catch for async operations
- Display user-friendly error messages
- Log errors for debugging
- Handle edge cases (empty states, loading states)
- Use error boundaries for React components (when implemented)

Example:
```javascript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw for handling upstream
  }
};
```

### Naming Conventions
- Components: PascalCase (MyComponent)
- Functions/variables: camelCase (myFunction)
- Constants: UPPER_SNAKE_CASE (MAX_ITEMS)
- Files: PascalCase for components (MyComponent.js), camelcase for utilities (utilityFunctions.js)
- CSS classes: kebab-case (dashboard-header)
- Events: camelCase (onClickHandler)

### Comments & Documentation
- Use JSDoc for complex functions
- Comment why, not what
- Keep comments up-to-date
- Use TODO comments with GitHub usernames for tracking
- Remove commented-out code

Example:
```javascript
/**
 * Validates AI endpoint configuration
 * @param {Object} endpoint - The endpoint to validate
 * @returns {boolean} True if valid
 * @throws {Error} If endpoint is invalid
 */
const validateEndpoint = (endpoint) => {
  // implementation
};
```

### Performance Considerations
- Use React.memo for expensive components
- Use useCallback/useMemo for expensive computations
- Virtualize long lists
- Lazy load routes and components
- Optimize images and assets
- Minimize re-renders with proper dependency arrays

### Testing Guidelines
- Write unit tests for utility functions and hooks
- Test component rendering and user interactions
- Mock API calls and external dependencies
- Test edge cases and error conditions
- Aim for meaningful coverage, not just line coverage
- Use React Testing Library for component tests
- Jest for mocking and assertions

Example test structure:
```javascript
describe('DashboardPage', () => {
  it('renders without crashing', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/AI Endpoint Manager/i)).toBeInTheDocument();
  });
  
  it('adds endpoint when form is submitted', () => {
    // test implementation
  });
});
```

### Git Practices
- Write descriptive commit messages
- Keep commits focused on single changes
- Pull before pushing to avoid conflicts
- Use feature branches for new work
- Tag releases appropriately

### Accessibility (a11y)
- Use semantic HTML elements
- Provide meaningful alt text for images
- Ensure proper color contrast
- Support keyboard navigation
- Use ARIA labels when necessary
- Test with screen readers

### Security Considerations
- Validate and sanitize user inputs
- Use HTTPS for API calls in production
- Store sensitive data securely (environment variables)
- Implement proper CORS policies
- Regularly update dependencies
- Avoid eval() and similar dangerous functions

### Environment Variables
- Store in .env file (not committed)
- Prefix with REACT_APP_ for React apps
- Never commit secrets to repository
- Use different configs for dev/staging/prod

Example:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

## Specific to This Project

### Terminal Implementation
- Commands should be validated before execution
- Simulate latency for realistic UX
- Handle command history properly
- Support common terminal shortcuts
- Provide clear error messages for invalid commands

### AI Endpoint Management
- Validate endpoint URLs and ports
- Test connections with timeouts
- Show appropriate loading states
- Support both local and online endpoints
- Store configurations securely

### CLI Features
- Swipe-down panels should be performant
- Pin/unpin should persist state
- Terminal renaming should be validated
- Multiple terminals should be isolated
- Command processing should be asynchronous

### Responsive Design
- Mobile-first breakpoint at 768px
- Secondary breakpoint at 480px
- Touch-friendly controls (minimum 48x48px)
- Consider viewport units for fluid typography
- Test on actual devices when possible

## Monitoring & Debugging
- Use React DevTools in development
- Implement proper logging levels
- Monitor performance with Lighthouse
- Track errors with error boundaries
- Consider adding analytics (respecting privacy)

## Future Considerations
- PWA implementation (service worker, manifest)
- Offline capabilities
- Dark/light theme support
- Internationalization (i18n)
- Accessibility audits
- Performance budgeting

## Troubleshooting Common Issues
1. **Port already in use**: Kill process on port or use different port
2. **Module not found**: Run npm install to restore dependencies
3. **Blank screen**: Check browser console for errors
4. **Styling issues**: Clear cache and hard refresh (Ctrl+F5)
5. **Test failures**: Update test snapshots if intentional, fix if regression

---
*Last updated: $(date)*
*This document should evolve with the project.*