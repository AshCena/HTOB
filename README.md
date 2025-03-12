# Terminal on browser 🖥️

Hosted Terminal on browser (HTOB) is a modern, browser-based terminal and file management interface that allows you to connect to and interact with remote servers, cloud instances, and local environments directly from your web browser.

TOB Interface

## 🚀 Features

### 💻 Terminal Access
- Full-featured terminal emulation in your browser
- Execute commands remotely as if you were directly connected to SSH
- Persistent terminal sessions with auto-reconnect capability
- Command history and rich command output formatting

### 📂 File Explorer
- Intuitive file browsing interface with folder navigation
- File upload and download functionality
- Create new folders and organize your files
- Visual file/folder representations with icons

### 🔌 Remote Connectivity
- Connect to AWS, GCP, Azure, or any cloud-based instances
- Access on-premise servers through WebSocket connections
- No need for SSH clients or additional software installations
- Works securely across firewalls and restricted networks

### 🛠️ Additional Tools
- Test connection feature to monitor server response times
- Deployer functionality for one-click deployments
- Multi-tab interface for organized workflow

## 🔧 Technical Overview

HTOB leverages WebSockets to create persistent, real-time connections to remote servers. The architecture consists of:

- **Frontend**: Modern HTML, CSS, and JavaScript interface
- **Backend**: Fast and efficient Python-based API server using FastAPI
- **Communication**: Real-time WebSocket protocol for bidirectional data transfer

## 📋 Usage Guide

### Getting Started

1. Clone the repository and install dependencies
2. Configure the server connection details
3. Start the server with `uvicorn server:app --reload --host 0.0.0.0 --port 8000 `
4. Host the fronend using ` python3 -m http.server 8002`
5. Access the interface at `http://<ipadress>:8002`

### Terminal Operations

The terminal provides full command-line functionality:

```bash
# Navigate directories
cd /path/to/directory

# List files
ls -la

# Run server commands example
sudo systemctl status nginx
```

### File Operations

The file manager supports common file operations:

- **Browsing**: Click on folders to navigate the directory structure
- **Uploading**: Use the upload button to transfer files from your local machine
- **Downloading**: Click on any file to download it to your local machine
- **Creating Directories**: Use the "New Folder" button or the `mkdir` command

## 🔐 Security Considerations

- Implement proper authentication before deploying in production
- Use HTTPS for secure connections
- Consider adding role-based access controls for team environments
- Limit file system access to appropriate directories

## 🌐 Use Cases

### Cloud Management
Connect to AWS EC2 instances, GCP Compute Engine VMs, or Azure virtual machines without managing SSH keys or dealing with complex network configurations.

### DevOps Workflows
Quickly access and manage production servers, deploy updates, and troubleshoot issues from anywhere with just a web browser.

### Remote Development
Access your development environment from any device with a modern web browser, perfect for remote work or when you need to quickly fix something while away from your workstation.

### Educational Environments
Provide students with terminal access to learning environments without requiring them to install specialized software or manage SSH connections.

## 🔄 Customization

CloudShell can be customized in several ways:

- Modify the CSS to match your organization's branding
- Add custom commands or functionality to the server
- Extend the interface with additional tabs and features
- Implement authentication systems appropriate for your environment

## 📋 Requirements

- Python 3.7+
- Web browser with WebSocket support
- Network connection to target servers

## 🏁 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/cloudshell.git

# Navigate to the project directory
cd HTOB

# Install dependencies
pip install fastapi uvicorn websockets

# Start the server
uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
python3 -m http.server 8002 &
```

## 📝 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/cloudshell/issues).
