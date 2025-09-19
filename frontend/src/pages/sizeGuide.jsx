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
  Tabs,
  Tab,
  Chip,
  Alert,
  Link,
} from "@mui/material";
import { useState } from "react";

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Size charts data
  const clothingSizes = [
    { size: "XS", chest: "32-34\"", waist: "26-28\"", hips: "34-36\"" },
    { size: "S", chest: "35-37\"", waist: "29-31\"", hips: "37-39\"" },
    { size: "M", chest: "38-40\"", waist: "32-34\"", hips: "40-42\"" },
    { size: "L", chest: "41-43\"", waist: "35-37\"", hips: "43-45\"" },
    { size: "XL", chest: "44-46\"", waist: "38-40\"", hips: "46-48\"" },
    { size: "XXL", chest: "47-49\"", waist: "41-43\"", hips: "49-51\"" },
  ];

  const shoeSizes = [
    { us: "6", uk: "5", eu: "39", inches: "9.5\"", cm: "24" },
    { us: "7", uk: "6", eu: "40", inches: "9.8\"", cm: "25" },
    { us: "8", uk: "7", eu: "41", inches: "10.2\"", cm: "26" },
    { us: "9", uk: "8", eu: "42", inches: "10.6\"", cm: "27" },
    { us: "10", uk: "9", eu: "43", inches: "11\"", cm: "28" },
    { us: "11", uk: "10", eu: "44", inches: "11.4\"", cm: "29" },
    { us: "12", uk: "11", eu: "45", inches: "11.8\"", cm: "30" },
  ];

  const kidsSizes = [
    { size: "2T", height: "34-35\"", chest: "21\"", waist: "20\"" },
    { size: "3T", height: "36-37\"", chest: "22\"", waist: "21\"" },
    { size: "4T", height: "38-39\"", chest: "23\"", waist: "22\"" },
    { size: "5", height: "40-41\"", chest: "24\"", waist: "23\"" },
    { size: "6", height: "42-43\"", chest: "25\"", waist: "24\"" },
    { size: "7", height: "44-45\"", chest: "26\"", waist: "25\"" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(236,72,153,0.15)",
          background: "#fff",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            color: "#ec4899",
            mb: 2,
            letterSpacing: 0.5,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Size Guide
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Find your perfect fit with our comprehensive size guide
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Important:</strong> Sizes may vary between brands and styles. 
            Always refer to the specific product's size chart when available. 
            When in doubt, choose the larger size as our items generally fit true to size.
          </Typography>
        </Alert>

        <Box sx={{ mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Clothing" />
            <Tab label="Shoes" />
            <Tab label="Kids" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Women's Clothing Size Chart
            </Typography>
            
            <TableContainer sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Size</strong></TableCell>
                    <TableCell><strong>Chest/Bust (inches)</strong></TableCell>
                    <TableCell><strong>Waist (inches)</strong></TableCell>
                    <TableCell><strong>Hips (inches)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clothingSizes.map((row, index) => (
                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell component="th" scope="row">
                        <Chip label={row.size} color={row.size === "M" ? "primary" : "default"} />
                      </TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                      <TableCell>{row.hips}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, mt: 4 }}>
              Men's Clothing Size Chart
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Size</strong></TableCell>
                    <TableCell><strong>Chest (inches)</strong></TableCell>
                    <TableCell><strong>Waist (inches)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { size: "S", chest: "35-37\"", waist: "29-31\"" },
                    { size: "M", chest: "38-40\"", waist: "32-34\"" },
                    { size: "L", chest: "41-43\"", waist: "35-37\"" },
                    { size: "XL", chest: "44-46\"", waist: "38-40\"" },
                    { size: "XXL", chest: "47-49\"", waist: "41-43\"" },
                  ].map((row, index) => (
                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell component="th" scope="row">
                        <Chip label={row.size} color={row.size === "M" ? "primary" : "default"} />
                      </TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Shoe Size Chart
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>US Size</strong></TableCell>
                    <TableCell><strong>UK Size</strong></TableCell>
                    <TableCell><strong>EU Size</strong></TableCell>
                    <TableCell><strong>Foot Length (inches)</strong></TableCell>
                    <TableCell><strong>Foot Length (cm)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shoeSizes.map((row, index) => (
                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell component="th" scope="row">
                        <Chip label={row.us} color={row.us === "9" ? "primary" : "default"} />
                      </TableCell>
                      <TableCell>{row.uk}</TableCell>
                      <TableCell>{row.eu}</TableCell>
                      <TableCell>{row.inches}</TableCell>
                      <TableCell>{row.cm}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 4, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                How to Measure Your Feet
              </Typography>
              <ol>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Place a piece of paper on the floor against a wall
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Stand on the paper with your heel against the wall and weight evenly distributed
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Have someone mark the longest part of your foot on the paper
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Measure from the wall to the marking to get your foot length
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Compare your measurement to the chart above
                  </Typography>
                </li>
              </ol>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Kids' Clothing Size Chart
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Size</strong></TableCell>
                    <TableCell><strong>Height (inches)</strong></TableCell>
                    <TableCell><strong>Chest (inches)</strong></TableCell>
                    <TableCell><strong>Waist (inches)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kidsSizes.map((row, index) => (
                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell component="th" scope="row">
                        <Chip label={row.size} />
                      </TableCell>
                      <TableCell>{row.height}</TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 4, p: 3, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#f57c00' }}>
                Kids' Sizing Tips
              </Typography>
              <ul>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Children grow quickly - consider sizing up for extended wear
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Check the specific product's size chart as kids' sizes can vary between brands
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    For infants (0-24 months), sizes are typically based on age and weight
                  </Typography>
                </li>
                <li>
                  <Typography variant="body1">
                    Toddlers (2T-5T) sizes are designed to fit with diapers
                  </Typography>
                </li>
              </ul>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 6, p: 3, bgcolor: '#f0f8ff', borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Need Help Finding Your Size?
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            If you're unsure about your size or need assistance, our customer support team is here to help:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2">Email Support</Typography>
              <Link href="mailto:support@nexusmart.com">support@nexusmart.com</Link>
            </Box>
            <Box>
              <Typography variant="subtitle2">Phone Support</Typography>
              <Link href="tel:+18001234567">1-800-NEXUS-MART</Link>
            </Box>
            <Box>
              <Typography variant="subtitle2">Live Chat</Typography>
              <Link href="/support/chat">Start a live chat</Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SizeGuide;