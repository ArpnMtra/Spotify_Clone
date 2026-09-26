let currentSong = new Audio();
let songs = []; // Current active view songs
let masterSongs = []; // Holds ALL songs from root and all subfolders for global search
let songHistory = [];
let currFolder = ""; // Tracks the currently active folder/playlist

// ==========================================
// FETCH SONGS & SCAN ALL FOLDERS GLOBALLY
// ==========================================
async function getSongs(folder = "") {
    currFolder = folder; 
    let url = folder ? `http://127.0.0.1:3000/song/${folder}/` : "http://127.0.0.1:3000/song/";
    
    let a = await fetch(url);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    
    songs = []; 
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let rawHref = element.getAttribute("href");
            let songName = decodeURIComponent(rawHref).replace(/\\/g, '/').split("/").pop().trim();
            songs.push(songName);
        }
    }

    // Render the songs dynamically into your .songList UI container
    renderSongList(songs);

    // Clear search box when switching folders/library
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = "";
    }

    return songs;
}

// Helper to render any song list array to the UI
function renderSongList(songArray) {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songArray) {
        songUL.innerHTML += `<li> 
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Song Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="bottomplaybtn.svg" alt="">
            </div> 
        </li>`;
    }

    // Re-attach click event listeners to each rendered song card
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            let trackName = e.querySelector(".info").firstElementChild.innerText.trim();
            console.log("Playing:", trackName);
            playMusic(trackName, currFolder);
        });
    });
}

