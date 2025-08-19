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
import ContigoSiempre from "/Album/ContigoSiempre.png"
import Andromeda from "/Album/Andromeda.png"
import MontagemXonada from "/Album/MontagemXonada.png"

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
import ContigoSiempreAudio from "/Audio/Phonk/ContigoSiempre.mp3"
import AndromedaAudio from "/Audio/Phonk/ANDROMEDA.mp3"
import MontagemXonadaAudio from "/Audio/Phonk/MontagemXonada.mp3"


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
    duration: 326,
    coverUrl: AboutYou,
    audioUrl: AboutYouAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/about-you.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 30 seconds
  },
  {
    id: 2,
    title: "Blue",
    artist: "Yung Kai",
    artistPoster: "",
    duration: 221,
    coverUrl: Blue,
    audioUrl: BlueAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/blue.mp4", // Replace with actual video URL
    showVideoSecond: 45 // Show video at 45 seconds
  },
  {
    id: 3,
    title: "Multo",
    artist: "Cup of Joe",
    artistPoster: "",
    duration: 240,
    coverUrl: Multo,
    audioUrl: MultoAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/multo.mp4", // Replace with actual video URL
    showVideoSecond: 0 // Show video at 1 minute
  },
  {
    id: 4,
    title: "Sikulo",
    artist: " Maki, Angela Ken, Nhiko",
    artistPoster: "",
    duration: 315,
    coverUrl: Sikulo,
    audioUrl: SikuloAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/sikulo.mp4", // Replace with actual video URL
    showVideoSecond: 90 // Show video at 1:30
  },
  {
    id: 5,
    title: "Ikaw Lang Patutunguhan",
    artist: "Amiel Sol",
    artistPoster: "",
    duration: 341,
    coverUrl: IkawPatutunguhan,
    audioUrl: IkawPatutunguhanAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/ikaw-patutunguhan.mp4", // Replace with actual video URL
    showVideoSecond: 120 // Show video at 2 minutes
  },
  {
    id: 6,
    title: "New Slang",
    artist: "The Shins",
    artistPoster: "",
    duration: 232,
    coverUrl: NewSlang,
    audioUrl: New_Slang,
    mode: "normal",
    videoUrl: "https://example.com/videos/new-slang.mp4", // Replace with actual video URL
    showVideoSecond: 75 // Show video at 1:15
  },
  {
    id: 7,
    title: "Let Down",
    artist: "Radiohead",
    artistPoster: "",
    duration: 299,
    coverUrl: LetDown,
    audioUrl: Let_Down,
    mode: "normal",
    videoUrl: "https://example.com/videos/let-down.mp4", // Replace with actual video URL
    showVideoSecond: 218 // Show video at 3:35
  },
  {
    id: 8,
    title: "ILYSB",
    artist: "LANY",
    artistPoster: LANYPoster,
    duration: 241,
    coverUrl: ilysb,
    audioUrl: ILYSB,
    mode: "normal",
    videoUrl: "https://example.com/videos/ilysb.mp4", // Replace with actual video URL
    showVideoSecond: 50 // Show video at 50 seconds
  },
  {
    id: 9,
    title: "Back to Friends",
    artist: "The 1975",
    artistPoster: The1975Poster,
    duration: 201,
    coverUrl: BackToFriends,
    audioUrl: Back_To_Friends,
    mode: "normal",
    videoUrl: "https://example.com/videos/back-to-friends.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 10,
    title: "Cry",
    artist: "Cigarettes After Sex",
    artistPoster: "",
    duration: 257,
    coverUrl: Cry,
    audioUrl: CryAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 11,
    title: "Make It To The Morning",
    artist: "Party Next Door",
    artistPoster: PartyNextDoorPoster,
    duration: 168,
    coverUrl: MakeItToTheMorning,
    audioUrl: MakeItToTheMorningAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 12,
    title: "Dreamin",
    artist: "Party Next Door",
    artistPoster: PartyNextDoorPoster,
    duration: 147,
    coverUrl: Dreamin,
    audioUrl: DreaminAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 13,
    title: "One Of The Girls",
    artist: "The Weeknd",
    artistPoster: TheWeekndPoster,
    duration: 244,
    coverUrl: OneOfTheGirls,
    audioUrl: OneOfTheGirlsAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 14,
    title: "You",
    artist: "LANY",
    artistPoster: LANYPoster,
    duration: 272,
    coverUrl: You,
    audioUrl: YouAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 15,
    title: "Wildflower",
    artist: "Yung Kai",
    artistPoster: YungKaiPoster,
    duration: 175,
    coverUrl: Wildflower,
    audioUrl: WildflowerAudio,
    mode: "normal",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 16,
    title: "Contigo Siempre",
    artist: "Flamer Runner",
    artistPoster: "",
    duration: 85,
    coverUrl: ContigoSiempre,
    audioUrl: ContigoSiempreAudio,
    mode: "phonk",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 17,
    title: "Andromeda",
    artist: "Elysian",
    artistPoster: "",
    duration: 74,
    coverUrl: Andromeda,
    audioUrl: AndromedaAudio,
    mode: "phonk",
    videoUrl: "https://example.com/videos/cry.mp4", // Replace with actual video URL
    showVideoSecond: 1 // Show video at 1:20
  },
  {
    id: 18,
    title: "Montagem Xonada",
    artist: "MXZI, Dj Samir, DJ Javi26",
    artistPoster: "",
    duration: 324,
    coverUrl: MontagemXonada,
    audioUrl: MontagemXonadaAudio,
    mode: "phonk",
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