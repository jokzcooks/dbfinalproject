import { useNavigate } from "react-router-dom";
import { DataIcon, TwitterIcon } from "../Images";

const Profile = ({profileData}) => {

    const navigate = useNavigate()

    console.log(profileData)

    return (
        <div className="profile">
            <img src={profileData.pfp} alt="" />
            <div className="profileData">
                <p>{profileData.name}</p>
                <div className="actions">
                    <img className="twitterLogo" src={TwitterIcon} onClick={(e) => {window.open(profileData.accountlink); e.preventDefault();}}/>
                    <img className="twitterLogo" src={DataIcon} onClick={(e) => { navigate(`/profile/${profileData.name}`); e.preventDefault();}}/>
                </div>
            </div>
        </div>
    )
}

export default Profile;