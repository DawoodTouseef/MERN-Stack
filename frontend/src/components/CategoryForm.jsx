import { Box, TextField, Button, Stack, Paper } from "@mui/material";

const CategoryForm = ({
  value,
  setValue,
  handleSubmit,
  buttonText = "Submit",
  handleDelete,
  disabled,
}) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            label="Category Name"
            variant="outlined"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write category name"
            autoFocus
            disabled={disabled}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={disabled}
              sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}
            >
              {buttonText}
            </Button>
            {handleDelete && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={disabled}
                sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}
              >
                Delete
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default CategoryForm;
