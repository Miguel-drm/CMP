import AboutYou from "../assets/Album/AboutYou.png"
import Blue from "../assets/Album/Blue.png"
import Multo from "../assets/Album/Multo.png"
import AboutYouAudio from "../assets/Audio/About You.mp3"
import BlueAudio from "../assets/Audio/Blue.mp3"
import MultoAudio from "../assets/Audio/Multo.mp3"
export const tracks = [
  {
    id: 1,
    title: "About You",
    artist: "The 1975",
    album: "Album 1",
    duration: 326,
    coverUrl: AboutYou,
    audioUrl: AboutYouAudio
  },
  {
    id: 2,
    title: "Blue",
    artist: "Yung Kai",
    album: "Album 2",
    duration: 221,
    coverUrl: Blue,
    audioUrl: BlueAudio
  },
  {
    id: 3,
    title: "Multo",
    artist: "Cup of Joe",
    album: "Album 3",
    duration: 240,
    coverUrl: Multo,
    audioUrl: MultoAudio
  }
];