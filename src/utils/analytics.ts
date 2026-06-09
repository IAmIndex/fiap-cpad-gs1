export interface DataPoint {
  timestamp: number; // em segundos
  value: number;
}

/**
 * Calcula a Regressão Linear Simples para prever um valor futuro.
 */
export function predictFutureValue(data: DataPoint[], futureTimestamp: number): number {
  if (data.length < 2) {
    return data.length === 1 ? data[0].value : 0;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  const n = data.length;

  for (let i = 0; i < n; i++) {
    const x = data[i].timestamp;
    const y = data[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  
  if (denominator === 0) {
    return data[data.length - 1].value;
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Retorna o valor predito extrapolando para o timestamp futuro
  const prediction = slope * futureTimestamp + intercept;
  
  // Garante que valores não fiquem negativos de forma irrealista
  return prediction < 0 ? 0 : prediction;
}
