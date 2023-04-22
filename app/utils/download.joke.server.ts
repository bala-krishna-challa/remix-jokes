const PDFDocument = require("pdfkit");
import { Joke } from "@prisma/client";
import path from "path";
import { mkdir, access } from "node:fs/promises";
import { existsSync, readFile, createWriteStream } from "node:fs";
import { promisify } from "util";

export const generateJokePDF = async (joke: Joke) => {
  const pdfDirectory = path.join(process.cwd(), "public\\joke-pdf");
  const file = path.join(pdfDirectory, `${joke.id}.pdf`);

  if (existsSync(file)) {
    const pdf = await promisify(readFile)(file);
    return pdf;
  }

  await createDirectoryIfNotFound(pdfDirectory);

  const doc = new PDFDocument();
  doc.pipe(createWriteStream(file));
  doc
    .font("public/fonts/baloo/baloo.woff")
    .fontSize(25)
    .text(`Title: ${joke.name}`, 100, 100);

  doc.fontSize(12).text(`Content: ${joke.content}`, 100, 140);

  doc.end();
  return doc;
};

async function createDirectoryIfNotFound(pdfDirectory: string) {
  try {
    await access(pdfDirectory);
  } catch {
    await mkdir(pdfDirectory);
  }
}
