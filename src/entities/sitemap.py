from dataclasses import dataclass
from datetime import datetime
from xml.etree import ElementTree


@dataclass
class Sitemap:
    def __init__(self, domain: str) -> None:
        self.domain = domain
        self.root = ElementTree.Element("urlset", {
            "xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
        })

    def add_url(self, url: str, last_modified: datetime, priority: float) -> None:
        item = ElementTree.SubElement(self.root, "url")
        ElementTree.SubElement(item, "loc").text = f"{self.domain}/{url}"
        ElementTree.SubElement(item, "lastmod").text = last_modified.strftime("%Y-%m-%dT%H:%M:%S+00:00")
        ElementTree.SubElement(item, "priority").text = f"{priority:.2f}"

    def content(self) -> str:
        return ElementTree.tostring(self.root, encoding="utf-8")
