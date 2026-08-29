import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import ExternalLinkAttachment, { AttachmentLinkList } from "../shared/ExternalLinkAttachment";

const documentTypes = [
  { value: "pan", label: "PAN Card" },
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "passport", label: "Passport" },
  { value: "voterId", label: "Voter ID" },
  { value: "drivingLicense", label: "Driving License" },
];

export default function StepDocuments({ formData, updateFormData, errors = {} }) {
  const handleTypeChange = (e) => {
    updateFormData({ selectedIdType: e.target.value });
  };

  const handleNumberChange = (e) => {
    updateFormData({ idDocumentNumber: e.target.value });
  };

  const documentLinks = formData.idDocumentUrl
    ? [{ id: "id-doc", url: formData.idDocumentUrl, name: "Identity Document" }]
    : [];

  const darkFieldStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 2,
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#90caf9",
    },
    "& .MuiOutlinedInput-root": {
      color: "#ffffff",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.23)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#90caf9",
      },
    },
    "& .MuiSelect-icon": {
      color: "#ffffff",
    },
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#ffffff" }}>
        Document Verification
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "rgba(255, 255, 255, 0.7)" }}>
        Provide your identity document number and an external Google Drive / file link for verification.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 520 }}>
        <TextField
          select
          fullWidth
          variant="outlined"
          label="Document Type"
          value={formData.selectedIdType || "pan"}
          onChange={handleTypeChange}
          error={Boolean(errors.selectedIdType)}
          helperText={
            typeof errors.selectedIdType === "string" ? errors.selectedIdType : ""
          }
          sx={darkFieldStyles}
        >
          {documentTypes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          variant="outlined"
          label="Document Number"
          placeholder="e.g. ABCDE1234F or Identification Number"
          value={formData.idDocumentNumber || ""}
          onChange={handleNumberChange}
          error={Boolean(errors.idDocumentNumber)}
          helperText={
            typeof errors.idDocumentNumber === "string" ? errors.idDocumentNumber : ""
          }
          sx={darkFieldStyles}
        />

        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            bgcolor: "rgba(255, 255, 255, 0.04)",
          }}
        >
          <ExternalLinkAttachment
            label="Document / Drive Link"
            placeholder="Paste Google Drive document link"
            buttonLabel="Attach Link"
            multiple={false}
            maxLinks={1}
            compact
            value={documentLinks}
            onChange={(links) => updateFormData({ idDocumentUrl: links[0]?.url || "" })}
            helperText="Store only the external link — no file upload"
          />
          {documentLinks.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <AttachmentLinkList items={documentLinks} readOnly />
            </Box>
          )}
        </Box>

        {typeof errors.idDocumentUrl === "string" && (
          <FormHelperText error sx={{ color: "#ff8a80" }}>
            {errors.idDocumentUrl}
          </FormHelperText>
        )}
        {typeof errors.idDocumentFile === "string" && (
          <FormHelperText error sx={{ color: "#ff8a80" }}>
            {errors.idDocumentFile}
          </FormHelperText>
        )}
      </Box>
    </Box>
  );
}

StepDocuments.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
};
