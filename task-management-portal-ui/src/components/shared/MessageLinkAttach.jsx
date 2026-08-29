import { useState } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Button, Popover } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ExternalLinkAttachment from "./ExternalLinkAttachment";

export default function MessageLinkAttach({ onAttach }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [links, setLinks] = useState([]);

  const open = Boolean(anchorEl);

  const handleAttach = () => {
    if (links[0]?.url) {
      onAttach?.(links[0]);
      setLinks([]);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <IconButton
        size="small"
        sx={{ color: "#64748B", bgcolor: "#F8FAFC", border: "1px solid #E8EDF5" }}
        aria-label="Attach link"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <AttachFileIcon fontSize="small" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <ExternalLinkAttachment
            label="Attach File / Drive Link"
            placeholder="Paste Google Drive / File URL"
            buttonLabel="Add Link"
            value={links}
            onChange={setLinks}
            multiple={false}
            maxLinks={1}
            compact
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAttach}
            disabled={!links[0]?.url}
            sx={{ mt: 1, textTransform: "none", bgcolor: "#2563EB", borderRadius: 2 }}
          >
            Attach to Message
          </Button>
        </Box>
      </Popover>
    </>
  );
}

MessageLinkAttach.propTypes = {
  onAttach: PropTypes.func,
};
