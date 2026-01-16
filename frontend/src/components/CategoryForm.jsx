import {
  Box,
  TextField,
  Button,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";

const CategoryForm = ({
  value,
  setValue,
  description,
  setDescription,
  image,
  setImage,
  parent,
  setParent,
  isActive,
  setIsActive,
  categories = [],
  handleSubmit,
  buttonText = "Submit",
  handleDelete,
  disabled,
  isEdit = false,
}) => {
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <TextField
          label="Category Name"
          variant="outlined"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter category name"
          autoFocus={!isEdit}
          disabled={disabled}
          required
        />

        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter category description"
          disabled={disabled}
        />

        <TextField
          label="Image URL"
          variant="outlined"
          fullWidth
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disabled}
        />

        <FormControl fullWidth variant="outlined">
          <InputLabel>Parent Category</InputLabel>
          <Select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            label="Parent Category"
            disabled={disabled}
          >
            <MenuItem value="">
              <em>None (Top Level)</em>
            </MenuItem>
            {categories
              .filter((cat) => cat._id !== parent) // Don't allow self as parent
              .map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              color="primary"
              disabled={disabled}
            />
          }
          label={
            <Typography variant="body2" fontWeight={500}>
              {isActive ? "Status: Active" : "Status: Inactive"}
            </Typography>
          }
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
          {isEdit && handleDelete && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={disabled}
              sx={{ fontWeight: 600, px: 4, borderRadius: 2 }}
            >
              Delete Category
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            sx={{
              fontWeight: 700,
              px: 6,
              borderRadius: 2,
              background: "linear-gradient(45deg, #6366f1 30%, #ec4899 90%)",
              boxShadow: "0 3px 5px 2px rgba(99, 102, 241, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #4f46e5 30%, #db2777 90%)",
              }
            }}
          >
            {buttonText}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CategoryForm;
