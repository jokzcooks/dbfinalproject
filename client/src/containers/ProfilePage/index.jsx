import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AverageSentiment from "../../components/Profile/averageSentiment"
import RankedEmotions from "../../components/Profile/rankedEmotions"
import RankedSentimentKeywords from './../../components/Profile/rankedSentimentKeywords';
import TweetList from './../../components/Profile/tweetList';

const ProfilePage = ({currentAccount}) => {
    const navigate = useNavigate()
    const {name} = useParams()
    const [userTweets, setUserTweets] = useState(null)

    const getUserTweets = useCallback(() => {
      fetch(`/tweets/${name}`)
        .then(res => res.json())
        .then(setUserTweets);
    });
  
    useEffect(() => {
      getUserTweets();
    }, [name]);
  
    useEffect(() => {
      console.log("new user tweets", userTweets)
    }, [userTweets])

    return (
        <div className="mainContainer">
        <div className='header profilePage'>
          <h1>{name}</h1>
          <p style={{cursor: "pointer"}} onClick={(e) => navigate("/")}>Home</p>
        </div>

        {userTweets && (
          <div className="profileBody">

            <div className="left">
              <AverageSentiment value={userTweets.averageSentiment[0]}/>
              <RankedEmotions list={userTweets.rankedEmotions}/>
              <RankedSentimentKeywords list={userTweets.rankedSentimentKeywords}/>
            </div>

            <div className="right">
              <div>
                <p style={{fontWeight: 500}}>Tweets</p>
              </div>
              <TweetList list={userTweets.results}/>
            </div>

          </div>
        )}
      </div>
  
    )
}

export default ProfilePage