/**
 * Smart Cluster Trading (Basket AI)
 * v6.0 Profit Intelligence Suite
 * 
 * AI benzer momentum-sentiment profiline sahip hisseleri sepet yapar
 * Fayda: 1 işlem = 5 hissede dengeli dağılım
 */

export interface ClusterInput {
  symbols: Array<{
    symbol: string;
    momentum: number; // 0-100
    sentiment: number; // 0-100
    price: number;
    volatility: number;
  }>;
  clusterSize: number; // Number of symbols per cluster (default 5)
}

export interface Cluster {
  symbols: string[];
  avgMomentum: number;
  avgSentiment: number;
  similarity: number; // 0-100, how similar the cluster is
  recommendedWeight: number; // 0-1, portfolio weight for this cluster
}

export interface ClusterOutput {
  clusters: Cluster[];
  bestCluster: Cluster | null;
  explanation: string;
}

/**
 * Generate smart clusters based on momentum-sentiment similarity
 */
export function generateSmartClusters(input: ClusterInput): ClusterOutput {
  const { symbols, clusterSize = 5 } = input;

  if (symbols.length < clusterSize) {
    return {
      clusters: [],
      bestCluster: null,
      explanation: `Yetersiz sembol sayısı (minimum ${clusterSize} sembol gerekli)`,
    };
  }

  // 1. Calculate similarity matrix (momentum + sentiment distance)
  const similarities: Array<Array<{ symbol: string; distance: number }>> = [];
  
  symbols.forEach(s1 => {
    const sims = symbols.map(s2 => ({
      symbol: s2.symbol,
      distance: Math.sqrt(
        Math.pow((s1.momentum - s2.momentum) / 100, 2) +
        Math.pow((s1.sentiment - s2.sentiment) / 100, 2)
      ),
    }));
    similarities.push(sims);
  });

  // 2. Cluster using simple K-means-like approach
  const clusters: Cluster[] = [];
  const used = new Set<string>();

  symbols.forEach(seed => {
    if (used.has(seed.symbol)) return;

    const seedIdx = symbols.findIndex(s => s.symbol === seed.symbol);
    const neighbors = similarities[seedIdx]
      .filter(s => !used.has(s.symbol) && s.distance < 0.3) // Similarity threshold
      .sort((a, b) => a.distance - b.distance)
      .slice(0, clusterSize - 1);

    if (neighbors.length >= clusterSize - 1) {
      const clusterSymbols = [seed.symbol, ...neighbors.map(n => n.symbol)];
      
      clusterSymbols.forEach(s => used.add(s));

      const clusterData = clusterSymbols.map(s => symbols.find(s2 => s2.symbol === s)!);
      const avgMomentum = clusterData.reduce((sum, s) => sum + s.momentum, 0) / clusterData.length;
      const avgSentiment = clusterData.reduce((sum, s) => sum + s.sentiment, 0) / clusterData.length;
      
      // Calculate cluster similarity (lower distance = higher similarity)
      const avgDistance = neighbors.reduce((sum, n) => sum + n.distance, 0) / neighbors.length;
      const similarity = Math.max(0, Math.min(100, (1 - avgDistance) * 100));

      // Recommended weight based on similarity and cluster size
      const recommendedWeight = Math.min(0.3, (similarity / 100) * 0.3 * (clusterSize / 5));

      clusters.push({
        symbols: clusterSymbols,
        avgMomentum: Math.round(avgMomentum * 10) / 10,
        avgSentiment: Math.round(avgSentiment * 10) / 10,
        similarity: Math.round(similarity * 10) / 10,
        recommendedWeight: Math.round(recommendedWeight * 100) / 100,
      });
    }
  });

  // 3. Find best cluster (highest similarity)
  const bestCluster = clusters.length > 0
    ? clusters.reduce((best, c) => c.similarity > best.similarity ? c : best)
    : null;

  // 4. Generate explanation
  const explanation = clusters.length > 0
    ? `${clusters.length} akıllı sepet bulundu. En iyi sepet: ${bestCluster?.symbols.join(', ')} (benzerlik: %${bestCluster?.similarity.toFixed(1)}). Önerilen ağırlık: %${((bestCluster?.recommendedWeight || 0) * 100).toFixed(1)}.`
    : 'Benzer momentum-sentiment profiline sahip sepet bulunamadı.';

  return {
    clusters,
    bestCluster,
    explanation,
  };
}



