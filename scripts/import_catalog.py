"""Build a local catalog snapshot and asset manifest from saved public source data."""
from __future__ import annotations

import hashlib
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class ImageExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for key in ("src", "data-src", "data-lazy-src", "data-large_image", "poster"):
            if values.get(key):
                self.add(values[key] or "")
        for key in ("srcset", "data-srcset"):
            if values.get(key):
                for candidate in (values[key] or "").split(","):
                    self.add(candidate.strip().split(" ")[0])
        style = values.get("style") or ""
        for match in re.findall(r"url\(['\"]?([^)'\"]+)", style):
            self.add(match)

    def add(self, url: str) -> None:
        url = html.unescape(url.strip())
        if "gbdigimart.com/wp-content/uploads/" in url:
            self.urls.add(urlsplit(url).scheme + "://" + urlsplit(url).netloc + urlsplit(url).path)


def asset_name(url: str) -> str:
    path = Path(urlsplit(url).path)
    digest = hashlib.sha1(url.encode()).hexdigest()[:10]
    return f"{path.stem}-{digest}{path.suffix.lower()}"


def text_content(markup: str) -> str:
    markup = re.sub(r"<(br|/p|/li|/h[1-6])\b[^>]*>", "\n", markup, flags=re.I)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", markup))).strip()


def main() -> None:
    source = json.loads(Path("/tmp/gbdigimart-api.json").read_text())
    homepage = Path("/tmp/gbdigimart-home.html")
    urls: set[str] = set()
    if homepage.exists():
        parser = ImageExtractor()
        parser.feed(homepage.read_text(errors="ignore"))
        urls.update(parser.urls)
    for product in source:
        for image in product.get("images", []):
            urls.update(value for value in (image.get("src"), image.get("thumbnail")) if value)

    local_path = {url: f"/catalog/{asset_name(url)}" for url in urls}
    catalog = []
    category_map: dict[str, str] = {}
    for product in source:
        prices = product.get("prices", {})
        price_range = prices.get("price_range") or {}
        product_categories = product.get("categories", [])
        for category in product_categories:
            category_map[category["slug"]] = category["name"]
        image_entries = []
        for image in product.get("images", []):
            src = image.get("src")
            if src:
                main_image = local_path.get(src, f"/catalog/{asset_name(src)}")
                thumbnail = local_path.get(image.get("thumbnail", src), f"/catalog/{asset_name(image.get('thumbnail', src))}")
                main_file = ROOT / "public" / main_image.lstrip("/")
                thumbnail_file = ROOT / "public" / thumbnail.lstrip("/")
                if not main_file.exists() and thumbnail_file.exists():
                    main_image = thumbnail
                image_entries.append({
                    "src": main_image,
                    "thumbnail": thumbnail,
                    "alt": image.get("alt") or image.get("name") or product["name"],
                })
        attrs = {attr.get("name", "").lower(): [term["name"] for term in attr.get("terms", [])] for attr in product.get("attributes", [])}
        catalog.append({
            "id": product["id"], "slug": product["slug"], "name": product["name"],
            "category": product_categories[0]["slug"] if product_categories else "uncategorized",
            "categories": [{"name": c["name"], "slug": c["slug"]} for c in product_categories],
            "price": int(prices.get("price") or price_range.get("min_amount") or 0),
            "regularPrice": int(prices.get("regular_price") or 0),
            "salePrice": int(prices.get("sale_price") or 0),
            "minPrice": int(price_range.get("min_amount") or prices.get("price") or 0),
            "maxPrice": int(price_range.get("max_amount") or prices.get("price") or 0),
            "rating": float(product.get("average_rating") or 0), "reviews": int(product.get("review_count") or 0),
            "inStock": bool(product.get("is_in_stock")),
            "description": text_content(product.get("description", "")),
            "shortDescription": text_content(product.get("short_description", "")),
            "weightOptions": attrs.get("weight", []) or attrs.get("size", []),
            "weight": ", ".join(attrs.get("weight", []) or attrs.get("size", [])) or "Select size",
            "images": image_entries, "image": image_entries[0]["src"] if image_entries else "/catalog/placeholder.svg",
            "permalink": product.get("permalink", ""), "sku": product.get("sku", ""),
        })

    (ROOT / "lib").mkdir(exist_ok=True)
    (ROOT / "lib/catalog.json").write_text(json.dumps({"products": catalog, "categories": [{"name": name, "slug": slug} for slug, name in sorted(category_map.items(), key=lambda item: item[1].lower())], "source": "https://gbdigimart.com/", "imageCount": len(urls)}, ensure_ascii=False, indent=2) + "\n")
    Path("/tmp/gbdigimart-image-urls.txt").write_text("\n".join(f"{url}\t{asset_name(url)}" for url in sorted(urls)) + "\n")
    print(f"Prepared {len(catalog)} products, {len(category_map)} categories, and {len(urls)} unique original image files.")


if __name__ == "__main__":
    main()
