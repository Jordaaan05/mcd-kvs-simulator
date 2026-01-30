/**
 * Helper logic to the order generation system
 */

const applyVariation = (baseCount) => {
  const variationFactor = 1 + (Math.random() * (0.2 + 0.35) - 0.35); // from 0.65 to 1.2
  return Math.max(0, Math.round(baseCount * variationFactor));
};

module.exports = { applyVariation }