import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.uploadDir = path.join(process.cwd(), "public", "article-images");
    form.keepExtensions = true;

    form.parse(request, (err, fields, files) => {
      if (err) {
        reject(new Response("Upload error", { status: 500 }));
        return;
      }
      const file = files.file; // το όνομα του input field πρέπει να είναι "file"
      if (!file) {
        resolve(new Response("No file uploaded", { status: 400 }));
        return;
      }

      // Μετακίνηση του αρχείου στο σωστό φάκελο και διατήρηση ονόματος
      const oldPath = file.filepath || file.path;
      const fileName = path.basename(oldPath);
      const newPath = path.join(form.uploadDir, fileName);

      fs.renameSync(oldPath, newPath);

      // Επιστρέφουμε το URL της εικόνας για χρήση στο frontend
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