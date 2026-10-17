"""Small desktop launcher for the local Keydeck web interface."""

from __future__ import annotations

import threading
import tkinter as tk
import webbrowser

from server import serve


server = serve(0)
url = f"http://127.0.0.1:{server.server_address[1]}/"
threading.Thread(target=server.serve_forever, daemon=True).start()

root = tk.Tk()
root.title("Keydeck · RK Keyboard Studio")
root.geometry("410x260")
root.resizable(False, False)
root.configure(bg="#f4f5f2")

tk.Label(root, text="KEYDECK", bg="#f4f5f2", fg="#245d4c", font=("Segoe UI", 10, "bold")).pack(anchor="w", padx=28, pady=(25, 3))
tk.Label(root, text="RK keyboard studio", bg="#f4f5f2", fg="#202522", font=("Segoe UI", 18, "bold")).pack(anchor="w", padx=28)
tk.Label(root, text="The local interface is ready in your browser.", bg="#f4f5f2", fg="#69736b", font=("Segoe UI", 10)).pack(anchor="w", padx=28, pady=(8, 14))

url_entry = tk.Entry(root, relief="flat", bg="#ffffff", fg="#4e5a51", font=("Consolas", 9), readonlybackground="#ffffff")
url_entry.insert(0, url)
url_entry.configure(state="readonly")
url_entry.pack(fill="x", padx=28, ipady=8)

button_row = tk.Frame(root, bg="#f4f5f2")
button_row.pack(fill="x", padx=28, pady=15)


def open_site():
    webbrowser.open_new_tab(url)


def close_app():
    server.shutdown()
    server.server_close()
    root.destroy()


tk.Button(button_row, text="Open Keydeck", command=open_site, relief="flat", bg="#397965", fg="white", activebackground="#245d4c", activeforeground="white", font=("Segoe UI", 9, "bold"), padx=13, pady=8).pack(side="left")
tk.Button(button_row, text="Exit", command=close_app, relief="flat", bg="#e8ebe7", fg="#46504a", activebackground="#dce2dc", font=("Segoe UI", 9), padx=18, pady=8).pack(side="right")

tk.Label(root, text="Use desktop Chrome or Edge for descriptor-only identification. This build does not open the HID device or exchange reports.", wraplength=350, justify="left", bg="#f4f5f2", fg="#858f87", font=("Segoe UI", 8)).pack(anchor="w", padx=28)
root.protocol("WM_DELETE_WINDOW", close_app)
root.after(450, open_site)
root.mainloop()
