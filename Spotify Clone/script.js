let currentSong = new Audio();

let songs = [];
let masterSongs = [];
let songHistory = [];
let currFolder = "";

/* =========================================================
   STATIC MUSIC LIBRARY
   =========================================================
   IMPORTANT:
   These paths are relative to the deployed website root.
   ========================================================= */

const MUSIC_LIBRARY = [
    // Root /song/
    {
        name: "Alfaaz - Hamza Malik x Zain Zohaib.mp3",
        folder: ""
    },
    {
        name: "Anuv Jain - HUSN.mp3",
        folder: ""
    },
    {
        name: "Classroom - Prithibi.mp3",
        folder: ""
    },
    {
        name: "E Achena  -  Prithibi.mp3",
        folder: ""
    },
    {
        name: "Gehra Hua (Dhurandhar) - Shashwat Sachdev, Arijit Singh, Irshad Kamil.mp3",
        folder: ""
    },
    {
        name: "One Direction - Perfect.mp3",
        folder: ""
    },
    {
        name: "Pehla Pyaar - Armaan Malik  Vishal Mishra.mp3",
        folder: ""
    },
    {
        name: "Tera Mera Rishta Purana - Mustafa Zahid.mp3",
        folder: ""
    },
    {
        name: "ZAYN - Let Me - Copy (2).mp3",
        folder: ""
    },

    // Fossils
    {
        name: "Hansnuhana - Rupam Islam - Rupam Islam - Fossils.mp3",
        folder: "Fossils all songs"
    },
    {
        name: "Khnoro Aamar Fossil - Rupam Islam - Fossils.mp3",
        folder: "Fossils all songs"
    },
    {
        name: "Nemesis - Rupam Islam - Fossils.mp3",
        folder: "Fossils all songs"
    },

    // Kabir Singh
    {
        name: "Full Song Mere Sohneya  Kabir Singh  Shahid K, Kiara A, Sandeep V  Sachet - Parampara  Irshad K.mp3",
        folder: "Kabir Singh all songs"
    },
    {
        name: "Full Song Pehla Pyaar  Kabir Singh  Shahid Kapoor, Kiara Advani  Armaan Malik  Vishal Mishra.mp3",
        folder: "Kabir Singh all songs"
    },
    {
        name: "LYRICAL Kaise Hua  Kabir Singh  Shahid K, Kiara A, Sandeep V  Vishal Mishra, Manoj Muntashir.mp3",
        folder: "Kabir Singh all songs"
    },

    // Prithibi
    {
        name: "Classroom - Prithibi.mp3",
        folder: "Prithibi all songs"
    },
    {
        name: "E Achena  -  Prithibi.mp3",
        folder: "Prithibi all songs"
    }
];


/* =========================================================
   HELPERS
   ========================================================= */

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


/* =========================================================
   GET SONGS
   ========================================================= */

async function getSongs(folder = "") {

    currFolder = folder;

    songs = MUSIC_LIBRARY
        .filter(song => song.folder === folder)
        .map(song => song.name);

    renderSongList(songs);

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.value = "";
    }

    return songs;
}


/* =========================================================
   BUILD MASTER SEARCH DATABASE
   ========================================================= */

function fetchAllMasterSongs() {

    masterSongs = MUSIC_LIBRARY.map(song => ({
        name: song.name,
        folder: song.folder
    }));

    console.log("Master Songs Loaded:", masterSongs);
}


/* =========================================================
   RENDER SONG LIST
   ========================================================= */

