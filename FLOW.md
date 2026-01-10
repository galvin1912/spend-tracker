# Group Spend Tracker (GST) Development Guidelines

This document outlines the structure, code flow, and naming conventions for the GST project.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Code Flow for New Features](#code-flow-for-new-features)
3. [Naming Conventions](#naming-conventions)
4. [Component Structure](#component-structure)
5. [Page Structure](#page-structure)
6. [Redux Setup](#redux-setup)
7. [Service Layer](#service-layer)

## Project Structure

The GST project follows a feature-based directory structure:

```
src/
├── assets/             # Images and static assets
├── components/         # Reusable UI components
│   ├── common/         # Shared components used throughout the app
│   ├── layouts/        # Layout components (headers, footers, etc.)
│   └── pages/          # Feature-specific components organized by feature
├── configs/            # Configuration files (Firebase, etc.)
├── features/           # Redux state management organized by feature
│   ├── group/          # Group feature state
│   ├── tracker/        # Tracker feature state
│   └── user/           # User/auth state
├── hooks/              # Custom React hooks
├── pages/              # Page components (one per route)
├── services/           # API and business logic services
├── store/              # Redux store configuration
├── theme/              # UI theme configuration
└── utils/              # Utility functions
```

### Adding a New Feature

When adding a new feature to the GST application, follow this structure:

```
src/
├── features/
│   └── newFeature/           # Redux state management for the new feature
│       ├── newFeatureActions.js
│       ├── newFeatureConstants.js
│       ├── newFeatureReducer.js
│       └── index.js          # Export relevant elements
├── pages/
│   └── NewFeaturePage.jsx    # Main page component(s) for the feature
├── components/
│   └── pages/
│       └── NewFeature/       # Feature-specific components
│           ├── FeatureComponent1.jsx
│           ├── FeatureComponent2.jsx
│           └── index.js      # Export components for easy imports
└── services/
    └── NewFeatureServices.js # API and business logic for the feature
```

## Code Flow for New Features

### 1. Planning
- Define the feature requirements and user stories
- Plan the data model and UI components needed
- Identify reusable components vs. feature-specific components

### 2. Implementation

#### Redux Setup
1. Define constants in `newFeatureConstants.js`
2. Create actions in `newFeatureActions.js`
3. Implement reducer in `newFeatureReducer.js`
4. Export and register the reducer in the store

#### Service Layer
1. Create Firebase/backend interactions in `NewFeatureServices.js`
2. Implement CRUD operations and business logic

#### Components & Pages
1. Create main page component(s) in `pages/NewFeaturePage.jsx`
2. Implement smaller UI components in `components/pages/NewFeature/`
3. Define routes in `routes.jsx`

### 3. Testing
- Test feature functionality
- Verify responsive design works across device sizes

### 4. Deployment
- Merge feature branch to main/development branch
- Deploy to staging environment
- Verify feature works in production environment

## Naming Conventions

### Files and Folders

- **React Components**: Use PascalCase
  - Page components: `NewFeaturePage.jsx`
  - UI components: `FeatureComponent.jsx`
  - Index files: `index.js` (lowercase)

- **Redux & Services**: Use camelCase for files
  - Actions: `newFeatureActions.js`
  - Constants: `newFeatureConstants.js`
  - Reducers: `newFeatureReducer.js`
  - Services: `NewFeatureServices.js` (PascalCase for class-based services)

- **Utility Files**: Use camelCase
  - `someUtil.js`
  - `helperFunction.js`

### Variables and Functions

- **Component Names**: PascalCase
  ```jsx
  const NewFeatureComponent = () => { /* ... */ };
  ```

- **Variables**: camelCase
  ```jsx
  const userData = { /* ... */ };
  const isLoading = true;
  ```

- **Constants**: UPPER_SNAKE_CASE (for Redux action types)
  ```js
  export const NEW_FEATURE_ACTION = "newFeature/action";
  ```

- **Props**: camelCase
  ```jsx
  <NewFeatureComponent featureName="example" isEnabled={true} />
  ```

- **Event Handlers**: Use `handle` prefix with camelCase
  ```jsx
  const handleSubmit = () => { /* ... */ };
  const handleInputChange = (e) => { /* ... */ };
  ```

- **Class Methods**: camelCase
  ```js
  class NewFeatureServices {
    static getFeatureData = async () => { /* ... */ };
    static updateFeature = async (id, data) => { /* ... */ };
  }
  ```

- **CSS Classes**: Use kebab-case for CSS classes, but camelCase when referenced in JS
  ```jsx
  <div className="feature-container">
  ```

## Component Structure

For new components, use this basic structure:

```jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Button, Typography } from "antd";
import PropTypes from "prop-types";

const FeatureComponent = ({ propName, anotherProp }) => {
  // Redux
  const dispatch = useDispatch();
  const stateData = useSelector(state => state.feature.data);
  
  // Local state
  const [localState, setLocalState] = useState(null);
  
  // Side effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleAction = () => {
    // Action logic
  };
  
  // Rendering logic
  return (
    <Card title="Tiêu đề tính năng">
      <Typography.Text>Mô tả tính năng</Typography.Text>
      <Button onClick={handleAction}>Thực hiện</Button>
    </Card>
  );
};

// PropTypes definition
FeatureComponent.propTypes = {
  propName: PropTypes.string.isRequired,
  anotherProp: PropTypes.number
};

export default FeatureComponent;
```

## Page Structure

For new pages, follow this structure:

```jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Row, Col, Typography, message } from "antd";
import FeatureComponent from "../components/pages/Feature/FeatureComponent";
import FeatureServices from "../services/FeatureServices";

const FeaturePage = () => {
  // State management
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await FeatureServices.getData();
        setData(response);
      } catch (error) {
        message.error(error.message || "Có lỗi xảy ra");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <>
      <Helmet
        title="Tiêu đề trang | GST"
        meta={[{ name: "description", content: "Mô tả trang" }]}
      />
      
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Typography.Title level={2}>Tiêu đề trang</Typography.Title>
        </Col>
        
        <Col span={24}>
          <FeatureComponent data={data} isLoading={isLoading} />
        </Col>
      </Row>
    </>
  );
};

export default FeaturePage;
```

## Redux Setup

### Constants

```js
// src/features/newFeature/newFeatureConstants.js
export const FEATURE_ACTION = "newFeature/action";
export const FEATURE_ACTION_SUCCESS = "newFeature/actionSuccess";
export const FEATURE_ACTION_FAILED = "newFeature/actionFailed";
```

### Actions

```js
// src/features/newFeature/newFeatureActions.js
import {
  FEATURE_ACTION,
  FEATURE_ACTION_SUCCESS,
  FEATURE_ACTION_FAILED
} from "./newFeatureConstants";
import FeatureServices from "../../services/FeatureServices";
import { message } from "antd";

export const performAction = (data) => async (dispatch) => {
  dispatch({ type: FEATURE_ACTION });

  try {
    const result = await FeatureServices.someMethod(data);
    dispatch({ type: FEATURE_ACTION_SUCCESS, payload: result });
    message.success("Thực hiện thành công");
    return result;
  } catch (error) {
    dispatch({ type: FEATURE_ACTION_FAILED });
    message.error(error.message || "Không thể thực hiện");
    throw error;
  }
};
```

### Reducer

```js
// src/features/newFeature/newFeatureReducer.js
import {
  FEATURE_ACTION,
  FEATURE_ACTION_SUCCESS,
  FEATURE_ACTION_FAILED
} from "./newFeatureConstants";

const initialState = {
  data: null,
  isLoading: false,
  error: null
};

const newFeatureReducer = (state = initialState, action) => {
  switch (action.type) {
    case FEATURE_ACTION:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case FEATURE_ACTION_SUCCESS:
      return {
        ...state,
        isLoading: false,
        data: action.payload
      };
    case FEATURE_ACTION_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default newFeatureReducer;
```

## Service Layer

```js
// src/services/FeatureServices.js
import { Timestamp, where, limit } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import store from "../store";

class FeatureServices {
  static getData = async (param) => {
    const { user } = store.getState().user;
    
    try {
      const data = await request("/collectionName", {
        method: "GET",
        queryConstraints: [where("field", "==", param), limit(10)]
      });
      
      return data;
    } catch (error) {
      console.error("Error in getData:", error);
      throw error;
    }
  };
  
  static createItem = async (itemData) => {
    try {
      const newItem = {
        ...itemData,
        createdAt: Timestamp.now(),
        updatedAt: null
      };
      
      const result = await request("/collectionName", {
        method: "POST",
        data: newItem
      });
      
      return result;
    } catch (error) {
      console.error("Error in createItem:", error);
      throw error;
    }
  };
}

export default FeatureServices;
```