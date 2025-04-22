// Modern theme configuration for Ant Design
const themeConfig = {
  token: {
    // Color system
    colorPrimary: '#5c6ac4', // Modern indigo as primary color
    colorSuccess: '#10b981', // Modern green
    colorWarning: '#f59e0b', // Modern amber
    colorError: '#ef4444',   // Modern red
    colorInfo: '#3b82f6',    // Modern blue
    
    // Border radius
    borderRadius: 10, // Increased border radius for more rounded look
    
    // Font family
    fontFamily: '"Raleway", sans-serif',
    
    // Sizing and spacing
    sizeUnit: 4,
    sizeStep: 4,
    
    // Box shadow
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 8px 16px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Button: {
      borderRadius: 8,
      paddingInline: 18,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      // Additional styling for hover state will be in CSS
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Modal: {
      borderRadius: 16,
    },
    Dropdown: {
      borderRadius: 12,
    },
    Tag: {
      borderRadius: 16,
    },
    Table: {
      borderRadius: 12,
    },
    Tabs: {
      inkBarColor: '#5c6ac4',
    },
  },
};

export default themeConfig;