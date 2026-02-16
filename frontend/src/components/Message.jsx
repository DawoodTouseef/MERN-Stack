import { Alert, AlertTitle, Box } from '@mui/material';

const Message = ({ variant, children }) => {
  const getSeverity = () => {
    switch (variant) {
      case "success":
        return "success";
      case "error":
      case "danger":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <Box sx={{ my: 2, width: '100%' }}>
      <Alert
        severity={getSeverity()}
        variant="outlined"
        sx={{
          borderRadius: 3,
          fontWeight: 500,
          borderWidth: '2px',
          '& .MuiAlert-icon': {
            fontSize: '1.5rem'
          }
        }}
      >
        {children}
      </Alert>
    </Box>
  );
};

export default Message;