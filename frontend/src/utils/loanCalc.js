/**
 * Loan Calculator Utilities
 * Pure offline math for financial planning
 */

/**
 * Calculate Monthly EMI
 * Formula: [P x R x (1+R)^N] / [(1+R)^N-1]
 * @param {number} principal 
 * @param {number} annualRate 
 * @param {number} tenureYears 
 */
export const calculateEMI = (principal, annualRate, tenureYears) => {
  const p = parseFloat(principal);
  const r = parseFloat(annualRate) / 12 / 100;
  const n = parseFloat(tenureYears) * 12;

  if (!p || !r || !n) return 0;

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};

/**
 * Calculate Maximum Loan Eligibility based on FOIR
 * @param {number} monthlyIncome 
 * @param {number} existingEmis 
 * @param {number} foirPercent (Standard is 50-60%)
 */
export const calculateEligibility = (monthlyIncome, existingEmis = 0, foirPercent = 50) => {
  const income = parseFloat(monthlyIncome);
  const obligations = parseFloat(existingEmis);
  const foir = parseFloat(foirPercent) / 100;

  if (!income) return 0;

  const disposableIncome = (income * foir) - obligations;
  return Math.max(0, Math.round(disposableIncome));
};

/**
 * Calculate Fixed Obligation to Income Ratio (FOIR)
 * @param {number} monthlyIncome 
 * @param {number} totalEmis 
 */
export const getFOIR = (monthlyIncome, totalEmis) => {
  const income = parseFloat(monthlyIncome);
  const emis = parseFloat(totalEmis);

  if (!income) return 0;

  return Math.round((emis / income) * 100);
};
