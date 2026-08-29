import PropTypes from "prop-types";
import ExternalLinkAttachment from "./ExternalLinkAttachment";

/** @deprecated Use ExternalLinkAttachment directly. Kept for backward compatibility. */
export default function FileUploader({
  accept = "all",
  multiple = true,
  maxFiles = 5,
  onFilesChange,
  label = "Attach File / Drive Link",
}) {
  void accept;

  return (
    <ExternalLinkAttachment
      label={label}
      placeholder="Paste Google Drive / File URL"
      buttonLabel="Add Link"
      value={[]}
      onChange={(links) => onFilesChange?.(links)}
      multiple={multiple}
      maxLinks={maxFiles}
    />
  );
}

FileUploader.propTypes = {
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  onFilesChange: PropTypes.func,
  label: PropTypes.string,
};
