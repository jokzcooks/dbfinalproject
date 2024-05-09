import { useRef, useState } from "react"

const TweetList = ({list}) => {
    return (
        <div className="tweetList nobg">
            {list && list.map(tweet => {
                
                const tweetText = useRef("")

                var sentiment = tweet.sentiment
                var [sign, score, ratio] = sentiment.split(":")
                var degree;
                var score = Math.round(Number(score) * 100_000) / 100_000
                if (Math.abs(score) < 0.1) {
                    degree = "Slightly"
                } else if (Math.abs(score < 0.3)) {
                    degree = "Fairly"
                } else if (Math.abs(score < 0.7)) {
                    degree = "Very"
                } else {
                    degree = "Extremely"
                }
                if (sign == "neutral") degree = ""

                var timestamp = tweet.created_at.substring(0, tweet.created_at.length - 10);

                var text = tweet.full_text
                var sentiment_keywords = tweet.sentiment_keywords
                if (sentiment_keywords) {
                    sentiment_keywords.split(", ").forEach(kw => {
                        const [word, score] = kw.split(":")

                        var colorSign = score > 0 ? "#99f752" : "#ff8888"
                        
                        let regex = new RegExp("\\b\\w*" + word + "\\w*\\b", "gm");
                        text = text.replace(regex, function(match) {
                            return `<span title=${score} style="font-weight: 400; cursor: help; color:${colorSign}; filter: brightness(${(Math.abs(score) + 0.3)});">` + match + '</span>';
                        });
                    })
                }

                if (tweetText && tweetText.current!="") 
                tweetText.current.innerHTML = text
                
                return (
                    <div className="tweet">
                        <p className="timestamp">{timestamp}</p>
                        <p className="fulltext" ref={tweetText}></p>
                        <div className="features">
                            <div className="sentiment">
                                <p title={score}>{degree} {sign}</p>
                            </div>
                            <div className="emotions">
                                {tweet.emotions && tweet.emotions.split(",").map(emotion => (
                                    <p>{emotion}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                )})}
        </div>
    )
}

export default TweetList