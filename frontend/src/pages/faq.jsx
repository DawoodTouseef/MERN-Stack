import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  InputAdornment,
} from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { ExpandMore } from "@mui/icons-material";
import { APP_NAME } from "../redux/constants";

const Faq = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  const faqCategories = [
    {
      id: "orders",
      title: "Orders and Purchases",
      questions: [
        {
          question: "How do I place an order?",
          answer:
            "To place an order, browse our website, select the products you want, and add them to your cart. Proceed to checkout, enter your shipping and payment details, and confirm your order. You'll receive an order confirmation email with the details.",
        },
        {
          question: "Can I modify or cancel my order?",
          answer:
            "You can modify or cancel your order within 1 hour of placement if it hasn't been processed for shipping. Visit 'My Orders' in your account or contact our support team at <a href='/contact'>support@nexusmart.com</a>.",
        },
        {
          question: "How do I track my order?",
          answer:
            "Once your order ships, you'll receive a tracking number via email. You can track your order in the 'My Orders' section of your account or on our shipping partner's website using the tracking number.",
        },
      ],
    },
    {
      id: "shipping",
      title: "Shipping and Delivery",
      questions: [
        {
          question: "What are the shipping options?",
          answer:
            "We offer standard (5-7 business days), express (2-3 business days), and same-day delivery (select cities) options. Shipping costs and availability vary based on your location and order size.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, {APP_NAME} ships to over 50 countries. International shipping costs and delivery times vary by destination. Check our <a href='/shipping'>Shipping Policy</a> for details.",
        },
        {
          question: "What if my order is delayed?",
          answer:
            "If your order is delayed, check the tracking information for updates. If the issue persists, contact our support team at <a href='/contact'>support@nexusmart.com</a> for assistance.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns and Refunds",
      questions: [
        {
          question: "What is your return policy?",
          answer:
            "You can return most items within 30 days of delivery for a refund or exchange, provided they are unused and in original condition. Check our <a href='/returns'>Returns Policy</a> for specific conditions.",
        },
        {
          question: "How do I initiate a return?",
          answer:
            "Go to 'My Orders' in your account, select the order, and choose 'Return Item.' Follow the instructions to print a return label and ship the item back. We'll process your refund once we receive it.",
        },
        {
          question: "How long does it take to process a refund?",
          answer:
            "Refunds are processed within 5-7 business days after we receive the returned item. The refund will be credited to your original payment method or as store credit, depending on your preference.",
        },
      ],
    },
    {
      id: "payments",
      title: "Payments and Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept credit/debit cards (Visa, MasterCard, Amex), UPI, net banking, digital wallets (PayPal, Google Pay), and cash on delivery (select regions).",
        },
        {
          question: "Is it safe to use my credit card on your site?",
          answer:
            "Yes, we use industry-standard encryption (SSL) and secure payment gateways to protect your payment information. Read our <a href='/privacy'>Privacy Policy</a> for details.",
        },
        {
          question: "Why was my payment declined?",
          answer:
            "Payments may be declined due to incorrect card details, insufficient funds, or bank restrictions. Verify your details or try another payment method. Contact support if the issue persists.",
        },
      ],
    },
    {
      id: "account",
      title: "Account and Security",
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "Click 'Sign Up' on our homepage, enter your email, create a password, and provide your details. You'll receive a verification email to activate your account.",
        },
        {
          question: "How do I reset my password?",
          answer:
            "Click 'Forgot Password' on the login page, enter your email, and follow the instructions in the reset email we send you. Check your spam folder if you don’t see it.",
        },
        {
          question: "How do I delete my account?",
          answer:
            "To delete your account, contact our support team at <a href='/contact'>support@nexusmart.com</a> with your request. We’ll process it within 7 business days, subject to our <a href='/privacy'>Privacy Policy</a>.",
        },
      ],
    },
  ];

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Filter FAQs based on search query
    if (!searchQuery.trim()) {
      setFilteredFaqs(faqCategories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(query) ||
              q.answer.toLowerCase().includes(query)
          ),
        }))
        .filter((category) => category.questions.length > 0);
      setFilteredFaqs(filtered);
    }
  }, [searchQuery]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 4 },
        bgcolor: "#f8fafc", // Cool Slate Gray
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 900,
          width: "100%",
          mx: "auto",
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: `1px solid ${alpha('#6366f1', 0.1)}`,
          background: "#fff",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            color: "#1e293b",
            mb: 2,
            letterSpacing: '-0.02em',
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Frequently Asked <Box component="span" sx={{ color: '#6366f1' }}>Questions</Box>
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ color: "#6366f1", mb: 4, textAlign: { xs: "center", md: "left" } }}
        >
          Find answers to your questions about shopping with us.
        </Typography>

        {/* Search Bar */}
        <TextField
          label="Search FAQs"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaSearch style={{ color: "#6366f1" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 4,
            bgcolor: "#fff",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { borderColor: alpha('#6366f1', 0.2) },
              "&:hover fieldset": { borderColor: '#6366f1' },
              "&.Mui-focused fieldset": { borderColor: '#6366f1' },
            },
          }}
        />

        {/* Table of Contents */}
        <Box sx={{ mb: 4, bgcolor: "#f9fafb", p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#18181b", mb: 2 }}>
            FAQ Categories
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {faqCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell sx={{ border: "none", py: 0.5 }}>
                      <Link
                        href={`#${category.id}`}
                        sx={{
                          color: "#6366f1",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {`${index + 1}. ${category.title}`}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ mb: 4, bgcolor: "#e3eeff" }} />

        {/* FAQ Sections */}
        {filteredFaqs.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#444", textAlign: "center" }}>
            No FAQs found for your search. Try a different query or{" "}
            <Link
              href="/contact"
              sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              contact us
            </Link>.
          </Typography>
        ) : (
          filteredFaqs.map((category) => (
            <Box key={category.id} id={category.id} sx={{ mb: 3 }}>
              <Accordion defaultExpanded elevation={0} sx={{ border: `1px solid ${alpha('#6366f1', 0.1)}`, borderRadius: '8px !important', overflow: 'hidden' }}>
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#6366f1' }} />}
                  sx={{ bgcolor: alpha('#6366f1', 0.03) }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e293b" }}>
                    {category.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {category.questions.map((q, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#18181b", mb: 1 }}>
                        {q.question}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#444" }}
                        dangerouslySetInnerHTML={{ __html: q.answer }}
                      />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Box>
          ))
        )}

        <Divider sx={{ my: 4, bgcolor: "#e3eeff" }} />

        {/* Contact Support */}
        <Typography variant="body1" sx={{ color: "#18181b", textAlign: "center" }}>
          Still have questions? Visit our{" "}
          <Link
            href="/contact"
            sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Contact Us
          </Link>{" "}
          page or check our{" "}
          <Link
            href="/privacy"
            sx={{ color: "#6366f1", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Privacy Policy
          </Link>.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Faq;