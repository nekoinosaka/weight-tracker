import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/common/Layout";
import theme from "./theme";


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;