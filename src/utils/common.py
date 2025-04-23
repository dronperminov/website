import hashlib
import os
import shutil
from typing import List

from bs4 import BeautifulSoup
from fastapi import UploadFile

from src.entities.picture import Picture
from src.utils.images import make_preview


def __get_hash(filename: str) -> str:
    hash_md5 = hashlib.md5()

    with open(filename, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)

    return hash_md5.hexdigest()


def get_static_hash() -> str:
    hashes = []

    for directory in ["js", "styles"]:
        for path, _, files in os.walk(os.path.join(os.path.dirname(__file__), "..", "..", "web", directory)):
            for name in files:
                hashes.append(__get_hash(os.path.join(path, name)))

    static_hash = "_".join(hashes)
    hash_md5 = hashlib.md5()
    hash_md5.update(static_hash.encode("utf-8"))
    return hash_md5.hexdigest()


def get_extension(filename: str) -> str:
    return filename.rsplit(".", maxsplit=1)[-1]


def get_plain_text(html: str) -> str:
    soup = BeautifulSoup(html, features="html.parser")

    for br in soup.find_all("br"):
        br.replace_with("\n")

    text = soup.get_text()

    lines = (line.strip() for line in text.splitlines())
    text = "\n".join(phrase.strip() for line in lines for phrase in line.split("  "))
    return text


def save_file(file: UploadFile, output_path: str) -> str:
    with open(output_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return output_path


def prepare_pictures(paths: List[str], post_id: int, post_images_path: str) -> List[Picture]:
    post_path = os.path.join(post_images_path, f"{post_id}")
    os.makedirs(post_path)
    pictures = []

    for i, path in enumerate(paths):
        counter = f"{i + 1}" if len(paths) > 1 else ""
        extension = get_extension(path)
        original_filename = f"original{counter}.{extension}"
        preview_filename = f"preview{counter}.webp"

        shutil.copy(path, os.path.join(post_path, original_filename))
        width, height = make_preview(input_path=path, output_path=os.path.join(post_path, preview_filename))
        pictures.append(Picture(
            width=width,
            height=height,
            url=f"/images/posts/{post_id}/{original_filename}",
            preview_url=f"/images/posts/{post_id}/{preview_filename}"
        ))

    return pictures


def get_word_form(count: int, word_forms: List[str], only_form: bool = False) -> str:
    index = 0

    if abs(count) % 10 in {0, 5, 6, 7, 8, 9} or abs(count) % 100 in {10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20}:
        index = 2
    elif abs(count) % 10 in {2, 3, 4}:
        index = 1

    return word_forms[index] if only_form else f"{count} {word_forms[index]}"
