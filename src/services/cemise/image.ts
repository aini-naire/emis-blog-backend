
import { Image, imagesTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { ImagesResponse, ImageType } from "@blog/schemas/cemise.js";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";
import { randomUUID } from "crypto";
import { MultipartFile } from "@fastify/multipart";

const imageMimeTypes = [
    'image/webp',
    'image/tiff',
    'image/png',
    'image/jpeg',
    'image/bmp',
];

export const ImageService = {
    add: async function (part: MultipartFile, type: ImageType): Promise<Image | null> {
        if (!(imageMimeTypes.includes(part.mimetype))) { await part.toBuffer(); return null; }
        const filename = randomUUID();
        await pipeline(part.file, createWriteStream(process.env.UPLOAD_FOLDER + filename));
        const image = await database.insert(imagesTable).values({ originalFilename: part.filename, filename: filename, type: type }).returning();

        return image.length ? image[0] : null;
    },

    list: async function (): Promise<ImagesResponse> {
        const images = await database.select().from(imagesTable);
        return images as ImagesResponse;
    },
}