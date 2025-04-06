import {
  CssBaseline,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Toolbar,
  Typography,
  useMediaQuery,
  Button,
  Box,
  AppBar,
  Container,
  Drawer,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("退出登录失败:", error.message);
    }
  };

  const menuItems = [
    { text: "仪表盘", icon: <DashboardIcon />, path: "/" },
    { text: "记录数据", icon: <AddCircleIcon />, path: "/record" },
    { text: "历史记录", icon: <HistoryIcon />, path: "/history" },
    { text: "AI助手", icon: <SmartToyIcon />, path: "/deepseek" },
  ];

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // 如果用户未登录，不显示布局
  if (!user) {
    return children;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ background: "linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)" }}
      >
        <Toolbar sx={{ py: { xs: 0.5, sm: 1 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              mr: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
            }}
          >
            减肥记录助手
          </Typography>
          {user && (
            <Button
              color="inherit"
              onClick={handleSignOut}
              sx={{
                borderRadius: 4,
                px: 2,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              退出
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            pt: 2,
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              减肥记录助手
            </Typography>
          </Box>
          <List sx={{ px: 2 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(33, 150, 243, 0.2)",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                    "& .MuiListItemText-primary": {
                      color: "primary.main",
                      fontWeight: "bold",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight:
                      location.pathname === item.path ? "bold" : "regular",
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <List sx={{ px: 2 }}>
            <ListItem
              button
              onClick={handleSignOut}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="退出登录"
                primaryTypographyProps={{
                  color: "error.main",
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Container
        component="main"
        sx={{ flexGrow: 1, py: 3, px: { xs: 1, sm: 2, md: 3 } }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
