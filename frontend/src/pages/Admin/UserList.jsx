import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
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
  TextField
} from "@mui/material";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  console.log(users)
  const [deleteUser] = useDeleteUserMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

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
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    try {
      await updateUser({
        userId: id,
        username: editableUserName,
        email: editableUserEmail,
      });
      setEditableUserId(null);
      refetch();
      toast.success("User updated");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const cancelEdit = () => {
    setEditableUserId(null);
    setEditableUserName("");
    setEditableUserEmail("");
  };

  return (
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
            maxWidth: 1100,
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
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
              <Loader />
            </Box>
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Avatar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
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
                        },
                      }}
                    >
                      <TableCell>
                        <Avatar sx={{ bgcolor: "#6366f1", color: "#fff" }}>
                          {user.username?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar>
                      </TableCell>
                      <TableCell>{user._id}</TableCell>
                      <TableCell>
                        {editableUserId === user._id ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <TextField
                              size="small"
                              value={editableUserName}
                              onChange={(e) => setEditableUserName(e.target.value)}
                              sx={{ width: 120 }}
                            />
                            <IconButton
                              color="success"
                              onClick={() => updateHandler(user._id)}
                              size="small"
                            >
                              <FaCheck />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={cancelEdit}
                              size="small"
                            >
                              <FaTimes />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span>{user.username}</span>
                            <Tooltip title="Edit Name">
                              <IconButton
                                onClick={() =>
                                  toggleEdit(user._id, user.username, user.email)
                                }
                                size="small"
                                color="primary"
                              >
                                <FaEdit />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {editableUserId === user._id ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <TextField
                              size="small"
                              value={editableUserEmail}
                              onChange={(e) => setEditableUserEmail(e.target.value)}
                              sx={{ width: 180 }}
                            />
                            <IconButton
                              color="success"
                              onClick={() => updateHandler(user._id)}
                              size="small"
                            >
                              <FaCheck />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={cancelEdit}
                              size="small"
                            >
                              <FaTimes />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <a href={`mailto:${user.email}`}>{user.email}</a>
                            <Tooltip title="Edit Email">
                              <IconButton
                                onClick={() =>
                                  toggleEdit(user._id, user.username, user.email)
                                }
                                size="small"
                                color="primary"
                              >
                                <FaEdit />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role==="admin" ? (
                          <Chip label="Admin" color="success" size="small" />
                        ) : (
                          <Chip label={user.role.toUpperCase()} color="info" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {user.role!=="admin" && (
                          <Tooltip title="Delete User">
                            <IconButton
                              onClick={() => deleteHandler(user)}
                              color="error"
                              size="small"
                            >
                              <FaTrash />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default UserList;