import getUser from "../actions/getUser";
import { photo } from "../database/schema";
import imagekitServer from "../utils/imagekit";
import { v4 as uuidv4 } from "uuid";

export default defineEventHandler(async (event) => {
  let uploadImage;
  const body = await readBody(event);

  const profile = await getUser(body.userId);

  //TODO: if user not exist, return

  try {
    uploadImage = await imagekitServer().upload({
      file: body.image,
      fileName: body.name,
      folder: "/flab",
    });
    // TODO: add a slug row for the image in the database
    const createdPhoto = await db.insert(photo).values({
      id: uuidv4(),
      userId: body.userId,
      title: body.name,
      url: uploadImage.url,
      profileId: profile.id,
    });

    return uploadImage;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
});
