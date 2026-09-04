/**
 * Format timestamp into relative time string
 * e.g. "Just now", "5m ago", "2h ago", "3d ago", "Aug 15"
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 30) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  // Fallback to short date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};
