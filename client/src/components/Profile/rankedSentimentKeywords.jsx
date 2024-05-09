const RankedSentimentKeywords = ({list}) => {
    console.log("rankedsent list", list)

    return (
        <div>
            <p className="title">Sentiment Keywords <span>(By Frequency)</span></p>
            <div className="sentimentList">
                {list && list.map((item, index) => (
                    <div className="sentiment">
                        <p>{index+1}.</p>
                        <p>{item.word}</p>
                        <p>({item.quant})</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RankedSentimentKeywords