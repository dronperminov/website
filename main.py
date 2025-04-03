import uvicorn


def main() -> None:
    uvicorn.run("src.app:app", host="0.0.0.0", port=1916, reload=True, reload_dirs=["src"])


if __name__ == "__main__":
    main()
