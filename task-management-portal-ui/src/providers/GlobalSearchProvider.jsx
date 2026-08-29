import PropTypes from "prop-types";
import { GlobalSearchDialog } from "../components/shared";
import useGlobalSearch from "../hooks/useGlobalSearch";
import useGlobalSearchShortcut from "../hooks/useGlobalSearchShortcut";

/** App-wide Ctrl/Cmd+K search — does not modify existing navbars or layouts. */
export default function GlobalSearchProvider({ children }) {
  const { open, openSearch, closeSearch, handleNavigate } = useGlobalSearch();
  useGlobalSearchShortcut(openSearch);

  return (
    <>
      {children}
      <GlobalSearchDialog open={open} onClose={closeSearch} onNavigate={handleNavigate} />
    </>
  );
}

GlobalSearchProvider.propTypes = { children: PropTypes.node.isRequired };
