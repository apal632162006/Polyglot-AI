let isRecording = false;
let recognition;
let isProcessing = false;

const SpeechRecognitionClass =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

if (SpeechRecognitionClass) {
    recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Set a default language

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("question").value = transcript;
        document.getElementById("status").innerText = `Recognized: "${transcript}"`;
        // Delay to allow user to see transcript before sending
        setTimeout(() => sendQuestion(), 400);
    };

    recognition.onerror = (event) => {
        document.getElementById("status").innerText = `Speech error: ${event.error}`;
        stopRecording();
    };

    recognition.onend = stopRecording;
}

function handleKeyPress(event) {
    if (event.key === "Enter" && !isProcessing) sendQuestion();
}

function showDebug(msg) {
    const dbg = document.getElementById("debug");
    dbg.style.display = "block";
    dbg.innerText = msg;
    console.error("DEBUG:", msg);
}

// Ensure the function is defined before the HTML uses it
window.handleKeyPress = handleKeyPress;
window.sendQuestion = sendQuestion;
window.toggleRecording = toggleRecording;

async function sendQuestion() {
    if (isProcessing) return;

    const question = document.getElementById("question").value.trim();
    if (!question) {
        document.getElementById("status").innerText = "Type something first.";
        return;
    }

    isProcessing = true;
    document.getElementById("sendBtn").disabled = true;
    document.getElementById("answer").innerText = "";
    document.getElementById("status").innerHTML = "Thinking…";
    document.getElementById("debug").style.display = "none"; // Hide previous debug

    try {
        // *** FIX: Using absolute URL to ensure connection to Node server on port 3000 ***
        const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: question })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status ${response.status}. ${errorText}`);
        }

        const data = await response.json();
        const reply = data.reply;

        document.getElementById("answer").innerText = reply;
        document.getElementById("status").innerText = "✓ Complete";

        if ("speechSynthesis" in window) speakText(reply);

    } catch (err) {
        document.getElementById("answer").innerText = "Error connecting or server issue.";
        showDebug(`Error: ${err.message}`);
    }

    isProcessing = false;
    document.getElementById("sendBtn").disabled = false;
}

function speakText(text) {
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(u);
    } catch (e) {
        console.warn("Speech Synthesis failed:", e);
    }
}

function toggleRecording() {
    if (!recognition) {
        document.getElementById("status").innerText = "Speech recognition is not supported by your browser.";
        return;
    }
    if (isProcessing) return;

    if (isRecording) recognition.stop();
    else {
        document.getElementById("question").value = "";
        recognition.start();
        isRecording = true;
        document.getElementById("micBtn").innerText = "⏹️ Stop";
        document.getElementById("status").innerText = "Listening…";
    }
}

function stopRecording() {
    isRecording = false;
    document.getElementById("micBtn").innerHTML = "🎤 Speak";
}