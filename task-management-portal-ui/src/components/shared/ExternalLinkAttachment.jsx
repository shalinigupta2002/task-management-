import { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Link,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { card } from "./styles";
import {
  getAttachmentOpenLabel,
  getUrlDisplayName,
  inferAttachmentType,
  isValidExternalUrl,
  normalizeExternalUrl,
} from "../../utils/urlValidation";

const TYPE_ICONS = {
  image: ImageOutlinedIcon,
  video: VideocamOutlinedIcon,
  document: InsertDriveFileOutlinedIcon,
};

function normalizeAttachment(item) {
  if (typeof item === "string") {
    const url = normalizeExternalUrl(item);
    return {
      id: url,
      url,
      name: getUrlDisplayName(url),
      type: inferAttachmentType(url),
    };
  }

  const url = normalizeExternalUrl(item.url || item.fileUrl || item.attachmentUrl || "");
  return {
    id: item.id || url || `link-${Date.now()}`,
    url,
    name: item.name || item.originalName || item.fileName || getUrlDisplayName(url),
    type: item.type || inferAttachmentType(url),
  };
}

export function AttachmentLinkList({ items = [], onRemove, readOnly = false, emptyText = "No attachments yet" }) {
  const links = items.map(normalizeAttachment).filter((item) => item.url || item.name);

  if (!links.length) {
    return emptyText ? (
      <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>{emptyText}</Typography>
    ) : null;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {links.map((item) => {
        const Icon = TYPE_ICONS[item.type] || InsertDriveFileOutlinedIcon;
        const label = item.name || getUrlDisplayName(item.url);
        return (
          <Box
            key={item.id}
            sx={{
              ...card,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              py: 1.25,
              px: 1.5,
            }}
          >
            <Icon sx={{ color: "#2563EB", fontSize: 20 }} />
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#0F172A" }} noWrap>
                {label}
              </Typography>
              {item.url ? (
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                  {getAttachmentOpenLabel(item.type)}
                </Link>
              ) : (
                <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>Legacy attachment</Typography>
              )}
            </Box>
            {!readOnly && onRemove && (
              <IconButton size="small" onClick={() => onRemove(item.id)} aria-label={`Remove ${label}`}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

AttachmentLinkList.propTypes = {
  items: PropTypes.array,
  onRemove: PropTypes.func,
  readOnly: PropTypes.bool,
  emptyText: PropTypes.string,
};

export default function ExternalLinkAttachment({
  label = "Attachments",
  placeholder = "Paste Google Drive / File URL",
  buttonLabel = "Add Link",
  value = [],
  onChange,
  multiple = true,
  maxLinks = 10,
  compact = false,
  helperText,
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const links = (value || []).map(normalizeAttachment);

  const addLink = () => {
    const url = normalizeExternalUrl(input);
    if (!isValidExternalUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }
    if (links.some((item) => item.url === url)) {
      setError("This link is already attached.");
      return;
    }
    if (!multiple && links.length >= 1) {
      onChange?.([{
        id: `link-${Date.now()}`,
        url,
        name: getUrlDisplayName(url),
        type: inferAttachmentType(url),
      }]);
      setInput("");
      setError("");
      return;
    }
    if (links.length >= maxLinks) {
      setError(`You can attach up to ${maxLinks} links.`);
      return;
    }

    const next = [
      ...links,
      {
        id: `link-${Date.now()}`,
        url,
        name: getUrlDisplayName(url),
        type: inferAttachmentType(url),
      },
    ];
    onChange?.(next);
    setInput("");
    setError("");
  };

  const removeLink = (id) => {
    onChange?.(links.filter((item) => item.id !== id));
  };

  return (
    <Box>
      {!compact && (
        <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.85rem", mb: 1 }}>
          {label}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1, flexDirection: compact ? "column" : { xs: "column", sm: "row" }, mb: links.length ? 1.5 : 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLink();
            }
          }}
          error={Boolean(error)}
          helperText={error || helperText || ""}
          InputProps={{
            startAdornment: <LinkIcon sx={{ color: "#94A3B8", fontSize: 18, mr: 1 }} />,
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: compact ? "#FFF" : "#F8FAFC" } }}
        />
        <Button
          variant="contained"
          onClick={addLink}
          sx={{
            textTransform: "none",
            bgcolor: "#2563EB",
            borderRadius: 2,
            px: 2.5,
            whiteSpace: "nowrap",
            alignSelf: compact ? "flex-start" : { xs: "flex-start", sm: "flex-start" },
          }}
        >
          {buttonLabel}
        </Button>
      </Box>

      <AttachmentLinkList items={links} onRemove={removeLink} emptyText={null} />
    </Box>
  );
}

ExternalLinkAttachment.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  buttonLabel: PropTypes.string,
  value: PropTypes.array,
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  maxLinks: PropTypes.number,
  compact: PropTypes.bool,
  helperText: PropTypes.string,
};
