import { API_BASE_URL } from '../api/baseQuery';

const exportTypes = {
  csv: 'text/csv',
  pdf: 'application/pdf',
};

export async function downloadTransactionExport(format) {
  const response = await fetch(`${API_BASE_URL}/api/export/${format}`, { credentials: 'include' });
  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (!response.ok || contentType !== exportTypes[format]) {
    throw new Error('The server did not return a valid export.');
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions.${format}`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
