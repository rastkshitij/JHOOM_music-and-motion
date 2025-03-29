const API_KEY = "AIzaSyCC8YSPH9OVinomnNPWQpluqzvgE2bTdhA"; // Replace with your API Key
const searchInput = document.getElementById("spotify-search");
const searchResults = document.getElementById("search-results");
const youtubeFrame = document.getElementById("spotify-frame"); // Reusing the frame

// Function to Search on YouTube
function searchYouTube() {
    const query = searchInput.value.trim();
    if (!query) return;

    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            searchResults.innerHTML = "";
            if (data.items.length === 0) {
                searchResults.innerHTML = "<p>No results found</p>";
                return;
            }

            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                
                const resultItem = document.createElement("p");
                resultItem.innerHTML = `🎵 ${title}`;
                resultItem.onclick = () => playSong(videoId);
                searchResults.appendChild(resultItem);
            });
        })
        .catch(error => console.error("YouTube Search Error:", error));
}

// Function to Play Selected Song
function playSong(videoId) {
    youtubeFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

// Attach Event to Button
document.querySelector("button").addEventListener("click", searchYouTube);
