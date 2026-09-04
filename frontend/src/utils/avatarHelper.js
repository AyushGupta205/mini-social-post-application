/**
 * Generate a consistent background color based on string hash
 */
export const stringToColor = (string = '') => {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#ea580c', // Orange
    '#059669', // Emerald
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#d97706'  // Amber
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get 1-2 letter uppercase initials from username or name
 */
export const getInitials = (name = '') => {
  if (!name) return '?';
  const clean = name.trim();
  if (clean.includes(' ')) {
    const parts = clean.split(' ');
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
};
