document.addEventListener("DOMContentLoaded", function () {
    let editorModal = document.createElement("div");
    editorModal.id = "editor-modal";
    editorModal.innerHTML = `
        <div id="editor-container">
            <textarea id="editor-textarea"></textarea>
            <div id="editor-status">-- INSERT --</div>
        </div>
    `;
    document.body.appendChild(editorModal);

    let isCommandMode = false;
    let commandBuffer = "";
    let cursorPosition = 0;
    let currentFileName = "";
    let fileContent = "";
    let currentDir = "";

    function getCurrentDirectory() {
        return new Promise((resolve, reject) => {
            let dirListener = function (event) {
                let receivedDir = event.data.trim();
                if (receivedDir) {
                    terminalSocket.removeEventListener("message", dirListener);
                    resolve(receivedDir);
                } else {
                    reject("Failed to fetch current directory.");
                }
            };

            terminalSocket.addEventListener("message", dirListener);
            terminalSocket.send("pwd");
        });
    }

    async function openTextEditor(fileName) {
        currentFileName = fileName;
        editorModal.style.display = "block";
        const editorTextarea = document.getElementById("editor-textarea");
        editorTextarea.focus();

        try {
            currentDir = await getCurrentDirectory(); // ✅ Correct working directory

            // ✅ Fetch file contents using `cat` for accurate reading
            let response = await fetch(`http://localhost:8000/load?file=${encodeURIComponent(fileName)}&dir=${encodeURIComponent(currentDir)}`);
            let data = await response.json();

            if (data.exists) {
                fileContent = data.content;
                editorTextarea.value = fileContent; // ✅ Show file contents
            } else {
                fileContent = "";
                editorTextarea.value = ""; // ✅ Blank new file
            }
        } catch (error) {
            console.error("Error loading file:", error);
        }
    }

    function closeTextEditor() {
        editorModal.style.display = "none";
    }

    async function saveFile() {
        const textContent = document.getElementById("editor-textarea").value;

        try {
            let response = await fetch("http://localhost:8000/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: currentFileName, content: textContent, dir: currentDir })
            });

            if (response.ok) {
                fileContent = textContent; // ✅ Update stored content
                closeTextEditor();
                alert(`✅ File '${currentFileName}' saved!`);
            } else {
                alert("❌ Failed to save the file.");
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    }

    function enterCommandMode() {
        isCommandMode = true;
        commandBuffer = "";
        cursorPosition = document.getElementById("editor-textarea").selectionStart;
        document.getElementById("editor-textarea").style.caretColor = "transparent";
        document.getElementById("editor-status").innerText = `:`;
    }

    function exitCommandMode() {
        isCommandMode = false;
        document.getElementById("editor-textarea").style.caretColor = "limegreen";
        document.getElementById("editor-status").innerText = "-- INSERT --";
        document.getElementById("editor-textarea").selectionStart = cursorPosition;
        document.getElementById("editor-textarea").selectionEnd = cursorPosition;
    }

    document.getElementById("editor-textarea").addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            if (isCommandMode) {
                exitCommandMode();
            } else {
                enterCommandMode();
            }
            event.preventDefault();
            return;
        }

        if (isCommandMode) {
            if (event.key === "Backspace") {
                commandBuffer = commandBuffer.slice(0, -1);
                document.getElementById("editor-status").innerText = `:${commandBuffer}`;
                event.preventDefault();
                return;
            }

            if (event.key === "Enter") {
                if (commandBuffer === "q") {
                    closeTextEditor(); // ✅ Quit without saving
                } else if (commandBuffer === "wq") {
                    saveFile(); // ✅ Save and quit
                } else {
                    document.getElementById("editor-status").innerText = "-- INVALID COMMAND --";
                    setTimeout(() => document.getElementById("editor-status").innerText = "-- COMMAND MODE --", 1000);
                }
                commandBuffer = "";
                event.preventDefault();
                return;
            }

            if (event.key.length === 1) {
                commandBuffer += event.key;
                document.getElementById("editor-status").innerText = `:${commandBuffer}`;
                event.preventDefault();
                return;
            }
        }
    });

    window.openTextEditor = openTextEditor;
});
