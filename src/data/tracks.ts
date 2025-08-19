// Album Cover Images
import AboutYou from "/Album/AboutYou.png"
import Blue from "/Album/Blue.png"
import Multo from "/Album/Multo.png"
import Sikulo from "/Album/Sikulo.png"
import IkawPatutunguhan from "/Album/Ikaw Patutunguhan.png"
import NewSlang from "/Album/New Slang.png"
import LetDown from "/Album/Let Down.png"
import ilysb from "/Album/ILYSB.png"
import BackToFriends from "/Album/BacktoFriends.png"
import Cry from "/Album/Cry.png"
import MakeItToTheMorning from "/Album/MakeItToTheMorning.png"
import Dreamin from "/Album/Dreamin.png"
import OneOfTheGirls from "/Album/OneOfTheGirls.png"
import You from "/Album/YOU.png"
import Wildflower from "/Album/Wildflower.png"

// MP3 Audio
import AboutYouAudio from "/Audio/The1975/About You.mp3"
import BlueAudio from "/Audio/YungKai/Blue.mp3"
import MultoAudio from "/Audio/Multo.mp3"
import SikuloAudio from "/Audio/Sikulo.mp3"
import IkawPatutunguhanAudio from "/Audio/Ikaw Patutunguhan.mp3"
import New_Slang from "/Audio/New Slang.mp3"
import Let_Down from "/Audio/Let Down.mp3"
import ILYSB from "/Audio/LANY/ILYSB.mp3"
import Back_To_Friends from "/Audio/The1975/Back_To_Friends.mp3"
import CryAudio from "/Audio/CigarettesAfterSex/Cry.mp3"
import MakeItToTheMorningAudio from "/Audio/PartyNextDoor/MakeItToTheMorning.mp3"
import DreaminAudio from "/Audio/PartyNextDoor/Dreamin.mp3"
import OneOfTheGirlsAudio from "/Audio/TheWeeknd/OneOfTheGirls.mp3"
import YouAudio from "/Audio/LANY/YOU.mp3"
import WildflowerAudio from "/Audio/YungKai/Wildflower.mp3"


// Artist Poster 
import The1975Poster from "/Album/ArtistPoster/The1975Poster.jpg"
import PartyNextDoorPoster from "/Album/ArtistPoster/PartyNextDoor.jpg"
import TheWeekndPoster from "/Album/ArtistPoster/TheWeeknd.jpg"
import LANYPoster from "/Album/ArtistPoster/LANY.jpg"
import YungKaiPoster from "/Album/ArtistPoster/YungKai.jpg"


const baseTracks = [
  {
    id: 1,
    title: "About You",
    artist: "The 1975",
    artistPoster: The1975Poster,
    album: "Album 1",
    duration: 326,
    coverUrl: AboutYou,
    audioUrl: AboutYouAudio,
    videoUrl: "https://example.com/videos/about-you.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 30 seconds
  },
  {
    id: 2,
    title: "Blue",
    artist: "Yung Kai",
    artistPoster: "",
    album: "Album 2",
    duration: 221,
    coverUrl: Blue,
    audioUrl: BlueAudio,
    videoUrl: "https://example.com/videos/blue.mp4", // Replace with actual video URL
    showVideoSecond: 45 // Show video at 45 seconds
  },
  {
    id: 3,
    title: "Multo",
    artist: "Cup of Joe",
    artistPoster: "",
    album: "Album 3",
    duration: 240,
    coverUrl: Multo,
    audioUrl: MultoAudio,
    videoUrl: "https://example.com/videos/multo.mp4", // Replace with actual video URL
    showVideoSecond: 0 // Show video at 1 minute
  },
  {
    id: 4,
    title: "Sikulo",
    artist: " Maki, Angela Ken, Nhiko",
    artistPoster: "",
    album: "Album 4",
    duration: 315,
    coverUrl: Sikulo,
    audioUrl: SikuloAudio,
    videoUrl: "https://example.com/videos/sikulo.mp4", // Replace with actual video URL
    showVideoSecond: 90 // Show video at 1:30
  },
  {
    id: 5,
    title: "Ikaw Lang Patutunguhan",
    artist: "Amiel Sol",
    artistPoster: "",
    album: "Album 5",
    duration: 341,
    coverUrl: IkawPatutunguhan,
    audioUrl: IkawPatutunguhanAudio,
    videoUrl: "https://example.com/videos/ikaw-patutunguhan.mp4", // Replace with actual video URL
    showVideoSecond: 120 // Show video at 2 minutes
  },
  {
    id: 6,
    title: "New Slang",
    artist: "The Shins",
    artistPoster: "",
    album: "Album 6",
    duration: 232,
    coverUrl: NewSlang,
    audioUrl: New_Slang,
    videoUrl: "https://example.com/videos/new-slang.mp4", // Replace with actual video URL
    showVideoSecond: 75 // Show video at 1:15
  },
  {
    id: 7,
    title: "Let Down",
    artist: "Radiohead",
    artistPoster: "",
    album: "OK Computer",
    duration: 299,
    coverUrl: LetDown,
    audioUrl: Let_Down,
    videoUrl: "https://example.com/videos/let-down.mp4", // Replace with actual video URL
    showVideoSecond: 218 // Show video at 3:35
  },
  {
    id: 8,
    title: "ILYSB",
    artist: "LANY",
    artistPoster: LANYPoster,
    album: "Album 7",
    duration: 241,
    coverUrl: ilysb,
    audioUrl: ILYSB,
    videoUrl: "https://example.com/videos/ilysb.mp4", // Replace with actual video URL
    showVideoSecond: 50 // Show video at 50 seconds
  },
  {
    id: 9,
    title: "Back to Friends",
    artist: "The 1975",
    artistPoster: The1975Poster,
    album: "Album 8",
    duration: 201,
    coverUrl: BackToFriends,
    audioUrl: Back_To_Friends,
    videoUrl: "https://example.com/videos/back-to-friends.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 10,
    title: "Cry",
    artist: "Cigarettes After Sex",
    artistPoster: "",
    album: "Album 9",
    duration: 257,
    coverUrl: Cry,
    audioUrl: CryAudio,
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 11,
    title: "Make It To The Morning",
    artist: "Party Next Door",
    artistPoster: PartyNextDoorPoster,
    album: "Album 10",
    duration: 168,
    coverUrl: MakeItToTheMorning,
    audioUrl: MakeItToTheMorningAudio,
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 12,
    title: "Dreamin",
    artist: "Party Next Door",
    artistPoster: PartyNextDoorPoster,
    album: "Album 11",
    duration: 147,
    coverUrl: Dreamin,
    audioUrl: DreaminAudio,
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 13,
    title: "One Of The Girls",
    artist: "The Weeknd",
    artistPoster: TheWeekndPoster,
    album: "Album 12",
    duration: 244,
    coverUrl: OneOfTheGirls,
    audioUrl: OneOfTheGirlsAudio,
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 14,
    title: "You",
    artist: "LANY",
    artistPoster: LANYPoster,
    album: "Album 13",
    duration: 272,
    coverUrl: You,
    audioUrl: YouAudio,
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 15,
    title: "Wildflower",
    artist: "Yung Kai",
    artistPoster: YungKaiPoster,
    album: "Album 14",
    duration: 175,
    coverUrl: Wildflower,
    audioUrl: WildflowerAudio,
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  }
];

function shuffleArray<T>(arr: T[]): T[] {
  const array = [...arr]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export const tracks = shuffleArray(baseTracks).map((track, index) => ({
  ...track,
  id: index + 1,
}))