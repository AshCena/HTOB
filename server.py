import asyncio
import os
import subprocess
import shutil
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active user session directories
user_sessions = {}


### 🚀 1️⃣ WebSocket for Terminal Commands ###
@app.websocket("/ws/terminal")
async def terminal_ws(websocket: WebSocket):
    await websocket.accept()
    user_sessions[websocket] = os.getcwd()  # Set initial directory

    try:
        while True:
            command = await websocket.receive_text()
            print(f"🖥️ Received Command: {command}")
            current_dir = user_sessions[websocket]  # Get user's session directory

            # Handle 'cd' separately
            if command.startswith("cd"):
                new_path = command[3:].strip()

                if new_path == "..":  # Handle "cd .."
                    new_dir = os.path.dirname(current_dir)
                elif new_path == "":  # Handle "cd" alone (go to home)
                    new_dir = os.path.expanduser("~")
                else:
                    new_dir = os.path.join(current_dir, new_path)

                # Validate if the directory exists
                if os.path.isdir(new_dir):
                    user_sessions[websocket] = new_dir  # Update session directory
                    await websocket.send_text(f"📁 Changed directory to: {new_dir}")
                else:
                    await websocket.send_text(f"❌ Directory not found: {new_path}")
                continue  # Skip running subprocess for 'cd' command

            # Execute command inside user's session directory
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=current_dir  # Run command in user's session directory
            )

            stdout, stderr = await process.communicate()

            if stdout:
                await websocket.send_text(stdout.decode().strip())

            if stderr:
                await websocket.send_text(f"❌ Error: {stderr.decode().strip()}")

            # Send updated current directory after each command
            await websocket.send_text(f"\n📂 {user_sessions[websocket]} > ")



    except WebSocketDisconnect:
        print("⚠️ Terminal WebSocket Disconnected")

    finally:
        await websocket.close()
        print("❌ WebSocket Connection Closed")


@app.websocket("/ws/file")
async def file_manager(websocket: WebSocket):
    await websocket.accept()
    user_sessions[websocket] = os.getcwd()  # Set user's initial directory

    try:
        while True:
            command_text = await websocket.receive_text()
            print(f"✅ Received File Command: {command_text}")

            try:
                command = command_text.strip()
                current_dir = user_sessions[websocket]

                if command == "pwd":
                    await websocket.send_json({"type": "pwd", "path": current_dir})

                elif command == "ls":
                    files = list_files(current_dir)
                    await websocket.send_json({"type": "list", "items": files})

                elif command.startswith("cd"):
                    new_path = command[3:].strip()

                    if new_path == "..":
                        new_dir = os.path.dirname(current_dir)
                    elif new_path == "":
                        new_dir = os.path.expanduser("~")
                    else:
                        new_dir = os.path.join(current_dir, new_path)

                    if os.path.isdir(new_dir):
                        user_sessions[websocket] = new_dir
                        await websocket.send_json({"type": "pwd", "path": new_dir})
                        await websocket.send_json({"type": "list", "items": list_files(new_dir)})
                    else:
                        await websocket.send_json({"type": "error", "message": "❌ Directory not found!"})

            except Exception as e:
                await websocket.send_json({"type": "error", "message": f"❌ Error: {str(e)}"})

    except WebSocketDisconnect:
        print("⚠️ File WebSocket Disconnected")
    finally:
        await websocket.close()
        print("❌ File WebSocket Connection Closed")


# def list_files(directory: str) -> List[dict]:
#     try:
#         items = []
#         for item in os.listdir(directory):
#             item_path = os.path.join(directory, item)
#             items.append({"name": item, "isDirectory": os.path.isdir(item_path)})
#         return items
#     except Exception as e:
#         return [{"name": "❌ Error listing files", "isDirectory": False}]
#
#
# @app.get("/download")
# async def download_file(file_path: str = Query(..., description="Path of the file to download")):
#     """Handles file download requests"""
#     if not os.path.exists(file_path):
#
#         return {"error": "File not found"}
#     import pdb
#     pdb.set_trace()
#     return FileResponse(path=file_path, filename=os.path.basename(file_path), media_type='application/octet-stream')


def list_files(directory: str):
    try:
        items = []
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            items.append({
                "name": item,
                "isDirectory": os.path.isdir(item_path),
                "path": item_path if not os.path.isdir(item_path) else None  # Send path only for files
            })
        return items
    except Exception as e:
        return [{"name": "❌ Error listing files", "isDirectory": False}]

@app.get("/download")
async def download_file(file_path: str = Query(..., description="Path of the file to download")):
    """Handles file download requests"""
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return {"error": "File not found"}

    return FileResponse(path=file_path, filename=os.path.basename(file_path), media_type='application/octet-stream')


@app.post("/upload")
async def upload_file(files: List[UploadFile] = File(...)):
    upload_dir = os.getcwd()
    for file in files:
        file_location = os.path.join(upload_dir, file.filename)
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())
    return {"message": "File(s) uploaded successfully"}
@app.get("/load")
async def load_file(file: str, dir: str = Query(default=os.getcwd())):
    """Load the content of a file using `cat` for accuracy."""
    dir = os.path.abspath(dir)
    file_path = os.path.join(dir, file)

    if os.path.exists(file_path):
        try:
            content = subprocess.run(["cat", file_path], capture_output=True, text=True).stdout  # ✅ Use `cat`
            return JSONResponse({"exists": True, "content": content})
        except Exception as e:
            return JSONResponse({"exists": False, "error": str(e)})

    return JSONResponse({"exists": False, "content": ""})

@app.post("/save")
async def save_file(request: Request):
    """Save the content to a file and create if new."""
    data = await request.json()
    dir_path = os.path.abspath(data.get("dir", os.getcwd()))  # ✅ Ensure correct path
    file_path = os.path.join(dir_path, data["fileName"])

    try:
        os.makedirs(dir_path, exist_ok=True)  # ✅ Ensure directory exists
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(data["content"])
        return JSONResponse({"status": "success"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)
