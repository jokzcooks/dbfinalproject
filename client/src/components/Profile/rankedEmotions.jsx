const RankedEmotions = ({list}) => {
    console.log("rankedemotions list", list)

    return (
        <div>
            <p className="title">Emotions <span>(By Frequency)</span></p>
            <div className="emotionList">
                {list && list.map((item, index) => (
                    <div className="emotion">
                        <p>{index+1}.</p>
                        <p>{item.emotion}</p>
                        <p>({item.quant})</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RankedEmotions