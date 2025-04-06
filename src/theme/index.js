import { createTheme } from '@mui/material/styles';

// 创建自定义主题
const theme = createTheme({
  palette: {
    primary: {
      light: '#64b5f6', // 浅蓝色
      main: '#2196f3', // 主蓝色
      dark: '#1976d2', // 深蓝色
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"LeeeafHei", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          borderRadius: 8,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 20px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 10px 0 rgba(0,0,0,0.05)',
          background: 'linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)',
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          '& .MuiRating-iconFilled': {
            color: '#2196f3',
          },
        },
      },
    },
  },
});

export default theme;