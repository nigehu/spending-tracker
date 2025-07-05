export const getCleanAmount = (amount: string) => {
  const cleanAmount = amount.replace(/[^0-9,.]/g, '');
  const cleanAmountFloat = parseFloat(cleanAmount);
  return cleanAmountFloat;
};
