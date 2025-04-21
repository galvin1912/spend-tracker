# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Models Overview

### User Model
- **Attributes**: email, password, fullName, gender, groups, timestamps
- Manages authentication and personal information
- Can own/join multiple groups
- Tracks created/joined groups through Redux store

### Group Model
- **Attributes**: groupName, description, color, owner, members, timestamps
- Enables collaborative financial tracking
- Each group has a unique color for visual identification
- Members can add/edit transactions and categories
- Supports group analytics through charts and statistics
- Can create budget for each group

### Tracker Model
- **Attributes**: transactions, categories, group association, timestamps
- Core financial tracking entity within a group
- **Transaction Types**:
  - Income: Positive financial entries
  - Expense: Negative financial entries
- **Category System**:
  - Customizable categories with color coding
  - Supports filtering and categorical analysis
- Provides time-based filtering (daily, monthly, yearly)

Currently, two official plugins are available:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
