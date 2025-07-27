import { Review } from '../types';

// Simple sentiment analysis function
export const analyzeSentiment = (reviews: Review[]): 'Good' | 'Bad' | 'Average' => {
  if (reviews.length === 0) return 'Average';

  // Calculate average rating
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  // Simple keyword-based sentiment analysis
  const positiveKeywords = [
    'clean', 'good', 'excellent', 'great', 'nice', 'well-maintained', 'hygienic', 
    'spotless', 'fresh', 'pleasant', 'tidy', 'proper', 'satisfied', 'recommended',
    'impressive', 'maintained', 'facilities', 'soap', 'water'
  ];

  const negativeKeywords = [
    'dirty', 'bad', 'terrible', 'awful', 'smelly', 'unhygienic', 'poor', 'broken',
    'disgusting', 'filthy', 'mess', 'stink', 'avoid', 'horrible', 'worst', 'nasty',
    'unmaintained', 'issues', 'problems', 'complaint'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        positiveScore += 1;
      }
    });

    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        negativeScore += 1;
      }
    });
  });

  // Combine rating-based and keyword-based analysis
  const ratingWeight = 0.7;
  const keywordWeight = 0.3;

  const ratingScore = (avgRating - 1) / 4; // Normalize to 0-1
  const keywordScore = positiveScore > negativeScore ? 
    (positiveScore / (positiveScore + negativeScore)) : 
    (negativeScore > 0 ? 0 : 0.5);

  const finalScore = (ratingScore * ratingWeight) + (keywordScore * keywordWeight);

  if (finalScore >= 0.65) return 'Good';
  if (finalScore <= 0.35) return 'Bad';
  return 'Average';
};

// Advanced sentiment analysis using more sophisticated logic
export const advancedSentimentAnalysis = (reviews: Review[]): 'Good' | 'Bad' | 'Average' => {
  if (reviews.length === 0) return 'Average';

  const recentReviews = reviews
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, Math.min(5, reviews.length)); // Consider only recent 5 reviews

  const avgRating = recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length;

  // Weight recent reviews more heavily
  if (avgRating >= 4) return 'Good';
  if (avgRating <= 2) return 'Bad';
  return 'Average';
};