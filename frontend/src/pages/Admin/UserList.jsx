import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes, FaUserCheck, FaUserTimes, FaSearch, FaFilter } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useVerifyVendorMutation,
  useRejectVendorMutation,
  useGetUserDetailsQuery
} from "../../redux/api/usersApiSlice";
import DocumentTitle from "react-document-title";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Chip,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Pagination,
  Tabs,
  Tab,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import { CheckCircle, Cancel, VerifiedUser, Warning, ExpandMore, Email, Phone, LocationOn, CalendarToday, AccessTime, ShoppingCart, Favorite, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data, refetch, isLoading, error } = useGetUsersQuery({
    search: searchTerm,
    role: roleFilter,
    status: statusFilter,
    sortBy,
    sortOrder,
    page,
    limit
  });
  
  const users = data?.users || [];
  const pagination = data?.pagination || {};
  
  const [deleteUser] = useDeleteUserMutation();
  const [verifyVendor] = useVerifyVendorMutation();
  const [rejectVendor] = useRejectVendorMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  const [updateUser] = useUpdateUserMutation();
  const [verificationDialog, setVerificationDialog] = useState({ open: false, user: null, action: '' });
  const [userDetailDialog, setUserDetailDialog] = useState({ open: false, user: null });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch, searchTerm, roleFilter, statusFilter, sortBy, sortOrder, page, limit]);

  const deleteHandler = async (user) => {
    if (window.confirm("Are you sure you want to delete this "+user.role+"?")) {
      try {
        await deleteUser(user._id);
        refetch();
        toast.success("User deleted");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const toggleEdit = (id, username, email) => {
    // Admin cannot edit users - only view details
    // This function is kept for backward compatibility but won't allow editing
    toast.info("Admin cannot edit user details. View user information instead.");
  };

  const updateHandler = async (id) => {
    // Admin cannot edit users - only view details
    toast.info("Admin cannot edit user details. View user information instead.");
  };

  const cancelEdit = () => {
    setEditableUserId(null);
    setEditableUserName("");
    setEditableUserEmail("");
  };

  // Open verification confirmation dialog
  const openVerificationDialog = (user, action) => {
    setVerificationDialog({ open: true, user, action });
  };

  // Close verification confirmation dialog
  const closeVerificationDialog = () => {
    setVerificationDialog({ open: false, user: null, action: '' });
  };

  // Handle verification/rejection
  const handleVerificationAction = async () => {
    try {
      if (verificationDialog.action === 'verify') {
        await verifyVendor(verificationDialog.user._id).unwrap();
        toast.success('Vendor verified successfully!');
      } else if (verificationDialog.action === 'reject') {
        await rejectVendor(verificationDialog.user._id).unwrap();
        toast.success('Vendor rejected successfully!');
      }
      refetch();
      closeVerificationDialog();
    } catch (err) {
      toast.error(`Failed to ${verificationDialog.action} vendor: ` + (err.data?.message || 'Unknown error'));
    }
  };

  // Open user detail dialog
  const openUserDetailDialog = (user) => {
    setSelectedUser(user);
    setUserDetailDialog({ open: true, user });
  };

  // Close user detail dialog
  const closeUserDetailDialog = () => {
    setUserDetailDialog({ open: false, user: null });
    setSelectedUser(null);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  return (
    <DocumentTitle title="User Management | Nexus Mart">
      <Box
        sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3eeff 0%, #f3e7e9 100%)",
        py: 6,
        px: { xs: 1, md: 8 },
      }}
    >
      <Fade in>
        <Paper
          elevation={8}
          sx={{
            maxWidth: 1200,
            mx: "auto",
            p: { xs: 2, md: 5 },
            borderRadius: 4,
            bgcolor: "#fff",
            boxShadow: "0 8px 32px 0 rgba(99,102,241,0.10)",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
            sx={{
              mb: 3,
              letterSpacing: 1,
              textAlign: "center",
              textShadow: "2px 2px 8px #e3eeff",
            }}
          >
            User Management
          </Typography>
          
          {/* Search and Filter Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f7ff', borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Users"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    endAdornment: (
                      <IconButton>
                        <FaSearch />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={handleRoleFilterChange}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<FaFilter />}
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
              <Loader />
            </Box>
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Avatar</TableCell>
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer' }} 
                        onClick={() => handleSortChange('_id')}
                      >
                        ID {sortBy === '_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer' }} 
                        onClick={() => handleSortChange('username')}
                      >
                        Name {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer' }} 
                        onClick={() => handleSortChange('email')}
                      >
                        Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer' }} 
                        onClick={() => handleSortChange('role')}
                      >
                        Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer' }} 
                        onClick={() => handleSortChange('status')}
                      >
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell 
                        sx={{ fontWeight: 700, cursor: 'pointer' }} 
                        onClick={() => handleSortChange('createdAt')}
                      >
                        Created {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          "&:hover": {
                            background: "linear-gradient(90deg, #e3eeff 60%, #f3e7e9 100%)",
                            cursor: 'pointer'
                          },
                        }}
                        onClick={() => openUserDetailDialog(user)}
                      >
                        <TableCell>
                          <Avatar sx={{ bgcolor: "#6366f1", color: "#fff" }}>
                            {user.username?.charAt(0)?.toUpperCase() || "U"}
                          </Avatar>
                        </TableCell>
                        <TableCell>{user._id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span>{user.username}</span>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </TableCell>
                        <TableCell>
                          {user.role==="admin" ? (
                            <Chip label="Admin" color="success" size="small" />
                          ) : (
                            <Chip label={user.role.toUpperCase()} color="info" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role === "vendor" ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {user.vendorVerified ? (
                                <Chip 
                                  icon={<VerifiedUser sx={{ width: 12, height: 12 }} />}
                                  label="Verified" 
                                  color="success" 
                                  size="small" 
                                />
                              ) : (
                                <Chip 
                                  icon={<Warning sx={{ width: 12, height: 12 }} />}
                                  label="Pending" 
                                  color="warning" 
                                  size="small" 
                                />
                              )}
                            </Stack>
                          ) : (
                            <Chip 
                              label={user.status?.toUpperCase() || "ACTIVE"} 
                              color={user.status === "active" ? "success" : "default"} 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {user.role === "vendor" && !user.vendorVerified && (
                              <>
                                <Tooltip title="Verify Vendor">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openVerificationDialog(user, 'verify');
                                    }}
                                    color="success"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <FaUserCheck />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject Vendor">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openVerificationDialog(user, 'reject');
                                    }}
                                    color="error"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    <FaUserTimes />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {user.role!=="admin" && (
                              <Tooltip title="Delete User">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteHandler(user);
                                  }}
                                  color="error"
                                  size="small"
                                >
                                  <FaTrash />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={pagination.totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
              
              {users.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="textSecondary">
                    No users found matching your criteria
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Fade>

      {/* Verification Confirmation Dialog */}
      <Dialog open={verificationDialog.open} onClose={closeVerificationDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {verificationDialog.action === 'verify' ? 'Verify Vendor' : 'Reject Vendor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              {verificationDialog.action === 'verify' 
                ? `Are you sure you want to verify ${verificationDialog.user?.username}?` 
                : `Are you sure you want to reject ${verificationDialog.user?.username}? This will ${verificationDialog.action === 'reject' ? 'ban their account' : 'deactivate their account'}.`}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: "#6366f1", color: "#fff" }}>
                {verificationDialog.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {verificationDialog.user?.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {verificationDialog.user?.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label={verificationDialog.user?.role} 
                    size="small" 
                    color={verificationDialog.user?.role === 'admin' ? 'success' : verificationDialog.user?.role === 'vendor' ? 'info' : 'default'} 
                  />
                  <Chip 
                    label={verificationDialog.user?.status} 
                    size="small" 
                    color={
                      verificationDialog.user?.status === 'active' ? 'success' : 
                      verificationDialog.user?.status === 'inactive' ? 'warning' : 'error'
                    } 
                  />
                </Box>
              </Box>
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              {verificationDialog.action === 'verify' 
                ? 'This will activate the vendor account and allow them to list products for sale.'
                : 'This will ban the vendor account and prevent them from accessing the platform.'}
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVerificationDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleVerificationAction} 
            variant="contained"
            color={verificationDialog.action === 'verify' ? 'success' : 'error'}
            startIcon={verificationDialog.action === 'verify' ? <CheckCircle /> : <Cancel />}
          >
            {verificationDialog.action === 'verify' ? 'Verify Vendor' : 'Reject Vendor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog 
        open={userDetailDialog.open} 
        onClose={closeUserDetailDialog} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "#6366f1", color: "#fff", fontSize: 24 }}>
              {userDetailDialog.user?.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {userDetailDialog.user?.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {userDetailDialog.user?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {userDetailDialog.user && (
            <Box sx={{ py: 2 }}>
              {/* Basic Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Email color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Email" 
                            secondary={
                              <a href={`mailto:${userDetailDialog.user.email}`}>
                                {userDetailDialog.user.email}
                              </a>
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Phone color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Phone" 
                            secondary={userDetailDialog.user.phone || 'Not provided'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Created At" 
                            secondary={formatDate(userDetailDialog.user.createdAt)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccessTime color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Last Login" 
                            secondary={userDetailDialog.user.lastLoginAt ? formatDate(userDetailDialog.user.lastLoginAt) : 'Never'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Role and Status */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Role & Status
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Role" 
                            secondary={
                              <Chip 
                                label={userDetailDialog.user.role.toUpperCase()} 
                                color={
                                  userDetailDialog.user.role === 'admin' ? 'success' : 
                                  userDetailDialog.user.role === 'vendor' ? 'info' : 'default'
                                } 
                                size="small"
                              />
                            } 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Status" 
                            secondary={
                              <Chip 
                                label={userDetailDialog.user.status?.toUpperCase() || 'ACTIVE'} 
                                color={
                                  userDetailDialog.user.status === 'active' ? 'success' : 
                                  userDetailDialog.user.status === 'inactive' ? 'warning' : 'error'
                                } 
                                size="small"
                              />
                            } 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {userDetailDialog.user.role === 'vendor' && (
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Vendor Verification" 
                              secondary={
                                userDetailDialog.user.vendorVerified ? (
                                  <Chip 
                                    icon={<VerifiedUser />}
                                    label="Verified" 
                                    color="success" 
                                    size="small" 
                                  />
                                ) : (
                                  <Chip 
                                    icon={<Warning />}
                                    label="Not Verified" 
                                    color="warning" 
                                    size="small" 
                                  />
                                )
                              } 
                            />
                          </ListItem>
                        </List>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Addresses */}
              {userDetailDialog.user.addresses && userDetailDialog.user.addresses.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Addresses
                    </Typography>
                    <Grid container spacing={2}>
                      {userDetailDialog.user.addresses.map((address, index) => (
                        <Grid item xs={12} key={index}>
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography>
                                {address.fullName} - {address.addressLine1}
                                {address.isDefault && (
                                  <Chip 
                                    label="Default" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1 }} 
                                  />
                                )}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                <ListItem>
                                  <ListItemIcon>
                                    <LocationOn fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Address" 
                                    secondary={`${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`} 
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon>
                                    <Phone fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Phone" 
                                    secondary={address.phone || 'Not provided'} 
                                  />
                                </ListItem>
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Behavioral Data */}
              {userDetailDialog.user.behaviorData && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Behavioral Data
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Session Count" 
                              secondary={userDetailDialog.user.behaviorData.sessionData?.sessionCount || 0} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Wishlist Items" 
                              secondary={userDetailDialog.user.wishlist?.length || 0} 
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Recently Viewed" 
                              secondary={userDetailDialog.user.recentlyViewed?.length || 0} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Newsletter" 
                              secondary={userDetailDialog.user.newsletterSubscribed ? 'Subscribed' : 'Not subscribed'} 
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Cart Abandonment" 
                              secondary={userDetailDialog.user.behaviorData.sessionData?.cartAbandonmentCount || 0} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Login Attempts" 
                              secondary={userDetailDialog.user.loginAttempts || 0} 
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Security Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Security Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Email Verified" 
                            secondary={userDetailDialog.user.emailVerified ? 'Yes' : 'No'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="2FA Enabled" 
                            secondary={userDetailDialog.user.twoFactorEnabled ? 'Yes' : 'No'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Account Locked" 
                            secondary={userDetailDialog.user.isLocked ? 'Yes' : 'No'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Password Changed" 
                            secondary={userDetailDialog.user.passwordChangedAt ? formatDate(userDetailDialog.user.passwordChangedAt) : 'Never'} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUserDetailDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </DocumentTitle>
  );
};

export default UserList;