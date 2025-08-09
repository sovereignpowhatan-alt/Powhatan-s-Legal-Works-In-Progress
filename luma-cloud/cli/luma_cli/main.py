import os
import json
import typer
import requests
from rich.table import Table
from rich.console import Console

app = typer.Typer(add_completion=False)
console = Console()

CONFIG_PATH = os.path.expanduser("~/.luma/config.json")


def load_config():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    return {}


def save_config(cfg):
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, 'w') as f:
        json.dump(cfg, f)


@app.command()
def login(server: str = typer.Option(..., help="Server base URL"), username: str = typer.Option(...), password: str = typer.Option(..., prompt=True, hide_input=True)):
    """Login and save token"""
    r = requests.post(f"{server}/auth/login", json={"username": username, "password": password})
    r.raise_for_status()
    token = r.json()["token"]
    cfg = load_config()
    cfg.update({"server": server, "token": token})
    save_config(cfg)
    console.print("[green]Logged in successfully[/green]")


def auth_headers():
    cfg = load_config()
    t = cfg.get("token")
    return {"Authorization": f"Bearer {t}"}


@app.command()
def ls(prefix: str = typer.Argument("", help="Remote prefix, e.g. /projects/")):
    cfg = load_config()
    r = requests.get(f"{cfg['server']}/api/files/list", params={"prefix": prefix}, headers=auth_headers())
    r.raise_for_status()
    data = r.json()
    table = Table(title=f"Listing {prefix}")
    table.add_column("Type")
    table.add_column("Name")
    table.add_column("Size")
    table.add_column("Modified")
    for d in data.get("dirs", []):
        name = d["prefix"][len(prefix):].rstrip('/')
        table.add_row("DIR", name, "", "")
    for f in data.get("files", []):
        name = f["key"][len(prefix):]
        table.add_row("FILE", name, str(f.get("size", 0)), f.get("lastModified", ""))
    console.print(table)


@app.command()
def upload(local_path: str, remote_key: str):
    cfg = load_config()
    with open(local_path, 'rb') as fh:
        files = {"file": (os.path.basename(local_path), fh)}
        data = {"key": remote_key}
        r = requests.post(f"{cfg['server']}/api/files/upload", files=files, data=data, headers=auth_headers())
        r.raise_for_status()
        console.print("[green]Uploaded[/green]", remote_key)


@app.command()
def download(remote_key: str, out: str = typer.Option(None, help="Output file path")):
    cfg = load_config()
    r = requests.get(f"{cfg['server']}/api/files/download", params={"key": remote_key}, headers=auth_headers())
    r.raise_for_status()
    url = r.json()["url"]
    d = requests.get(url)
    d.raise_for_status()
    out_path = out or os.path.basename(remote_key)
    with open(out_path, 'wb') as f:
        f.write(d.content)
    console.print("[green]Downloaded[/green]", out_path)


@app.command()
def chat(message: str, provider: str = typer.Option("ollama", help="ollama|openai|openrouter")):
    cfg = load_config()
    r = requests.post(f"{cfg['server']}/api/llm/chat", json={"provider": provider, "messages": [{"role": "user", "content": message}]}, headers=auth_headers())
    r.raise_for_status()
    console.print("[bold cyan]Luma:[/bold cyan]", r.json().get("content", ""))


if __name__ == "__main__":
    app()