document.addEventListener("DOMContentLoaded", function () {
    const terminalOutput = document.getElementById("terminal-output");
    const terminalInput = document.getElementById("terminal-input");
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    let currentDir = "~"; // Default directory display

    // ✅ WebSocket Connection for Terminal
    let terminalSocket = null;

    function connectTerminalSocket() {
        if (terminalSocket && terminalSocket.readyState === WebSocket.OPEN) return; // Prevent multiple connections

        terminalSocket = new WebSocket("ws://localhost:8000/ws/terminal");

        terminalSocket.onopen = function () {
            console.log("✅ Terminal WebSocket Connected");
            terminalOutput.innerHTML = `✅ Connected to Server Terminal\n`;
            terminalSocket.send("pwd"); // Get initial working directory
        };

        terminalSocket.onmessage = function (event) {
            terminalOutput.innerHTML += `\n${event.data}`;
            scrollTerminalToBottom();
        };

        terminalSocket.onerror = function (error) {
            console.error("❌ Terminal WebSocket Error:", error);
        };

        // 🔄 Handle WebSocket Closure (Auto Reconnect)
        terminalSocket.onclose = function () {
            console.warn("⚠️ Terminal WebSocket Disconnected! Reconnecting...");
            setTimeout(connectTerminalSocket, 3000);
        };
    }

    connectTerminalSocket(); // Establish terminal connection

    // terminalInput.addEventListener("keypress", function (event) {
    //     if (event.key === "Enter") {
    //         let command = terminalInput.value.trim();
    //         terminalInput.value = "";
    //
    //         if (command) {
    //             terminalOutput.innerHTML += `\n<span class="user-command">${currentDir} > ${command}</span>`;
    //             scrollTerminalToBottom();
    //             terminalSocket.send(command);
    //         }
    //     }
    // });


          terminalInput.addEventListener("keypress", function (event) {
                if (event.key === "Enter") {
                    let command = terminalInput.value.trim();
                    terminalInput.value = "";

                    if (command === "clear") {
                        terminalOutput.innerHTML = ""; // Clears the terminal UI
                        return;
                    }

                    if (command.startsWith("vi ")) {
                        let fileName = command.split(" ")[1];
                        if (!fileName) {
                            terminalOutput.innerHTML += `\nError: Please provide a file name`;
                            return;
                        }
                        openTextEditor(fileName);
                        return;
                    }

                    if (command) {
                        terminalOutput.innerHTML += `\n<span class="user-command">${currentDir} > ${command}</span>`;
                        scrollTerminalToBottom();

                        // 🚀 Only send the command if it's NOT 'clear'
                        if (command !== "clear") {
                            terminalSocket.send(command);
                        }
                    }
                }
            });


    function scrollTerminalToBottom() {
        setTimeout(() => {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }, 100);
    }

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.style.display = "none");

            this.classList.add("active");
            const tabId = this.getAttribute("data-tab");
            document.getElementById(tabId).style.display = "block";

            if (tabId === "file-share") {
                connectFileSocket(); // Ensure File Manager WebSocket is active
                setTimeout(() => {
                    fileSocket.send("pwd");
                    fileSocket.send("ls");
                }, 500);
            }
        });
    });

    function setDefaultTab() {
        document.querySelector(".tab-button[data-tab='terminal']").classList.add("active");
        document.getElementById("terminal").style.display = "block";
    }

    setDefaultTab();
});


