const getMadridFormatter = (options = {}) =>
  new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    ...options,
  });

export const toMadridDateOnly = (value = new Date()) => {
  const parts = getMadridFormatter({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
};

export const formatMadridDate = (value = new Date(), options = {}) =>
  getMadridFormatter(options).format(new Date(value));
