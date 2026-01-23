import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Express } from 'express';

@Injectable()
export class FirebaseService {
  private bucket: any;

  constructor() {
    // Initialize Firebase only if it's not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : '',
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    // Initialize Firebase Storage bucket
    this.bucket = admin.storage().bucket();
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<string> {
    // Construct file path
    const filePath = `${folder}/${filename}`;

    // Define the file in Firebase Storage
    const fileUpload = this.bucket.file(filePath);

    return new Promise<string>((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Handle errors during the upload process
      stream.on('error', (error) => {
        console.error(`Error uploading file: ${error}`);
        reject(`Unable to upload image: ${error}`);
      });

      // Handle the successful file upload
      stream.on('finish', async () => {
        try {
          // Make the file public
          await fileUpload.makePublic();

          // Get the public URL of the uploaded file
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
          console.log(`File successfully uploaded to: ${publicUrl}`);

          // Return the public URL
          resolve(publicUrl);
        } catch (error) {
          console.error(`Error while making file public: ${error}`);
          reject(`Error making file public: ${error}`);
        }
      });

      // End the stream and start uploading the file buffer
      stream.end(file.buffer);
    });
  }
}
