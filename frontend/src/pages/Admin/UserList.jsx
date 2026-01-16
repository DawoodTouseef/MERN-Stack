import { useEffect, useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { DataGrid } from '@mui/x-data-grid';

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
import {
  CheckCircle,
  Cancel,
  VerifiedUser,
  Warning,
  ExpandMore,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  AccessTime,
  ShoppingCart,
  Favorite,
  Visibility,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Verified as VerifiedIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme as useMuiTheme } from "@mui/material/styles";

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

  const [updateUser] = useUpdateUserMutation();
  const [verificationDialog, setVerificationDialog] = useState({ open: false, user: null, action: '' });
  const [userDetailDialog, setUserDetailDialog] = useState({ open: false, user: null });
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, user: null });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: '',
    status: ''
  });

  const theme = useMuiTheme();

  useEffect(() => {
    refetch();
  }, [refetch, searchTerm, roleFilter, statusFilter, sortBy, sortOrder, page, limit]);

  const openEditDialog = (user) => {
    setEditDialog({ open: true, user });
    setEditFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'customer',
      status: user.status || 'active'
    });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, user: null });
  };

  const openDeleteConfirmDialog = (user) => {
    setDeleteConfirmDialog({ open: true, user });
  };

  const closeDeleteConfirmDialog = () => {
    setDeleteConfirmDialog({ open: false, user: null });
  };

  const deleteHandler = async () => {
    const user = deleteConfirmDialog.user;
    if (!user) return;

    try {
      await deleteUser(user._id).unwrap();
      toast.success(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} deleted successfully`);
      refetch();
      closeDeleteConfirmDialog();
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to delete user");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId: editDialog.user._id, ...editFormData }).unwrap();
      toast.success("User updated successfully");
      refetch();
      closeEditDialog();
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to update user");
    }
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
        toast.warning('Vendor rejected and account deactivated.');
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

  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : 'N/A';
  };

  const columns = [
    {
      field: 'username',
      headerName: 'User',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, color: "#fff", width: 40, height: 40 }}>
            {params.row.username?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {params.row.username}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => {
        const role = params.value?.toLowerCase();
        let color = 'default';
        if (role === 'admin') color = 'error';
        else if (role === 'vendor') color = 'primary';
        else if (role === 'seller') color = 'secondary';
        else if (role === 'customer') color = 'info';

        return (
          <Chip
            label={role?.toUpperCase()}
            size="small"
            color={color}
            variant="outlined"
            sx={{ fontWeight: 600, borderRadius: 1.5 }}
          />
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value?.toUpperCase() || 'ACTIVE'}
          size="small"
          color={
            params.value === 'active' ? 'success' :
              params.value === 'inactive' ? 'warning' : 'error'
          }
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'verification',
      headerName: 'Verification',
      width: 160,
      renderCell: (params) => {
        if (params.row.role !== 'vendor') return "--";
        const isVerified = params.row.vendorVerified;
        return (
          <Chip
            icon={isVerified ? <VerifiedUser sx={{ width: 14, height: 14 }} /> : <Warning sx={{ width: 14, height: 14 }} />}
            label={isVerified ? "Verified" : "Pending"}
            size="small"
            color={isVerified ? "success" : "warning"}
            variant="soft"
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Joined Date',
      width: 180,
      valueGetter: (params) => formatDate(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => openUserDetailDialog(params.row)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => openEditDialog(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {params.row.role === 'vendor' && !params.row.vendorVerified && (
            <>
              <Tooltip title="Verify Vendor">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => openVerificationDialog(params.row, 'verify')}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject Vendor">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => openVerificationDialog(params.row, 'reject')}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          {params.row.role !== 'admin' && (
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                color="error"
                onClick={() => openDeleteConfirmDialog(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )
    }
  ];

  return (
    <DocumentTitle title="User Management | Nexus Mart">
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 6, px: { xs: 1, md: 4 } }}>
        <Fade in>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: "#fff" }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800} color="text.primary">
                  User Intelligence
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage platform members, verify vendors, and audit account statuses
                </Typography>
              </Box>
            </Box>

            {/* Filters Section */}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f1f5f9', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search by name, email, or ID..."
                    size="small"
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />,
                      sx: { borderRadius: 2, bgcolor: 'white' }
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Role</InputLabel>
                    <Select value={roleFilter} label="Role" onChange={handleRoleFilterChange} sx={{ borderRadius: 2, bgcolor: 'white' }}>
                      <MenuItem value="all">All Roles</MenuItem>
                      <MenuItem value="customer">Customer</MenuItem>
                      <MenuItem value="vendor">Vendor</MenuItem>
                      <MenuItem value="seller">Seller</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange} sx={{ borderRadius: 2, bgcolor: 'white' }}>
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="banned">Banned</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="text"
                    startIcon={<FaFilter />}
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("all");
                      setStatusFilter("all");
                      setPage(1);
                    }}
                  >
                    Reset Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* DataGrid Implementation */}
            <Box sx={{ height: 650, width: '100%', '& .MuiDataGrid-root': { border: 'none' } }}>
              {error ? (
                <Alert severity="error" sx={{ mx: 'auto', mt: 4, maxWidth: 600 }}>
                  {error?.data?.message || "Failed to load user data. Please try again later."}
                </Alert>
              ) : (
                <DataGrid
                  rows={users}
                  columns={columns}
                  getRowId={(row) => row._id}
                  paginationMode="server"
                  rowCount={pagination.totalUsers || 0}
                  loading={isLoading}
                  page={page - 1}
                  pageSize={limit}
                  onPageChange={(newPage) => setPage(newPage + 1)}
                  onPageSizeChange={(newSize) => setLimit(newSize)}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  disableSelectionOnClick
                  density="comfortable"
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      bgcolor: '#f8fafc',
                      color: '#475569',
                      fontWeight: 700,
                      borderBottom: '1px solid #e2e8f0',
                    },
                    '& .MuiDataGrid-row': {
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': { bgcolor: '#f1f5f9' },
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid #e2e8f0',
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
        </Fade>

        {/* Edit User Dialog */}
        <Dialog open={editDialog.open} onClose={closeEditDialog} maxWidth="xs" fullWidth>
          <form onSubmit={handleEditSubmit}>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Edit Member Profile</Typography>
              <Typography variant="caption" color="text.secondary">ID: {editDialog.user?._id}</Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Account Role</InputLabel>
                  <Select
                    label="Account Role"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="vendor">Vendor</MenuItem>
                    <MenuItem value="seller">Seller</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    label="Account Status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={closeEditDialog}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>Save Changes</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmDialog.open} onClose={closeDeleteConfirmDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <DeleteForeverIcon /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to permanently delete <strong>{deleteConfirmDialog.user?.username}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action is irreversible. All associated data will be purged.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDeleteConfirmDialog}>Dismiss</Button>
            <Button onClick={deleteHandler} variant="contained" color="error" sx={{ borderRadius: 2 }}>
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Verification Confirmation Dialog */}
        <Dialog open={verificationDialog.open} onClose={closeVerificationDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {verificationDialog.action === 'verify' ? 'Approve Vendor Documents' : 'Reject Vendor Application'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.soft", color: "primary.main", border: '2px solid' }}>
                  {verificationDialog.user?.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>{verificationDialog.user?.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{verificationDialog.user?.email}</Typography>
                </Box>
              </Box>

              <Alert severity={verificationDialog.action === 'verify' ? "info" : "warning"} icon={<InfoIcon />}>
                {verificationDialog.action === 'verify'
                  ? "Verifying this vendor will grant them permission to publish and sell products on the marketplace."
                  : "Rejecting this application will restrict vendor privileges and deactivate the account."}
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={closeVerificationDialog}>Cancel</Button>
            <Button
              onClick={handleVerificationAction}
              variant="contained"
              color={verificationDialog.action === 'verify' ? 'success' : 'error'}
              startIcon={verificationDialog.action === 'verify' ? <CheckCircle /> : <Cancel />}
              sx={{ borderRadius: 2 }}
            >
              {verificationDialog.action === 'verify' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Detail Dialog */}
        <Dialog open={userDetailDialog.open} onClose={closeUserDetailDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>Member Intelligence Report</Typography>
              <Chip label={userDetailDialog.user?.role?.toUpperCase()} color="primary" variant="soft" />
            </Box>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#f8fafc', p: 3 }}>
            {userDetailDialog.user && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', borderRadius: 3 }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32 }}>
                        {userDetailDialog.user.username?.charAt(0)}
                      </Avatar>
                      <Typography variant="h6" fontWeight={700}>{userDetailDialog.user.username}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>{userDetailDialog.user.email}</Typography>
                      <Chip
                        label={userDetailDialog.user.status?.toUpperCase()}
                        size="small"
                        color={userDetailDialog.user.status === 'active' ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                    <Divider />
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Email fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary="Email" secondary={userDetailDialog.user.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary="Phone" secondary={userDetailDialog.user.phone || 'N/A'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarToday fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary="Joined" secondary={formatDate(userDetailDialog.user.createdAt)} />
                      </ListItem>
                    </List>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    {/* Security & Access */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedIcon color="primary" fontSize="small" /> Security & Access Control
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Account Verification</Typography>
                          <Typography variant="body2">{userDetailDialog.user.emailVerified ? 'Verified' : 'Pending'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Two-Factor Auth</Typography>
                          <Typography variant="body2">{userDetailDialog.user.twoFactorEnabled ? 'Active' : 'Disabled'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Login Failures</Typography>
                          <Typography variant="body2" color={userDetailDialog.user.loginAttempts > 3 ? 'error.main' : 'inherit'}>
                            {userDetailDialog.user.loginAttempts || 0} Attempts
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Last System Entry</Typography>
                          <Typography variant="body2">{userDetailDialog.user.lastLoginAt ? formatDate(userDetailDialog.user.lastLoginAt) : 'None Recorded'}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Behavior Analytics */}
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCart color="primary" fontSize="small" /> Marketplace Activity
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Wishlist</Typography>
                          <Typography variant="body1" fontWeight={600}>{userDetailDialog.user.wishlist?.length || 0} Items</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Session Count</Typography>
                          <Typography variant="body1" fontWeight={600}>{userDetailDialog.user.behaviorData?.sessionData?.sessionCount || 0}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Cart Abandons</Typography>
                          <Typography variant="body1" fontWeight={600} color="warning.main">{userDetailDialog.user.behaviorData?.sessionData?.cartAbandonmentCount || 0}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Address Registry */}
                    {userDetailDialog.user.addresses?.length > 0 && (
                      <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" /> Address Registry
                        </Typography>
                        {userDetailDialog.user.addresses.map((addr, idx) => (
                          <Box key={idx} sx={{ mb: 2, p: 1, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600}>{addr.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                            </Typography>
                            {addr.isDefault && <Chip label="Default Shipping" size="small" variant="soft" color="primary" sx={{ mt: 0.5 }} />}
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={closeUserDetailDialog} variant="contained" disableElevation>Close Report</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DocumentTitle>
  );
};

export default UserList;