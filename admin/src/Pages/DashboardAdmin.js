import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Collapse, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
// One icon per nav group — child items are text under a rail, so the
// per-screen icons the flat menu used are no longer needed.
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArticleIcon from '@mui/icons-material/Article';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import PeopleIcon from '@mui/icons-material/People';
import ExtensionIcon from '@mui/icons-material/Extension';
import SettingsIcon from '@mui/icons-material/Settings';

import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/authContext';
import OrderNotifications from '../Components/OrderNotifications';

const drawerWidth = 280;
const collapsedDrawerWidth = 76;

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#37a6ff',
    },
    background: {
      default: '#f4f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5df transparent',
        },
        '*::-webkit-scrollbar': {
          width: 6,
          height: 6,
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#cbd5df',
          borderRadius: 999,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#9aa8b5',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#37a6ff',
          boxShadow: '0 2px 10px rgba(55, 166, 255, 0.2)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          overflowX: 'hidden',
        },
      },
    },
  },
});

// Sidebar navigation, grouped by the job being done rather than by which
// screen happens to exist. One group is open at a time so the list stays
// short; the group holding the current route opens itself.
const navGroups = [
  {
    id: 'catalog',
    label: 'Catalog',
    icon: <InventoryIcon />,
    items: [
      { name: 'Products (Jackets)', link: '/products' },
      { name: 'Sports & Spirit', link: '/sports-products' },
      { name: 'Fabric Colors', link: '/fabric-colors' },
      { name: 'Photo Gallery', link: '/gallery' },
      { name: 'Embroidery & Patches', link: '/patches' },
      { name: 'Reviews', link: '/reviews' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ListAltIcon />,
    items: [
      { name: 'Orders', link: '/orders' },
      { name: 'Bulk Order', link: '/bulkorder' },
      { name: 'Deleted Orders', link: '/deleted-orders' },
      { name: 'Shipping Rates', link: '/shipping-rates' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: <ArticleIcon />,
    items: [
      { name: 'Website', link: '/website' },
      { name: 'Blog', link: '/blogs' },
      { name: 'Features', link: '/features' },
      { name: 'Top Bar', link: '/top-bar' },
      { name: 'Storefront FAQs', link: '/storefront-faqs' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO & Analytics',
    icon: <TroubleshootIcon />,
    items: [
      { name: 'SEO Health', link: '/seo-health' },
      { name: 'Index Control', link: '/index-control' },
      { name: 'MetaData', link: '/metadata' },
      { name: 'Visitor Analytics', link: '/visitor-analytics' },
      { name: 'Insights', link: '/insights' },
      { name: 'Analytics Configuration', link: '/analytics-configuration' },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: <PeopleIcon />,
    items: [
      { name: 'Customer', link: '/users' },
      { name: 'Admin', link: '/admin' },
      { name: 'Subscribers', link: '/subscribers' },
    ],
  },
  {
    id: 'plugins',
    label: 'Jacket Options',
    icon: <ExtensionIcon />,
    items: [
      { name: 'Categories', link: '/category' },
      { name: 'Colors', link: '/colors' },
      { name: 'Collars', link: '/collar' },
      { name: 'Sleeves', link: '/sleeves' },
      { name: 'Closure', link: '/closure' },
      { name: 'Pockets', link: '/pockets' },
      { name: 'Linings', link: '/linings' },
      { name: 'Designs', link: '/design' },
      { name: 'Materials', link: '/material' },
      { name: 'Size', link: '/size' },
      { name: 'Fonts', link: '/fonts' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    items: [
      { name: 'Email Configuration', link: '/email-configuration' },
      { name: 'Payment Configuration', link: '/payment-configuration' },
      { name: 'Change Password', link: '/change-password' },
    ],
  },
];

const DashboardAdmin = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeDrawerWidth = sidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  // Detail routes like /orders/:id should still light up their parent.
  const isLinkActive = (link) =>
    location.pathname === link || location.pathname.startsWith(`${link}/`);

  const activeGroupId = navGroups.find((group) =>
    group.items.some((item) => isLinkActive(item.link))
  )?.id || null;

  // Keep the group containing the current page open, including on first load
  // and after navigating from somewhere else.
  useEffect(() => {
    if (activeGroupId) setOpenGroup(activeGroupId);
  }, [activeGroupId]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleGroupToggle = (groupId) => {
    // A collapsed rail has nowhere to show children — open up first.
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      setOpenGroup(groupId);
      return;
    }

    setOpenGroup((current) => (current === groupId ? null : groupId));
  };

  const handleSidebarCollapseToggle = () => {
    if (!sidebarCollapsed) {
      setOpenGroup(null);
    } else if (activeGroupId) {
      setOpenGroup(activeGroupId);
    }

    setSidebarCollapsed((value) => !value);
  };

  const drawerScrollbarSx = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#d2dbe5 transparent',
    '&::-webkit-scrollbar': {
      width: 4,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#d2dbe5',
      borderRadius: 999,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#9aa8b5',
    },
  };

  const drawerTextSx = (collapsed, typographySx = {}, extraSx = {}) => ({
    flex: collapsed ? '0 0 0px' : '1 1 auto',
    minWidth: 0,
    maxWidth: collapsed ? 0 : 220,
    opacity: collapsed ? 0 : 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
    transition: (theme) => theme.transitions.create(['max-width', 'opacity', 'transform'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    '& .MuiTypography-root': {
      whiteSpace: 'nowrap',
      ...typographySx,
    },
    ...extraSx,
  });

  const renderDrawer = (collapsed = false) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 2,
          transition: (theme) => theme.transitions.create(['padding'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#37a6ff',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxWidth: collapsed ? 36 : 180,
            transition: (theme) => theme.transitions.create(['max-width', 'opacity'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          {collapsed ? 'EJ' : 'EasyJackets'}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pb: 2, ...drawerScrollbarSx }}>
        {navGroups.map((group) => {
          const isOpen = !collapsed && openGroup === group.id;
          // A collapsed rail hides its children, so the group header itself has
          // to carry the active state — otherwise there is no cue at all.
          const holdsActive = activeGroupId === group.id;
          const highlight = holdsActive || isOpen;

          return (
            <Box key={group.id}>
              <Tooltip
                title={collapsed ? `${group.label} — ${group.items.length} items` : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleGroupToggle(group.id)}
                  sx={{
                    my: 0.3,
                    mx: 1,
                    px: collapsed ? 0 : 2,
                    py: 0.85,
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 2,
                    bgcolor: holdsActive && collapsed
                      ? 'rgba(55, 166, 255, 0.12)'
                      : isOpen ? 'rgba(55, 166, 255, 0.05)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(55, 166, 255, 0.08)' },
                    transition: (theme) => theme.transitions.create(['padding', 'background-color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                  }}
                >
                  <ListItemIcon sx={{
                    color: highlight ? '#1e88e5' : '#37a6ff',
                    minWidth: collapsed ? 0 : 46,
                    justifyContent: 'center',
                    transition: (theme) => theme.transitions.create(['color', 'min-width'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                  }}>
                    {group.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={group.label}
                    sx={drawerTextSx(
                      collapsed,
                      { fontSize: '0.95rem', fontWeight: highlight ? 700 : 500 },
                      { color: highlight ? '#1e88e5' : '#555' }
                    )}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      opacity: collapsed ? 0 : 1,
                      maxWidth: collapsed ? 0 : 24,
                      overflow: 'hidden',
                      transition: (theme) => theme.transitions.create(['opacity', 'max-width'], {
                        easing: theme.transitions.easing.easeInOut,
                        duration: theme.transitions.duration.standard,
                      }),
                    }}
                  >
                    {isOpen
                      ? <ExpandLess sx={{ color: '#37a6ff' }} />
                      : <ExpandMore sx={{ color: highlight ? '#37a6ff' : '#b0bec5' }} />}
                  </Box>
                </ListItemButton>
              </Tooltip>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ position: 'relative' }}>
                  {/* Rail tying the children back to their group header */}
                  <Box sx={{ position: 'absolute', left: 30, top: 4, bottom: 4, width: '2px', bgcolor: 'rgba(55,166,255,.16)' }} />
                  {group.items.map((item) => {
                    const isActive = isLinkActive(item.link);
                    return (
                      <Link
                        to={item.link}
                        key={item.link}
                        style={{ textDecoration: 'none', color: isActive ? '#1e88e5' : '#666' }}
                      >
                        <ListItemButton sx={{
                          pl: 5,
                          pr: 2,
                          ml: 1,
                          mr: 1,
                          py: 0.7,
                          minHeight: 36,
                          borderRadius: 2,
                          bgcolor: isActive ? 'rgba(55, 166, 255, 0.12)' : 'transparent',
                          '&:hover': {
                            bgcolor: isActive ? 'rgba(55, 166, 255, 0.18)' : 'rgba(55, 166, 255, 0.05)',
                            color: '#37a6ff',
                          },
                        }}>
                          <ListItemText
                            primary={item.name}
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#1e88e5' : 'inherit',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              },
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ px: collapsed ? 1 : 2, pb: 2 }}>
          <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
          <ListItemButton
            onClick={() => {
              sessionStorage.clear();
              logout();
              navigate('/')
            }}
            sx={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #37a6ff 0%, #1e88e5 100%)',
              borderRadius: 2,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 0 : 2,
              py: 1.2,
              '&:hover': {
                background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(55, 166, 255, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={drawerTextSx(collapsed, { fontWeight: 'bold' }, { color: 'white' })}
            />
          </ListItemButton>
          </Tooltip>
        </Box>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} arrow>
              <IconButton
                color="inherit"
                aria-label={sidebarCollapsed ? 'expand sidebar' : 'collapse sidebar'}
                onClick={handleSidebarCollapseToggle}
                sx={{ mr: 2, color: 'white', display: { xs: 'none', sm: 'inline-flex' } }}
              >
                {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
              Admin Dashboard
            </Typography>
            <OrderNotifications />
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: activeDrawerWidth,
            flexShrink: 0,
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            [`& .MuiDrawer-paper`]: {
              width: activeDrawerWidth,
              boxSizing: 'border-box',
              height: '100vh',
              overflow: 'hidden',
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            },
            display: { xs: 'none', sm: 'block' },
          }}
          open
        >
          {renderDrawer(sidebarCollapsed)}
        </Drawer>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            [`& .MuiDrawer-paper`]: {
              boxSizing: 'border-box',
              width: drawerWidth,
              height: '100vh',
              overflow: 'hidden'
            },
          }}
        >
          {renderDrawer(false)}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${activeDrawerWidth}px)` },
            minHeight: '100vh',
            bgcolor: '#f4f7fa',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5df transparent',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardAdmin;
