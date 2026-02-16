import { Paper, Typography, Table, TableBody, TableRow, TableCell } from "@mui/material";

const ProductSpecifications = ({ specifications }) => {
    if (!specifications || Object.keys(specifications).length === 0) return null;

    return (
        <Paper
            sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                bgcolor: "#fafafa",
                boxShadow: "0 2px 12px #ec489933",
            }}
        >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Specifications
            </Typography>
            <Table>
                <TableBody>
                    {Object.entries(specifications).map(
                        ([key, value]) => (
                            <TableRow key={key}>
                                <TableCell
                                    sx={{
                                        fontWeight: "bold",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {key}
                                </TableCell>
                                <TableCell>{value}</TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default ProductSpecifications;
