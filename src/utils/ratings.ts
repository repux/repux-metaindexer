export type Rating = { price: number, score: number };
export type RatingArray = Array<Rating>;

export class Ratings {
    public static asymptoticTrustAlgorithm(ratingsList: RatingArray, gamma: number, alpha: number): Array<number> {
        let ratings: Array<number> = [0];

        ratingsList.forEach(({score, price}: Rating, index) => {
            score = Number(score);
            price = Math.round(Number(price));

            ratings.push(this.asymptoticTrustAlgorithmFromPrevious(ratings[index], price, score, gamma, alpha));
        });

        return ratings;
    }

    public static asymptoticTrustAlgorithmFromPrevious(
        prevRating: number,
        price: number,
        score: number,
        gamma: number,
        alpha: number
    ) {
        switch (score) {
            case 5:
                return prevRating + (1 - prevRating) * Math.tanh(price / gamma) * alpha;
            case 4:
                return prevRating;
            case 3:
                return prevRating - prevRating * Math.tanh(price / gamma) * (0.5 * alpha);
            case 2:
                return prevRating - prevRating * Math.tanh(price / gamma) * alpha;
            case 1:
                return prevRating - prevRating * Math.tanh(price / gamma) * (2 * alpha);
        }

        return prevRating;
    }
}

module.exports.Ratings = Ratings;