function renderSongList(songArray) {

    const songList = document.querySelector(".songList");

    if (!songList) return;

    const songUL = songList.getElementsByTagName("ul")[0];

    songUL.innerHTML = "";

    for (const song of songArray) {

        songUL.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                
                <div class="info">
                    <div>${song}</div>
                    <div>Song Artist</div>
                </div>

                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="bottomplaybtn.svg" alt="">
                </div>
            </li>
        `;
    }


    Array.from(songUL.getElementsByTagName("li")).forEach((element) => {

        element.addEventListener("click", () => {

            const trackName =
                element.querySelector(".info")
                    .firstElementChild
                    .innerText
                    .trim();

            const songData = MUSIC_LIBRARY.find(
                song => song.name === trackName && song.folder === currFolder
            );

            if (songData) {
                playMusic(songData.name, songData.folder);
            }
        });

    });
}


/* =========================================================
   PLAY MUSIC
   ========================================================= */

function playMusic(
    track,
    targetFolder = currFolder,
    pause = false,
    isGoingBack = false
) {

    currFolder = targetFolder;

    const cleanTrack = decodeURIComponent(track)
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        .trim();


    const basePath = currFolder
        ? `/song/${encodeURIComponent(currFolder)}/`
        : `/song/`;


    currentSong.src =
        basePath + encodeURIComponent(cleanTrack);


    /* History */

    if (!isGoingBack) {

        const lastPlayed =
            songHistory[songHistory.length - 1];

        if (lastPlayed !== cleanTrack) {
            songHistory.push(cleanTrack);
        }
    }


    if (!pause) {

        currentSong
            .play()
            .then(() => {
                playButton.src = "pause.svg";
            })
            .catch(error => {
                console.error("Playback error:", error);
            });

    }


    document.querySelector(".songinfo").innerHTML =
        cleanTrack;

    document.querySelector(".songtime").innerHTML =
        "00:00 / 00:00";
}


/* =========================================================
   MAIN
   ========================================================= */

async function main() {

    /* -----------------------------------------------------
       INITIAL LOAD
       ----------------------------------------------------- */

    await getSongs("");

    fetchAllMasterSongs();


    if (songs.length > 0) {
        playMusic(songs[0], "", true);
    }


    /* =====================================================
       ELEMENT REFERENCES
       ===================================================== */

    const playButton =
        document.getElementById("play");

    const previousButton =
        document.getElementById("previous");

    const nextButton =
        document.getElementById("next");

    const shuffleButton =
        document.getElementById("shuffle");

    const repeatButton =
        document.getElementById("repeat");

    const libraryButton =
        document.getElementById("libraryBtn");

    const searchTab =
        document.getElementById("searchTab");

    const searchContainer =
        document.getElementById("searchContainer");

    const searchInput =
        document.getElementById("searchInput");

    const loginButton =
        document.querySelector(".loginbtn");

    const loginModal =
        document.getElementById("loginModal");

    const closeLogin =
        document.getElementById("closeLogin");


    /* =====================================================
       LIBRARY BUTTON
       ===================================================== */

    if (libraryButton) {

        libraryButton.addEventListener("click", async () => {

            await getSongs("");

            if (songs.length > 0) {
                playMusic(songs[0], "", true);
            }

        });

    }


    /* =====================================================
       ALBUM / FOLDER CARDS
       ===================================================== */

    Array.from(
        document.getElementsByClassName("card")
    ).forEach(card => {

        card.addEventListener("click", async event => {

            const folderName =
                event.currentTarget.dataset.folder;

            await getSongs(folderName);

            if (songs.length > 0) {
                playMusic(songs[0], folderName);
            }

        });

    });


    /* =====================================================
       PLAY / PAUSE
       ===================================================== */

    if (playButton) {

        playButton.addEventListener("click", () => {

            if (!currentSong.src) return;


            if (currentSong.paused) {

                currentSong
                    .play()
                    .then(() => {
                        playButton.src = "pause.svg";
                    })
                    .catch(error => {
                        console.error(
                            "Unable to play:",
                            error
                        );
                    });

            } else {

                currentSong.pause();

                playButton.src =
                    "bottomplaybtn.svg";
            }

        });

    }


    /* =====================================================
       TIME UPDATE
       ===================================================== */

    currentSong.addEventListener(
        "timeupdate",
        () => {

            document.querySelector(
                ".songtime"
            ).innerHTML =
                `${secondsToMinutesSeconds(currentSong.currentTime)}
                 / 
                 ${secondsToMinutesSeconds(currentSong.duration)}`;


            if (!isNaN(currentSong.duration)) {

                const progress =
                    (currentSong.currentTime /
                        currentSong.duration) * 100;

                document.querySelector(
                    ".circle"
                ).style.left =
                    progress + "%";
            }

        }
    );


    /* =====================================================
       SEEK BAR
       ===================================================== */

    const seekbar =
        document.querySelector(".seekbar");


    if (seekbar) {

        seekbar.addEventListener("click", event => {

            if (isNaN(currentSong.duration)) return;


            const rect =
                seekbar.getBoundingClientRect();

            const percent =
                ((event.clientX - rect.left) /
                    rect.width) * 100;


            document.querySelector(
                ".circle"
            ).style.left =
                percent + "%";


            currentSong.currentTime =
                (currentSong.duration * percent) / 100;

        });

    }


    /* =====================================================
       SONG ENDED
       ===================================================== */

    currentSong.addEventListener(
        "ended",
        () => {

            if (!currentSong.loop) {

                if (songs.length === 0) return;


                const currentName =
                    decodeURIComponent(
                        currentSong.src
                            .split("/")
                            .pop()
                    );


                const currentIndex =
                    songs.indexOf(currentName);


                const nextIndex =
                    currentIndex + 1 < songs.length
                        ? currentIndex + 1
                        : 0;


                playMusic(
                    songs[nextIndex],
                    currFolder
                );

            }

        }
    );


    /* =====================================================
       PREVIOUS
       ===================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (songHistory.length > 1) {

                    songHistory.pop();

                    const previousSong =
                        songHistory[
                            songHistory.length - 1
                        ];


                    playMusic(
                        previousSong,
                        currFolder,
                        false,
                        true
                    );

                }

            }
        );

    }


    /* =====================================================
       NEXT
       ===================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (songs.length === 0) return;


                const currentName =
                    decodeURIComponent(
                        currentSong.src
                            .split("/")
                            .pop()
                    );


                const currentIndex =
                    songs.indexOf(currentName);


                const nextIndex =
                    currentIndex + 1 < songs.length
                        ? currentIndex + 1
                        : 0;


                playMusic(
                    songs[nextIndex],
                    currFolder
                );

            }
        );

    }


    /* =====================================================
       SHUFFLE
       ===================================================== */

    if (shuffleButton) {

        shuffleButton.addEventListener(
            "click",
            () => {

                if (songs.length === 0) return;


                let randomIndex =
                    Math.floor(
                        Math.random() *
                        songs.length
                    );


                const currentName =
                    decodeURIComponent(
                        currentSong.src
                            .split("/")
                            .pop()
                    );


                /* Avoid selecting same song */

                if (
                    songs.length > 1 &&
                    songs[randomIndex] === currentName
                ) {

                    randomIndex =
                        (randomIndex + 1) %
                        songs.length;

                }


                playMusic(
                    songs[randomIndex],
                    currFolder
                );


                shuffleButton.style.filter =
                    shuffleButton.style.filter
                        ? ""
                        : "invert(50%) sepia(100%) saturate(500%)";

            }
        );

    }


    /* =====================================================
       REPEAT
       ===================================================== */

    if (repeatButton) {

        repeatButton.addEventListener(
            "click",
            () => {

                currentSong.loop =
                    !currentSong.loop;


                if (currentSong.loop) {

                    repeatButton.style.filter =
                        "invert(50%) sepia(100%) saturate(500%)";

                } else {

                    repeatButton.style.filter = "";

                }

            }
        );

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    if (
        searchTab &&
        searchContainer &&
        searchInput
    ) {

        searchTab.addEventListener(
            "click",
            () => {

                if (
                    searchContainer.style.display ===
                    "none"
                ) {

                    searchContainer.style.display =
                        "block";

                    searchInput.focus();

                } else {

                    searchContainer.style.display =
                        "none";

                    searchInput.value = "";

                    renderSongList(songs);

                }

            }
        );


        searchInput.addEventListener(
            "input",
            event => {

                const query =
                    event.target.value
                        .toLowerCase()
                        .trim();


                if (query === "") {

                    renderSongList(songs);

                    return;
                }


                const matchedSongs =
                    masterSongs.filter(song =>
                        song.name
                            .toLowerCase()
                            .includes(query)
                    );


                const songUL =
                    document
                        .querySelector(".songList")
                        .getElementsByTagName("ul")[0];


                songUL.innerHTML = "";


                for (
                    const item of matchedSongs
                ) {

                    songUL.innerHTML += `
                        <li>
                            <img
                                class="invert"
                                src="music.svg"
                                alt=""
                            >

                            <div class="info">
                                <div>${item.name}</div>
                                <div>
                                    ${
                                        item.folder ||
                                        "Local Library"
                                    }
                                </div>
                            </div>

                            <div class="playnow">
                                <span>Play Now</span>
                                <img
                                    class="invert"
                                    src="bottomplaybtn.svg"
                                    alt=""
                                >
                            </div>
                        </li>
                    `;
                }


                /* Attach search result events */

                Array.from(
                    songUL.getElementsByTagName("li")
                ).forEach((element, index) => {

                    element.addEventListener(
                        "click",
                        () => {

                            const selectedSong =
                                matchedSongs[index];


                            playMusic(
                                selectedSong.name,
                                selectedSong.folder
                            );

                        }
                    );

                });

            }
        );

    }


    /* =====================================================
       LOGIN MODAL
       ===================================================== */

    if (loginButton && loginModal) {

        loginButton.addEventListener(
            "click",
            () => {

                loginModal.style.display =
                    "flex";

            }
        );

    }


    if (closeLogin && loginModal) {

        closeLogin.addEventListener(
            "click",
            () => {

                loginModal.style.display =
                    "none";

            }
        );

    }


    window.addEventListener(
        "click",
        event => {

            if (
                event.target === loginModal
            ) {

                loginModal.style.display =
                    "none";

            }

        }
    );

}


/* =========================================================
   START APPLICATION
   ========================================================= */

main();