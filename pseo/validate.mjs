import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "pseo", "manifest.json"), "utf8"));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const routeFile = (route) => path.join(ROOT, route.replace(/^\//, ""), "index.html");
const strip = (value) => String(value).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ").trim();
const words = (value) => strip(value).split(/\s+/).filter(Boolean).length;
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");

check(manifest.length === 1000, `manifest has ${manifest.length} target pages`);
check(new Set(manifest.map((page) => page.route)).size === manifest.length, "duplicate routes in manifest");
const bodyDigests = new Map();
const imageDigests = new Map();
const internalLinks = new Set();
for (const page of manifest) {
  const file = routeFile(page.route);
  check(fs.existsSync(file), `missing page ${page.route}`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  const article = html.match(/<article class="pseo-article">([\s\S]*?)<\/article>/i)?.[1] || "";
  const contentWords = words(article);
  check(contentWords >= 500, `${page.route} has ${contentWords} article words`);
  check((html.match(/<img /g) || []).length === 7, `${page.route} should have header/footer logos plus five page images`);
  check((html.match(/assets\/pseo\//g) || []).length === 6, `${page.route} should reference five page assets plus OG image`);
  check((html.match(/<link rel="canonical"/g) || []).length === 1, `${page.route} canonical count is not one`);
  check(html.includes('lang="tr"'), `${page.route} is not Turkish HTML`);
  check(html.includes("application/ld+json"), `${page.route} has no structured data`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  check(canonical === `https://www.omay.com.tr${page.route}`, `${page.route} canonical mismatch`);
  const articleDigest = digest(article.replace(/\s+/g, " "));
  if (bodyDigests.has(articleDigest)) failures.push(`duplicate article body ${page.route} and ${bodyDigests.get(articleDigest)}`);
  bodyDigests.set(articleDigest, page.route);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]+)(?:[#?][^"]*)?"/g)) {
    const target = match[1];
    if (target.startsWith("/assets/pseo/")) {
      const asset = path.join(ROOT, target.replace(/^\//, ""));
      check(fs.existsSync(asset), `${page.route} missing asset ${target}`);
      if (fs.existsSync(asset)) {
        const assetSource = fs.readFileSync(asset, "utf8");
        check(!assetSource.includes("undefined"), `${page.route} malformed SVG colour in ${target}`);
        check(!/opacity="[^\"]*\d\.\d+\.\d+/.test(assetSource), `${page.route} malformed SVG opacity in ${target}`);
        const assetDigest = digest(assetSource);
        if (imageDigests.has(assetDigest)) failures.push(`duplicate image asset ${target} and ${imageDigests.get(assetDigest)}`);
        imageDigests.set(assetDigest, target);
      }
    } else if (target.startsWith("/")) {
      internalLinks.add(target);
    }
  }
}
for (const target of internalLinks) {
  const clean = target.replace(/\/$/, "");
  const file = target.endsWith("/") ? path.join(ROOT, target.replace(/^\//, ""), "index.html") : path.join(ROOT, target.replace(/^\//, ""));
  if (!target.startsWith("/assets/") && !target.startsWith("/pseo/") && !target.startsWith("/site.js") && !target.startsWith("/styles.css")) check(fs.existsSync(file), `broken internal link ${target}`);
  void clean;
}
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check(sitemapUrls.length >= 1025, `root sitemap has only ${sitemapUrls.length} URLs`);
for (const page of manifest) check(sitemapUrls.includes(`https://www.omay.com.tr${page.route}`), `missing sitemap URL ${page.route}`);
const svgCount = fs.readdirSync(path.join(ROOT, "assets", "pseo")).filter((file) => file.endsWith(".svg")).length;
check(svgCount === 5000, `expected 5000 SVG assets, found ${svgCount}`);

const result = { targetPages: manifest.length, targetImages: imageDigests.size, duplicateBodies: failures.filter((failure) => failure.startsWith("duplicate article")).length, sitemapUrls: sitemapUrls.length, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
