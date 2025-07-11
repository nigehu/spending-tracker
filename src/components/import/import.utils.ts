export const getCleanAmount = (amount: string) => {
  console.log('amount', amount);
  const cleanAmount = amount.replace(/[^0-9.]/g, '');
  console.log('cleanAmount', cleanAmount);
  const cleanAmountFloat = parseFloat(cleanAmount);
  console.log('cleanAmountFloat', cleanAmountFloat);
  return cleanAmountFloat;
};
