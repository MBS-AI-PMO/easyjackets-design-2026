const toText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value).trim();
};

export const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address !== 'object') return toText(address);

  const line1 = toText(address.line1 || address.street || address.address);
  const line2 = toText(address.line2);
  const cityState = [address.city, address.state].map(toText).filter(Boolean).join(', ');
  const countryZip = [
    address.country,
    address.postal_code || address.postalCode || address.zip,
  ].map(toText).filter(Boolean).join(' ');

  return [line1, line2, cityState, countryZip].filter(Boolean).join(', ');
};
