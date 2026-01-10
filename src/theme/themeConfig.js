// Modern theme configuration for Ant Design - Warm Fintech Theme
const themeConfig = {
  token: {
    // Color system - Warm Fintech Palette
    colorPrimary: '#3F221D', // Primary dark brown
    colorSuccess: '#6F8F72', // Success green
    colorWarning: '#C98A4A', // Warning amber
    colorError: '#A84E3B',   // Destructive red
    colorInfo: '#C9A24D',     // Accent gold
    
    // Border radius
    borderRadius: 14, // Match --radius variable
    
    // Font family - Be Vietnam Pro for Vietnamese support
    fontFamily: '"Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    
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
      inkBarColor: '#3F221D',
    },
  },
};

export default themeConfig;