const AverageSentiment = ({value}) => {
    console.log("averagesentiment value", value)
    var degree;
    var sign;
    var score = Math.round(Number(value[Object.keys(value)[0]]) * 100_000) / 100_000
    sign = score <= 0 ? "Negative" : "Positive"
    degree = Math.abs(score) > 0.1 ? "" : "Slightly "
    return (
        <div>
            <p className="title">Average Sentiment</p>
            <p className="body">{degree}{sign} <span>({score})</span></p>
        </div>
    )
}

export default AverageSentiment