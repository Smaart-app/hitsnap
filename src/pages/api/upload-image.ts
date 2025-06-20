import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import { IncomingForm, File } from "formidable";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.uploadDir = path.join(process.cwd(), "public", "article-images");
    form.keepExtensions = true;
    form.multiples = false; // αποδεχόμαστε μόνο 1 αρχείο ανά upload

    form.parse(request, (err, fields, files) => {
      if (err) {
        reject(new Response("Upload error", { status: 500 }));
        return;
      }

      // Το πεδίο πρέπει να λέγεται "file"
      const file = files.file as File | File[] | undefined;

      if (!file) {
        resolve(new Response("No file uploaded", { status: 400 }));
        return;
      }

      // Αν είναι array, πάρε το πρώτο (ασφαλής χειρισμός)
      const uploadedFile = Array.isArray(file) ? file[0] : file;

      // Παλιό path του αρχείου
      const oldPath = uploadedFile.filepath || (uploadedFile as any).path;
      const fileName = path.basename(oldPath);
      const newPath = path.join(form.uploadDir, fileName);

      try {
        fs.renameSync(oldPath, newPath);
      } catch (err) {
        reject(new Response("File rename error", { status: 500 }));
        return;
      }

      // Επιστρέφουμε το URL της εικόνας
      const imageUrl = `/article-images/${fileName}`;
      resolve(
        new Response(JSON.stringify({ url: imageUrl }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });
};