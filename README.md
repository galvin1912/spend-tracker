# GST - Group Spend Tracker

A collaborative expense tracking application built with React, Firebase, and Ant Design. This application allows users to create groups, track expenses and income, and analyze spending patterns over time.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Group Management**: Create, join, and manage expense tracking groups
- **Transaction Tracking**: Record and categorize income and expenses
- **Budgeting**: Set and monitor monthly budgets for groups
- **Analytics**: Visualize spending patterns with charts and statistics
- **Internationalization**: Full support for English and Vietnamese

## Development Setup

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v7.0.0 or higher)
- Firebase account (for emulators)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/spend-tracker.git
cd spend-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```
# Create a .env file in the root directory with your Firebase configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Running Development Server

Start the development server with Firebase emulators:
```bash
npm run dev
```

This will:
- Launch the Vite development server
- Start Firebase emulators for authentication, Firestore, and storage
- Import existing emulator data (if available)
- Export emulator data when shutting down

Access the application at http://localhost:5173

### Firebase Emulators

The application uses Firebase emulators during development:
- Authentication: http://localhost:9099
- Firestore: http://localhost:8080
- Storage: http://localhost:9199

## Building for Production

1. Create a production build
```bash
npm run build
```

2. Preview the production build locally
```bash
npm run preview
```

3. Deploy to Firebase Hosting (if configured)
```bash
firebase deploy
```

## Project Structure

```
spend-tracker/
├── firebase.json            # Firebase configuration
├── index.html               # HTML entry point
├── package.json             # Project dependencies
├── vite.config.js           # Vite configuration
├── public/                  # Static assets
│   ├── favicon/             # Favicon files
│   └── fonts/               # Font files
└── src/
    ├── App.jsx              # Root component
    ├── index.css            # Global styles
    ├── main.jsx             # Application entry point
    ├── routes.jsx           # Route definitions
    ├── assets/              # Images and other assets
    ├── components/          # Reusable components
    │   ├── common/          # Utility components
    │   ├── layouts/         # Layout components
    │   └── pages/           # Page-specific components
    ├── configs/             # Configuration files
    ├── features/            # Redux feature modules
    │   ├── group/           # Group-related redux
    │   ├── language/        # Language-related redux
    │   ├── tracker/         # Tracker-related redux
    │   └── user/            # User-related redux
    ├── hooks/               # Custom React hooks
    ├── i18n/                # Internationalization
    │   ├── index.js         # i18n setup
    │   └── locales/         # Translation files
    ├── locale/              # Ant Design localization
    ├── pages/               # Page components
    ├── services/            # Firebase service interactions
    ├── store/               # Redux store setup
    ├── theme/               # UI theme configuration
    └── utils/               # Utility functions
```

## Data Models

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

## Code Conventions

### File Naming
- React components: PascalCase (e.g., `Header.jsx`)
- Utility files: camelCase (e.g., `numberUtils.js`)
- CSS/SCSS: hyphen-case (e.g., `main-styles.css`)

### React Components
- Use functional components with hooks
- Split large components into smaller, focused components
- Use the `memo()` function for performance optimization when appropriate
- Export components as default when they are the main export of a file

### State Management
- Use Redux for global state management
- Use React hooks (`useState`, `useReducer`) for local component state
- Follow the Redux Toolkit pattern: actions, reducers, and selectors

### Internationalization
- All user-facing strings must be internationalized using the `t()` function
- Add new strings to both English and Vietnamese translation files
- Use interpolation for dynamic content: `t('welcomeMessage', { name: user.name })`

### Styling
- Use CSS-in-JS via Ant Design's styling system for component styles
- Use CSS variables for theme colors and spacing
- Maintain responsive design across all components

### Best Practices
- Add PropTypes for all components that accept props
- Write meaningful comments for complex logic
- Create reusable utility functions for repeated logic
- Use asynchronous functions for API calls and data fetching

## Contributing

1. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit with descriptive messages
```bash
git commit -m "Add feature: your feature description"
```

3. Push your branch and create a pull request
```bash
git push origin feature/your-feature-name
```

## License

MIT License
