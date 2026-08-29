export function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  
  export function truncateText(text, length = 50) {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
  }