/* 🚀 File Explorer Functionality */
document.addEventListener("DOMContentLoaded", function () {
    const fileTerminalOutput = document.getElementById("file-terminal-output");
    const fileTerminalInput = document.getElementById("file-terminal-input");
    const fileListContainer = document.getElementById("file-list");
    let currentDir = "/"; // Default directory

    let fileSocket = null;

    function connectFileSocket() {
        if (fileSocket && fileSocket.readyState === WebSocket.OPEN) return; // Prevent multiple connections

        fileSocket = new WebSocket("ws://localhost:8000/ws/file");

        fileSocket.onopen = function () {
            console.log("✅ File WebSocket Connected");
            fileTerminalOutput.innerHTML = `✅ Connected to File Manager\n📂 ${currentDir} > `;
            fileSocket.send("pwd"); // Get initial directory
            fileSocket.send("ls"); // Fetch file list
        };

        fileSocket.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (data.type === "pwd") {
                currentDir = data.path;
                updateTerminal(`📂 ${currentDir} > `);
            } else if (data.type === "list") {
                updateFileList(data.items);document.addEventListener("DOMContentLoaded", function () {
    const terminalOutput = document.getElementById("terminal-output");
    const terminalInput = document.getElementById("terminal-input");
    const fileTerminalOutput = document.getElementById("file-terminal-output");
    const fileTerminalInput = document.getElementById("file-terminal-input");
    const fileListContainer = document.getElementById("file-list");
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    let currentDir = "~";
    let terminalSocket = null;
    let fileSocket = null;

    function connectTerminalSocket() {
        if (terminalSocket && terminalSocket.readyState === WebSocket.OPEN) return;

        terminalSocket = new WebSocket("ws://localhost:8000/ws/terminal");

        terminalSocket.onopen = function () {
            console.log("✅ Terminal WebSocket Connected");
            terminalOutput.innerHTML = `✅ Connected to Server Terminal\n`;
            terminalSocket.send("pwd");
        };

        terminalSocket.onmessage = function (event) {
            terminalOutput.innerHTML += `\n${event.data}`;
            scrollTerminalToBottom();
        };

        terminalSocket.onerror = function (error) {
            console.error("❌ Terminal WebSocket Error:", error);
        };

        terminalSocket.onclose = function () {
            console.warn("⚠️ Terminal WebSocket Disconnected! Reconnecting...");
            setTimeout(connectTerminalSocket, 3000);
        };
    }

    function connectFileSocket() {
        if (fileSocket && fileSocket.readyState === WebSocket.OPEN) return;

        fileSocket = new WebSocket("ws://localhost:8000/ws/file");

        fileSocket.onopen = function () {
            console.log("✅ File WebSocket Connected");
            fileTerminalOutput.innerHTML = `✅ Connected to File Manager\n📂 ${currentDir} > `;
            fileSocket.send("pwd");
            fileSocket.send("ls");
        };

        fileSocket.onmessage = function (event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "pwd") {
                    currentDir = data.path;
                    updateFileTerminal(`📂 ${currentDir} > `);
                } else if (data.type === "list") {
                    updateFileList(data.items);
                } else {
                    updateFileTerminal(data.message);
                }
            } catch (error) {
                console.error("❌ Error parsing WebSocket message:", error, event.data);
            }
        };

        fileSocket.onerror = function (error) {
            console.error("❌ File Manager WebSocket Error:", error);
        };

        fileSocket.onclose = function () {
            console.warn("⚠️ File WebSocket Disconnected! Reconnecting...");
            setTimeout(connectFileSocket, 3000);
        };
    }

    terminalInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            let command = terminalInput.value.trim();
            terminalInput.value = "";

            if (command) {
                terminalOutput.innerHTML += `\n<span class="user-command">${currentDir} > ${command}</span>`;
                scrollTerminalToBottom();
                terminalSocket.send(command);
            }
        }
    });

    fileTerminalInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            let command = fileTerminalInput.value.trim();
            fileTerminalInput.value = "";
            if (command) {
                updateFileTerminal(`> ${command}`);
                fileSocket.send(command);
            }
        }
    });

    function updateFileTerminal(message) {
        fileTerminalOutput.innerHTML = message;
        scrollFileTerminal();
    }

    function updateFileList(items) {
        fileListContainer.innerHTML = "";
        items.forEach(item => {
            const fileElement = document.createElement("div");
            fileElement.classList.add("file-item");
            const iconSrc = item.isDirectory
                ? "https://cdn-icons-png.flaticon.com/512/716/716784.png"
                : "https://cdn-icons-png.flaticon.com/512/2331/2331878.png";
            fileElement.innerHTML = `<img src="${iconSrc}" width="50" height="50"><span>${item.name}</span>`;
            fileElement.onclick = function () {
                if (item.isDirectory) {
                    fileSocket.send(`cd ${item.name}`);
                    fileSocket.send("pwd");
                    fileSocket.send("ls");
                } else {
                    const encodedPath = encodeURIComponent(item.path);
                    window.location.href = `http://localhost:8000/download?file_path=${encodedPath}`;
                }
            };
            fileListContainer.appendChild(fileElement);
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.style.display = "none");
            this.classList.add("active");
            const tabId = this.getAttribute("data-tab");
            document.getElementById(tabId).style.display = "block";

            if (tabId === "file-share") {
                if (!fileSocket || fileSocket.readyState !== WebSocket.OPEN) {
                    connectFileSocket();
                }
                setTimeout(() => {
                    fileSocket.send("pwd");
                    fileSocket.send("ls");
                }, 500);
            }
        });
    });

    function scrollTerminalToBottom() {
        setTimeout(() => {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }, 100);
    }

    function scrollFileTerminal() {
        setTimeout(() => {
            fileTerminalOutput.scrollTop = fileTerminalOutput.scrollHeight;
        }, 100);
    }

    function setDefaultTab() {
        document.querySelector(".tab-button[data-tab='terminal']").classList.add("active");
        document.getElementById("terminal").style.display = "block";
    }

    setDefaultTab();
    connectTerminalSocket();
});

            } else {
                updateTerminal(data.message);
            }
        };

        fileSocket.onerror = function (error) {
            console.error("❌ File Manager WebSocket Error:", error);
        };

        // 🔄 Handle WebSocket Closure (Auto Reconnect)
        fileSocket.onclose = function () {
            console.warn("⚠️ File WebSocket Disconnected! Reconnecting...");
            setTimeout(connectFileSocket, 3000);
        };
    }

    document.querySelector(".tab-button[data-tab='file-share']").addEventListener("click", function () {
        connectFileSocket();
        setTimeout(() => {
            fileSocket.send("pwd");
            fileSocket.send("ls");
        }, 500);
    });

    fileTerminalInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            let command = fileTerminalInput.value.trim();
            fileTerminalInput.value = "";
            if (command) {
                updateTerminal(`> ${command}`);
                fileSocket.send(command);
            }
        }
    });

    function updateTerminal(message) {
        fileTerminalOutput.innerHTML = message; // Replace previous output
        scrollFileTerminal();
    }

    function scrollFileTerminal() {
        setTimeout(() => {
            fileTerminalOutput.scrollTop = fileTerminalOutput.scrollHeight;
        }, 100);
    }

    // ✅ Fix file disappearing issue