// Scan root and all subfolders to build a master search database
async function fetchAllMasterSongs() {
    masterSongs = [];
    try {
        let res = await fetch("http://127.0.0.1:3000/song/");
        let text = await res.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        
        let subfolders = [];
        
        for (let el of as) {
            let href = el.getAttribute("href");
            let decoded = decodeURIComponent(href).replace(/\\/g, '/');
            
            if (decoded.endsWith(".mp3")) {
                let songName = decoded.split("/").pop().trim();
                masterSongs.push({ name: songName, folder: "" });
            } else if (decoded.endsWith("/") && !decoded.includes("..")) {
                let folderName = decoded.split("/").filter(Boolean).pop();
                if (folderName && folderName !== "song") {
                    subfolders.push(folderName);
                }
            }
        }
        
        // Fetch contents of each subfolder
        for (let folder of subfolders) {
            try {
                let subRes = await fetch(`http://127.0.0.1:3000/song/${folder}/`);
                let subText = await subRes.text();
                let subDiv = document.createElement("div");
                subDiv.innerHTML = subText;
                let subAs = subDiv.getElementsByTagName("a");
                
                for (let el of subAs) {
                    let subHref = el.getAttribute("href");
                    let subDecoded = decodeURIComponent(subHref).replace(/\\/g, '/');
                    if (subDecoded.endsWith(".mp3")) {
                        let songName = subDecoded.split("/").pop().trim();
                        masterSongs.push({ name: songName, folder: folder });
                    }
                }
            } catch (err) {
                console.error("Could not load folder:", folder);
            }
        }
        console.log("Master Global Songs Database Loaded:", masterSongs);
    } catch (e) {
        console.error("Error building master song list", e);
    }
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// ==========================================
// PLAY MUSIC FUNCTION (Folder & History Aware)
// ==========================================
const playMusic = (track, targetFolder = currFolder, pause = false, isGoingBack = false) => {
    currFolder = targetFolder;
    let cleanTrack = decodeURIComponent(track).replace(/\\/g, '/').split("/").pop().trim();
    
    let basePath = currFolder ? `/song/${currFolder}/` : `/song/`;
    currentSong.src = basePath + encodeURIComponent(cleanTrack);

    if (!isGoingBack) {
        let lastPlayed = songHistory[songHistory.length - 1];
        if (lastPlayed !== cleanTrack) {
            songHistory.push(cleanTrack);
        }
    }

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = cleanTrack;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function main() {
    // 1. Fetch default root songs on startup & build global search index
    await getSongs();  
    await fetchAllMasterSongs();

    // Auto-load the first track into audio (paused by default) if songs exist
    if (songs.length > 0) {
        playMusic(songs[0], "", true);
    }

    // ==========================================
    // YOUR LIBRARY RESET TO ROOT SONGS
    // ==========================================
    const libraryBtn = document.getElementById("libraryBtn");
    if (libraryBtn) {
        libraryBtn.addEventListener("click", async () => {
            console.log("Loading root library songs...");
            await getSongs(""); 
            if (songs.length > 0) {
                playMusic(songs[0], "", true);
            }
        });
    }

    // ==========================================
    // ALBUM / FOLDER CARD CLICK LISTENERS
    // ==========================================
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder;
            console.log("Loading folder playlist:", folderName);
            
            await getSongs(folderName);
            
            if (songs.length > 0) {
                playMusic(songs[0], folderName);
            }
        });
    });

    // ==========================================
    // MAIN PLAY/PAUSE BUTTON EVENT LISTENER
    // ==========================================
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "bottomplaybtn.svg";
        }
    });

    // ==========================================
    // TIME UPDATE EVENT LISTENER
    // ==========================================
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        if (!isNaN(currentSong.duration)) {
            let progress = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".circle").style.left = progress + "%";
        }
    });

    // ==========================================
    // SEEKBAR CLICK EVENT (JUMP TO TIMESTAMP)
    // ==========================================
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // ==========================================
    // PREVIOUS BUTTON FUNCTIONALITY (History-based)
    // ==========================================
    previous.addEventListener("click", () => {
        console.log("Previous clicked, history stack:", songHistory);

        if (songHistory.length > 1) {
            songHistory.pop();
            let previousSong = songHistory[songHistory.length - 1];
            playMusic(previousSong, currFolder, false, true);
        } else {
            console.log("No previous song in history.");
        }
    });

    // ==========================================
    // NEXT BUTTON FUNCTIONALITY
    // ==========================================
    next.addEventListener("click", () => {
        let currentDecodedName = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let exactIndex = songs.indexOf(currentDecodedName);

        if ((exactIndex + 1) < songs.length) {
            playMusic(songs[exactIndex + 1], currFolder);
        } else {
            playMusic(songs[0], currFolder);
        }
    });

    // ==========================================
    // SHUFFLE BUTTON FUNCTIONALITY
    // ==========================================
    shuffle.addEventListener("click", () => {
        let randomIndex = Math.floor(Math.random() * songs.length);
        playMusic(songs[randomIndex], currFolder);
        shuffle.style.filter = shuffle.style.filter ? "" : "invert(50%) sepia(100%) saturate(500%)";
    });

    // ==========================================
    // REPEAT BUTTON FUNCTIONALITY
    // ==========================================
    repeat.addEventListener("click", () => {
        currentSong.loop = !currentSong.loop;
        if (currentSong.loop) {
            repeat.style.filter = "invert(50%) sepia(100%) saturate(500%)";
        } else {
            repeat.style.filter = "";
        }
    });

    // ==========================================
    // GLOBAL DIRECTORY SEARCH BAR FUNCTIONALITY
    // ==========================================
    const searchTab = document.getElementById("searchTab");
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");

    searchTab.addEventListener("click", () => {
        if (searchContainer.style.display === "none") {
            searchContainer.style.display = "block";
            searchInput.focus();
        } else {
            searchContainer.style.display = "none";
            searchInput.value = "";
            renderSongList(songs); // Reset view back to current folder list
        }
    });

    // Search globally across masterSongs database
    searchInput.addEventListener("input", (e) => {
        let query = e.target.value.toLowerCase();
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";

        if (query.trim() === "") {
            renderSongList(songs);
            return;
        }

        let matchedSongs = masterSongs.filter(s => s.name.toLowerCase().includes(query));

        for (const item of matchedSongs) {
            songUL.innerHTML += `<li> 
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${item.name}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="bottomplaybtn.svg" alt="">
                </div> 
            </li>`;
        }

        // Attach click events to the globally searched results
        Array.from(songUL.getElementsByTagName("li")).forEach((liElement, idx) => {
            liElement.addEventListener("click", () => {
                let trackToPlay = matchedSongs[idx].name;
                let folderToPlay = matchedSongs[idx].folder;
                playMusic(trackToPlay, folderToPlay);
            });
        });
    });

    // ==========================================
    // LOGIN MODAL CONTROLLER
    // ==========================================
    const loginbtn = document.querySelector(".loginbtn");
    const loginModal = document.getElementById("loginModal");
    const closeLogin = document.getElementById("closeLogin");

    if (loginbtn) {
        loginbtn.addEventListener("click", () => {
            loginModal.style.display = "flex";
        });
    }

    if (closeLogin) {
        closeLogin.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = "none";
        }
    });
}

main();