function updateFileList(items) {
    fileListContainer.innerHTML = "";

    items.forEach(item => {
        const fileElement = document.createElement("div");
        fileElement.classList.add("file-item");

        // Default Icons for Files and Folders
        const iconSrc = item.isDirectory
            ? "https://cdn-icons-png.flaticon.com/512/716/716784.png"
            : "https://cdn-icons-png.flaticon.com/512/2331/2331878.png"; // File icon

        fileElement.innerHTML = `
            <img src="${iconSrc}" width="50" height="50">
            <span>${item.name}</span>
        `;

        fileElement.onclick = function () {
            if (item.isDirectory) {
                fileSocket.send(`cd ${item.name}`);
                fileSocket.send("pwd");
                fileSocket.send("ls");
            } else {
                if (!item.path) {
                    console.error("❌ Error: File path is undefined");
                    return;
                }

                console.log(`📂 Downloading file: ${item.path}`);

                // ✅ Make a direct API call to download the file
                const encodedPath = encodeURIComponent(item.path);
                window.location.href = `http://localhost:8000/download?file_path=${encodedPath}`;
            }
        };

        fileListContainer.appendChild(fileElement);
    });
}


    // Upload Files
    window.uploadFiles = function () {
        const files = document.getElementById("file-upload").files;
        if (files.length === 0) {
            alert("No files selected.");
            return;
        }

        const formData = new FormData();
        for (const file of files) {
            formData.append("files", file);
        }

        fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData,
        }).then(response => {
            if (response.ok) {
                alert("✅ Files uploaded successfully!");
                fileSocket.send("ls"); // Refresh File List
            }
        }).catch(error => console.error("Upload Error:", error));
    };

    // Create New Folder
    window.createFolder = function () {
        const folderName = prompt("Enter folder name:");
        if (folderName) {
            fileSocket.send(`mkdir ${folderName}`);
            fileSocket.send("ls");
        }
    };
});

